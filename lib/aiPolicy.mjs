const DEFAULT_MAX_OUTPUT_TOKENS = 500;
const MIN_MAX_OUTPUT_TOKENS = 128;
const MAX_MAX_OUTPUT_TOKENS = 1000;

function boundedInteger(value, fallback, min, max) {
	const parsed = Number.parseInt(value, 10);
	if (!Number.isFinite(parsed)) return fallback;
	return Math.min(max, Math.max(min, parsed));
}

export function getAiMaxOutputTokens(fallback = DEFAULT_MAX_OUTPUT_TOKENS) {
	return boundedInteger(process.env.OPENAI_MAX_OUTPUT_TOKENS, fallback, MIN_MAX_OUTPUT_TOKENS, MAX_MAX_OUTPUT_TOKENS);
}

export function limitAiText(value, maxLength = 2_000) {
	const text = String(value || "").trim();
	return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

export const AI_INPUT_LIMITS = Object.freeze({
	profile: 500,
	newsTitle: 320,
	newsText: 900,
});
