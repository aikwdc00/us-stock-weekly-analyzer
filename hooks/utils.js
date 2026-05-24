import { valueCopy } from "./copy";

export function cls(...names) {
	return names.filter(Boolean).join(" ");
}

export function displayValue(value, language) {
	return language === "en" ? valueCopy.en[value] || value : value;
}

export function thesisText(quote, language) {
	if (language !== "en") return quote.thesis;
	return `Theme focus: ${quote.profile.theme}. Current rating is ${displayValue(quote.rating, language)}, valuation is ${displayValue(
		quote.valuation,
		language
	)}, and the technical view is ${displayValue(quote.trend, language)}. Use staged entries and the price zones rather than chasing strength.`;
}

export function safeNumber(value) {
	return Number.isFinite(value) ? value : null;
}

export function getNewsUrl(item, symbol) {
	if (item?.url) return item.url;
	const query = [symbol, item?.source, item?.title].filter(Boolean).join(" ");
	return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

export function formatDate(value, language = "zh", fallbackText) {
	if (!value) return fallbackText || (language === "en" ? "Not updated yet" : "尚未更新");
	return new Intl.DateTimeFormat(language === "en" ? "en-US" : "zh-TW", {
		dateStyle: "medium",
		timeStyle: "short",
		hour12: language === "en",
	}).format(new Date(value));
}

export function generateMarkdown(quote, language = "zh") {
	const locale = language === "en" ? "en-US" : "zh-TW";
	const today = new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date());
	const profile = quote.profile;

	if (language === "en") {
		return `# ${quote.symbol} / ${quote.name}: Weekly Analysis Report

Last updated: ${today}

## One-Line Conclusion

**Rating: ${displayValue(quote.rating, language)}.** ${thesisText(quote, language)}

## Price and Technicals

- Latest price: ${quote.formatted.price || "N/A"}
- Daily move: ${quote.formatted.changePercent || "N/A"}
- 50-day average: ${quote.formatted.fiftyDay || "N/A"}
- 200-day average: ${quote.formatted.twoHundredDay || "N/A"}
- 52-week range: ${quote.formatted.range52 || "N/A"}
- Technical view: ${displayValue(quote.trend, language)}

## Themes and Current Catalysts

Theme: ${profile.theme}

Catalysts:
${quote.catalysts.map((item) => `- ${item}`).join("\n")}

Major news:
${quote.news.length ? quote.news.map((item) => `- ${item.time} | ${item.source} | ${item.title} | ${getNewsUrl(item, quote.symbol)}`).join("\n") : "- No major news was fetched"}

## Financial Position

- Latest quarterly revenue: ${quote.fundamentals.latestQuarterRevenue || "N/A"}, growth: ${quote.fundamentals.latestQuarterRevenueGrowth || "N/A"}
- Latest quarterly EPS: ${quote.fundamentals.latestQuarterEps || "N/A"}, growth: ${quote.fundamentals.latestQuarterEpsGrowth || "N/A"}
- Estimated annual revenue: ${quote.fundamentals.estimatedAnnualRevenue || "N/A"}, growth: ${quote.fundamentals.estimatedAnnualRevenueGrowth || "N/A"}
- Estimated next annual revenue: ${quote.fundamentals.estimatedNextAnnualRevenue || "N/A"}, growth: ${quote.fundamentals.estimatedNextAnnualRevenueGrowth || "N/A"}
- TTM revenue: ${quote.detailedFinancials?.ttm?.revenue || "N/A"}
- TTM cost of revenue: ${quote.detailedFinancials?.ttm?.costOfRevenue || "N/A"}
- TTM operating expenses: ${quote.detailedFinancials?.ttm?.operatingExpenses || "N/A"}
- TTM net income: ${quote.detailedFinancials?.ttm?.netIncome || "N/A"}
- Cost assessment: ${quote.detailedFinancials?.costAnalysis || "N/A"}

## Peer / Supplier / Customer Context

- Competitors: ${profile.competitors.join(", ")}
- Suppliers / partners: ${profile.suppliers.join(", ")}
- Customers / demand sources: ${profile.customers.join(", ")}

## Valuation Method

Assessment: **${displayValue(quote.valuation, language)}**

Primary method: ${quote.valuationMethod.primary}

Rationale: ${quote.valuationMethod.why}

Evidence: ${quote.valuationMethod.evidence.join(", ") || "Insufficient data"}

## Price Zones

- Ideal price: ${quote.zones.ideal}
- Buy zone: ${quote.zones.buy}
- Watch zone: ${quote.zones.watch}

## Key Risks

1. Valuation may already price in part of future growth.
2. Competition, supply-chain constraints, customer in-sourcing, or weaker demand may pressure growth and margins.
3. Rates, regulation, geopolitics, and fading market themes may compress multiples.

## Disclaimer

This report is a rule-based research framework. It is not personalized investment advice and does not guarantee investment returns.
`;
	}

	return `# ${quote.symbol} / ${quote.name}：每週分析報告

最後更新：${today}

## 一句話結論

**評級：${quote.rating}。** ${quote.thesis}

## 本週股價與技術面

- 最新股價：${quote.formatted.price || "N/A"}
- 單日漲跌：${quote.formatted.changePercent || "N/A"}
- 50 日均線：${quote.formatted.fiftyDay || "N/A"}
- 200 日均線：${quote.formatted.twoHundredDay || "N/A"}
- 52 週區間：${quote.formatted.range52 || "N/A"}
- 技術面判斷：${quote.trend}

## 最新新聞與題材

主要題材：${profile.theme}

當前催化劑：
${quote.catalysts.map((item) => `- ${item}`).join("\n")}

重大新聞：
${quote.news.length ? quote.news.map((item) => `- ${item.time}｜${item.source}｜${item.title}｜${getNewsUrl(item, quote.symbol)}`).join("\n") : "- 目前沒有抓到重大新聞"}

## 財報與財務狀況

- 最新季度營收：${quote.fundamentals.latestQuarterRevenue || "N/A"}，成長：${quote.fundamentals.latestQuarterRevenueGrowth || "N/A"}
- 最新季度 EPS：${quote.fundamentals.latestQuarterEps || "N/A"}，成長：${quote.fundamentals.latestQuarterEpsGrowth || "N/A"}
- TTM 營收：${quote.detailedFinancials?.ttm?.revenue || "N/A"}
- 成本變動判斷：${quote.detailedFinancials?.costAnalysis || "N/A"}
- PE：${quote.formatted.pe}
- Forward PE：${quote.formatted.forwardPe}

## 競爭格局、供應鏈與客戶

- 競爭對手：${profile.competitors.join("、")}
- 供應商/夥伴：${profile.suppliers.join("、")}
- 客戶/需求來源：${profile.customers.join("、")}

## 估值分析

估值判斷：**${quote.valuation}**

使用方法：${quote.valuationMethod.primary}

原因：${quote.valuationMethod.why}

## 護城河分析

${profile.moat}

## 價格區間

- 理想價：${quote.zones.ideal}
- 買入價：${quote.zones.buy}
- 觀察價：${quote.zones.watch}

## 最終評級

${quote.rating}

## 免責提醒

本報告是依照固定規則整理的投資分析框架，不構成個人化投資建議。
`;
}

export function downloadMarkdown(quote, language = "zh") {
	const blob = new Blob([generateMarkdown(quote, language)], {
		type: "text/markdown;charset=utf-8",
	});
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = `${quote.symbol}-${language}.md`;
	anchor.click();
	URL.revokeObjectURL(url);
}
