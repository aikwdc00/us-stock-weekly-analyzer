"use client";

import { useCallback, useMemo, useState } from "react";
import { safeNumber } from "./utils";
import { usePreferences } from "./usePreferences";
import { useQuotes } from "./useQuotes";
import { useRecommendations } from "./useRecommendations";
import { useSymbolSearch } from "./useSymbolSearch";
import { useWatchlist } from "./useWatchlist";

export function useStockAnalyzer() {
	const [error, setError] = useState("");
	const preferences = usePreferences();
	const watchlistState = useWatchlist();

	const reportError = useCallback((message) => {
		setError(message);
	}, []);

	const clearError = useCallback(() => {
		setError("");
	}, []);

	const quotesState = useQuotes(watchlistState.watchlist, { onError: reportError });
	const recommendationsState = useRecommendations(watchlistState.watchlist, {
		onError: reportError,
	});
	const searchState = useSymbolSearch({ onError: reportError });

	const addSymbol = useCallback(
		async (rawSymbol) => {
			clearError();
			const next = watchlistState.addSymbol(rawSymbol);
			if (!next || next === watchlistState.watchlist) return;
			searchState.clearSearch();
			await Promise.all([quotesState.refreshQuotes(next), recommendationsState.refreshRecommendations(next)]);
		},
		[clearError, quotesState, recommendationsState, searchState, watchlistState]
	);

	const removeSymbol = useCallback(
		(symbol) => {
			clearError();
			watchlistState.removeSymbol(symbol);
		},
		[clearError, watchlistState]
	);

	const refreshAll = useCallback(async () => {
		clearError();
		await quotesState.refreshQuotes();
	}, [clearError, quotesState]);

	const refreshIdeas = useCallback(async () => {
		clearError();
		await recommendationsState.refreshRecommendations();
	}, [clearError, recommendationsState]);

	const selectedQuote = useMemo(
		() => quotesState.quotes.find((quote) => quote.symbol === watchlistState.selectedSymbol),
		[quotesState.quotes, watchlistState.selectedSymbol]
	);

	const coverageStats = useMemo(() => {
		const loaded = quotesState.quotes.length;
		const positive = quotesState.quotes.filter((quote) => ["分批買入", "續抱"].includes(quote.rating)).length;
		const avgMove = quotesState.quotes.reduce((sum, quote) => sum + (safeNumber(quote.changePercent) ?? 0), 0) / Math.max(loaded, 1);

		return { loaded, positive, avgMove };
	}, [quotesState.quotes]);

	const hasRecommendationItems = recommendationsState.groups.some((group) => group.items?.length);

	return {
		...preferences,
		...watchlistState,
		...quotesState,
		...recommendationsState,
		...searchState,
		error,
		selectedQuote,
		coverageStats,
		hasRecommendationItems,
		recommendationGroups: recommendationsState.groups,
		recommendationsUpdatedAt: recommendationsState.updatedAt,
		isLoadingRecommendations: recommendationsState.isLoading,
		addSymbol,
		removeSymbol,
		refreshAll,
		refreshIdeas,
	};
}
