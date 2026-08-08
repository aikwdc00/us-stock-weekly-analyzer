import test from "node:test";
import assert from "node:assert/strict";
import {
	DATA_STATUSES,
	EVIDENCE_KINDS,
	createCapability,
	createEvidence,
	createField,
	createProviderRecord,
	isRenderableField,
	isUsableEvidence,
} from "../../lib/dataContract.mjs";

test("available evidence keeps provenance and is usable", () => {
	const evidence = createEvidence({
		value: 12.5,
		kind: EVIDENCE_KINDS.calculated,
		source: "SEC EDGAR",
		sourceUrl: "https://www.sec.gov/",
		status: DATA_STATUSES.available,
		confidence: "high",
	});

	assert.equal(evidence.kind, "calculated");
	assert.equal(evidence.source, "SEC EDGAR");
	assert.equal(isUsableEvidence(evidence), true);
});

test("unsupported fields remain hidden candidates", () => {
	const field = createField(null, {
		status: DATA_STATUSES.unsupported,
		note: "Company does not publish monthly revenue.",
	});

	assert.equal(field.capability.supported, false);
	assert.equal(isRenderableField(field), false);
});

test("available evidence without provenance is downgraded to missing", () => {
	const evidence = createEvidence({ value: 42, status: DATA_STATUSES.available });

	assert.equal(evidence.status, DATA_STATUSES.missing);
	assert.equal(isUsableEvidence(evidence), false);
});

test("provider records do not enter verified state by default", () => {
	const record = createProviderRecord({ id: "new-provider" });

	assert.equal(record.state, "candidate");
	assert.equal(createCapability({ status: DATA_STATUSES.stale }).stale, true);
});
