import { fetchWithTimeout } from "./fetchPolicy.js";
import { fetchSecCompanyIdentity, secHeaders } from "./secOwnershipProvider.js";

const SEC_COMPANYFACTS_URL = "https://data.sec.gov/api/xbrl/companyfacts";
const SEC_ARCHIVES_URL = "https://www.sec.gov/Archives/edgar/data";
const cache = new Map();
const MAX_COMPANYFACTS_BYTES = 32 * 1024 * 1024;
const MAX_FACT_RECORDS = 20_000;
const MAX_FACT_RECORDS_PER_UNIT = 2_000;
const FLOW_FORMS = new Set(["10-K", "10-K/A", "10-Q", "10-Q/A", "20-F", "20-F/A", "40-F", "40-F/A"]);
const ANNUAL_FORMS = new Set(["10-K", "10-K/A", "20-F", "20-F/A", "40-F", "40-F/A"]);
const QUARTER_FORMS = new Set(["10-Q", "10-Q/A"]);

const TAGS = {
	revenue: ["RevenueFromContractWithCustomerExcludingAssessedTax", "Revenues", "SalesRevenueNet"],
	costOfRevenue: ["CostOfRevenue", "CostOfGoodsAndServicesSold"],
	grossProfit: ["GrossProfit"],
	operatingIncome: ["OperatingIncomeLoss"],
	netIncome: ["NetIncomeLoss", "ProfitLoss"],
	researchAndDevelopment: ["ResearchAndDevelopmentExpense"],
	sga: ["SellingGeneralAndAdministrativeExpense"],
	pretaxIncome: [
		"IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest",
		"IncomeLossFromContinuingOperationsBeforeIncomeTaxesMinorityInterestAndIncomeLossFromEquityMethodInvestments",
	],
	taxProvision: ["IncomeTaxExpenseBenefit"],
	operatingCashFlow: ["NetCashProvidedByUsedInOperatingActivities"],
	capex: ["PaymentsToAcquirePropertyPlantAndEquipment", "PaymentsToAcquireProductiveAssets"],
	cash: ["CashAndCashEquivalentsAtCarryingValue", "CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents"],
	currentDebt: ["LongTermDebtCurrent", "ShortTermBorrowings"],
	nonCurrentDebt: ["LongTermDebtNoncurrent", "LongTermDebtAndFinanceLeaseObligationsNoncurrent"],
	totalDebt: ["LongTermDebtAndFinanceLeaseObligations", "DebtCurrent"],
	assets: ["Assets"],
	liabilities: ["Liabilities"],
	equity: ["StockholdersEquity", "StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest"],
};

function accessionPath(accessionNumber) {
	return accessionNumber?.replaceAll("-", "");
}

function toDate(value) {
	const date = value ? new Date(value) : null;
	return date && !Number.isNaN(date.getTime()) ? date : null;
}

function durationDays(record) {
	const start = toDate(record.start);
	const end = toDate(record.end);
	if (!start || !end) return null;
	return Math.round((end - start) / 86_400_000) + 1;
}

function isFlowRecord(record) {
	return Boolean(record.start && record.end);
}

function isPeriodRecord(record, period) {
	if (!record || !period) return false;
	if (record.end !== period.end) return false;
	if (period.kind === "annual") return ANNUAL_FORMS.has(record.form) && (durationDays(record) || 0) >= 300;
	if (period.kind === "quarter") return QUARTER_FORMS.has(record.form) && (durationDays(record) || 0) >= 60 && (durationDays(record) || 0) <= 140;
	if (period.kind === "latest") return FLOW_FORMS.has(record.form);
	return false;
}

export function formatSecValue(value) {
	if (!Number.isFinite(value)) return null;
	const absolute = Math.abs(value);
	const sign = value < 0 ? "-" : "";
	if (absolute >= 1e12) return `${sign}$${(absolute / 1e12).toFixed(2)}T`;
	if (absolute >= 1e9) return `${sign}$${(absolute / 1e9).toFixed(2)}B`;
	if (absolute >= 1e6) return `${sign}$${(absolute / 1e6).toFixed(2)}M`;
	if (absolute >= 1e3) return `${sign}$${(absolute / 1e3).toFixed(2)}K`;
	return `${sign}$${absolute.toFixed(0)}`;
}

export function normalizeCompanyFacts(payload) {
	const output = [];
	const relevantTags = new Set(Object.values(TAGS).flat());
	for (const [namespace, namespaceFacts] of Object.entries(payload?.facts || {})) {
		for (const [tag, definition] of Object.entries(namespaceFacts || {})) {
			if (!relevantTags.has(tag)) continue;
			const units = definition.units || {};
			const unit = Object.keys(units).find((candidate) => candidate === "USD") || Object.keys(units)[0];
			if (!unit) continue;
			const records = units[unit] || [];
			for (const record of records.slice(-MAX_FACT_RECORDS_PER_UNIT)) {
				if (!Number.isFinite(record.val) || !record.end || !record.filed) continue;
				output.push({
					namespace,
					tag,
					label: definition.label || tag,
					unit,
					val: record.val,
					start: record.start || null,
					end: record.end,
					filed: record.filed,
					form: record.form || null,
					accn: record.accn || null,
					frame: record.frame || null,
				});
				if (output.length >= MAX_FACT_RECORDS) return output;
			}
		}
	}
	return output;
}

async function readResponseTextWithLimit(response, maxBytes) {
	const contentLength = Number(response.headers.get("content-length"));
	if (Number.isFinite(contentLength) && contentLength > maxBytes) {
		throw new Error("SEC companyfacts response exceeded the size limit");
	}

	if (!response.body?.getReader) {
		const text = await response.text();
		if (new TextEncoder().encode(text).byteLength > maxBytes) {
			throw new Error("SEC companyfacts response exceeded the size limit");
		}
		return text;
	}

	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	const chunks = [];
	let totalBytes = 0;

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			totalBytes += value.byteLength;
			if (totalBytes > maxBytes) {
				await reader.cancel();
				throw new Error("SEC companyfacts response exceeded the size limit");
			}
			chunks.push(decoder.decode(value, { stream: true }));
		}
	} finally {
		reader.releaseLock();
	}

	chunks.push(decoder.decode());
	return chunks.join("");
}

export function selectFact(records, { end, kind = "latest" } = {}) {
	return (
		records
			.filter((record) => (!end || record.end === end) && isPeriodRecord(record, { end: record.end, kind }))
			.sort((left, right) => {
				const filedOrder = String(right.filed).localeCompare(String(left.filed));
				return filedOrder || String(right.accn || "").localeCompare(String(left.accn || ""));
			})[0] || null
	);
}

function latestPeriod(records, kind) {
	const ends = [...new Set(records.filter((record) => isPeriodRecord(record, { end: record.end, kind })).map((record) => record.end))]
		.sort()
		.reverse();
	return ends[0] ? { end: ends[0], kind } : null;
}

function evidenceFor(record, sourceUrl, cik) {
	if (!record) return null;
	const numericCik = String(cik || "").replace(/^0+/, "") || "0";
	const indexUrl = record.accn ? `${SEC_ARCHIVES_URL}/${numericCik}/${record.accn.replaceAll("-", "")}/${record.accn}-index.htm` : sourceUrl;
	return {
		source: "SEC EDGAR Companyfacts",
		sourceUrl: indexUrl,
		filed: record.filed,
		reportedPeriod: record.end,
		start: record.start,
		form: record.form,
		accessionNumber: record.accn,
		confidence: "high",
	};
}

function metric(record, sourceUrl, cik) {
	if (!record) return null;
	return {
		value: record.val,
		display: formatSecValue(record.val),
		evidence: evidenceFor(record, sourceUrl, cik),
	};
}

function chooseMetric(records, tags, period, sourceUrl, cik) {
	for (const tag of tags) {
		const match = records
			.filter((record) => record.tag === tag && isPeriodRecord(record, period))
			.sort((left, right) => String(right.filed).localeCompare(String(left.filed)))[0];
		if (match) return metric(match, sourceUrl, cik);
	}
	return null;
}

function addMetrics(records, period, sourceUrl, cik) {
	const result = {};
	for (const [key, tags] of Object.entries(TAGS)) {
		result[key] = chooseMetric(records, tags, period, sourceUrl, cik);
	}

	if (!result.totalDebt && (result.currentDebt || result.nonCurrentDebt)) {
		const current = result.currentDebt?.value || 0;
		const nonCurrent = result.nonCurrentDebt?.value || 0;
		if (current || nonCurrent) {
			result.totalDebt = {
				value: current + nonCurrent,
				display: formatSecValue(current + nonCurrent),
				evidence: result.currentDebt?.evidence || result.nonCurrentDebt?.evidence,
			};
		}
	}

	if (result.revenue?.value) {
		if (result.grossProfit?.value !== undefined) {
			result.grossMargin = `${((result.grossProfit.value / result.revenue.value) * 100).toFixed(2)}%`;
		}
		if (result.operatingIncome?.value !== undefined) {
			result.operatingMargin = `${((result.operatingIncome.value / result.revenue.value) * 100).toFixed(2)}%`;
		}
		if (result.netIncome?.value !== undefined) {
			result.netMargin = `${((result.netIncome.value / result.revenue.value) * 100).toFixed(2)}%`;
		}
	}
	return result;
}

function periodPayload(records, period, sourceUrl, cik) {
	if (!period) return null;
	const metrics = addMetrics(records, period, sourceUrl, cik);
	const evidence = Object.values(metrics)
		.filter((value) => value?.evidence)
		.map((value) => value.evidence);
	return {
		period: period.end,
		periodType: period.kind,
		form: evidence[0]?.form || null,
		filed: evidence[0]?.filed || null,
		metrics,
		evidence,
	};
}

export function parseCompanyFacts(payload, { symbol, cik } = {}) {
	const records = normalizeCompanyFacts(payload);
	const sourceUrl = `${SEC_COMPANYFACTS_URL}/CIK${String(cik || payload?.entityName || "").padStart(10, "0")}.json`;
	const annual = periodPayload(records, latestPeriod(records, "annual"), sourceUrl, cik);
	const quarter = periodPayload(records, latestPeriod(records, "quarter"), sourceUrl, cik);
	const latest = periodPayload(records, latestPeriod(records, "latest"), sourceUrl, cik);
	const balancePeriod = latestPeriod(
		records.filter((record) => !isFlowRecord(record)),
		"latest"
	);
	const balanceSheet = balancePeriod ? periodPayload(records, balancePeriod, sourceUrl, cik) : null;
	const evidence = [...(annual?.evidence || []), ...(quarter?.evidence || []), ...(balanceSheet?.evidence || [])];

	if (!annual && !quarter && !balanceSheet) {
		return {
			status: "unsupported",
			symbol,
			cik,
			source: "SEC EDGAR Companyfacts",
			sourceUrl,
			note: "SEC Companyfacts 沒有可解析的 US-GAAP/IFRS 申報期間，未補寫財報數值。",
		};
	}

	return {
		status: "ok",
		symbol,
		cik,
		entityName: payload?.entityName || null,
		source: "SEC EDGAR Companyfacts",
		sourceUrl,
		asOf: evidence.sort((left, right) => String(right.filed).localeCompare(String(left.filed)))[0]?.filed || null,
		latestFilingUrl: evidence[0]?.sourceUrl || null,
		annual,
		latestPeriod: quarter || latest,
		balanceSheet,
		evidence,
	};
}

export async function fetchSecFinancials(symbol) {
	const normalized = symbol?.toUpperCase();
	if (!normalized) return { status: "no-symbol", symbol: normalized, metrics: {} };

	const cached = cache.get(`financials:${normalized}`);
	if (cached && Date.now() - cached.createdAt < 60 * 60 * 1000) return cached.value;

	const company = await fetchSecCompanyIdentity(normalized);
	if (!company?.cik) {
		return {
			status: "unsupported",
			symbol: normalized,
			source: "SEC EDGAR Companyfacts",
			note: "SEC ticker map 找不到 CIK，未補寫財報數值。",
		};
	}

	const url = `${SEC_COMPANYFACTS_URL}/CIK${company.cik}.json`;
	const response = await fetchWithTimeout(url, {
		timeoutMs: 15_000,
		headers: secHeaders(),
		cache: "no-store",
	});
	if (!response.ok) throw new Error(`SEC companyfacts failed for ${normalized}: ${response.status}`);

	const body = await readResponseTextWithLimit(response, MAX_COMPANYFACTS_BYTES);
	const result = parseCompanyFacts(JSON.parse(body), { symbol: normalized, cik: company.cik });
	cache.set(`financials:${normalized}`, { createdAt: Date.now(), value: result });
	return result;
}
