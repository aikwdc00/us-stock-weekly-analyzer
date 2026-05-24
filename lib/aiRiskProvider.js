import { getInsightWithGuard } from "./aiInsightCache";

function extractOutputText(data) {
	if (!data || typeof data !== "object") return "";
	if (typeof data.output_text === "string" && data.output_text.trim()) {
		return data.output_text;
	}
	const chunks = [];
	for (const item of Array.isArray(data.output) ? data.output : []) {
		for (const content of Array.isArray(item?.content) ? item.content : []) {
			if (typeof content?.text === "string" && content.text.trim()) {
				chunks.push(content.text);
			}
		}
	}
	return chunks.join("\n").trim();
}

function parseRiskResponse(text) {
	if (!text) return [];

	const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
	const candidate = fenced ? fenced[1] : text;

	try {
		const parsed = JSON.parse(candidate);
		if (Array.isArray(parsed)) {
			return parsed
				.map((item) => String(item).trim())
				.filter(Boolean)
				.slice(0, 6);
		}
		if (parsed?.risks && Array.isArray(parsed.risks)) {
			return parsed.risks
				.map((item) => String(item).trim())
				.filter(Boolean)
				.slice(0, 6);
		}
	} catch {
		// Fall through to text parsing.
	}

	return candidate
		.split(/\r?\n/)
		.map((line) => line.replace(/^[\-\d\.\)\s]+/, "").trim())
		.filter(Boolean)
		.slice(0, 6);
}

function compactSnapshot(snapshot) {
	const metrics = snapshot?.metrics || {};
	const forecast = snapshot?.forecast || {};

	return {
		price: snapshot?.price,
		changePercent: snapshot?.changePercent,
		valuation: {
			pe: metrics.pe?.value,
			forwardPe: metrics.peForward?.value,
			ps: metrics.ps?.value,
			pfcf: metrics.pfcf?.value,
			fcfYield: metrics.fcfYield?.value,
			peg: metrics.pegRatio?.value,
		},
		profitability: {
			grossMargin: metrics.grossMargin?.value,
			operatingMargin: metrics.operatingMargin?.value,
			profitMargin: metrics.profitMargin?.value,
		},
		balanceSheet: {
			cash: metrics.totalcash?.value,
			debt: metrics.debt?.value,
			netCash: metrics.netcash?.value,
		},
		growth: {
			annualRevenueGrowth: forecast.annualRevenue?.growthDisplay,
			nextAnnualRevenueGrowth: forecast.nextAnnualRevenue?.growthDisplay,
			annualEpsGrowth: forecast.annualEps?.growthDisplay,
			nextAnnualEpsGrowth: forecast.nextAnnualEps?.growthDisplay,
		},
		ownership: {
			insiders: metrics.sharesInsiders?.value,
			institutions: metrics.sharesInstitutions?.value,
		},
		news: (snapshot?.news || []).slice(0, 3).map((item) => ({
			source: item.source,
			title: item.title,
		})),
	};
}

function normalizeSwotArray(value, limit = 5) {
	if (!Array.isArray(value)) return [];
	return value
		.map((item) => String(item).trim())
		.filter(Boolean)
		.slice(0, limit);
}

function parseSwotResponse(text) {
	if (!text) return null;

	const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
	const candidate = fenced ? fenced[1] : text;

	try {
		const parsed = JSON.parse(candidate);
		if (!parsed || typeof parsed !== "object") return null;

		const swot = {
			s: normalizeSwotArray(parsed.s || parsed.strengths),
			w: normalizeSwotArray(parsed.w || parsed.weaknesses),
			o: normalizeSwotArray(parsed.o || parsed.opportunities),
			t: normalizeSwotArray(parsed.t || parsed.threats),
		};

		if (swot.s.length || swot.w.length || swot.o.length || swot.t.length) {
			return swot;
		}
	} catch {
		return null;
	}

	return null;
}

export async function fetchAiRiskInsights(symbol, snapshot, finnhub = {}, profile = {}) {
	return getInsightWithGuard({
		symbol,
		type: "risk",
		producer: async () => fetchAiRiskInsightsDirect(symbol, snapshot, finnhub, profile),
	});
}

async function fetchAiRiskInsightsDirect(symbol, snapshot, finnhub = {}, profile = {}) {
	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey) return [];

	try {
		const model = process.env.OPENAI_RISK_MODEL || "gpt-4.1-mini";
		const payload = {
			model,
			input: [
				{
					role: "system",
					content: "You are a strict equity risk analyst. Return concise, objective risks only. No hype. No guarantees.",
				},
				{
					role: "user",
					content: `請針對 ${symbol} 產生 4-6 條「主要風險」。必須繁體中文，且只回傳 JSON：{"risks":["..."]}。\n要求：\n1) 只使用我提供的資料，不可幻想不存在的事件。\n2) 每條都需可驗證且具體，優先關注估值、成長放緩、毛利率、負債、競爭、供應鏈、法規、題材退燒。\n3) 避免重複敘述。\n\n公司題材：${profile?.theme || "N/A"}\n資料摘要：${JSON.stringify(compactSnapshot(snapshot))}\n分析師補充：${JSON.stringify(finnhub?.recommendations || {})}`,
				},
			],
		};

		const response = await fetch("https://api.openai.com/v1/responses", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify(payload),
			signal: AbortSignal.timeout(30000),
		});

		if (!response.ok) {
			console.error(`[AI Risk] OpenAI response not ok for ${symbol}:`, response.status);
			return [];
		}

		const data = await response.json();
		const outputText = extractOutputText(data);

		const parsed = parseRiskResponse(outputText);
		if (!parsed.length) {
			console.warn(`[AI Risk] Empty/invalid parsed payload for ${symbol}`);
		}
		return parsed;
	} catch (error) {
		console.error(`[AI Risk] Request failed for ${symbol}:`, error?.message || error);
		return [];
	}
}

export async function fetchAiSwotInsights(symbol, snapshot, finnhub = {}, profile = {}) {
	return getInsightWithGuard({
		symbol,
		type: "swot",
		producer: async () => fetchAiSwotInsightsDirect(symbol, snapshot, finnhub, profile),
	});
}

async function fetchAiSwotInsightsDirect(symbol, snapshot, finnhub = {}, profile = {}) {
	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey) return null;

	try {
		const model = process.env.OPENAI_SWOT_MODEL || process.env.OPENAI_RISK_MODEL || "gpt-4.1-mini";
		const payload = {
			model,
			input: [
				{
					role: "system",
					content: "You are an objective equity analyst. Build concise SWOT points strictly from provided data. No fabrication.",
				},
				{
					role: "user",
					content: `請針對 ${symbol} 產出 SWOT，必須繁體中文，且只回傳 JSON：{"s":[],"w":[],"o":[],"t":[]}。\n要求：\n1) 每個維度 3-5 點。\n2) 每點必須是可驗證、可追蹤的客觀敘述。\n3) 優先使用估值、成長、獲利、現金流、負債、分析師共識、近期新聞。\n4) 禁止空泛口號。\n\n公司題材：${profile?.theme || "N/A"}\n資料摘要：${JSON.stringify(compactSnapshot(snapshot))}\n分析師補充：${JSON.stringify(finnhub?.recommendations || {})}`,
				},
			],
		};

		const response = await fetch("https://api.openai.com/v1/responses", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify(payload),
			signal: AbortSignal.timeout(30000),
		});

		if (!response.ok) {
			console.error(`[AI SWOT] OpenAI response not ok for ${symbol}:`, response.status);
			return null;
		}

		const data = await response.json();
		const outputText = extractOutputText(data);

		const parsed = parseSwotResponse(outputText);
		if (!parsed) {
			console.warn(`[AI SWOT] Empty/invalid parsed payload for ${symbol}`);
		}
		return parsed;
	} catch (error) {
		console.error(`[AI SWOT] Request failed for ${symbol}:`, error?.message || error);
		return null;
	}
}

export async function fetchAiRisks(context) {
	return fetchAiRiskInsights(context?.symbol, context?.snapshot, {}, context?.profile || {});
}
