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
		customers: [{ name: "雲端服務商", role: "需求來源" }],
		suppliers: [{ name: "半導體供應鏈", role: "關鍵投入" }],
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
	valuationMethod: { primary: "Forward PE + FCF Yield", why: "Fixture valuation method.", evidence: [], sources: [] },
	valuationModels: [],
	catalystTimeline: [],
	zones: { ideal: "N/A", buy: "N/A", watch: "N/A" },
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
	await expect(page.getByText("[object Object]", { exact: true })).toHaveCount(0);

	const mindMapTab = page.getByRole("tab", { name: "心智圖與 SWOT" });
	await expect(mindMapTab).toBeVisible();
	await mindMapTab.click();

	await expect(page.getByRole("heading", { name: "投資心智圖" })).toBeVisible();
	await expect(page.getByRole("heading", { name: "SWOT 客觀分析" })).toBeVisible();
});

test("explore is a working route with recommendation candidates", async ({ page }) => {
	await page.route(/\/api\/quotes(?:\?.*)?$/, (route) =>
		route.fulfill({
			contentType: "application/json",
			body: JSON.stringify({ updatedAt: "2026-08-06T00:00:00.000Z", quotes: [quoteFixture] }),
		})
	);
	await page.route(/\/api\/recommendations(?:\?.*)?$/, (route) =>
		route.fulfill({
			contentType: "application/json",
			body: JSON.stringify({
				updatedAt: "2026-08-06T00:00:00.000Z",
				groups: [
					{
						id: "stableGrowth",
						title: "穩定成長",
						criteria: "候選池排序",
						items: [
							{
								symbol: "AVGO",
								name: "Broadcom Inc.",
								score: 84,
								valuation: "合理",
								revenueGrowth: "+20%",
								reasons: ["FCF Yield 為正"],
							},
						],
					},
				],
			}),
		})
	);

	await page.goto("/explore");
	await expect(page).toHaveURL(/\/explore$/);
	await expect(page.getByRole("heading", { name: "探索標的", exact: true })).toBeVisible();
	await expect(page.getByRole("button", { name: /AVGO Broadcom Inc\./ })).toBeVisible();
});

test("dashboard links to the watchlist route, supports dark mode, and stays usable on mobile", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
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
	await expect(page.getByRole("heading", { name: "我的清單", exact: true })).toHaveCount(0);
	await expect(page.getByRole("link", { name: "追蹤清單", exact: true })).toBeVisible();
	await expect(page.locator(".decisionBar .reportActions")).toBeVisible();
	await page.getByRole("button", { name: "夜間", exact: true }).click();
	await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
	await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
	const backToTop = page.getByRole("button", { name: "回到頂部", exact: true });
	await expect(backToTop).toBeVisible();
	await backToTop.click();
	await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

	await page.setViewportSize({ width: 768, height: 1024 });
	await expect(page.getByRole("heading", { name: "我的清單", exact: true })).toHaveCount(0);
	await expect(page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).resolves.toBe(true);
});

test("watchlist has its own route and does not load recommendations", async ({ page }) => {
	let recommendationRequests = 0;
	page.on("request", (request) => {
		if (request.url().includes("/api/recommendations")) recommendationRequests += 1;
	});
	await page.route(/\/api\/quotes(?:\?.*)?$/, (route) =>
		route.fulfill({
			contentType: "application/json",
			body: JSON.stringify({ updatedAt: "2026-07-16T00:00:00.000Z", quotes: [quoteFixture] }),
		})
	);

	await page.goto("/watchlist");
	await expect(page.getByRole("heading", { name: "我的清單", exact: true })).toHaveCount(1);
	await expect(page.getByRole("heading", { name: "新增追蹤標的", exact: true })).toBeVisible();
	await expect(page.getByRole("button", { name: "NVDA NVIDIA Corporation" })).toBeVisible();
	await expect(recommendationRequests).toBe(0);
	await page.getByRole("button", { name: "NVDA NVIDIA Corporation" }).click();
	await expect(page).toHaveURL(/\/?symbol=NVDA/);
	await expect(page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).resolves.toBe(true);
});

test("watchlist stays contained at tablet width", async ({ page }) => {
	await page.setViewportSize({ width: 1024, height: 900 });
	await page.route(/\/api\/quotes(?:\?.*)?$/, (route) =>
		route.fulfill({
			contentType: "application/json",
			body: JSON.stringify({ updatedAt: "2026-07-16T00:00:00.000Z", quotes: [quoteFixture] }),
		})
	);

	await page.goto("/watchlist");
	await expect(page.getByRole("heading", { name: "新增追蹤標的", exact: true })).toBeVisible();
	await expect(page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).resolves.toBe(true);
	await expect(page.locator(".watchlistTable")).toHaveCSS("display", "block");
});

test("today surfaces quote failures instead of reporting a healthy empty state", async ({ page }) => {
	await page.route(/\/api\/quotes(?:\?.*)?$/, (route) =>
		route.fulfill({ status: 502, contentType: "application/json", body: JSON.stringify({ error: "行情來源暫時無法取得" }) })
	);

	await page.goto("/today");
	await expect(page.locator(".prototypeAlert")).toContainText("行情來源暫時無法取得");
	await expect(page.getByText("資料不足，暫不評估", { exact: true })).toBeVisible();
});

test("tooltip renders in the viewport instead of being clipped by report panels", async ({ page }) => {
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
	await page.getByRole("tab", { name: "估值", exact: true }).click();
	await page.getByRole("button", { name: "顯示說明" }).first().click();

	const tooltip = page.getByRole("tooltip");
	await expect(tooltip).toBeVisible();
	const box = await tooltip.boundingBox();
	const viewport = page.viewportSize();
	expect(box).not.toBeNull();
	expect(box.x).toBeGreaterThanOrEqual(0);
	expect(box.y).toBeGreaterThanOrEqual(0);
	expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
	expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
});
