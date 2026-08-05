import test from "node:test";
import assert from "node:assert/strict";
import { getProvider, getVerifiedProviders, PROVIDER_STATES } from "../../lib/providerRegistry.mjs";

test("SEC is the only verified primary provider in the current registry", () => {
	const providers = getVerifiedProviders();
	assert.deepEqual(
		providers.map((provider) => provider.id),
		["sec-edgar"]
	);
	assert.equal(getProvider("sec-edgar").state, PROVIDER_STATES.VERIFIED);
});

test("candidate providers cannot be selected as verified sources", () => {
	assert.equal(getProvider("polygon").state, PROVIDER_STATES.CANDIDATE);
	assert.equal(getVerifiedProviders("quote").length, 0);
});
