import { createHash } from "node:crypto";
import { getInsightWithGuard } from "./aiInsightCache";
import { fetchWithTimeout } from "./fetchPolicy";

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

function normalizeNewsItem(item) {
	return {
		url: typeof item?.url === "string" ? item.url : "",
		source: typeof item?.source === "string" ? item.source : "",
		time: typeof item?.time === "string" ? item.time : "",
		title: typeof item?.title === "string" ? item.title.trim() : "",
		text: typeof item?.text === "string" ? item.text.trim() : "",
	};
}

function buildDigest(news) {
	return createHash("sha1").update(JSON.stringify(news)).digest("hex").slice(0, 12);
}

function parseTranslatedItems(text) {
	if (!text) return [];

	const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
	const candidate = fenced ? fenced[1] : text;

	try {
		const parsed = JSON.parse(candidate);
		const items = Array.isArray(parsed) ? parsed : parsed?.items;
		if (!Array.isArray(items)) return [];

		return items
			.map((item) => ({
				index: Number(item?.index),
				translatedTitle: typeof item?.translatedTitle === "string" ? item.translatedTitle.trim() : "",
				translatedText: typeof item?.translatedText === "string" ? item.translatedText.trim() : "",
			}))
			.filter((item) => Number.isInteger(item.index) && (item.translatedTitle || item.translatedText));
	} catch {
		return [];
	}
}

function mergeTranslations(news, translatedItems) {
	const translationMap = new Map(
		(Array.isArray(translatedItems) ? translatedItems : []).map((item) => [
			item.index,
			{
				translatedTitle: item.translatedTitle,
				translatedText: item.translatedText,
			},
		])
	);

	return (Array.isArray(news) ? news : []).map((item, index) => {
		const translated = translationMap.get(index);
		if (!translated) return item;
		return {
			...item,
			translatedTitle: translated.translatedTitle || item?.translatedTitle || "",
			translatedText: translated.translatedText || item?.translatedText || "",
		};
	});
}

export async function fetchAiTranslatedNews(symbol, news = []) {
	const normalized = (Array.isArray(news) ? news : [])
		.slice(0, 5)
		.map(normalizeNewsItem)
		.filter((item) => item.title || item.text);
	if (!normalized.length) return Array.isArray(news) ? news : [];

	const digest = buildDigest(normalized);
	const translatedItems = await getInsightWithGuard({
		symbol,
		type: `news-translation:${digest}`,
		producer: async () => fetchAiTranslatedNewsDirect(symbol, normalized),
	});

	if (!Array.isArray(translatedItems) || !translatedItems.length) {
		return Array.isArray(news) ? news : [];
	}

	return mergeTranslations(news, translatedItems);
}

async function fetchAiTranslatedNewsDirect(symbol, news = []) {
	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey || !news.length) return [];

	try {
		const model = process.env.OPENAI_TRANSLATION_MODEL || process.env.OPENAI_RISK_MODEL || "gpt-4.1-mini";
		const payload = {
			model,
			input: [
				{
					role: "system",
					content:
						"You are a financial-news translator. Translate English news headlines and short summaries into Traditional Chinese for Taiwan readers. Preserve company names, tickers, dates, percentages, money amounts, and uncertainty. Do not add facts or investment advice.",
				},
				{
					role: "user",
					content: `請把以下 ${symbol} 的新聞標題與摘要翻成繁體中文，只回傳 JSON：{"items":[{"index":0,"translatedTitle":"","translatedText":""}]}。\n要求：\n1) 保留公司名、股票代號、數字、日期、百分比、幣別與不確定語氣。\n2) 不要增添原文沒有的事實。\n3) 若原文已是中文，直接保留原意。\n4) translatedText 需精簡、自然，不要逐字硬譯。\n\n新聞資料：${JSON.stringify(news)}`,
				},
			],
		};

		const response = await fetchWithTimeout("https://api.openai.com/v1/responses", {
			timeoutMs: 30_000,
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			return [];
		}

		const data = await response.json();
		return parseTranslatedItems(extractOutputText(data));
	} catch (error) {
		return [];
	}
}
