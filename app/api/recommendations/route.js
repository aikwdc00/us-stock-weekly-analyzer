import { enrichQuote, getProfileForSymbol } from "../../../lib/analysis";
import { fetchStockAnalysisSnapshot } from "../../../lib/stockAnalysisProvider";

export const dynamic = "force-dynamic";

const BIGGEST_COMPANIES_URL = "https://stockanalysis.com/list/biggest-companies/";
const MAX_CANDIDATES = 36;
const MAX_PER_GROUP = 8;

function cleanText(value) {
	return value
		.replace(/<!--[\s\S]*?-->/g, "")
		.replace(/<[^>]+>/g, "")
		.replace(/&amp;/g, "&")
		.replace(/&#39;/g, "'")
		.trim();
}

function parsePercent(value) {
	if (!value) return null;
	const number = Number(String(value).replace(/[+,%]/g, ""));
	return Number.isFinite(number) ? number : null;
}

function parseCompanyRows(html) {
	const table = html.match(/<table[\s\S]*?<\/table>/)?.[0] || "";
	const rows = [...table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].slice(1);

	return rows
		.map(([, row]) => {
			const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((cell) => cleanText(cell[1]));
			const href = row.match(/<a href="\/stocks\/([^"/]+)\/"/)?.[1];
			const symbol = cells[1]?.replace(/\./g, "-").toUpperCase();

			return {
				symbol,
				sourceSlug: href,
				name: cells[2],
				marketCap: cells[3],
				price: cells[4],
				change: cells[5],
				revenue: cells[6],
			};
		})
		.filter((row) => row.symbol && row.sourceSlug && /^[A-Z][A-Z0-9-]{0,7}$/.test(row.symbol));
}

async function fetchMarketUniverse() {
	const response = await fetch(BIGGEST_COMPANIES_URL, {
		headers: { "User-Agent": "Mozilla/5.0" },
		next: { revalidate: 60 * 60 },
	});

	if (!response.ok) {
		throw new Error(`StockAnalysis universe failed: ${response.status}`);
	}

	const html = await response.text();
	return parseCompanyRows(html).slice(0, MAX_CANDIDATES);
}

function makeSyntheticQuote(row, snapshot) {
	const metrics = snapshot.metrics || {};

	return {
		symbol: row.symbol,
		shortName: snapshot.name || row.name || row.symbol,
		fullExchangeName: snapshot.exchange || "US market",
		currency: "USD",
		regularMarketPrice: snapshot.price,
		regularMarketChange: snapshot.change,
		regularMarketChangePercent: snapshot.changePercent ?? parsePercent(row.change),
		regularMarketPreviousClose: snapshot.previousClose,
		regularMarketOpen: snapshot.open,
		regularMarketDayLow: snapshot.dayLow,
		regularMarketDayHigh: snapshot.dayHigh,
		regularMarketVolume: snapshot.volume,
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
		fundamentalsSource: snapshot.source,
		fundamentalsSourceUrl: snapshot.sourceUrl,
	};
}

function addReason(reasons, condition, text) {
	if (condition) reasons.push(text);
}

function scoreStable(quote, rank) {
	const reasons = [];
	const fcfYield = quote.fcfYield;
	const forwardPe = quote.forwardPe;
	const grossMargin = parsePercent(quote.fundamentals.grossMargin);
	const profitMargin = parsePercent(quote.fundamentals.profitMargin);
	const revenueGrowth = parsePercent(quote.fundamentals.estimatedAnnualRevenueGrowth);
	let score = 50;

	score += Math.max(0, 18 - rank * 0.35);
	if (quote.quality?.score) score += quote.quality.score * 0.16;
	if (Number.isFinite(fcfYield) && fcfYield > 0) score += Math.min(fcfYield * 1.5, 14);
	if (Number.isFinite(forwardPe) && forwardPe > 0 && forwardPe <= 35) score += 11;
	if (Number.isFinite(grossMargin) && grossMargin >= 45) score += 8;
	if (Number.isFinite(profitMargin) && profitMargin >= 18) score += 8;
	if (Number.isFinite(revenueGrowth) && revenueGrowth >= 5) score += Math.min(revenueGrowth * 0.35, 10);
	if (quote.valuation === "明顯高估") score -= 14;
	if (quote.trend === "偏空") score -= 8;

	addReason(reasons, quote.quality?.score >= 80, `資料完整度 ${quote.quality.score}/100`);
	addReason(reasons, Number.isFinite(fcfYield) && fcfYield > 0, `FCF Yield ${quote.formatted.fcfYield}`);
	addReason(reasons, Number.isFinite(forwardPe) && forwardPe <= 35, `Forward PE ${quote.formatted.forwardPe}`);
	addReason(reasons, Number.isFinite(profitMargin) && profitMargin >= 18, `淨利率 ${quote.fundamentals.profitMargin}`);
	addReason(reasons, Number.isFinite(revenueGrowth) && revenueGrowth >= 5, `預估營收成長 ${quote.fundamentals.estimatedAnnualRevenueGrowth}`);

	return { score: Math.round(score), reasons: reasons.slice(0, 4) };
}

function scoreAggressive(quote) {
	const reasons = [];
	const revenueGrowth = parsePercent(quote.fundamentals.estimatedAnnualRevenueGrowth);
	const nextRevenueGrowth = parsePercent(quote.fundamentals.estimatedNextAnnualRevenueGrowth);
	const latestGrowth = parsePercent(quote.fundamentals.latestQuarterRevenueGrowth);
	const grossMargin = parsePercent(quote.fundamentals.grossMargin);
	let score = 45;

	if (quote.quality?.score) score += quote.quality.score * 0.12;
	if (Number.isFinite(revenueGrowth)) score += Math.min(Math.max(revenueGrowth, 0) * 0.9, 28);
	if (Number.isFinite(nextRevenueGrowth)) score += Math.min(Math.max(nextRevenueGrowth, 0) * 0.55, 18);
	if (Number.isFinite(latestGrowth)) score += Math.min(Math.max(latestGrowth, 0) * 0.45, 14);
	if (Number.isFinite(grossMargin) && grossMargin >= 45) score += 8;
	if (quote.trend === "偏多") score += 7;
	if (quote.valuation === "明顯高估") score -= 10;

	addReason(reasons, Number.isFinite(revenueGrowth), `本年度預估營收成長 ${quote.fundamentals.estimatedAnnualRevenueGrowth}`);
	addReason(reasons, Number.isFinite(nextRevenueGrowth), `下一年度預估營收成長 ${quote.fundamentals.estimatedNextAnnualRevenueGrowth}`);
	addReason(reasons, Number.isFinite(latestGrowth), `最新季度營收成長 ${quote.fundamentals.latestQuarterRevenueGrowth}`);
	addReason(reasons, Number.isFinite(grossMargin) && grossMargin >= 45, `毛利率 ${quote.fundamentals.grossMargin}`);
	addReason(reasons, quote.trend === "偏多", "技術面偏多");

	return { score: Math.round(score), reasons: reasons.slice(0, 4) };
}

function toItem(quote, result, row) {
	return {
		symbol: quote.symbol,
		name: quote.name,
		score: result.score,
		reasons: result.reasons.length ? result.reasons : ["通過基礎資料檢查，適合列入觀察"],
		price: quote.formatted.price,
		valuation: quote.valuation,
		rating: quote.rating,
		trend: quote.trend,
		revenueGrowth: quote.fundamentals.estimatedAnnualRevenueGrowth || "N/A",
		fcfYield: quote.formatted.fcfYield,
		sourceRank: row.rank,
	};
}

export async function GET(request) {
	const { searchParams } = new URL(request.url);
	const exclude = new Set(
		searchParams
			.get("exclude")
			?.split(",")
			.map((symbol) => symbol.trim().toUpperCase())
			.filter(Boolean) || []
	);

	try {
		const universe = (await fetchMarketUniverse()).map((row, index) => ({
			...row,
			rank: index + 1,
		}));
		const snapshots = await Promise.all(universe.map((row) => fetchStockAnalysisSnapshot(row.symbol).catch(() => ({ metrics: {} }))));
		const enriched = universe
			.map((row, index) => enrichQuote(makeSyntheticQuote(row, snapshots[index] || {}), getProfileForSymbol(row.symbol)))
			.filter((quote) => quote.price && !exclude.has(quote.symbol));

		const stable = enriched
			.map((quote) => {
				const row = universe.find((item) => item.symbol === quote.symbol) || {};
				return { quote, row, result: scoreStable(quote, row.rank || 99) };
			})
			.filter((item) => item.result.score >= 62)
			.sort((a, b) => b.result.score - a.result.score)
			.slice(0, MAX_PER_GROUP)
			.map((item) => toItem(item.quote, item.result, item.row));

		const aggressive = enriched
			.map((quote) => {
				const row = universe.find((item) => item.symbol === quote.symbol) || {};
				return { quote, row, result: scoreAggressive(quote) };
			})
			.filter((item) => item.result.score >= 58)
			.sort((a, b) => b.result.score - a.result.score)
			.slice(0, MAX_PER_GROUP)
			.map((item) => toItem(item.quote, item.result, item.row));

		return Response.json({
			updatedAt: new Date().toISOString(),
			source: "StockAnalysis biggest companies + app weekly-rule scoring",
			universeCount: universe.length,
			groups: [
				{
					id: "steadyGrowth",
					title: "穩定成長",
					titleEn: "Stable Growth",
					criteria: "即時候選池中，優先篩選大型企業、資料完整、FCF Yield 為正、Forward PE 較可控、毛利率/淨利率較佳且仍有營收成長者。",
					criteriaEn:
						"From the live candidate pool, prioritizes large companies with good data quality, positive FCF yield, controlled forward PE, stronger margins, and continuing revenue growth.",
					items: stable,
				},
				{
					id: "aggressiveGrowth",
					title: "積極成長",
					titleEn: "Aggressive Growth",
					criteria: "即時候選池中，優先篩選預估營收成長、下一年度成長、最新季度成長、毛利率與技術面動能較強者，同時扣除估值過熱風險。",
					criteriaEn:
						"From the live candidate pool, prioritizes estimated revenue growth, next-year growth, latest-quarter growth, gross margin, and technical momentum while penalizing overheated valuation.",
					items: aggressive,
				},
			],
		});
	} catch (error) {
		return Response.json(
			{
				error: "目前無法產生動態建議標的，請稍後再試。",
				detail: error.message,
				groups: [],
			},
			{ status: 502 }
		);
	}
}
