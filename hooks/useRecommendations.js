"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useRecommendations(watchlist, { onError, enabled = true } = {}) {
	const [groups, setGroups] = useState([]);
	const [updatedAt, setUpdatedAt] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const watchlistRef = useRef(watchlist);
	watchlistRef.current = watchlist;

	const refreshRecommendations = useCallback(
		async (excludedSymbols, options = {}) => {
			setIsLoading(true);

			try {
				const targetSymbols = excludedSymbols || watchlistRef.current;
				const force = Boolean(options?.force);
				const query = force ? `exclude=${targetSymbols.join(",")}&_ts=${Date.now()}` : `exclude=${targetSymbols.join(",")}`;
				const response = await fetch(`/api/recommendations?${query}`, {
					cache: "no-store",
				});
				const payload = await response.json();

				if (!response.ok) {
					throw new Error(payload.error || "建議標的更新失敗");
				}

				setGroups(payload.groups || []);
				setUpdatedAt(payload.updatedAt);
			} catch (recommendationError) {
				onError?.(recommendationError.message);
				setGroups([]);
			} finally {
				setIsLoading(false);
			}
		},
		[onError]
	);

	useEffect(() => {
		if (!enabled) return undefined;
		refreshRecommendations();
		const interval = window.setInterval(() => refreshRecommendations(), 60 * 60 * 1000);
		return () => window.clearInterval(interval);
	}, [enabled, refreshRecommendations]);

	return {
		groups,
		updatedAt,
		isLoading,
		refreshRecommendations,
	};
}
