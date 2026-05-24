import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import moment from "moment";

const CACHE_PATH = join(process.cwd(), ".cache", "ai-insights.json");

// 防呆開關：true = debug 模式，不限流；false = 啟用週期限制
const AI_DEBUG_MODE = false;

// 一週限制（天數）
const AI_INSIGHT_REFRESH_DAYS = 7;

let memoryCache = null;

function cacheKey(symbol, type) {
	return `${String(symbol || "").toUpperCase()}:${type}`;
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

export async function getInsightWithGuard({ symbol, type, producer }) {
	const key = cacheKey(symbol, type);
	const store = await loadCache();
	const cached = store[key];

	// debug 模式：每次都可重新抓，但抓失敗時仍回退到既有快取
	if (!shouldThrottle()) {
		try {
			const payload = await producer();
			if (!isEmptyPayload(payload)) {
				store[key] = { updatedAt: moment().toISOString(), payload };
				await persistCache();
				return payload;
			}
		} catch {
			// ignore and fallback below
		}
		return cached?.payload ?? null;
	}

	// 正常模式：一週內直接用快取
	if (cached && isFresh(cached)) {
		return cached.payload;
	}

	// 到期才重抓；若重抓失敗，保留舊資料避免 UI 失效
	try {
		const payload = await producer();
		if (!isEmptyPayload(payload)) {
			store[key] = { updatedAt: moment().toISOString(), payload };
			await persistCache();
			return payload;
		}
	} catch {
		// ignore and fallback below
	}

	return cached?.payload ?? null;
}
