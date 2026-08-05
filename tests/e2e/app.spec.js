import { expect, test } from "@playwright/test";

const quoteFixture = {
	symbol: "NVDA",
	name: "NVIDIA Corporation",
	exchange: "NASDAQ",
	formatted: {
		price: "$212.50",
		changePercent: "+1.25%",
		marketCap: "5.15T",
		volume: "124.80M",
		pe: "32.54x",
		forwardPe: "21.32x",
		ps: "20.30x",
		pfcf: "43.22x",
		fcfYield: "2.31%",
		pegRatio: "0.47",
		fiftyDay: "$209.61",
		twoHundredDay: "$192.14",
		range52: "$164.07 - $236.54",
		targetMeanPrice: "$301.62",
		recommendation: "Strong Buy",
	},
	changePercent: 1.25,
	rating: "分批買入",
	valuation: "合理",
	trend: "偏多",
	profile: {
		theme: "AI 加速運算",
		moat: "軟硬體生態與開發者工具。",
		competitors: ["AMD"],
		customers: ["雲端服務商"],
		suppliers: ["半導體供應鏈"],
		sector: "Technology",
		industry: "Semiconductors",
		description: "NVIDIA develops accelerated computing platforms.",
		risks: ["Forward PE 21.32x。"],
		swot: {
			s: ["毛利率 74.15%。"],
			w: ["目前 API 未提供量化劣勢訊號。"],
			o: ["年度營收成長預估 +81.90%。"],
			t: ["需追蹤 AI 資本支出循環。"],
		},
		aiSupplement: { enabled: false },
	},
	fundamentals: {
		freeCashFlow: "119.08B",
		grossMargin: "74.15%",
		profitMargin: "62.97%",
		totalCash: "53.17B",
		debt: "12.81B",
	},
	valuationMethod: { primary: "Forward PE + FCF Yield" },
	quality: { score: 100, status: "完整", available: 12, total: 12, missing: [] },
	catalysts: [],
	news: [],
	ownership: { insiders: "3.91%", institutions: "69.08%", filings: [], transactionNote: "N/A" },
};

test("quote API returns a coherent daily price range", async ({ request }) => {
	const response = await request.get("/api/quotes?symbols=NVDA");
	// Public upstream providers can be unavailable in CI or during rate limiting.
	// The API must still return a controlled response rather than leaking an exception.
	expect([200, 502]).toContain(response.status());
	if (response.status() === 502) return;

	const payload = await response.json();
	const quote = payload.quotes?.[0];
	expect(quote?.symbol).toBe("NVDA");
	expect(quote?.price).toBeGreaterThan(0);

	if (Number.isFinite(quote.dayLow) && Number.isFinite(quote.dayHigh)) {
		expect(quote.dayLow).toBeLessThanOrEqual(quote.price);
		expect(quote.dayHigh).toBeGreaterThanOrEqual(quote.price);
	}
});

test("dashboard loads a report and opens the mind map SWOT tab", async ({ page }) => {
	await page.route(/\/api\/quotes(?:\?.*)?$/, (route) =>
		route.fulfill({
			contentType: "application/json",
			body: JSON.stringify({ updatedAt: "2026-07-16T00:00:00.000Z", quotes: [quoteFixture] }),
		})
	);
	await page.route(/\/api\/recommendations(?:\?.*)?$/, (route) =>
		route.fulfill({ contentType: "application/json", body: JSON.stringify({ updatedAt: "2026-07-16T00:00:00.000Z", groups: [] }) })
	);
	await page.route(/\/api\/peers(?:\?.*)?$/, (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ peers: [] }) }));

	await page.goto("/");
	await expect(page.getByRole("heading", { name: "美股週報分析工作台" })).toBeVisible();

	const mindMapTab = page.getByRole("tab", { name: "心智圖與 SWOT" });
	await expect(mindMapTab).toBeVisible();
	await mindMapTab.click();

	await expect(page.getByRole("heading", { name: "投資心智圖" })).toBeVisible();
	await expect(page.getByRole("heading", { name: "SWOT 客觀分析" })).toBeVisible();
});
