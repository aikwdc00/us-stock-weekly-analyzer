import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3001";
const devPort = new URL(baseURL).port || "3001";

export default defineConfig({
	testDir: "./tests/e2e",
	fullyParallel: false,
	timeout: 120_000,
	expect: { timeout: 90_000 },
	use: {
		baseURL,
		trace: "retain-on-failure",
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
	...(process.env.PLAYWRIGHT_BASE_URL
		? {}
		: {
				webServer: {
					command: `npm run dev -- --port ${devPort}`,
					url: baseURL,
					reuseExistingServer: !process.env.CI,
					timeout: 120_000,
				},
			}),
});
