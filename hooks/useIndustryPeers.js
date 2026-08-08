"use client";

import { useState, useEffect } from "react";

const REQUEST_TIMEOUT_MS = 12_000;

export function useIndustryPeers(symbol) {
	const [peers, setPeers] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!symbol) {
			setPeers([]);
			return;
		}

		const controller = new AbortController();
		let unmounted = false;
		const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

		async function fetchPeers() {
			setIsLoading(true);
			setError(null);
			try {
				// 1. Get peer symbols
				const peersRes = await fetch(`/api/peers?symbol=${encodeURIComponent(symbol)}`, { signal: controller.signal });
				if (!peersRes.ok) throw new Error(`Peers request failed: ${peersRes.status}`);
				const peersData = await peersRes.json();
				const peerSymbols = peersData.peers || [];

				if (peerSymbols.length === 0) {
					if (!unmounted) setPeers([]);
					return;
				}

				// Peer comparison needs valuation and margin metrics, but not full SEC/news/AI detail.
				const quotesRes = await fetch(`/api/quotes?scope=peer&symbols=${peerSymbols.map(encodeURIComponent).join(",")}`, {
					signal: controller.signal,
				});
				if (!quotesRes.ok) throw new Error(`Peer quotes request failed: ${quotesRes.status}`);
				const quotesData = await quotesRes.json();
				if (!unmounted) setPeers(quotesData.quotes || []);
			} catch (err) {
				if (!unmounted) setError(err.name === "AbortError" ? "Peers request timed out" : err.message);
			} finally {
				if (!unmounted) setIsLoading(false);
			}
		}

		fetchPeers();
		return () => {
			unmounted = true;
			window.clearTimeout(timeoutId);
			controller.abort();
		};
	}, [symbol]);

	return { peers, isLoading, error };
}
