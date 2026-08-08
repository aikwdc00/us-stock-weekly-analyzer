const NODE_WIDTH = { core: 168, branch: 196 };
const NODE_HEIGHT = { core: 96, branch: 132 };

function radialPosition(index, total, radius, centerX, centerY, nodeType) {
	const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
	const width = NODE_WIDTH[nodeType];
	const height = NODE_HEIGHT[nodeType];

	return {
		x: centerX + radius * Math.cos(angle) - width / 2,
		y: centerY + radius * Math.sin(angle) - height / 2,
	};
}

function truncate(text, max = 88) {
	if (!text) return "";
	return text.length > max ? `${text.slice(0, max)}…` : text;
}

function pickFirst(values, fallback = "N/A") {
	for (const value of values) {
		if (value !== null && value !== undefined && value !== "") return value;
	}
	return fallback;
}

function buildFinancialMindMapValue(quote) {
	const f = quote.fundamentals || {};
	const metrics = [
		`營收 ${pickFirst([f.revenue, f.latestQuarterRevenue], "營收趨勢")}`,
		`EPS ${pickFirst([f.eps, f.latestQuarterEps], "EPS 趨勢")}`,
		`毛利率 ${pickFirst([f.grossMargin], "毛利率")}`,
		`淨利率 ${pickFirst([f.profitMargin], "淨利率")}`,
		`現金/負債 ${pickFirst([f.totalCash], "現金體質")}/${pickFirst([f.debt], "負債體質")}`,
		`FCF ${pickFirst([f.freeCashFlow], "自由現金流")}`,
	];
	return metrics.join("｜");
}

export function buildMindMapGraph({ quote, language, t, displayValue }) {
	const centerX = 360;
	const centerY = 240;
	const radius = 250;
	const coreId = "core";

	const branches = [
		{ id: "moat", title: t.moat, value: quote.profile.moat || `${quote.symbol} 的競爭優勢觀察` },
		{ id: "themes", title: t.themes, value: quote.profile.theme || `${quote.symbol} 的業務與需求驅動` },
		{
			id: "financials",
			title: t.financials,
			value: buildFinancialMindMapValue(quote),
		},
		{
			id: "valuation",
			title: t.valuation,
			value: `${quote.valuationMethod.primary}｜${quote.valuation === "資料不足" ? "以股價、獲利與現金流觀察估值" : quote.valuation}`,
		},
		{
			id: "risks",
			title: t.risks,
			value: (quote.profile.risks || []).slice(0, 2).join("｜") || `${quote.symbol} 的財報、估值與產業變化觀察`,
		},
	];

	const nodes = [
		{
			id: coreId,
			type: "mindMapCore",
			position: { x: centerX - NODE_WIDTH.core / 2, y: centerY - NODE_HEIGHT.core / 2 },
			data: {
				symbol: quote.symbol,
				rating: quote.rating === "資料不足" ? "以財報與估值資料判讀" : displayValue(quote.rating, language),
			},
			draggable: false,
		},
		...branches.map((branch, index) => ({
			id: branch.id,
			type: "mindMapBranch",
			position: radialPosition(index, branches.length, radius, centerX, centerY, "branch"),
			data: {
				title: branch.title,
				value: truncate(branch.value, branch.id === "financials" ? 136 : 88),
			},
			draggable: false,
		})),
	];

	const edges = branches.map((branch) => ({
		id: `edge-${branch.id}`,
		source: coreId,
		target: branch.id,
		type: "smoothstep",
		animated: true,
		style: { stroke: "#8fc8ce", strokeWidth: 2 },
	}));

	return { nodes, edges };
}
