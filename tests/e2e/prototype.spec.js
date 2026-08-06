import { expect, test } from "@playwright/test";

const quoteFixture = {
	symbol: "NVDA",
	name: "NVIDIA Corporation",
	price: 212.5,
	changePercent: 1.25,
	formatted: { price: "$212.50", changePercent: "+1.25%" },
	rating: "分批買入",
	quality: { score: 82 },
	thesis: "以公開財報與市場資料持續驗證成長與估值。",
	events: [
		{
			label: "財報公告日",
			date: "2026-08-20",
			status: "expected",
			detail: "請以公司 IR 或 SEC 公告複核",
			source: "SEC EDGAR",
			sourceUrl: "https://www.sec.gov/edgar/search/",
		},
	],
};

async function mockTodayData(page) {
	await page.route(/\/api\/quotes(?:\?.*)?$/, (route) =>
		route.fulfill({
			contentType: "application/json",
			body: JSON.stringify({ updatedAt: "2026-08-06T00:00:00.000Z", quotes: [quoteFixture] }),
		})
	);
	await page.route(/\/api\/recommendations(?:\?.*)?$/, (route) =>
		route.fulfill({ contentType: "application/json", body: JSON.stringify({ updatedAt: "2026-08-06T00:00:00.000Z", groups: [] }) })
	);
}

test("today is a functional live review workspace and prototype redirects", async ({ page }) => {
	await mockTodayData(page);
	await page.goto("/today");

	await expect(page.getByRole("heading", { name: "美股週報分析工作台" })).toBeVisible();
	await expect(page.getByRole("heading", { name: "今天先看這些" })).toBeVisible();
	await expect(page.getByRole("heading", { name: "研究健康度" })).toBeVisible();
	await expect(page.getByText("NVDA", { exact: true }).first()).toBeVisible();
	await expect(page.locator(".prototypeEvent").first()).toHaveAttribute("href", /sec\.gov/);

	await page.goto("/prototype");
	await expect(page).toHaveURL(/\/today$/);
	await expect(page.getByRole("heading", { name: "今天先看這些" })).toBeVisible();
});

test("today remains usable on a mobile viewport", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await mockTodayData(page);
	await page.goto("/today");

	await expect(page.locator(".prototypeShell")).toBeVisible();
	await expect(page.getByRole("link", { name: "探索標的", exact: true })).toBeVisible();
	await expect(page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).resolves.toBe(true);
});
