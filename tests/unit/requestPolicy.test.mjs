import test from "node:test";
import assert from "node:assert/strict";
import { getClientKey, normalizeSearchQuery, normalizeSymbols } from "../../lib/requestValidation.mjs";
import { checkRateLimit, rateLimitHeaders, resetRateLimits } from "../../lib/rateLimit.mjs";
import { allSettledWithConcurrency, mapWithConcurrency } from "../../lib/concurrency.mjs";

test("normalizes and deduplicates bounded symbols", () => {
	assert.deepEqual(normalizeSymbols("nvda, NVDA, tsla").symbols, ["NVDA", "TSLA"]);
	assert.match(normalizeSymbols("NVDA, bad ticker!").error, /格式無效/);
	assert.match(normalizeSymbols("AAPL,MSFT,GOOG", { maxSymbols: 2 }).error, /最多/);
});

test("bounds search input", () => {
	assert.equal(normalizeSearchQuery("  Tesla  ").query, "Tesla");
	assert.match(normalizeSearchQuery("x".repeat(9), 8).error, /最多/);
});

test("forwarded IP headers are ignored unless the proxy is explicitly trusted", () => {
	delete process.env.TRUST_PROXY_HEADERS;
	const first = getClientKey(
		new Request("https://example.test", { headers: { "x-forwarded-for": "203.0.113.1", "user-agent": "test" } }),
		"quotes"
	);
	const second = getClientKey(
		new Request("https://example.test", { headers: { "x-forwarded-for": "203.0.113.2", "user-agent": "test" } }),
		"quotes"
	);

	assert.equal(first, second);
});

test("rate limit returns retry information", () => {
	resetRateLimits();
	const first = checkRateLimit("test", { limit: 1, windowMs: 60_000 });
	const second = checkRateLimit("test", { limit: 1, windowMs: 60_000 });

	assert.equal(first.allowed, true);
	assert.equal(second.allowed, false);
	assert.equal(rateLimitHeaders(second)["Retry-After"] > 0, true);
});

test("bounded concurrency preserves input order", async () => {
	let active = 0;
	let peak = 0;
	const result = await mapWithConcurrency([1, 2, 3, 4], 2, async (value) => {
		active += 1;
		peak = Math.max(peak, active);
		await new Promise((resolve) => setTimeout(resolve, 1));
		active -= 1;
		return value * 2;
	});

	assert.deepEqual(result, [2, 4, 6, 8]);
	assert.equal(peak <= 2, true);
});

test("bounded settled concurrency keeps failures isolated", async () => {
	const result = await allSettledWithConcurrency([1, 2], 1, async (value) => {
		if (value === 2) throw new Error("failed");
		return value;
	});

	assert.deepEqual(
		result.map((item) => item.status),
		["fulfilled", "rejected"]
	);
});
