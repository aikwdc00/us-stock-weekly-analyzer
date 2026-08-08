import test from "node:test";
import assert from "node:assert/strict";
import { clearCache, getOrCreateCached } from "../../lib/cache.mjs";
import { createInsightDigest, getInsightWithGuard } from "../../lib/aiInsightCache.js";

test("cache collapses concurrent work and serves fresh values", async () => {
	clearCache();
	let calls = 0;
	const producer = async () => {
		calls += 1;
		await new Promise((resolve) => setTimeout(resolve, 5));
		return { value: calls };
	};

	const values = await Promise.all([getOrCreateCached("same", producer), getOrCreateCached("same", producer)]);
	assert.equal(calls, 1);
	assert.deepEqual(values[0], { value: 1 });
	assert.deepEqual(await getOrCreateCached("same", producer), { value: 1 });
});

test("stale cache serves while one refresh runs", async () => {
	clearCache();
	let calls = 0;
	const producer = async () => {
		calls += 1;
		return calls;
	};

	assert.equal(await getOrCreateCached("stale", producer, { ttlMs: 1 }), 1);
	await new Promise((resolve) => setTimeout(resolve, 5));
	assert.equal(await getOrCreateCached("stale", producer, { ttlMs: 1 }), 1);
	await new Promise((resolve) => setTimeout(resolve, 5));
	assert.equal(calls, 2);
});

test("AI insight cache collapses concurrent requests and separates snapshots", async () => {
	let calls = 0;
	const type = `risk-test-${Date.now()}`;
	const contextDigest = createInsightDigest({ reportedPeriod: "2026-Q2" });
	const producer = async () => {
		calls += 1;
		await new Promise((resolve) => setTimeout(resolve, 5));
		return [`risk-${calls}`];
	};

	const [first, second] = await Promise.all([
		getInsightWithGuard({ symbol: "TEST", type, contextDigest, producer }),
		getInsightWithGuard({ symbol: "TEST", type, contextDigest, producer }),
	]);

	assert.deepEqual(first, ["risk-1"]);
	assert.deepEqual(second, ["risk-1"]);
	assert.equal(calls, 1);
	assert.deepEqual(
		await getInsightWithGuard({ symbol: "TEST", type, contextDigest: createInsightDigest({ reportedPeriod: "2026-Q3" }), producer }),
		["risk-2"]
	);
});
