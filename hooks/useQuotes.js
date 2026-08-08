"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useQuotes(watchlist, { onError, enabled = true, retainSymbols = [] } = {}) {
	const [quotes, setQuotes] = useState([]);
	const [updatedAt, setUpdatedAt] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [dataWarning, setDataWarning] = useState("");
	const watchlistRef = useRef(watchlist);
	watchlistRef.current = watchlist;

	const refreshQuotes = useCallback(
		async (symbols, options = {}) => {
			const targetSymbols = symbols || watchlistRef.current;
			if (!targetSymbols.length) {
				setQuotes([]);
				setDataWarning("");
				return;
			}

			setIsLoading(true);
			setDataWarning("");

			try {
				const force = Boolean(options?.force);
				const scope = options?.scope === "detail" ? "detail" : "summary";
				const params = new URLSearchParams({ symbols: targetSymbols.join(",") });
				params.set("scope", scope);
				if (force) params.set("_ts", String(Date.now()));
				if (options?.ai) params.set("ai", "true");
				const query = params.toString();
				const response = await fetch(`/api/quotes?${query}`, {
					cache: "no-store",
				});
				const payload = await response.json();

				if (!response.ok) {
					throw new Error(payload.error || "行情更新失敗");
				}

				const nextQuotes = payload.quotes || [];
				setQuotes((currentQuotes) => {
					if (!options?.merge) return nextQuotes;
					const bySymbol = new Map(currentQuotes.map((quote) => [quote.symbol, quote]));
					for (const quote of nextQuotes) {
						const current = bySymbol.get(quote.symbol);
						if (scope === "summary" && current?.detailLevel === "detail") {
							bySymbol.set(quote.symbol, {
								...current,
								...quote,
								profile: current.profile,
								ownership: current.ownership,
								filingFinancials: current.filingFinancials,
								detailedFinancials: current.detailedFinancials,
								news: current.news,
								events: current.events,
								evidence: { ...current.evidence, market: quote.evidence?.market || current.evidence?.market },
								quality: { ...current.quality, stale: quote.quality?.stale, asOf: quote.quality?.asOf },
								catalystTimeline: current.catalystTimeline,
								valuationModels: current.valuationModels,
								valuationMethod: current.valuationMethod,
								catalysts: current.catalysts,
								aiSupplement: current.aiSupplement,
								valuation: current.valuation,
								trend: current.trend,
								rating: current.rating,
								thesis: current.thesis,
								detailLevel: "detail",
							});
						} else {
							bySymbol.set(quote.symbol, quote);
						}
					}
					return [...bySymbol.values()];
				});
				setUpdatedAt(payload.updatedAt);
				setDataWarning(payload.warning || "");
			} catch (quoteError) {
				onError?.(quoteError.message);
			} finally {
				setIsLoading(false);
			}
		},
		[onError]
	);

	const refreshDetail = useCallback(
		(symbols, options = {}) => refreshQuotes(symbols, { ...options, scope: "detail", merge: true }),
		[refreshQuotes]
	);

	useEffect(() => {
		if (!enabled) return undefined;
		refreshQuotes(undefined, { merge: true, scope: "summary" });
		const interval = window.setInterval(() => refreshQuotes(undefined, { merge: true, scope: "summary" }), 15 * 60 * 1000);
		return () => window.clearInterval(interval);
	}, [enabled, refreshQuotes]);

	const retainedSymbolsKey = retainSymbols.filter(Boolean).join(",");

	useEffect(() => {
		const retained = new Set(retainedSymbolsKey ? retainedSymbolsKey.split(",") : []);
		setQuotes((currentQuotes) => currentQuotes.filter((quote) => watchlist.includes(quote.symbol) || retained.has(quote.symbol)));
	}, [retainedSymbolsKey, watchlist.join(",")]);

	return {
		quotes,
		updatedAt,
		isLoading,
		dataWarning,
		refreshQuotes,
		refreshDetail,
	};
}
