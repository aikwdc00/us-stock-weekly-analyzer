import test from "node:test";
import assert from "node:assert/strict";
import { enrichQuote, getProfileForSymbol } from "../../lib/analysis.js";

test("missing research fields still produce all required research sections without a rating", () => {
	const profile = getProfileForSymbol("GOOGL", { metrics: {} });
	const quote = enrichQuote({ symbol: "GOOGL", regularMarketPrice: 100 }, profile);

	assert.match(profile.moat, /護城河|競爭優勢/);
	assert.ok(profile.competitors.length);
	assert.ok(profile.supplyChain.upstream.length);
	assert.ok(profile.supplyChain.downstream.length);
	assert.ok(profile.risks.length >= 3);
	for (const side of ["s", "w", "o", "t"]) {
		assert.ok(profile.swot[side].length);
		assert.ok(profile.swot[side].every((item) => !item.includes("來源:")));
	}
	assert.equal(quote.rating, "資料不足");
	assert.match(quote.thesis, /資料不足/);
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
