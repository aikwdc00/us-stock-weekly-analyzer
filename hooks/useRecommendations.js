"use client";

import { useCallback, useEffect, useState } from "react";

export function useRecommendations(watchlist, { onError } = {}) {
	const [groups, setGroups] = useState([]);
	const [updatedAt, setUpdatedAt] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	const refreshRecommendations = useCallback(
		async (excludedSymbols = watchlist, options = {}) => {
			setIsLoading(true);

			try {
				const force = Boolean(options?.force);
				const query = force ? `exclude=${excludedSymbols.join(",")}&_ts=${Date.now()}` : `exclude=${excludedSymbols.join(",")}`;
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
		[onError, watchlist]
	);

	useEffect(() => {
		refreshRecommendations(watchlist);
		const interval = window.setInterval(() => refreshRecommendations(watchlist), 60 * 60 * 1000);
		return () => window.clearInterval(interval);
	}, [watchlist.join(","), refreshRecommendations]);

	return {
		groups,
		updatedAt,
		isLoading,
		refreshRecommendations,
	};
}
