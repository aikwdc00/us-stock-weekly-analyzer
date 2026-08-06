"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { safeNumber } from "./utils";
import { usePreferences } from "./usePreferences";
import { useQuotes } from "./useQuotes";
import { useRecommendations } from "./useRecommendations";
import { useSymbolSearch } from "./useSymbolSearch";
import { useWatchlist } from "./useWatchlist";

export function useStockAnalyzer({ loadRecommendations = true } = {}) {
	const [error, setError] = useState("");
	const [isAiLoading, setIsAiLoading] = useState(false);
	const preferences = usePreferences();
	const watchlistState = useWatchlist();

	const reportError = useCallback((message) => {
		setError(message);
	}, []);

	const clearError = useCallback(() => {
		setError("");
	}, []);

	const quotesState = useQuotes(watchlistState.watchlist, { onError: reportError, enabled: watchlistState.hydrated });
	const recommendationsState = useRecommendations(watchlistState.watchlist, {
		onError: reportError,
		enabled: watchlistState.hydrated && loadRecommendations,
	});
	const searchState = useSymbolSearch({ onError: reportError });

	const addSymbol = useCallback(
		(rawSymbol) => {
			clearError();
			const next = watchlistState.addSymbol(rawSymbol);
			if (!next || next === watchlistState.watchlist) return;
			searchState.clearSearch();
		},
		[clearError, searchState, watchlistState]
	);

	useEffect(() => {
		if (!watchlistState.hydrated || !watchlistState.selectedSymbol) return;
		void quotesState.refreshDetail([watchlistState.selectedSymbol]);
	}, [quotesState.refreshDetail, watchlistState.hydrated, watchlistState.selectedSymbol]);

	const removeSymbol = useCallback(
		(symbol) => {
			clearError();
			watchlistState.removeSymbol(symbol);
		},
		[clearError, watchlistState]
	);

	const refreshQuotes = useCallback(async () => {
		clearError();
		await quotesState.refreshQuotes(undefined, { force: true, merge: true, scope: "summary" });
	}, [clearError, quotesState]);

	const refreshIdeas = useCallback(async () => {
		if (!loadRecommendations) return;
		clearError();
		await recommendationsState.refreshRecommendations(undefined, { force: true });
	}, [clearError, loadRecommendations, recommendationsState]);

	const runAiAnalysis = useCallback(async () => {
		const symbol = watchlistState.selectedSymbol;
		if (!symbol) return;

		clearError();
		setIsAiLoading(true);
		try {
			await quotesState.refreshDetail([symbol], { force: true, ai: true });
		} finally {
			setIsAiLoading(false);
		}
	}, [clearError, quotesState, watchlistState.selectedSymbol]);

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
		isAiLoading,
		addSymbol,
		removeSymbol,
		refreshAll: refreshQuotes,
		refreshIdeas,
		runAiAnalysis,
	};
}
