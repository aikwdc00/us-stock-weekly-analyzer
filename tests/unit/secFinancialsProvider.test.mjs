import test from "node:test";
import assert from "node:assert/strict";
import { formatSecValue, normalizeCompanyFacts, parseCompanyFacts, selectFact } from "../../lib/secFinancialsProvider.js";

const fixture = {
	entityName: "Example Corp",
	facts: {
		"us-gaap": {
			Revenues: {
				label: "Revenue",
				units: {
					USD: [
						{ val: 100000000, start: "2024-01-01", end: "2024-12-31", filed: "2025-02-15", form: "10-K", accn: "0000000000-25-000001" },
						{ val: 25000000, start: "2024-10-01", end: "2024-12-31", filed: "2025-02-15", form: "10-Q", accn: "0000000000-25-000001" },
					],
				},
			},
			GrossProfit: {
				units: {
					USD: [{ val: 60000000, start: "2024-01-01", end: "2024-12-31", filed: "2025-02-15", form: "10-K", accn: "0000000000-25-000001" }],
				},
			},
			NetIncomeLoss: {
				units: {
					USD: [{ val: 20000000, start: "2024-01-01", end: "2024-12-31", filed: "2025-02-15", form: "10-K", accn: "0000000000-25-000001" }],
				},
			},
			CashAndCashEquivalentsAtCarryingValue: {
				units: {
					USD: [{ val: 50000000, end: "2024-12-31", filed: "2025-02-15", form: "10-K", accn: "0000000000-25-000001" }],
				},
			},
			Assets: {
				units: {
					USD: [{ val: 200000000, end: "2024-12-31", filed: "2025-02-15", form: "10-K", accn: "0000000000-25-000001" }],
				},
			},
		},
	},
};

test("SEC companyfacts parser selects annual facts by filing period and preserves evidence", () => {
	const result = parseCompanyFacts(fixture, { symbol: "TEST", cik: "0000000000" });

	assert.equal(result.status, "ok");
	assert.equal(result.annual.period, "2024-12-31");
	assert.equal(result.annual.metrics.revenue.value, 100000000);
	assert.equal(result.annual.metrics.grossMargin, "60.00%");
	assert.equal(result.balanceSheet.metrics.cash.value, 50000000);
	assert.equal(result.annual.metrics.revenue.evidence.form, "10-K");
	assert.match(result.annual.metrics.revenue.evidence.sourceUrl, /000000000025000001/);
});

test("SEC period selector rejects an annual duration as a quarterly fact", () => {
	const records = [
		{ tag: "Revenue", val: 100, start: "2023-01-01", end: "2023-12-31", filed: "2024-02-01", form: "10-K" },
		{ tag: "Revenue", val: 25, start: "2023-10-01", end: "2023-12-31", filed: "2024-02-01", form: "10-Q" },
	];

	assert.equal(selectFact(records, { end: "2023-12-31", kind: "quarter" }).val, 25);
	assert.equal(selectFact(records, { end: "2023-12-31", kind: "annual" }).val, 100);
});

test("SEC values render with stable compact units", () => {
	assert.equal(formatSecValue(1250000000), "$1.25B");
	assert.equal(formatSecValue(-2500000), "-$2.50M");
});

test("SEC companyfacts normalization ignores unrelated tags and caps oversized units", () => {
	const result = normalizeCompanyFacts({
		facts: {
			"us-gaap": {
				UnrelatedTag: { units: { USD: [{ val: 1, end: "2024-12-31", filed: "2025-01-01" }] } },
				Revenues: {
					units: {
						USD: Array.from({ length: 2_005 }, (_, index) => ({
							val: index + 1,
							end: `2024-12-${String((index % 28) + 1).padStart(2, "0")}`,
							filed: "2025-01-01",
						})),
					},
				},
			},
		},
	});

	assert.equal(result.length, 2_000);
	assert.equal(
		result.every((record) => record.tag === "Revenues"),
		true
	);
});
