export const dynamic = "force-dynamic";

const YAHOO_PEERS_URL = "https://query2.finance.yahoo.com/v6/finance/recommendationsbysymbol";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol")?.toUpperCase();

  if (!symbol) {
    return Response.json({ peers: [] });
  }

  try {
    const url = `${YAHOO_PEERS_URL}/${symbol}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      },
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error(`Yahoo peers failed: ${response.status}`);
    }

    const payload = await response.json();
    const result = payload.finance?.result?.[0];
    const peerSymbols = (result?.recommendedSymbols || [])
      .map((item) => item.symbol)
      .filter((s) => s !== symbol)
      .slice(0, 5);

    return Response.json({
      symbol,
      peers: peerSymbols
    });
  } catch (error) {
    console.error("Peers API error:", error);
    return Response.json({
      symbol,
      peers: [],
      error: error.message
    });
  }
}
