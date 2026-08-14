import { expect, test } from "@playwright/test";

test("public APIs reject malformed or oversized input before upstream work", async ({ request }) => {
	const invalidSymbol = await request.get("/api/quotes?symbols=bad%20ticker");
	const tooManySymbols = await request.get(`/api/quotes?symbols=${Array.from({ length: 51 }, (_, index) => `A${index}`).join(",")}`);
	const tooManyQuoteSymbols = await request.get(`/api/quotes?symbols=${Array.from({ length: 21 }, (_, index) => `A${index}`).join(",")}`);
	const invalidSearch = await request.get(`/api/search?q=${"x".repeat(81)}`);
	const invalidPeers = await request.get("/api/peers?symbol=BAD!");

	expect(invalidSymbol.status()).toBe(400);
	expect(tooManySymbols.status()).toBe(400);
	expect(tooManyQuoteSymbols.status()).toBe(400);
	expect(invalidSearch.status()).toBe(400);
	expect(invalidPeers.status()).toBe(400);
});
