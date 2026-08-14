export function filterQuotesToRequestedSymbols(rawQuotes, requestedSymbols) {
	const requested = new Set(requestedSymbols);
	const seen = new Set();

	return (Array.isArray(rawQuotes) ? rawQuotes : [])
		.filter((quote) => {
			const symbol = String(quote?.symbol || "")
				.trim()
				.toUpperCase();
			if (!symbol || !requested.has(symbol) || seen.has(symbol)) return false;
			seen.add(symbol);
			return true;
		})
		.map((quote) => ({ ...quote, symbol: String(quote.symbol).trim().toUpperCase() }));
}
