import test from "node:test";
import assert from "node:assert/strict";
import { clearCache, getOrCreateCached } from "../../lib/cache.mjs";

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
