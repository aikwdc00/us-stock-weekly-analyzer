export const dynamic = "force-dynamic";

const YAHOO_PEERS_URL = "https://query2.finance.yahoo.com/v6/finance/recommendationsbysymbol";
const FINNHUB_PEERS_URL = "https://finnhub.io/api/v1/stock/peers";
const FINNHUB_TOKEN = process.env.FINNHUB_API_KEY;

async function fetchFinnhubPeers(symbol) {
	if (!FINNHUB_TOKEN) return [];
	const url = new URL(FINNHUB_PEERS_URL);
	url.searchParams.set("symbol", symbol);
	url.searchParams.set("grouping", "industry");
	url.searchParams.set("token", FINNHUB_TOKEN);

	const response = await fetch(url, { next: { revalidate: 86400 } });
	if (!response.ok) {
		throw new Error(`Finnhub peers failed: ${response.status}`);
	}

	const payload = await response.json();
	return (Array.isArray(payload) ? payload : []).filter((item) => typeof item === "string" && item !== symbol).slice(0, 5);
}

async function fetchYahooPeers(symbol) {
	const url = `${YAHOO_PEERS_URL}/${symbol}`;
	const response = await fetch(url, {
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
	const symbol = searchParams.get("symbol")?.toUpperCase();

	if (!symbol) {
		return Response.json({ peers: [] });
	}

	let finnhubError = null;
	try {
		const peers = await fetchFinnhubPeers(symbol);
		if (peers.length) return Response.json({ symbol, peers, source: "finnhub" });
	} catch (error) {
		finnhubError = error;
	}

	try {
		const peers = await fetchYahooPeers(symbol);
		return Response.json({ symbol, peers, source: "yahoo" });
	} catch (error) {
		console.error("Peers API error:", error);
		return Response.json({
			symbol,
			peers: [],
			error: error.message,
			fallbackError: finnhubError?.message || null,
		});
	}
}
