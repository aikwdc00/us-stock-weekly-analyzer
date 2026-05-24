export const dynamic = "force-dynamic";

const YAHOO_SEARCH_URL = "https://query1.finance.yahoo.com/v1/finance/search";
const aliasResults = {
  google: [{ symbol: "GOOGL", name: "Alphabet Inc. Class A", exchange: "NASDAQ", type: "EQUITY" }],
  alphabet: [{ symbol: "GOOGL", name: "Alphabet Inc. Class A", exchange: "NASDAQ", type: "EQUITY" }],
  tsmc: [{ symbol: "TSM", name: "Taiwan Semiconductor Manufacturing Company Limited", exchange: "NYSE", type: "EQUITY" }],
  nvidia: [{ symbol: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ", type: "EQUITY" }],
  tesla: [{ symbol: "TSLA", name: "Tesla, Inc.", exchange: "NASDAQ", type: "EQUITY" }],
  amd: [{ symbol: "AMD", name: "Advanced Micro Devices, Inc.", exchange: "NASDAQ", type: "EQUITY" }]
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return Response.json({ results: [] });
  }

  try {
    const url = new URL(YAHOO_SEARCH_URL);
    url.searchParams.set("q", query);
    url.searchParams.set("quotesCount", "10");
    url.searchParams.set("newsCount", "0");
    url.searchParams.set("lang", "en-US");
    url.searchParams.set("region", "US");

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      throw new Error(`Yahoo search failed: ${response.status}`);
    }

    const payload = await response.json();
    const yahooResults = (payload.quotes || [])
      .filter((item) => item.symbol && ["EQUITY", "ETF"].includes(item.quoteType))
      .map((item) => ({
        symbol: item.symbol,
        name: item.shortname || item.longname || item.symbol,
        exchange: item.exchange || item.exchDisp || "US",
        type: item.quoteType
      }));
    const aliases = aliasResults[query.toLowerCase()] || [];
    const direct =
      /^[A-Za-z.]{1,8}$/.test(query) && aliases.length === 0
        ? [{ symbol: query.toUpperCase(), name: "直接加入此代號", exchange: "US", type: "EQUITY" }]
        : [];
    const seen = new Set();
    const results = [...aliases, ...direct, ...yahooResults].filter((item) => {
      if (seen.has(item.symbol)) return false;
      seen.add(item.symbol);
      return true;
    });

    return Response.json({ results });
  } catch (error) {
    return Response.json(
      {
        results: [],
        error: "目前無法搜尋公開行情來源，請稍後再試。",
        detail: error.message
      },
      { status: 502 }
    );
  }
}
