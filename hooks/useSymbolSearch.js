"use client";

import { useCallback, useState } from "react";

export function useSymbolSearch({ onError } = {}) {
	const [searchTerm, setSearchTerm] = useState("");
	const [results, setResults] = useState([]);
	const [isSearching, setIsSearching] = useState(false);

	const searchSymbols = useCallback(
		async (event) => {
			event?.preventDefault();
			const query = searchTerm.trim();
			if (!query) return;

			setIsSearching(true);

			try {
				const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
					cache: "no-store",
				});
				const payload = await response.json();

				if (!response.ok) {
					throw new Error(payload.error || "搜尋失敗");
				}

				setResults(payload.results || []);
			} catch (searchError) {
				onError?.(searchError.message);
			} finally {
				setIsSearching(false);
			}
		},
		[onError, searchTerm]
	);

	const clearSearch = useCallback(() => {
		setSearchTerm("");
		setResults([]);
	}, []);

	return {
		searchTerm,
		setSearchTerm,
		results,
		isSearching,
		searchSymbols,
		clearSearch,
	};
}
