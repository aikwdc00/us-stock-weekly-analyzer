import { expect, test } from "@playwright/test";

test("prototype supports the weekly review flow and hides unsupported fields", async ({ page }) => {
	await page.goto("/prototype");
	await expect(page.getByRole("heading", { name: "美股週報分析工作台" })).toBeVisible();
	await expect(page.getByRole("heading", { name: "今天先看這些" })).toBeVisible();
	await expect(page.getByText("月營收", { exact: true })).toHaveCount(0);

	const watchlistTab = page.getByRole("button", { name: "追蹤清單", exact: true });
	await expect(watchlistTab).toHaveCount(1);
	await watchlistTab.click();
	await expect(page.getByRole("heading", { name: "追蹤清單" })).toBeVisible();

	const compareNvda = page.getByRole("button", { name: "選取 NVDA 比較", exact: true });
	await compareNvda.click();
	await expect(page.getByText("已選 1 檔", { exact: true })).toBeVisible();

	const nvdaTicker = page.getByRole("button", { name: "NVDA NVIDIA Corporation Semiconductors", exact: true });
	await nvdaTicker.click();
	await expect(page.getByRole("heading", { name: "決策摘要" })).toBeVisible();
	await expect(page.getByRole("heading", { name: "產業與長線監控" })).toBeVisible();
	await expect(page.getByText("月營收", { exact: true })).toHaveCount(0);

	const sourceLink = page.getByRole("link", { name: /查看來源/ });
	await expect(sourceLink).toHaveAttribute("href", /stockanalysis\.com|sec\.gov/);
});

test("prototype remains usable on a mobile viewport", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/prototype");
	await expect(page.getByTestId("prototype-shell")).toBeVisible();
	await expect(page.getByRole("button", { name: "Today", exact: true })).toBeVisible();
	await expect(page.getByRole("button", { name: "探索標的", exact: true })).toBeVisible();
});
