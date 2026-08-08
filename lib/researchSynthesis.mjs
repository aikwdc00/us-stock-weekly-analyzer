import { stockProfiles } from "./stockProfiles.js";

function numberFrom(metric) {
	if (Number.isFinite(metric)) return metric;
	if (Number.isFinite(metric?.number)) return metric.number;
	if (Number.isFinite(metric?.value)) return metric.value;
	return null;
}

function displayFrom(metric, fallback = null) {
	if (typeof metric === "string" && metric.trim()) return metric;
	if (typeof metric === "number" && Number.isFinite(metric)) return String(metric);
	if (metric?.value !== undefined && metric.value !== null && metric.value !== "") return String(metric.value);
	if (metric?.display) return metric.display;
	const number = numberFrom(metric);
	return Number.isFinite(number) ? String(number) : fallback;
}

function formatPercent(value) {
	return Number.isFinite(value) ? `${value >= 0 ? "+" : ""}${value.toFixed(2)}%` : null;
}

function formatMoney(value) {
	if (!Number.isFinite(value)) return null;
	const absolute = Math.abs(value);
	const sign = value < 0 ? "-" : "";
	if (absolute >= 1e12) return `${sign}$${(absolute / 1e12).toFixed(2)}T`;
	if (absolute >= 1e9) return `${sign}$${(absolute / 1e9).toFixed(2)}B`;
	if (absolute >= 1e6) return `${sign}$${(absolute / 1e6).toFixed(2)}M`;
	return `${sign}$${absolute.toFixed(0)}`;
}

function compact(text, length = 150) {
	const value = String(text || "")
		.replace(/\s+/g, " ")
		.trim();
	return value.length > length ? `${value.slice(0, length)}...` : value;
}

function namesFrom(items) {
	return (Array.isArray(items) ? items : []).map((item) => (typeof item === "string" ? item : item?.name)).filter(Boolean);
}

const relationshipTickers = {
	"applied materials": "AMAT",
	"arista networks": "ANET",
	"amazon web services": "AMZN",
	broadcom: "AVGO",
	coreweave: "CRWV",
	dell: "DELL",
	"hca healthcare": "HCA",
	hertz: "HTZ",
	"infineon technologies": "IFNNY",
	intel: "INTC",
	"lam research": "LRCX",
	lenovo: "LNVGY",
	meta: "META",
	microsoft: "MSFT",
	micron: "MU",
	nvidia: "NVDA",
	"oracle cloud": "ORCL",
	panasonic: "PCRFY",
	"pg&e": "PCG",
	qualcomm: "QCOM",
	sony: "SONY",
	"shin-etsu chemical": "SHECY",
	stmicroelectronics: "STM",
	"taiwan semiconductor manufacturing company limited": "TSM",
	tsmc: "TSM",
	"tokyo electron": "TOELY",
	wpp: "WPP",
	apple: "AAPL",
	amd: "AMD",
	google: "GOOGL",
};

function withRelationshipTicker(item) {
	if (typeof item === "string") {
		const symbol = relationshipTickers[item.trim().toLowerCase()];
		return symbol ? { name: item, symbol } : { name: item };
	}
	if (!item || typeof item !== "object") return null;
	if (item.symbol || item.ticker) return item;

	const name = item.name || item.company || item.title || "";
	const symbol = relationshipTickers[String(name).trim().toLowerCase()];
	return symbol ? { ...item, symbol } : item;
}

function relationshipItems(items) {
	return (Array.isArray(items) ? items : []).map(withRelationshipTicker).filter(Boolean);
}

function metricFrom(snapshot, key) {
	const metrics = snapshot.metrics || {};
	const annual = snapshot.secFinancials?.annual?.metrics || {};
	const latest = snapshot.secFinancials?.latestPeriod?.metrics || {};
	return metrics[key] || annual[key] || latest[key] || null;
}

function metricText(snapshot, key, fallback = null) {
	return displayFrom(metricFrom(snapshot, key), fallback);
}

function metricNumber(snapshot, key) {
	return numberFrom(metricFrom(snapshot, key));
}

function buildTheme(symbol, snapshot, industry, sector) {
	const knownProfile = stockProfiles[symbol] || {};
	const description = compact(snapshot.profile?.description, 180);
	if (knownProfile.theme && description) return `${knownProfile.theme}；${description}`;
	if (knownProfile.theme) return knownProfile.theme;
	if (description) return `${industry || sector || "公開市場"}：${description}`;
	return null;
}

function buildCompetitors(snapshot, symbol, industry, sector) {
	const knownProfile = stockProfiles[symbol] || {};
	const explicit = namesFrom(snapshot.profile?.competitors);
	if (explicit.length) return explicit.slice(0, 6);
	if (knownProfile.competitors?.length) return knownProfile.competitors.slice(0, 6);
	return [];
}

function buildSupplyChain(snapshot, symbol, industry, sector) {
	const knownProfile = stockProfiles[symbol] || {};
	const explicitChain = snapshot.profile?.supplyChain || {};
	const explicitUpstream =
		Array.isArray(explicitChain.upstream) && explicitChain.upstream.length ? explicitChain.upstream : snapshot.profile?.suppliers;
	const explicitDownstream =
		Array.isArray(explicitChain.downstream) && explicitChain.downstream.length ? explicitChain.downstream : snapshot.profile?.customers;
	const knownChain = knownProfile.supplyChain || {};
	const upstream = relationshipItems(explicitUpstream?.length ? explicitUpstream : knownChain.upstream);
	const downstream = relationshipItems(explicitDownstream?.length ? explicitDownstream : knownChain.downstream);

	return {
		upstream,
		downstream,
		note: knownChain.note || null,
	};
}

function buildMoat(snapshot, symbol, industry, sector) {
	const knownProfile = stockProfiles[symbol] || {};
	const signals = [];
	if (knownProfile.moat) signals.push(`公開公司資料整理的競爭優勢：${knownProfile.moat}`);
	const description = compact(snapshot.profile?.description, 100);
	const grossMargin = metricText(snapshot, "grossMargin");
	const operatingMargin = metricText(snapshot, "operatingMargin");
	const revenueGrowth = snapshot.forecast?.annualRevenue?.growth;
	const cash = metricNumber(snapshot, "cash");
	const debt = metricNumber(snapshot, "totalDebt");
	const rd = metricNumber(snapshot, "researchAndDevelopment");
	const revenue = metricNumber(snapshot, "revenue");

	if (description) signals.push(`核心業務定位：${description}`);
	if (grossMargin) signals.push(`毛利率 ${grossMargin}，可用來觀察產品組合與定價能力`);
	if (operatingMargin) signals.push(`營業利益率 ${operatingMargin}，反映規模化與營運效率`);
	if (Number.isFinite(revenueGrowth)) signals.push(`本年度營收預估成長 ${formatPercent(revenueGrowth)}，可觀察成長動能是否延續`);
	if (Number.isFinite(cash) && Number.isFinite(debt)) {
		signals.push(`現金 ${formatMoney(cash)} 對負債 ${formatMoney(debt)}，用於評估資本韌性與擴張能力`);
	}
	if (Number.isFinite(rd) && Number.isFinite(revenue) && revenue !== 0) {
		signals.push(`研發投入約占營收 ${((rd / revenue) * 100).toFixed(2)}%，反映產品與技術更新強度`);
	}
	return signals.length ? signals.slice(0, 5).join("；") : null;
}

function buildRisks(snapshot, symbol, industry, sector) {
	const risks = [];
	const pe = metricNumber(snapshot, "pe");
	const forwardPe = metricNumber(snapshot, "peForward");
	const grossMargin = metricText(snapshot, "grossMargin");
	const operatingMargin = metricText(snapshot, "operatingMargin");
	const revenueGrowth = snapshot.forecast?.annualRevenue?.growth;
	const nextRevenueGrowth = snapshot.forecast?.nextAnnualRevenue?.growth;
	const cash = metricNumber(snapshot, "cash");
	const debt = metricNumber(snapshot, "totalDebt");

	if (Number.isFinite(pe) && pe >= 45) risks.push(`估值敏感度：本益比 ${pe.toFixed(2)} 倍，市場預期變化可能放大股價波動。`);
	if (Number.isFinite(forwardPe) && forwardPe >= 38)
		risks.push(`預期獲利風險：Forward PE ${forwardPe.toFixed(2)} 倍，後續財報與指引需要維持成長假設。`);
	if (Number.isFinite(revenueGrowth) && revenueGrowth < 0)
		risks.push(`成長放緩：本年度營收預估成長 ${formatPercent(revenueGrowth)}，需求或市占變化可能影響估值。`);
	if (Number.isFinite(nextRevenueGrowth) && nextRevenueGrowth < 0)
		risks.push(`需求循環：下一年度營收預估成長 ${formatPercent(nextRevenueGrowth)}，需留意訂單與資本支出節奏。`);
	if (grossMargin) risks.push(`毛利率變化：目前毛利率 ${grossMargin}，產品組合、價格與投入成本會直接影響獲利。`);
	if (operatingMargin) risks.push(`營運槓桿：目前營業利益率 ${operatingMargin}，費用成長快於營收時可能壓縮利潤。`);
	if (Number.isFinite(cash) && Number.isFinite(debt) && debt > cash)
		risks.push(`資本結構：負債 ${formatMoney(debt)} 高於現金 ${formatMoney(cash)}，再融資與利率變化需要納入情境。`);
	return risks.slice(0, 6);
}

function buildSwot(snapshot, symbol, industry, sector) {
	const strengths = [];
	const weaknesses = [];
	const opportunities = [];
	const threats = [];
	const grossMargin = metricText(snapshot, "grossMargin");
	const operatingMargin = metricText(snapshot, "operatingMargin");
	const profitMargin = metricText(snapshot, "netMargin") || metricText(snapshot, "profitMargin");
	const revenueGrowth = snapshot.forecast?.annualRevenue?.growth;
	const nextRevenueGrowth = snapshot.forecast?.nextAnnualRevenue?.growth;
	const target = metricNumber(snapshot, "priceTarget");
	const price = Number.isFinite(snapshot.price) ? snapshot.price : null;
	const cash = metricNumber(snapshot, "cash");
	const debt = metricNumber(snapshot, "totalDebt");
	const pe = metricNumber(snapshot, "peForward") ?? metricNumber(snapshot, "pe");

	if (snapshot.profile?.description) strengths.push(`業務定位：${compact(snapshot.profile.description, 130)}`);
	if (grossMargin) strengths.push(`獲利品質：毛利率 ${grossMargin}，可觀察產品組合與定價能力。`);
	if (Number.isFinite(cash) && Number.isFinite(debt) && cash >= debt)
		strengths.push(`財務韌性：現金 ${formatMoney(cash)} 不低於負債 ${formatMoney(debt)}。`);

	if (operatingMargin) weaknesses.push(`營運效率：營業利益率 ${operatingMargin}，需持續觀察費用與營收的增速差。`);
	if (profitMargin) weaknesses.push(`最終獲利：淨利表現 ${profitMargin}，利潤波動會影響現金流與估值承受度。`);
	if (Number.isFinite(pe) && pe >= 35) weaknesses.push(`估值容錯率：Forward PE / PE ${pe.toFixed(2)} 倍，預期下修時評價可能收縮。`);

	if (Number.isFinite(revenueGrowth) && revenueGrowth > 0) opportunities.push(`成長機會：本年度營收預估成長 ${formatPercent(revenueGrowth)}。`);
	if (Number.isFinite(nextRevenueGrowth) && nextRevenueGrowth > 0)
		opportunities.push(`延續性機會：下一年度營收預估成長 ${formatPercent(nextRevenueGrowth)}。`);
	if (Number.isFinite(target) && Number.isFinite(price) && target > price) opportunities.push(`市場預期：平均目標價高於現價，仍有預期差可供追蹤。`);

	if (Number.isFinite(nextRevenueGrowth) && nextRevenueGrowth < 0)
		threats.push(`需求威脅：下一年度營收預估成長 ${formatPercent(nextRevenueGrowth)}。`);
	if (Number.isFinite(pe) && pe >= 45) threats.push(`估值威脅：較高評價需要持續的獲利與現金流成長支撐。`);
	if (Number.isFinite(cash) && Number.isFinite(debt) && debt > cash)
		threats.push(`財務威脅：負債 ${formatMoney(debt)} 高於現金 ${formatMoney(cash)}。`);
	return {
		s: strengths.slice(0, 5),
		w: weaknesses.slice(0, 5),
		o: opportunities.slice(0, 5),
		t: threats.slice(0, 5),
	};
}

export function buildResearchSynthesis({ symbol, snapshot = {} } = {}) {
	const data = snapshot && typeof snapshot === "object" ? snapshot : {};
	const industry = data.profile?.industry || null;
	const sector = data.profile?.sector || null;
	const knownProfile = stockProfiles[symbol] || {};

	return {
		theme: buildTheme(symbol, data, industry, sector),
		competitors: buildCompetitors(data, symbol, industry, sector),
		supplyChain: buildSupplyChain(data, symbol, industry, sector),
		moat: buildMoat(data, symbol, industry, sector),
		risks: buildRisks(data, symbol, industry, sector),
		swot: buildSwot(data, symbol, industry, sector),
		catalysts: knownProfile.catalysts || [],
		monthlyRevenueNote: knownProfile.monthlyRevenueNote || null,
		valuationMethod: knownProfile.valuationMethod || null,
		valuationModels: knownProfile.valuationModels || [],
	};
}
