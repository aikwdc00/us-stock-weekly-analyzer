import test from "node:test";
import assert from "node:assert/strict";
import { enrichQuote, getProfileForSymbol } from "../../lib/analysis.js";

test("missing research fields do not fabricate company-specific analysis", () => {
	const profile = getProfileForSymbol("GOOGL", { metrics: {} });
	const quote = enrichQuote({ symbol: "GOOGL", regularMarketPrice: 100 }, profile);

	assert.match(profile.moat, /護城河|競爭優勢/);
	assert.ok(profile.competitors.length);
	assert.ok(profile.supplyChain.upstream.length);
	assert.ok(profile.supplyChain.downstream.length);
	assert.deepEqual(profile.risks, []);
	for (const side of ["s", "w", "o", "t"]) {
		assert.deepEqual(profile.swot[side], []);
	}
	assert.equal(quote.rating, "資料不足");
	assert.match(quote.thesis, /資料不足/);
});

test("unknown companies keep unsupported research sections empty", () => {
	const profile = getProfileForSymbol("UNKNOWN", { profile: { industry: "Unknown" }, metrics: {} });

	assert.equal(profile.theme, null);
	assert.deepEqual(profile.competitors, []);
	assert.deepEqual(profile.supplyChain.upstream, []);
	assert.deepEqual(profile.supplyChain.downstream, []);
	assert.equal(profile.moat, null);
	assert.deepEqual(profile.risks, []);
	assert.deepEqual(profile.swot, { s: [], w: [], o: [], t: [] });
});

test("data quality marks records without a recent provider timestamp as stale", () => {
	const profile = getProfileForSymbol("NVDA", { metrics: {} });
	const quote = enrichQuote({ symbol: "NVDA", regularMarketPrice: 100, updatedAt: "2020-01-01T00:00:00.000Z" }, profile);

	assert.equal(quote.quality.stale, true);
});

test("known company profiles expose representative supply-chain companies and tickers", () => {
	const profile = getProfileForSymbol("NVDA", { metrics: {} });

	assert.deepEqual(profile.supplyChain.upstream[0], {
		name: "TSMC",
		symbol: "TSM",
		role: "負責先進製程晶圓代工，生產 NVIDIA 核心 GPU 晶片",
	});
	assert.equal(profile.supplyChain.downstream[0].symbol, "MSFT");
	assert.equal(profile.supplyChain.downstream[0].name, "Microsoft");
	assert.equal(
		profile.supplyChain.upstream.some((item) => item.name === "SK hynix" && !item.symbol),
		true
	);
});
