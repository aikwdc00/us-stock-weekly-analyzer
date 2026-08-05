"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useQuotes(watchlist, { onError, enabled = true } = {}) {
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
				const query = force ? `symbols=${targetSymbols.join(",")}&_ts=${Date.now()}` : `symbols=${targetSymbols.join(",")}`;
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
					for (const quote of nextQuotes) bySymbol.set(quote.symbol, quote);
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

	useEffect(() => {
		if (!enabled) return undefined;
		refreshQuotes();
		const interval = window.setInterval(() => refreshQuotes(), 15 * 60 * 1000);
		return () => window.clearInterval(interval);
	}, [enabled, refreshQuotes]);

	useEffect(() => {
		setQuotes((currentQuotes) => currentQuotes.filter((quote) => watchlist.includes(quote.symbol)));
	}, [watchlist.join(",")]);

	return {
		quotes,
		updatedAt,
		isLoading,
		dataWarning,
		refreshQuotes,
	};
}
