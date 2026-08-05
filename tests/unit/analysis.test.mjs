import test from "node:test";
import assert from "node:assert/strict";
import { enrichQuote, getProfileForSymbol } from "../../lib/analysis.js";

test("missing profile evidence does not fall back to static company copy or a rating", () => {
	const profile = getProfileForSymbol("GOOGL", { metrics: {} });
	const quote = enrichQuote({ symbol: "GOOGL", regularMarketPrice: 100 }, profile);

	assert.equal(profile.moat, null);
	assert.deepEqual(profile.competitors, []);
	assert.equal(quote.rating, "資料不足");
	assert.match(quote.thesis, /資料不足/);
});
