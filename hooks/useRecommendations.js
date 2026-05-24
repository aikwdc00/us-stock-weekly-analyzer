"use client";

import { useCallback, useEffect, useState } from "react";

export function useRecommendations(watchlist, { onError } = {}) {
  const [groups, setGroups] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshRecommendations = useCallback(
    async (excludedSymbols = watchlist) => {
      setIsLoading(true);

      try {
        const response = await fetch(`/api/recommendations?exclude=${excludedSymbols.join(",")}`, {
          cache: "no-store"
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
    refreshRecommendations
  };
}
