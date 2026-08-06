import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import moment from "moment";

const CACHE_PATH = join(process.cwd(), ".cache", "ai-insights.json");

// 防呆開關：true = debug 模式，不限流；false = 啟用週期限制
const AI_DEBUG_MODE = false;

// 一週限制（天數）
const AI_INSIGHT_REFRESH_DAYS = 7;

let memoryCache = null;
const inFlight = new Map();

function cacheKey(symbol, type, contextDigest) {
	return `${String(symbol || "").toUpperCase()}:${type}:${contextDigest || "default"}`;
}

export function createInsightDigest(value) {
	return createHash("sha256")
		.update(JSON.stringify(value ?? null))
		.digest("hex")
		.slice(0, 16);
}

async function loadCache() {
	if (memoryCache) return memoryCache;
	try {
		const content = await readFile(CACHE_PATH, "utf8");
		const parsed = JSON.parse(content);
		memoryCache = parsed && typeof parsed === "object" ? parsed : {};
	} catch {
		memoryCache = {};
	}
	return memoryCache;
}

async function persistCache() {
	if (!memoryCache) return;
	await mkdir(dirname(CACHE_PATH), { recursive: true });
	await writeFile(CACHE_PATH, JSON.stringify(memoryCache, null, 2), "utf8");
}

function isEmptyPayload(payload) {
	if (payload == null) return true;
	if (Array.isArray(payload)) return payload.length === 0;
	if (typeof payload === "object") return Object.keys(payload).length === 0;
	return false;
}

function shouldThrottle() {
	const bypassByEnv = String(process.env.AI_DEBUG_BYPASS || "").toLowerCase() === "true";
	return !(AI_DEBUG_MODE || bypassByEnv);
}

function isFresh(entry) {
	if (!entry?.updatedAt) return false;
	const now = moment();
	const updated = moment(entry.updatedAt);
	if (!updated.isValid()) return false;
	return now.diff(updated, "days", true) < AI_INSIGHT_REFRESH_DAYS;
}

export async function getInsightWithGuard({ symbol, type, contextDigest, producer }) {
	const key = cacheKey(symbol, type, contextDigest);
	const store = await loadCache();
	const cached = store[key];
	const active = inFlight.get(key);
	if (active) return active;

	// debug 模式：每次都可重新抓，但抓失敗時仍回退到既有快取
	if (shouldThrottle() && cached && isFresh(cached)) {
		return cached.payload;
	}

	const refresh = (async () => {
		try {
			const payload = await producer();
			if (!isEmptyPayload(payload)) {
				store[key] = { updatedAt: moment().toISOString(), payload };
				try {
					await persistCache();
				} catch {
					// Memory cache remains usable when the runtime filesystem is read-only.
				}
				return payload;
			}
		} catch {
			// Keep the previous payload as a stale fallback when the provider fails.
		}

		return cached?.payload ?? null;
	})().finally(() => inFlight.delete(key));

	inFlight.set(key, refresh);
	return refresh;
}
