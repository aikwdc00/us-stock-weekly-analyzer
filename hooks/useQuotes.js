"use client";

import { useCallback, useEffect, useState } from "react";

export function useQuotes(watchlist, { onError } = {}) {
	const [quotes, setQuotes] = useState([]);
	const [updatedAt, setUpdatedAt] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [dataWarning, setDataWarning] = useState("");

	const refreshQuotes = useCallback(
		async (symbols = watchlist, options = {}) => {
			if (!symbols.length) {
				setQuotes([]);
				setDataWarning("");
				return;
			}

			setIsLoading(true);
			setDataWarning("");

			try {
				const force = Boolean(options?.force);
				const query = force ? `symbols=${symbols.join(",")}&_ts=${Date.now()}` : `symbols=${symbols.join(",")}`;
				const response = await fetch(`/api/quotes?${query}`, {
					cache: "no-store",
				});
				const payload = await response.json();

				if (!response.ok) {
					throw new Error(payload.error || "行情更新失敗");
				}

				setQuotes(payload.quotes || []);
				setUpdatedAt(payload.updatedAt);
				setDataWarning(payload.warning || "");
			} catch (quoteError) {
				onError?.(quoteError.message);
			} finally {
				setIsLoading(false);
			}
		},
		[onError, watchlist]
	);

	useEffect(() => {
		refreshQuotes(watchlist);
		const interval = window.setInterval(() => refreshQuotes(watchlist), 15 * 60 * 1000);
		return () => window.clearInterval(interval);
	}, [watchlist.join(","), refreshQuotes]);

	return {
		quotes,
		updatedAt,
		isLoading,
		dataWarning,
		refreshQuotes,
	};
}
