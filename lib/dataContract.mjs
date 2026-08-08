export const EVIDENCE_KINDS = Object.freeze({
	fact: "fact",
	calculated: "calculated",
	inference: "inference",
	ai: "ai",
});

export const DATA_STATUSES = Object.freeze({
	available: "available",
	missing: "missing",
	stale: "stale",
	unsupported: "unsupported",
});

export const CONFIDENCE_LEVELS = Object.freeze({
	high: "high",
	medium: "medium",
	low: "low",
});

const validValues = (values, value) => values.includes(value);

export function createEvidence(input = {}) {
	const evidence = {
		value: input.value ?? null,
		unit: input.unit || null,
		kind: validValues(Object.values(EVIDENCE_KINDS), input.kind) ? input.kind : EVIDENCE_KINDS.fact,
		source: input.source || null,
		sourceUrl: input.sourceUrl || null,
		asOf: input.asOf || null,
		reportedPeriod: input.reportedPeriod || null,
		confidence: validValues(Object.values(CONFIDENCE_LEVELS), input.confidence) ? input.confidence : CONFIDENCE_LEVELS.low,
		status: validValues(Object.values(DATA_STATUSES), input.status) ? input.status : DATA_STATUSES.missing,
		note: input.note || null,
	};

	if (evidence.status === DATA_STATUSES.available && !evidence.source) {
		evidence.status = DATA_STATUSES.missing;
	}

	return evidence;
}

export function createCapability(input = {}) {
	const status = validValues(Object.values(DATA_STATUSES), input.status) ? input.status : DATA_STATUSES.missing;
	return {
		status,
		supported: status !== DATA_STATUSES.unsupported,
		available: status === DATA_STATUSES.available,
		stale: status === DATA_STATUSES.stale,
		source: input.source || null,
		sourceUrl: input.sourceUrl || null,
		asOf: input.asOf || null,
		note: input.note || null,
	};
}

export function createField(value, input = {}) {
	return {
		value: value ?? null,
		evidence: createEvidence({ ...input, value }),
		capability: createCapability(input),
	};
}

export function isRenderableField(field) {
	return Boolean(field?.capability && field.capability.status !== DATA_STATUSES.unsupported);
}

export function isUsableEvidence(evidence) {
	return Boolean(evidence?.status === DATA_STATUSES.available && evidence.source);
}

export function createProviderRecord(input = {}) {
	const states = ["candidate", "verified", "rejected", "fallback"];
	return {
		id: input.id || "unknown",
		state: states.includes(input.state) ? input.state : "candidate",
		domain: input.domain || "unknown",
		verifiedAt: input.verifiedAt || null,
		reason: input.reason || null,
	};
}
