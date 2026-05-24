import { enrichQuote, getProfileForSymbol } from "../../../lib/analysis";
import { fetchSecOwnershipFilings } from "../../../lib/secOwnershipProvider";
import { fetchStockAnalysisSnapshot } from "../../../lib/stockAnalysisProvider";
import { fetchFinnhubData } from "../../../lib/finnhubProvider";

export const dynamic = "force-dynamic";

const YAHOO_QUOTE_URL = "https://query1.finance.yahoo.com/v7/finance/quote";
const STOOQ_QUOTE_URL = "https://stooq.com/q/l/";
const displayNames = {
  NVDA: "NVIDIA Corporation",
  TSLA: "Tesla, Inc.",
  AMD: "Advanced Micro Devices, Inc.",
  GOOGL: "Alphabet Inc.",
  GOOG: "Alphabet Inc.",
  TSM: "Taiwan Semiconductor Manufacturing Company Limited",
  MSFT: "Microsoft Corporation",
  AMZN: "Amazon.com, Inc.",
  META: "Meta Platforms, Inc.",
  AVGO: "Broadcom Inc.",
  ASML: "ASML Holding N.V.",
  AAPL: "Apple Inc.",
  PLTR: "Palantir Technologies Inc."
};

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let quoted = false;

  for (const char of line) {
    if (char === "\"") {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

async function fetchStooqQuote(symbol) {
  const url = new URL(STOOQ_QUOTE_URL);
  url.searchParams.set("s", `${symbol.toLowerCase()}.us`);
  url.searchParams.set("f", "sd2t2ohlcv");
  url.searchParams.set("h", "");
  url.searchParams.set("e", "csv");

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    },
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    throw new Error(`Stooq quote failed: ${response.status}`);
  }

  const text = await response.text();
  const [, row] = text.trim().split("\n");
  const [rawSymbol, date, time, open, high, low, close, volume] = parseCsvLine(row || "");

  if (!row || date === "N/D" || close === "N/D") {
    return null;
  }

  const cleanSymbol = rawSymbol.replace(".US", "").toUpperCase();
  const current = toNumber(close);
  const openPrice = toNumber(open);
  const change = current !== null && openPrice !== null ? current - openPrice : null;
  const changePercent = current !== null && openPrice ? (change / openPrice) * 100 : null;

  return {
    symbol: cleanSymbol,
    shortName: displayNames[cleanSymbol] || cleanSymbol,
    fullExchangeName: "US market",
    currency: "USD",
    regularMarketPrice: current,
    regularMarketChange: change,
    regularMarketChangePercent: changePercent,
    regularMarketOpen: openPrice,
    regularMarketDayLow: toNumber(low),
    regularMarketDayHigh: toNumber(high),
    regularMarketVolume: toNumber(volume),
    marketState: "REGULAR",
    source: `Stooq latest quote ${date} ${time}`
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbols = searchParams
    .get("symbols")
    ?.split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean);

  if (!symbols?.length) {
    return Response.json({ quotes: [] });
  }

  try {
    const url = new URL(YAHOO_QUOTE_URL);
    url.searchParams.set("symbols", symbols.join(","));
    url.searchParams.set("lang", "en-US");
    url.searchParams.set("region", "US");

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      throw new Error(`Yahoo quote failed: ${response.status}`);
    }

    const payload = await response.json();
    let rawQuotes = payload.quoteResponse?.result || [];

    if (!rawQuotes.length) {
      rawQuotes = await Promise.all(symbols.map((symbol) => fetchStooqQuote(symbol)));
      rawQuotes = rawQuotes.filter(Boolean);
    }

    const [snapshots, ownershipFilings, finnhubData] = await Promise.all([
      Promise.all(rawQuotes.map((quote) => fetchStockAnalysisSnapshot(quote.symbol))),
      Promise.all(rawQuotes.map((quote) => fetchSecOwnershipFilings(quote.symbol).catch(() => null))),
      Promise.all(rawQuotes.map((quote) => fetchFinnhubData(quote.symbol).catch(() => null)))
    ]);
    const quotes = rawQuotes.map((quote, index) => {
      const snapshot = snapshots[index] || {};
      const secOwnership = ownershipFilings[index] || null;
      const finnhub = finnhubData[index] || {};
      const metrics = snapshot.metrics || {};
      const mergedQuote = {
        ...quote,
        shortName: snapshot.name || quote.shortName,
        fullExchangeName: snapshot.exchange || quote.fullExchangeName,
        regularMarketPrice: snapshot.price ?? quote.regularMarketPrice,
        regularMarketChange: snapshot.change ?? quote.regularMarketChange,
        regularMarketChangePercent: snapshot.changePercent ?? quote.regularMarketChangePercent,
        regularMarketPreviousClose: snapshot.previousClose ?? quote.regularMarketPreviousClose,
        regularMarketOpen: snapshot.open ?? quote.regularMarketOpen,
        regularMarketDayLow: snapshot.dayLow ?? quote.regularMarketDayLow,
        regularMarketDayHigh: snapshot.dayHigh ?? quote.regularMarketDayHigh,
        regularMarketVolume: snapshot.volume ?? quote.regularMarketVolume,
        marketCap: metrics.marketcap?.number ?? quote.marketCap,
        trailingPE: metrics.pe?.number ?? quote.trailingPE,
        forwardPE: metrics.peForward?.number ?? quote.forwardPE,
        epsTrailingTwelveMonths: metrics.eps?.number ?? quote.epsTrailingTwelveMonths,
        fiftyDayAverage: metrics.sma50?.number ?? quote.fiftyDayAverage,
        twoHundredDayAverage: metrics.sma200?.number ?? quote.twoHundredDayAverage,
        fiftyTwoWeekLow: snapshot.low52 ?? quote.fiftyTwoWeekLow,
        fiftyTwoWeekHigh: snapshot.high52 ?? quote.fiftyTwoWeekHigh,
        targetMeanPrice: metrics.priceTarget?.number ?? quote.targetMeanPrice,
        averageAnalystRating: metrics.analystRatings?.value ?? quote.averageAnalystRating,
        metrics,
        forecast: snapshot.forecast,
        financials: snapshot.financials,
        news: snapshot.news,
        secOwnership,
        finnhub,
        fundamentalsSource: snapshot.source,
        fundamentalsSourceUrl: snapshot.sourceUrl
      };

      return enrichQuote(mergedQuote, getProfileForSymbol(quote.symbol, snapshot));
    });

    return Response.json({
      updatedAt: new Date().toISOString(),
      quotes
    });
  } catch (error) {
    try {
      const rawQuotes = await Promise.all(symbols.map((symbol) => fetchStooqQuote(symbol)));
      const validRawQuotes = rawQuotes.filter(Boolean);
      const [snapshots, ownershipFilings, finnhubData] = await Promise.all([
        Promise.all(validRawQuotes.map((quote) => fetchStockAnalysisSnapshot(quote.symbol))),
        Promise.all(validRawQuotes.map((quote) => fetchSecOwnershipFilings(quote.symbol).catch(() => null))),
        Promise.all(validRawQuotes.map((quote) => fetchFinnhubData(quote.symbol).catch(() => null)))
      ]);
      const quotes = validRawQuotes.map((quote, index) => {
        const snapshot = snapshots[index] || {};
        const secOwnership = ownershipFilings[index] || null;
        const finnhub = finnhubData[index] || {};
        const metrics = snapshot.metrics || {};
        return enrichQuote(
          {
            ...quote,
            shortName: snapshot.name || quote.shortName,
            fullExchangeName: snapshot.exchange || quote.fullExchangeName,
            regularMarketPrice: snapshot.price ?? quote.regularMarketPrice,
            regularMarketChange: snapshot.change ?? quote.regularMarketChange,
            regularMarketChangePercent: snapshot.changePercent ?? quote.regularMarketChangePercent,
            regularMarketPreviousClose: snapshot.previousClose ?? quote.regularMarketPreviousClose,
            regularMarketOpen: snapshot.open ?? quote.regularMarketOpen,
            regularMarketDayLow: snapshot.dayLow ?? quote.regularMarketDayLow,
            regularMarketDayHigh: snapshot.dayHigh ?? quote.regularMarketDayHigh,
            regularMarketVolume: snapshot.volume ?? quote.regularMarketVolume,
            marketCap: metrics.marketcap?.number,
            trailingPE: metrics.pe?.number,
            forwardPE: metrics.peForward?.number,
            epsTrailingTwelveMonths: metrics.eps?.number,
            fiftyDayAverage: metrics.sma50?.number,
            twoHundredDayAverage: metrics.sma200?.number,
            fiftyTwoWeekLow: snapshot.low52,
            fiftyTwoWeekHigh: snapshot.high52,
            targetMeanPrice: metrics.priceTarget?.number,
            averageAnalystRating: metrics.analystRatings?.value,
            metrics,
            forecast: snapshot.forecast,
            financials: snapshot.financials,
            news: snapshot.news,
            secOwnership,
            finnhub,
            fundamentalsSource: snapshot.source,
            fundamentalsSourceUrl: snapshot.sourceUrl
          },
          getProfileForSymbol(quote.symbol, snapshot)
        );
      });

      if (quotes.length) {
        return Response.json({
          updatedAt: new Date().toISOString(),
          quotes,
          warning: "Yahoo Finance quote endpoint 暫時不可用，已改用 Stooq 公開行情。"
        });
      }
    } catch {
      // Return the original upstream error below.
    }

    return Response.json(
      {
        quotes: [],
        error: "目前無法取得公開行情資料，請稍後再試。",
        detail: error.message
      },
      { status: 502 }
    );
  }
}
