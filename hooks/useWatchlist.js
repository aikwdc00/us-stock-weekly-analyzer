"use client";

import { useCallback, useEffect, useState } from "react";
import { normalizeSymbol } from "../lib/analysis";
import { DEFAULT_WATCHLIST, STORAGE_KEYS } from "./copy";

export function useWatchlist() {
	const [watchlist, setWatchlist] = useState(DEFAULT_WATCHLIST);
	const [selectedSymbol, setSelectedSymbol] = useState(DEFAULT_WATCHLIST[0]);
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		const saved = window.localStorage.getItem(STORAGE_KEYS.watchlist);
		if (!saved) {
			setHydrated(true);
			return;
		}

		try {
			const parsed = JSON.parse(saved);
			if (Array.isArray(parsed) && parsed.length) {
				setWatchlist(parsed);
				setSelectedSymbol(parsed[0]);
			}
		} catch {
			window.localStorage.removeItem(STORAGE_KEYS.watchlist);
		} finally {
			setHydrated(true);
		}
	}, []);

	useEffect(() => {
		if (!hydrated) return;
		window.localStorage.setItem(STORAGE_KEYS.watchlist, JSON.stringify(watchlist));
	}, [watchlist, hydrated]);

	const applyWatchlist = useCallback(
		(next, preferredSymbol) => {
			setWatchlist(next);
			if (preferredSymbol) {
				setSelectedSymbol(preferredSymbol);
			} else if (!next.includes(selectedSymbol)) {
				setSelectedSymbol(next[0] || "");
			}
			return next;
		},
		[selectedSymbol]
	);

	const addSymbol = useCallback(
		(rawSymbol) => {
			const symbol = normalizeSymbol(rawSymbol);
			if (!symbol) return null;
			if (watchlist.includes(symbol)) {
				setSelectedSymbol(symbol);
				return watchlist;
			}
			const next = [...watchlist, symbol];
			applyWatchlist(next, symbol);
			return next;
		},
		[applyWatchlist, watchlist]
	);

	const removeSymbol = useCallback(
		(symbol) => {
			const next = watchlist.filter((item) => item !== symbol);
			applyWatchlist(next, selectedSymbol === symbol ? next[0] || "" : selectedSymbol);
			return next;
		},
		[applyWatchlist, selectedSymbol, watchlist]
	);

	return {
		watchlist,
		selectedSymbol,
		setSelectedSymbol,
		addSymbol,
		removeSymbol,
		hydrated,
	};
}
