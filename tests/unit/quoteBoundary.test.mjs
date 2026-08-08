import test from "node:test";
import assert from "node:assert/strict";
import { filterQuotesToRequestedSymbols } from "../../lib/quoteBoundary.mjs";

test("quote boundary keeps only requested symbols and removes duplicates", () => {
	const quotes = filterQuotesToRequestedSymbols(
		[
			{ symbol: "nvda", price: 1 },
			{ symbol: "OTHER", price: 2 },
			{ symbol: "NVDA", price: 3 },
		],
		["NVDA"]
	);

	assert.deepEqual(quotes, [{ symbol: "NVDA", price: 1 }]);
});

test("quote boundary treats malformed upstream results as empty", () => {
	assert.deepEqual(filterQuotesToRequestedSymbols([{ price: 1 }, null], ["NVDA"]), []);
});
