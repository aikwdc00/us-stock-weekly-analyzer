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

test("price zones are transparent client-side estimates when market inputs exist", () => {
	const profile = getProfileForSymbol("NVDA", { metrics: {} });
	const quote = enrichQuote(
		{
			symbol: "NVDA",
			regularMarketPrice: 100,
			fiftyTwoWeekLow: 60,
			fiftyTwoWeekHigh: 120,
			forwardPE: 22,
			metrics: { peForward: { number: 22 } },
		},
		profile
	);

	assert.equal(quote.zones.isEstimate, true);
	assert.match(quote.zones.ideal, /\$[0-9.]+ - \$[0-9.]+/);
	assert.match(quote.zones.buy, /\$[0-9.]+ - \$[0-9.]+/);
	assert.match(quote.zones.watch, /\$[0-9.]+ - \$[0-9.]+/);
	assert.match(quote.zones.basis, /客端估算/);
	assert.match(quote.zones.method, /52 週區間/);
});

test("price zones stay unavailable without a current market price", () => {
	const profile = getProfileForSymbol("NVDA", { metrics: {} });
	const quote = enrichQuote({ symbol: "NVDA" }, profile);

	assert.deepEqual(quote.zones, {
		ideal: "資料不足",
		buy: "資料不足",
		watch: "資料不足",
		isEstimate: true,
		basis: "客端估算需要目前股價；目前沒有足夠行情資料。",
	});
});

test("profit forecast derives estimated margins from forecast revenue and latest available margins", () => {
	const profile = getProfileForSymbol("NVDA", { metrics: {} });
	const quote = enrichQuote(
		{
			symbol: "NVDA",
			regularMarketPrice: 100,
			fundamentalsSource: "StockAnalysis",
			fundamentalsSourceUrl: "https://stockanalysis.com/stocks/nvda/statistics/",
			forecast: {
				annualRevenue: { last: 100_000_000_000, current: 200_000_000_000 },
				nextAnnualRevenue: { current: 300_000_000_000 },
			},
			metrics: {
				grossMargin: { number: 70, value: "70.00%" },
				operatingMargin: { number: 20, value: "20.00%" },
			},
		},
		profile
	);

	assert.equal(quote.fundamentals.estimatedAnnualGrossProfit, "$140.00B");
	assert.equal(quote.fundamentals.estimatedNextAnnualGrossProfit, "$210.00B");
	assert.equal(quote.fundamentals.estimatedAnnualOperatingIncome, "$40.00B");
	assert.equal(quote.fundamentals.estimatedNextAnnualOperatingIncome, "$60.00B");
	assert.equal(quote.fundamentals.forecastGrossMarginReference, "+70.00%");
	assert.equal(quote.fundamentals.forecastOperatingMarginReference, "+20.00%");
	assert.equal(quote.fundamentals.forecastSource, "StockAnalysis Forecast");
	assert.match(quote.fundamentals.forecastSourceUrl, /\/forecast\/$/);
	assert.match(quote.fundamentals.forecastAssumptionNote, /預估營收 × 最近可取得利潤率/);
});

test("unavailable valuation metrics stay readable instead of appending a suffix", () => {
	const profile = getProfileForSymbol("INTC", { metrics: {} });
	const quote = enrichQuote(
		{
			symbol: "INTC",
			regularMarketPrice: 100,
			metrics: { pe: { number: null, value: "n/a" } },
		},
		profile
	);

	assert.equal(quote.formatted.pe, "N/A");
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
