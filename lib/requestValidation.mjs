const SYMBOL_PATTERN = /^[A-Z][A-Z0-9.-]{0,7}$/;
const DEFAULT_MAX_SYMBOLS = 50;

export function normalizeSymbols(value, { maxSymbols = DEFAULT_MAX_SYMBOLS } = {}) {
	const rawSymbols = Array.isArray(value) ? value : String(value || "").split(",");
	const symbols = [...new Set(rawSymbols.map((symbol) => String(symbol).trim().toUpperCase()).filter(Boolean))];

	if (!symbols.length) {
		return { symbols: [], error: "至少需要一個有效的股票代號。" };
	}

	if (symbols.length > maxSymbols) {
		return { symbols: [], error: `一次最多只能處理 ${maxSymbols} 個股票代號。` };
	}

	const invalid = symbols.find((symbol) => !SYMBOL_PATTERN.test(symbol));
	if (invalid) {
		return { symbols: [], error: `股票代號格式無效：${invalid}` };
	}

	return { symbols, error: null };
}

export function normalizeSearchQuery(value, maxLength = 80) {
	const query = String(value || "").trim();
	if (!query) return { query: "", error: null };
	if (query.length > maxLength) {
		return { query: "", error: `搜尋字串最多 ${maxLength} 個字元。` };
	}
	return { query, error: null };
}

export function getClientKey(request, scope) {
	const realIp = request.headers.get("x-real-ip")?.trim();
	const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
	const address = (realIp || forwarded || "anonymous").slice(0, 96);
	return `${scope}:${address}`;
}
