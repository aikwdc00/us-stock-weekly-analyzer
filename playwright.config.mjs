import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests/e2e",
	fullyParallel: false,
	timeout: 120_000,
	expect: { timeout: 90_000 },
	use: {
		baseURL: "http://127.0.0.1:3100",
		trace: "retain-on-failure",
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
	webServer: {
		command: "npm run dev -- --port 3100",
		url: "http://127.0.0.1:3100",
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
