"use client";

import { useState, useEffect } from "react";

export function useIndustryPeers(symbol) {
  const [peers, setPeers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol) {
      setPeers([]);
      return;
    }

    async function fetchPeers() {
      setIsLoading(true);
      setError(null);
      try {
        // 1. Get peer symbols
        const peersRes = await fetch(`/api/peers?symbol=${symbol}`);
        const peersData = await peersRes.json();
        const peerSymbols = peersData.peers || [];

        if (peerSymbols.length === 0) {
          setPeers([]);
          return;
        }

        // 2. Get full quotes for these peers
        const quotesRes = await fetch(`/api/quotes?symbols=${peerSymbols.join(",")}`);
        const quotesData = await quotesRes.json();
        setPeers(quotesData.quotes || []);
      } catch (err) {
        console.error("Failed to fetch industry peers", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPeers();
  }, [symbol]);

  return { peers, isLoading, error };
}
