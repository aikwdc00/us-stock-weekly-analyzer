import { fetchWithTimeout } from "./fetchPolicy";

const YAHOO_CALENDAR_URL = "https://query1.finance.yahoo.com/v10/finance/quoteSummary";
const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
const FINNHUB_TOKEN = process.env.FINNHUB_API_KEY;
const cache = new Map();

function isoDate(value) {
	if (!Number.isFinite(value)) return null;
	const date = new Date(value > 10_000_000_000 ? value : value * 1000);
	return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

function dateRange() {
	const from = new Date();
	const to = new Date(from);
	to.setUTCFullYear(to.getUTCFullYear() + 1);
	return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

function dedupeEvents(events) {
	const seen = new Set();
	return events.filter((event) => {
		const key = `${event.type}:${event.date}`;
		if (!event.date || seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

function readRawQuoteEvents(symbol, quote) {
	const source = "Yahoo Finance quote";
	const sourceUrl = `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}/calendar/`;
	const events = [];
	const earningsTimestamp = quote?.earningsTimestamp || quote?.earningsTimestampStart;
	const earningsDate = isoDate(earningsTimestamp);
	if (earningsDate) {
		events.push({
			type: "earnings",
			label: "財報公告日",
			labelEn: "Earnings release date",
			date: earningsDate,
			status: "expected",
			source,
			sourceUrl,
		});
	}

	for (const [key, label, labelEn] of [
		["exDividendDate", "除息日", "Ex-dividend date"],
		["dividendDate", "配息日", "Dividend date"],
	]) {
		const date = isoDate(quote?.[key]);
		if (date) events.push({ type: "dividend", label, labelEn, date, status: "scheduled", source, sourceUrl });
	}

	return events;
}

async function fetchYahooEvents(symbol) {
	const url = new URL(`${YAHOO_CALENDAR_URL}/${encodeURIComponent(symbol)}`);
	url.searchParams.set("modules", "calendarEvents,summaryDetail");

	const response = await fetchWithTimeout(url, {
		timeoutMs: 8_000,
		headers: { "User-Agent": "Mozilla/5.0" },
		next: { revalidate: 1800 },
	});
	if (!response.ok) return [];

	const result = (await response.json())?.quoteSummary?.result?.[0] || {};
	const calendar = result.calendarEvents || {};
	const summary = result.summaryDetail || {};
	const source = "Yahoo Finance Calendar";
	const sourceUrl = `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}/calendar/`;
	const events = [];

	const earningsDate = calendar.earnings?.earningsDate?.[0]?.raw;
	if (Number.isFinite(earningsDate)) {
		events.push({
			type: "earnings",
			label: "財報公告日",
			labelEn: "Earnings release date",
			date: isoDate(earningsDate),
			status: "expected",
			source,
			sourceUrl,
		});
	}

	for (const [key, label, labelEn] of [
		["exDividendDate", "除息日", "Ex-dividend date"],
		["dividendDate", "配息日", "Dividend date"],
	]) {
		const date = summary[key]?.raw;
		if (Number.isFinite(date)) {
			events.push({ type: "dividend", label, labelEn, date: isoDate(date), status: "scheduled", source, sourceUrl });
		}
	}

	return events;
}

async function fetchFinnhubEvents(symbol) {
	if (!FINNHUB_TOKEN) return [];
	const { from, to } = dateRange();
	const [earningsResponse, dividendResponse] = await Promise.all([
		fetchWithTimeout(`${FINNHUB_BASE_URL}/calendar/earnings?from=${from}&to=${to}&symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_TOKEN}`, {
			timeoutMs: 8_000,
			next: { revalidate: 1800 },
		}),
		fetchWithTimeout(`${FINNHUB_BASE_URL}/stock/dividend?symbol=${encodeURIComponent(symbol)}&from=${from}&to=${to}&token=${FINNHUB_TOKEN}`, {
			timeoutMs: 8_000,
			next: { revalidate: 1800 },
		}),
	]);
	const source = "Finnhub";
	const sourceUrl = "https://finnhub.io/docs/api";
	const events = [];

	if (earningsResponse.ok) {
		const payload = await earningsResponse.json();
		for (const item of payload?.earningsCalendar || []) {
			if (item.symbol && item.symbol.toUpperCase() !== symbol.toUpperCase()) continue;
			events.push({
				type: "earnings",
				label: "財報公告日",
				labelEn: "Earnings release date",
				date: item.date,
				status: "expected",
				detail: [item.year && `FY${item.year}`, item.quarter && `Q${item.quarter}`, item.hour].filter(Boolean).join(" · "),
				source,
				sourceUrl,
			});
		}
	}

	if (dividendResponse.ok) {
		const payload = await dividendResponse.json();
		for (const item of Array.isArray(payload) ? payload : []) {
			events.push({
				type: "dividend",
				label: "配息",
				labelEn: "Dividend",
				date: item.paymentDate || item.date || item.recordDate,
				status: "scheduled",
				detail: Number.isFinite(item.amount) ? `Amount ${item.amount}` : null,
				source,
				sourceUrl,
			});
		}
	}

	return events;
}

export async function fetchMarketEvents(symbol, quote = {}) {
	const key = String(symbol || "").toUpperCase();
	if (!key) return { status: "missing", events: [] };

	const cached = cache.get(key);
	if (cached && cached.expiresAt > Date.now()) return cached.value;

	const [yahooResult, finnhubResult] = await Promise.allSettled([fetchYahooEvents(key), fetchFinnhubEvents(key)]);
	const events = dedupeEvents([
		...readRawQuoteEvents(key, quote),
		...(yahooResult.status === "fulfilled" ? yahooResult.value : []),
		...(finnhubResult.status === "fulfilled" ? finnhubResult.value : []),
	]).sort((left, right) => left.date.localeCompare(right.date));
	const value = { status: events.length ? "available" : "missing", events };
	cache.set(key, { expiresAt: Date.now() + 30 * 60 * 1000, value });
	return value;
}
