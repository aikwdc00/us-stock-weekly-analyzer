export const dynamic = "force-dynamic";

import { fetchWithTimeout } from "../../../lib/fetchPolicy";
import { getClientKey, normalizeSymbols } from "../../../lib/requestValidation.mjs";
import { checkRateLimit, rateLimitHeaders } from "../../../lib/rateLimit.mjs";

const YAHOO_PEERS_URL = "https://query2.finance.yahoo.com/v6/finance/recommendationsbysymbol";
const FINNHUB_PEERS_URL = "https://finnhub.io/api/v1/stock/peers";
const FINNHUB_TOKEN = process.env.FINNHUB_API_KEY;

async function fetchFinnhubPeers(symbol) {
	if (!FINNHUB_TOKEN) return [];
	const url = new URL(FINNHUB_PEERS_URL);
	url.searchParams.set("symbol", symbol);
	url.searchParams.set("grouping", "industry");
	url.searchParams.set("token", FINNHUB_TOKEN);

	const response = await fetchWithTimeout(url, { timeoutMs: 8_000, next: { revalidate: 86400 } });
	if (!response.ok) {
		throw new Error(`Finnhub peers failed: ${response.status}`);
	}

	const payload = await response.json();
	return (Array.isArray(payload) ? payload : []).filter((item) => typeof item === "string" && item !== symbol).slice(0, 5);
}

async function fetchYahooPeers(symbol) {
	const url = `${YAHOO_PEERS_URL}/${symbol}`;
	const response = await fetchWithTimeout(url, {
		timeoutMs: 8_000,
		headers: {
			"User-Agent": "Mozilla/5.0",
		},
		next: { revalidate: 86400 },
	});

	if (!response.ok) {
		throw new Error(`Yahoo peers failed: ${response.status}`);
	}

	const payload = await response.json();
	const result = payload.finance?.result?.[0];
	return (result?.recommendedSymbols || [])
		.map((item) => item.symbol)
		.filter((item) => item !== symbol)
		.slice(0, 5);
}

export async function GET(request) {
	const { searchParams } = new URL(request.url);
	const parsed = normalizeSymbols(searchParams.get("symbol"), { maxSymbols: 1 });
	const rateLimit = checkRateLimit(getClientKey(request, "peers"), { limit: 90, windowMs: 60_000 });

	if (!rateLimit.allowed) {
		return Response.json({ peers: [], error: "請求過於頻繁，請稍後再試。" }, { status: 429, headers: rateLimitHeaders(rateLimit) });
	}

	if (parsed.error) {
		return Response.json({ peers: [], error: parsed.error }, { status: 400 });
	}

	const [symbol] = parsed.symbols;

	try {
		const peers = await fetchFinnhubPeers(symbol);
		if (peers.length) return Response.json({ symbol, peers, source: "finnhub" });
	} catch {
		// Fall back to Yahoo recommendations when Finnhub is unavailable.
	}

	try {
		const peers = await fetchYahooPeers(symbol);
		return Response.json({ symbol, peers, source: "yahoo" });
	} catch {
		return Response.json({ symbol, peers: [], error: "同業資料暫時無法取得，請稍後再試。" }, { status: 502 });
	}
}
