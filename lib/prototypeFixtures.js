export const prototypeWatchlist = [
	{
		symbol: "NVDA",
		name: "NVIDIA Corporation",
		industry: "Semiconductors",
		price: "$182.84",
		move: "+2.14%",
		week: "+4.8%",
		valuation: "Forward PE 34.8x",
		quality: "92/100",
		status: "需要複查",
		statusTone: "warning",
		event: "財報 8/19",
		freshness: "8 分鐘前",
		thesis: "AI 資本支出仍支持成長，但估值容錯率下降。",
	},
	{
		symbol: "TSM",
		name: "Taiwan Semiconductor",
		industry: "Semiconductors",
		price: "$248.19",
		move: "+0.62%",
		week: "+1.9%",
		valuation: "Forward PE 21.2x",
		quality: "96/100",
		status: "持續追蹤",
		statusTone: "positive",
		event: "法說 10/16",
		freshness: "8 分鐘前",
		thesis: "先進製程需求健康，需追蹤海外產能與資本支出。",
	},
	{
		symbol: "GOOGL",
		name: "Alphabet Inc.",
		industry: "Interactive Media",
		price: "$194.72",
		move: "-0.38%",
		week: "-2.1%",
		valuation: "Forward PE 24.1x",
		quality: "89/100",
		status: "資料過期",
		statusTone: "muted",
		event: "財報 10/28",
		freshness: "2 天前",
		thesis: "搜尋現金流穩定，AI 產品化與監管是主要驗證點。",
	},
];

export const prototypeEvidence = [
	{ label: "TTM 營收", value: "$187.1B", meta: "Fact · StockAnalysis · 2026-07-31", tone: "positive" },
	{ label: "營收成長", value: "+14.2%", meta: "Calculated · FY2025 vs FY2024", tone: "positive" },
	{ label: "Forward PE", value: "34.8x", meta: "Fact · StockAnalysis · 8 分鐘前", tone: "warning" },
	{ label: "月營收", value: null, meta: "Unsupported · 公司未提供月度揭露", tone: "muted" },
];

export const prototypeDiscover = [
	{ symbol: "AVGO", name: "Broadcom Inc.", reason: "AI 網路與基礎設施需求", score: 84, industry: "Semiconductors" },
	{ symbol: "AMZN", name: "Amazon.com, Inc.", reason: "雲端與廣告獲利結構改善", score: 81, industry: "Internet Retail" },
];
