import { translateTerm } from "./translationMap.js";
import { buildResearchSynthesis } from "./researchSynthesis.mjs";

const fallbackProfile = {
	theme: null,
	competitors: [],
	suppliers: [],
	customers: [],
	supplyChain: {
		upstream: [],
		downstream: [],
		note: null,
	},
	moat: null,
	risks: [],
	valuationMethod: {
		primary: "標準化估值框架",
		why: "使用可取得的估值與現金流欄位計算；不代表公司特有的商業判斷。",
	},
	valuationModels: ["growth", "fcf"],
};

export function getProfileForSymbol(symbol, snapshot) {
	const dynamicProfile = snapshot?.profile || {};
	const synthesis = buildResearchSynthesis({ symbol, snapshot });
	const objectiveRisks = generateDynamicRisks(snapshot);

	return {
		...fallbackProfile,
		theme: dynamicProfile.description
			? `${translateTerm(dynamicProfile.sector, "zh")} / ${translateTerm(dynamicProfile.industry, "zh")}：${dynamicProfile.description.slice(0, 120)}...`
			: synthesis.theme,
		industry: dynamicProfile.industry,
		sector: dynamicProfile.sector,
		description: dynamicProfile.description,
		competitors:
			Array.isArray(dynamicProfile.competitors) && dynamicProfile.competitors.length ? dynamicProfile.competitors : synthesis.competitors,
		suppliers:
			Array.isArray(dynamicProfile.suppliers) && dynamicProfile.suppliers.length ? dynamicProfile.suppliers : synthesis.supplyChain.upstream,
		customers:
			Array.isArray(dynamicProfile.customers) && dynamicProfile.customers.length ? dynamicProfile.customers : synthesis.supplyChain.downstream,
		supplyChain:
			dynamicProfile.supplyChain?.upstream?.length || dynamicProfile.supplyChain?.downstream?.length
				? dynamicProfile.supplyChain
				: synthesis.supplyChain,
		moat: dynamicProfile.moat || synthesis.moat,
		catalysts: Array.isArray(dynamicProfile.catalysts) && dynamicProfile.catalysts.length ? dynamicProfile.catalysts : synthesis.catalysts,
		monthlyRevenueNote: dynamicProfile.monthlyRevenueNote || synthesis.monthlyRevenueNote,
		swot: deriveSourceDrivenSWOT(snapshot, symbol) || synthesis.swot,
		risks: objectiveRisks?.length ? objectiveRisks : synthesis.risks,
		profileSource: dynamicProfile.source || snapshot?.source || null,
		profileSourceUrl: dynamicProfile.sourceUrl || snapshot?.sourceUrl || null,
		aiSupplement: {
			enabled: Boolean(snapshot?.aiSwot || (Array.isArray(snapshot?.aiRisks) && snapshot.aiRisks.length)),
			swot: Boolean(snapshot?.aiSwot),
			risks: Boolean(Array.isArray(snapshot?.aiRisks) && snapshot.aiRisks.length),
		},
		valuationMethod: synthesis.valuationMethod || fallbackProfile.valuationMethod,
		valuationModels: synthesis.valuationModels.length ? synthesis.valuationModels : fallbackProfile.valuationModels,
	};
}

/**
 * 徹底去硬編碼化的 SWOT 分析邏輯
 * 核心原則：100% 引用第三方專業原文與實時量化事實
 * 來源：StockAnalysis (專業摘要) + Finnhub (分析師情緒)
 */
function deriveSourceDrivenSWOT(snapshot = {}, symbol) {
	const synthesis = buildResearchSynthesis({ symbol, snapshot });
	const { metrics = {}, profile = {}, finnhub = {} } = snapshot || {};

	const s = [];
	const w = [];
	const o = [];
	const t = [];

	// --- 優勢 (Strengths): 直接引用第三方專業財報回顧 ---
	if (profile?.financialIntro) {
		s.push(`${profile.financialIntro} (來源: StockAnalysis)`);
	}
	// 量化優勢事實
	if (metrics.grossMargin?.number >= 40) s.push(`毛利率事實: ${metrics.grossMargin.value} (來源: StockAnalysis)`);
	if (metrics.roe?.number >= 12) s.push(`ROE 事實: ${metrics.roe.value} (來源: StockAnalysis)`);
	if (metrics.fcfYield?.number >= 2) s.push(`現金流收益率事實: FCF Yield ${metrics.fcfYield.value} (來源: StockAnalysis)`);

	// --- 劣勢 (Weaknesses): 客觀財務壓力事實 ---
	const debt = metrics.debt;
	const cash = metrics.totalcash;
	if (Number.isFinite(debt?.number) && Number.isFinite(cash?.number) && debt.number > cash.number) {
		w.push(`資產負債壓力: 負債 ${debt.value} 高於現金 ${cash.value} (來源: StockAnalysis)`);
	}

	const pe = metrics.peForward || metrics.pe;
	if (pe?.number >= 35) w.push(`定價倍數壓力: P/E ${pe.value} (來源: StockAnalysis / Yahoo)`);

	const revGrowth = snapshot.forecast?.annualRevenue;
	if (Number.isFinite(revGrowth?.growth) && revGrowth.growth < 0) {
		w.push(`預期增速壓力: 年度營收成長預計 ${revGrowth.growthDisplay} (來源: StockAnalysis)`);
	}

	const pm = metrics.profitMargin?.number;
	if (Number.isFinite(pm) && pm < 5) {
		w.push(`獲利能力壓力: 淨利率 ${metrics.profitMargin.value} (來源: StockAnalysis)`);
	}
	if (Number.isFinite(metrics.operatingMargin?.number) && metrics.operatingMargin.number < 10) {
		w.push(`營運效率壓力: 營業利益率 ${metrics.operatingMargin.value} (來源: StockAnalysis)`);
	}
	if (Number.isFinite(metrics.grossMargin?.number) && metrics.grossMargin.number < 25) {
		w.push(`產品/定價壓力: 毛利率 ${metrics.grossMargin.value} (來源: StockAnalysis)`);
	}
	if (Number.isFinite(metrics.roe?.number) && metrics.roe.number < 8) {
		w.push(`資本報酬率偏弱: ROE ${metrics.roe.value} (來源: StockAnalysis)`);
	}
	if (Number.isFinite(metrics.roic?.number) && metrics.roic.number < 6) {
		w.push(`資本效率偏弱: ROIC ${metrics.roic.value} (來源: StockAnalysis)`);
	}
	if (Number.isFinite(metrics.fcfYield?.number) && metrics.fcfYield.number < 1) {
		w.push(`現金流收益率偏低: FCF Yield ${metrics.fcfYield.value} (來源: StockAnalysis)`);
	}
	const annualEpsGrowth = snapshot.forecast?.annualEps?.growth;
	if (Number.isFinite(annualEpsGrowth) && annualEpsGrowth < 0) {
		w.push(`盈餘預估壓力: 年度 EPS 成長預估 ${snapshot.forecast.annualEps.growthDisplay} (來源: StockAnalysis)`);
	}

	// --- 機會 (Opportunities): 直接引用第三方專業市場預測 ---
	if (profile?.analystIntro) {
		o.push(`${profile.analystIntro} (來源: StockAnalysis)`);
	}

	// 量化分析師情緒 (Finnhub)
	const recommendations = finnhub?.recommendations;
	if (recommendations) {
		const total =
			(recommendations.strongBuy || 0) +
			(recommendations.buy || 0) +
			(recommendations.hold || 0) +
			(recommendations.sell || 0) +
			(recommendations.strongSell || 0);
		if ((recommendations.strongBuy || 0) + (recommendations.buy || 0) > (recommendations.sell || 0) + (recommendations.strongSell || 0)) {
			o.push(`分析師情緒: ${recommendations.strongBuy} 位推薦強力買入, ${recommendations.buy} 位推薦買入 (共 ${total} 位, 來源: Finnhub)`);
		}
	}

	const targetPrice = metrics.priceTarget;
	if (targetPrice?.number > 0 && Number.isFinite(snapshot.price) && targetPrice.number > snapshot.price) {
		o.push(`目標價上行空間: 目標價 ${targetPrice.value} 高於現價 $${snapshot.price} (來源: StockAnalysis)`);
	}

	const annualGrowth = snapshot.forecast?.annualRevenue?.growth;
	const nextAnnualGrowth = snapshot.forecast?.nextAnnualRevenue?.growth;
	if (Number.isFinite(annualGrowth) && annualGrowth > 0) {
		o.push(`年度營收成長預估: ${snapshot.forecast.annualRevenue.growthDisplay} (來源: StockAnalysis)`);
	}
	if (Number.isFinite(nextAnnualGrowth) && nextAnnualGrowth > 0) {
		o.push(`下一年度營收成長預估: ${snapshot.forecast.nextAnnualRevenue.growthDisplay} (來源: StockAnalysis)`);
	}

	// --- 威脅 (Threats): 市場共識分歧與估值警告 ---
	const peg = metrics.pegRatio;
	if (Number.isFinite(peg?.number) && peg.number > 1.5) {
		t.push(`估值泡沫指標: PEG 比率 ${peg.value} (來源: StockAnalysis)`);
	}
	if (Number.isFinite(peg?.number) && peg.number > 2) {
		t.push(`成長定價風險: PEG ${peg.value}，成長假設偏樂觀 (來源: StockAnalysis)`);
	}
	const forwardPe = metrics.peForward?.number;
	if (Number.isFinite(forwardPe) && forwardPe > 35) {
		t.push(`估值壓縮風險: Forward P/E ${metrics.peForward.value} (來源: StockAnalysis)`);
	}

	if (recommendations && (recommendations.sell > 0 || recommendations.strongSell > 0)) {
		t.push(`市場分歧事實: 共有 ${recommendations.sell + recommendations.strongSell} 位專業分析師給予賣出評級 (來源: Finnhub)`);
	}
	if (recommendations) {
		const buyCount = (recommendations.strongBuy || 0) + (recommendations.buy || 0);
		const sellCount = (recommendations.sell || 0) + (recommendations.strongSell || 0);
		if (sellCount > buyCount) {
			t.push(`分析師結構風險: 賣出評級 (${sellCount}) 高於買入評級 (${buyCount}) (來源: Finnhub)`);
		}
	}

	const downside = metrics.priceTargetChange?.number;
	if (Number.isFinite(downside) && downside < 0) {
		t.push(`目標價風險: 分析師平均目標價較現價低 ${metrics.priceTargetChange.value} (來源: StockAnalysis)`);
	}

	const profitMargin = metrics.profitMargin?.number;
	if (Number.isFinite(profitMargin) && profitMargin < 5) {
		t.push(`獲利壓力事實: 淨利率 ${metrics.profitMargin.value}，緩衝空間偏低 (來源: StockAnalysis)`);
	}

	const nextRevenueGrowth = snapshot.forecast?.nextAnnualRevenue?.growth;
	if (Number.isFinite(nextRevenueGrowth) && nextRevenueGrowth < 0) {
		t.push(`成長風險事實: 下一年度預估營收成長 ${snapshot.forecast.nextAnnualRevenue.growthDisplay} (來源: StockAnalysis)`);
	}
	const nextEpsGrowth = snapshot.forecast?.nextAnnualEps?.growth;
	if (Number.isFinite(nextEpsGrowth) && nextEpsGrowth < 0) {
		t.push(`盈餘下修風險: 下一年度預估 EPS 成長 ${snapshot.forecast.nextAnnualEps.growthDisplay} (來源: StockAnalysis)`);
	}
	if (Number.isFinite(metrics.sharesInsiders?.number) && metrics.sharesInsiders.number < 1) {
		t.push(`內部人持股偏低: ${metrics.sharesInsiders.value}，管理層與股東利益連結較弱 (來源: StockAnalysis)`);
	}
	if (Number.isFinite(metrics.priceTarget?.number) && Number.isFinite(snapshot.price)) {
		const gapPct = ((metrics.priceTarget.number - snapshot.price) / snapshot.price) * 100;
		if (gapPct < -10) {
			t.push(`下行空間風險: 目標價相對現價約 ${gapPct.toFixed(2)}% (來源: StockAnalysis)`);
		}
	}

	const cleanResearchText = (value) => String(value || "").trim();
	const sourceDriven = {
		s: (s.length ? s : synthesis.swot.s).map(cleanResearchText),
		w: (w.length ? w : synthesis.swot.w).map(cleanResearchText),
		o: (o.length ? o : synthesis.swot.o).map(cleanResearchText),
		t: (t.length ? t : synthesis.swot.t).map(cleanResearchText),
	};

	const aiSwot = snapshot?.aiSwot || null;
	if (!aiSwot) return sourceDriven;

	const mergeSide = (base, extra) => {
		const merged = [...(Array.isArray(base) ? base : [])];
		for (const line of Array.isArray(extra) ? extra : []) {
			const cleaned = cleanResearchText(line);
			if (cleaned && !merged.includes(cleaned)) merged.push(cleaned);
		}
		return merged.slice(0, 6);
	};

	const merged = {
		s: mergeSide(sourceDriven.s, aiSwot.s),
		w: mergeSide(sourceDriven.w, aiSwot.w),
		o: mergeSide(sourceDriven.o, aiSwot.o),
		t: mergeSide(sourceDriven.t, aiSwot.t),
	};

	return merged;
}

function generateDynamicRisks(snapshot) {
	if (!snapshot || !snapshot.metrics) return null;
	const metrics = snapshot.metrics;
	const risks = [];
	const pe = metrics.pe?.number;
	const forwardPe = metrics.peForward?.number;
	const peg = metrics.pegRatio?.number;
	const fcfYield = metrics.fcfYield?.number;
	const grossMargin = metrics.grossMargin?.number;
	const operatingMargin = metrics.operatingMargin?.number;
	const profitMargin = metrics.profitMargin?.number;
	const debt = metrics.debt?.number;
	const cash = metrics.totalcash?.number;
	const targetGap = metrics.priceTargetChange?.value;
	const revenueGrowth = snapshot.forecast?.annualRevenue?.growth;
	const nextRevenueGrowth = snapshot.forecast?.nextAnnualRevenue?.growth;
	const nextEpsGrowth = snapshot.forecast?.nextAnnualEps?.growth;
	const insiderOwnership = metrics.sharesInsiders?.number;
	const aiRisks = (snapshot.aiRisks || []).filter(Boolean);

	if (Number.isFinite(pe) && pe >= 45) {
		risks.push(`估值風險：目前 PE ${metrics.pe?.value || pe.toFixed(2)}，市場已提前反映大量成長預期，財報容錯率偏低。`);
	}
	if (Number.isFinite(forwardPe) && forwardPe >= 38) {
		risks.push(`估值壓縮風險：Forward PE ${metrics.peForward?.value || forwardPe.toFixed(2)}，若指引低於預期，倍數回調壓力較高。`);
	}
	if (Number.isFinite(peg) && peg >= 1.8) {
		risks.push(`成長定價風險：PEG ${metrics.pegRatio?.value || peg.toFixed(2)}，需持續驗證高成長假設。`);
	}
	if (Number.isFinite(fcfYield) && fcfYield < 1) {
		risks.push(`現金流風險：FCF Yield ${metrics.fcfYield?.value || `${fcfYield.toFixed(2)}%`}，現金流緩衝較薄。`);
	}
	if (Number.isFinite(profitMargin) && profitMargin < 5) {
		risks.push(`獲利壓力：淨利率 ${metrics.profitMargin?.value || `${profitMargin.toFixed(2)}%`} 偏低，成本/需求波動容易放大獲利下修。`);
	}
	if (Number.isFinite(operatingMargin) && operatingMargin < 10) {
		risks.push(`營運效率風險：營業利益率 ${metrics.operatingMargin?.value || `${operatingMargin.toFixed(2)}%`}，費用控管與營運槓桿需持續追蹤。`);
	}
	if (Number.isFinite(grossMargin) && grossMargin < 25) {
		risks.push(`毛利率風險：毛利率 ${metrics.grossMargin?.value || `${grossMargin.toFixed(2)}%`}，產品組合或定價壓力可能侵蝕獲利。`);
	}
	if (Number.isFinite(debt) && Number.isFinite(cash) && debt > cash * 2 && debt > 1e9) {
		risks.push(`財務槓桿風險：負債 ${metrics.debt?.value || "N/A"} 高於現金 ${metrics.totalcash?.value || "N/A"}，需關注再融資與利率環境。`);
	}
	if (Number.isFinite(revenueGrowth) && revenueGrowth < 0) {
		risks.push(`成長放緩風險：年度營收預估成長 ${snapshot.forecast?.annualRevenue?.growthDisplay || `${revenueGrowth.toFixed(2)}%`}。`);
	}
	if (Number.isFinite(nextRevenueGrowth) && nextRevenueGrowth < 0) {
		risks.push(
			`需求循環風險：下一年度營收預估成長 ${snapshot.forecast?.nextAnnualRevenue?.growthDisplay || `${nextRevenueGrowth.toFixed(2)}%`}，需警惕景氣與市占波動。`
		);
	}
	if (Number.isFinite(nextEpsGrowth) && nextEpsGrowth < 0) {
		risks.push(`獲利下修風險：下一年度 EPS 預估成長 ${snapshot.forecast?.nextAnnualEps?.growthDisplay || `${nextEpsGrowth.toFixed(2)}%`}。`);
	}
	if (typeof targetGap === "string" && targetGap.startsWith("-")) {
		risks.push(`市場預期分歧：分析師目標價差距 ${targetGap}，代表目前價格高於部分共識估值。`);
	}
	if (Number.isFinite(insiderOwnership) && insiderOwnership < 1) {
		risks.push(
			`治理與激勵風險：內部人持股 ${metrics.sharesInsiders?.value || `${insiderOwnership.toFixed(2)}%`} 偏低，需追蹤管理層與股東利益一致性。`
		);
	}

	for (const risk of aiRisks) {
		if (!risks.includes(risk)) risks.push(risk);
	}

	return risks.slice(0, 8);
}

export function normalizeSymbol(input) {
	const value = input.trim().toUpperCase();
	if (value === "GOOGLE") return "GOOGL";
	if (value === "TSMC") return "TSM";
	return value;
}

function numberOrNull(value) {
	return Number.isFinite(value) ? value : null;
}

function pct(value) {
	if (!Number.isFinite(value)) return null;
	return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function price(value) {
	if (!Number.isFinite(value)) return null;
	return `$${value.toFixed(2)}`;
}

function classifyValuation(pe, forwardPe, fcfYield, pegRatio) {
	const basis = numberOrNull(forwardPe) ?? numberOrNull(pe);
	if (Number.isFinite(pegRatio) && pegRatio <= 0.8 && Number.isFinite(fcfYield) && fcfYield >= 2) {
		return "合理";
	}
	if (!Number.isFinite(basis)) return "資料不足";
	if (basis < 18) return "合理偏低";
	if (basis < 28) return "合理";
	if (basis < 45) return "合理偏高";
	return "明顯高估";
}

function classifyTrend(changePercent, current, fiftyDay, twoHundredDay) {
	if (!Number.isFinite(current)) return "資料不足";
	const above50 = Number.isFinite(fiftyDay) && current >= fiftyDay;
	const above200 = Number.isFinite(twoHundredDay) && current >= twoHundredDay;
	if (above50 && above200 && changePercent >= 0) return "偏多";
	if (!above50 && !above200) return "偏空";
	return "中性";
}

function makePriceZones() {
	return {
		ideal: "資料不足",
		buy: "資料不足",
		watch: "資料不足",
		basis: "目前沒有可驗證的公司專屬價格區間模型，暫不產生操作價位。",
	};
}

function ratingFrom(valuation, trend, changePercent) {
	if (valuation === "資料不足" || trend === "資料不足") return "資料不足";
	if (valuation === "明顯高估" && trend !== "偏空") return "觀望";
	if (valuation === "合理偏高" && trend === "偏多") return "續抱";
	if (["合理", "合理偏低"].includes(valuation) && trend !== "偏空") return "分批買入";
	if (trend === "偏空" && changePercent < -5) return "觀望";
	return "續抱";
}

function thesisFrom(rating, valuation, profile) {
	if (rating === "資料不足") return "目前可驗證資料不足，暫不提供買入、續抱或減碼評級。";
	const theme = profile.theme || "公司公開資料";
	if (rating === "分批買入") {
		return `估值屬於${valuation}，且目前公開資料顯示的主題為 ${theme}，可用分批方式建立或增加部位。`;
	}
	if (rating === "觀望") {
		return `目前公開資料顯示的主題為 ${theme}，但估值屬於${valuation}，需要更好的安全邊際或更明確基本面催化。`;
	}
	return `目前公開資料顯示的主題為 ${theme}，基本面仍值得追蹤，但現價更適合續抱與等待更好的加碼點。`;
}

function formatFinancialDisplay(value) {
	if (!Number.isFinite(value)) return null;
	const absolute = Math.abs(value);
	const sign = value < 0 ? "-" : "";
	if (absolute >= 1e12) return `${sign}$${(absolute / 1e12).toFixed(2)}T`;
	if (absolute >= 1e9) return `${sign}$${(absolute / 1e9).toFixed(2)}B`;
	if (absolute >= 1e6) return `${sign}$${(absolute / 1e6).toFixed(2)}M`;
	return `${sign}$${absolute.toFixed(0)}`;
}

export function enrichQuote(quote, profile) {
	const metrics = quote.metrics || {};
	const filingFinancials = quote.secFinancials?.status === "ok" ? quote.secFinancials : null;
	const filingAnnual = filingFinancials?.annual?.metrics || {};
	const filingLatest = filingFinancials?.latestPeriod?.metrics || {};
	const filingBalance = filingFinancials?.balanceSheet?.metrics || {};
	const actual = (key, fallback) => (filingAnnual[key]?.display || filingLatest[key]?.display || fallback) ?? null;
	const actualBalance = (key, fallback) => (filingBalance[key]?.display || filingLatest[key]?.display || fallback) ?? null;
	const current = numberOrNull(quote.regularMarketPrice);
	const changePercent = numberOrNull(quote.regularMarketChangePercent);
	const pe = numberOrNull(quote.trailingPE) ?? metrics.pe?.number;
	const forwardPe = numberOrNull(quote.forwardPE) ?? metrics.peForward?.number;
	const ps = metrics.ps?.number;
	const forwardPs = metrics.psForward?.number;
	const pfcf = metrics.pfcf?.number;
	const fcfYield = metrics.fcfYield?.number;
	const pegRatio = metrics.pegRatio?.number;
	const low52 = numberOrNull(quote.fiftyTwoWeekLow);
	const high52 = numberOrNull(quote.fiftyTwoWeekHigh);
	const fiftyDay = numberOrNull(quote.fiftyDayAverage) ?? metrics.sma50?.number;
	const twoHundredDay = numberOrNull(quote.twoHundredDayAverage) ?? metrics.sma200?.number;
	const valuation = classifyValuation(pe, forwardPe, fcfYield, pegRatio);
	const trend = classifyTrend(changePercent ?? 0, current, fiftyDay, twoHundredDay);
	const zones = makePriceZones();
	const rating = ratingFrom(valuation, trend, changePercent ?? 0);

	return {
		symbol: quote.symbol,
		detailLevel: quote.detailLevel || "detail",
		name: quote.shortName || quote.longName || quote.symbol,
		exchange: quote.fullExchangeName || quote.exchange || "US",
		currency: quote.currency || "USD",
		marketState: quote.marketState || "UNKNOWN",
		price: current,
		change: numberOrNull(quote.regularMarketChange),
		changePercent,
		previousClose: numberOrNull(quote.regularMarketPreviousClose),
		open: numberOrNull(quote.regularMarketOpen),
		dayLow: numberOrNull(quote.regularMarketDayLow),
		dayHigh: numberOrNull(quote.regularMarketDayHigh),
		volume: numberOrNull(quote.regularMarketVolume),
		marketCap: numberOrNull(quote.marketCap),
		marketCapDisplay: metrics.marketcap?.value || null,
		pe,
		forwardPe,
		ps,
		forwardPs,
		pfcf,
		fcfYield,
		pegRatio,
		eps: numberOrNull(quote.epsTrailingTwelveMonths),
		fiftyDay,
		twoHundredDay,
		low52,
		high52,
		dividendYield: numberOrNull(quote.trailingAnnualDividendYield),
		targetMeanPrice: numberOrNull(quote.targetMeanPrice),
		targetHighPrice: numberOrNull(quote.targetHighPrice),
		targetLowPrice: numberOrNull(quote.targetLowPrice),
		recommendation: quote.averageAnalystRating || null,
		fundamentals: {
			monthlyRevenue: quote.monthlyRevenue || null,
			latestQuarterRevenue: quote.forecast?.latestQuarter?.revenueDisplay || null,
			latestQuarterRevenueGrowth: quote.forecast?.latestQuarter?.revenueGrowthDisplay || null,
			latestQuarterEps: quote.forecast?.latestQuarter?.epsDisplay || null,
			latestQuarterEpsGrowth: quote.forecast?.latestQuarter?.epsGrowthDisplay || null,
			latestQuarterDate: quote.forecast?.latestQuarter?.date || null,
			estimatedQuarterEps: quote.forecast?.quarterlyEps?.current ? `$${quote.forecast.quarterlyEps.current.toFixed(2)}` : null,
			estimatedQuarterEpsGrowth: quote.forecast?.quarterlyEps?.growthDisplay || null,
			estimatedNextQuarterEps: quote.forecast?.nextQuarterEps?.current ? `$${quote.forecast.nextQuarterEps.current.toFixed(2)}` : null,
			estimatedNextQuarterEpsGrowth: quote.forecast?.nextQuarterEps?.growthDisplay || null,
			estimatedAnnualRevenue: quote.forecast?.annualRevenue?.currentDisplay || null,
			estimatedAnnualRevenueGrowth: quote.forecast?.annualRevenue?.growthDisplay || null,
			estimatedNextAnnualRevenue: quote.forecast?.nextAnnualRevenue?.currentDisplay || null,
			estimatedNextAnnualRevenueGrowth: quote.forecast?.nextAnnualRevenue?.growthDisplay || null,
			estimatedAnnualGrossProfit: quote.financials?.forecast?.annualGrossProfitDisplay || null,
			estimatedAnnualGrossProfitGrowth: quote.financials?.forecast?.annualGrossProfitGrowthDisplay || null,
			estimatedNextAnnualGrossProfit: quote.financials?.forecast?.nextAnnualGrossProfitDisplay || null,
			estimatedNextAnnualGrossProfitGrowth: quote.financials?.forecast?.nextAnnualGrossProfitGrowthDisplay || null,
			estimatedAnnualOperatingIncome: quote.financials?.forecast?.annualOperatingIncomeDisplay || null,
			estimatedAnnualOperatingIncomeGrowth: quote.financials?.forecast?.annualOperatingIncomeGrowthDisplay || null,
			estimatedNextAnnualOperatingIncome: quote.financials?.forecast?.nextAnnualOperatingIncomeDisplay || null,
			estimatedNextAnnualOperatingIncomeGrowth: quote.financials?.forecast?.nextAnnualOperatingIncomeGrowthDisplay || null,
			estimatedAnnualEps: quote.forecast?.annualEps?.current ? `$${quote.forecast.annualEps.current.toFixed(2)}` : null,
			estimatedAnnualEpsGrowth: quote.forecast?.annualEps?.growthDisplay || null,
			estimatedNextAnnualEps: quote.forecast?.nextAnnualEps?.current ? `$${quote.forecast.nextAnnualEps.current.toFixed(2)}` : null,
			estimatedNextAnnualEpsGrowth: quote.forecast?.nextAnnualEps?.growthDisplay || null,
			forecastAssumptionNote: quote.financials?.forecast?.assumptionNote || null,
			forecastGrossMarginReference: quote.financials?.forecast?.annualMarginReference?.grossMargin || null,
			forecastOperatingMarginReference: quote.financials?.forecast?.annualMarginReference?.operatingMargin || null,
			estimatedQuarterRevenue: quote.forecast?.quarterlyRevenue?.currentDisplay || null,
			estimatedQuarterRevenueGrowth: quote.forecast?.quarterlyRevenue?.growthDisplay || null,
			estimatedNextQuarterRevenue: quote.forecast?.nextQuarterRevenue?.currentDisplay || null,
			estimatedNextQuarterRevenueGrowth: quote.forecast?.nextQuarterRevenue?.growthDisplay || null,
			revenue: actual("revenue", metrics.revenue?.value ? metrics.revenue.value : null),
			eps: metrics.eps?.value || null,
			grossMargin: filingAnnual.grossMargin || metrics.grossMargin?.value || null,
			operatingMargin: filingAnnual.operatingMargin || metrics.operatingMargin?.value || null,
			profitMargin: filingAnnual.netMargin || metrics.profitMargin?.value || null,
			freeCashFlow: metrics.fcf?.value || null,
			totalCash: actualBalance("cash", metrics.totalcash?.value ? metrics.totalcash.value : null),
			debt: actualBalance("totalDebt", metrics.debt?.value ? metrics.debt.value : null),
			netCash:
				filingBalance.cash?.value !== undefined && filingBalance.totalDebt?.value !== undefined
					? formatFinancialDisplay(filingBalance.cash.value - filingBalance.totalDebt.value)
					: metrics.netcash?.value || null,
			roe: metrics.roe?.value || null,
			roic: metrics.roic?.value || null,
			insiderOwnership: metrics.sharesInsiders?.value || null,
			institutionalOwnership: metrics.sharesInstitutions?.value || null,
			revenue5y: metrics.revenue5y?.value || null,
			eps5y: metrics.eps5y?.value || null,
			analystCount: metrics.analystCount?.value || null,
			priceTargetChange: metrics.priceTargetChange?.value || null,
			source: filingFinancials?.source || quote.fundamentalsSource || null,
			sourceUrl: filingFinancials?.sourceUrl || quote.fundamentalsSourceUrl || null,
			forecastSourceUrl: quote.fundamentalsSourceUrl ? quote.fundamentalsSourceUrl.replace("/statistics/", "/forecast/") : null,
			asOf: quote.updated || null,
		},
		detailedFinancials: quote.financials || null,
		filingFinancials,
		news: quote.news || [],
		events: quote.events || [],
		ownership: {
			insiders: metrics.sharesInsiders?.value || "N/A",
			institutions: metrics.sharesInstitutions?.value || "N/A",
			filings: quote.secOwnership?.filings || [],
			latestDisclosure: quote.secOwnership?.latestDisclosure || null,
			filingSource: quote.secOwnership?.source || "SEC EDGAR",
			transactionNote:
				quote.secOwnership?.note ||
				"目前公開資料層先顯示董監/內部人與法人持股比例；若 SEC EDGAR 有 Form 3/4/5，會列出近期 ownership filings。",
		},
		evidence: {
			market: {
				source: quote.source || "Yahoo Finance",
				sourceUrl: quote.sourceUrl || null,
				asOf: quote.updated || null,
			},
			fundamentals: {
				source: filingFinancials?.source || quote.fundamentalsSource || null,
				sourceUrl: filingFinancials?.sourceUrl || quote.fundamentalsSourceUrl || null,
				asOf: quote.updated || null,
			},
			filings: {
				source: filingFinancials?.source || null,
				sourceUrl: filingFinancials?.latestFilingUrl || filingFinancials?.sourceUrl || null,
				asOf: filingFinancials?.asOf || null,
				reportedPeriod: filingFinancials?.annual?.period || null,
			},
			ownership: {
				source: quote.secOwnership?.source || null,
				sourceUrl: quote.secOwnership?.sourceUrl || null,
				asOf: quote.secOwnership?.asOf || null,
			},
			events: {
				source: quote.events?.[0]?.source || null,
				sourceUrl: quote.events?.[0]?.sourceUrl || null,
				asOf: quote.events?.[0]?.date || null,
			},
		},
		quality: buildDataQuality({
			current,
			pe,
			forwardPe,
			ps,
			pfcf,
			fcfYield,
			fiftyDay,
			twoHundredDay,
			marketCap: metrics.marketcap?.value || quote.marketCap,
			financials: quote.financials || filingFinancials,
			news: quote.news,
			source: filingFinancials?.source || quote.fundamentalsSource,
			asOf: filingFinancials?.asOf || quote.updated || quote.updatedAt || null,
		}),
		catalystTimeline: buildCatalystTimeline(profile, quote),
		valuationModels: buildValuationModels(profile, {
			current,
			pe,
			forwardPe,
			ps,
			pfcf,
			fcfYield,
			pegRatio,
			grossMargin: metrics.grossMargin?.value,
			operatingMargin: metrics.operatingMargin?.value,
			revenueGrowth: quote.forecast?.annualRevenue?.growthDisplay,
			epsGrowth: quote.forecast?.annualEps?.growthDisplay,
			targetMeanPrice: metrics.priceTarget?.value || price(quote.targetMeanPrice),
		}),
		catalysts: buildCatalysts(profile, {
			trend,
			valuation,
			revenueGrowth: quote.forecast?.annualRevenue?.growthDisplay,
			nextRevenueGrowth: quote.forecast?.nextAnnualRevenue?.growthDisplay,
			epsGrowth: quote.forecast?.annualEps?.growthDisplay,
			latestQuarterRevenueGrowth: quote.forecast?.latestQuarter?.revenueGrowthDisplay,
		}),
		valuationMethod: buildValuationMethod(profile, {
			pe,
			forwardPe,
			ps,
			pfcf,
			fcfYield,
			pegRatio,
			epsGrowth: metrics.eps5y?.value,
			revenueGrowth: metrics.revenue5y?.value,
			source: quote.fundamentalsSource || null,
			sourceUrl: quote.fundamentalsSourceUrl || null,
		}),
		peterLynch: buildPeterLynchSnapshot({
			current,
			trailingEps: numberOrNull(quote.epsTrailingTwelveMonths),
			annualEps: quote.forecast?.annualEps,
			nextAnnualEps: quote.forecast?.nextAnnualEps,
			eps5y: metrics.eps5y?.number,
		}),
		valuation,
		trend,
		rating,
		zones,
		profile,
		thesis: thesisFrom(rating, valuation, profile),
		formatted: {
			price: price(current),
			changePercent: pct(changePercent),
			pe: metrics.pe?.value ? `${metrics.pe.value}x` : pe ? `${pe.toFixed(1)}x` : "N/A",
			forwardPe: metrics.peForward?.value ? `${metrics.peForward.value}x` : forwardPe ? `${forwardPe.toFixed(1)}x` : "N/A",
			ps: metrics.ps?.value ? `${metrics.ps.value}x` : ps ? `${ps.toFixed(1)}x` : "N/A",
			pfcf: metrics.pfcf?.value ? `${metrics.pfcf.value}x` : pfcf ? `${pfcf.toFixed(1)}x` : "N/A",
			fcfYield: metrics.fcfYield?.value || "N/A",
			pegRatio: metrics.pegRatio?.value || "N/A",
			marketCap: metrics.marketcap?.value || formatLargeNumber(quote.marketCap),
			volume: formatLargeNumber(quote.regularMarketVolume),
			fiftyDay: price(fiftyDay),
			twoHundredDay: price(twoHundredDay),
			range52: low52 && high52 ? `${price(low52)} - ${price(high52)}` : "N/A",
			targetMeanPrice: metrics.priceTarget?.value || price(quote.targetMeanPrice),
			recommendation: metrics.analystRatings?.value || quote.averageAnalystRating || "N/A",
		},
	};
}

function buildDataQuality(data) {
	const asOf = data.asOf ? Date.parse(data.asOf) : NaN;
	const stale = !Number.isFinite(asOf) || Date.now() - asOf > 24 * 60 * 60 * 1000;
	const checks = [
		["股價", Number.isFinite(data.current)],
		["市值", Boolean(data.marketCap)],
		["PE", Number.isFinite(data.pe)],
		["Forward PE", Number.isFinite(data.forwardPe)],
		["PS", Number.isFinite(data.ps)],
		["P/FCF", Number.isFinite(data.pfcf)],
		["FCF Yield", Number.isFinite(data.fcfYield)],
		["50日均線", Number.isFinite(data.fiftyDay)],
		["200日均線", Number.isFinite(data.twoHundredDay)],
		["財報細項", Boolean(data.financials)],
		["重大新聞", Boolean(data.news?.length)],
		["資料來源", Boolean(data.source)],
	];
	const available = checks.filter(([, ok]) => ok).length;
	const missing = checks.filter(([, ok]) => !ok).map(([label]) => label);
	const score = Math.round((available / checks.length) * 100);

	return {
		score,
		available,
		total: checks.length,
		missing,
		stale,
		asOf: Number.isFinite(asOf) ? new Date(asOf).toISOString() : null,
		status: score >= 85 ? "完整" : score >= 65 ? "可用但需補強" : "資料不足",
	};
}

function buildCatalystTimeline(profile, quote) {
	const items = [];
	const latestQuarterDate = quote.forecast?.latestQuarter?.date;

	for (const event of quote.events || []) {
		items.push({
			label: event.label,
			timing: event.date,
			status: event.status === "expected" ? "預估" : "已排定",
			signal: event.detail || event.source || "公開事件資料",
			source: event.source,
			sourceUrl: event.sourceUrl,
		});
	}

	if (latestQuarterDate) {
		const epsSignal = quote.forecast?.latestQuarter?.epsGrowthDisplay;
		const revenueSignal = quote.forecast?.latestQuarter?.revenueGrowthDisplay;
		const combinedSignal = [epsSignal ? `EPS ${epsSignal}` : null, revenueSignal ? `營收 ${revenueSignal}` : null].filter(Boolean).join("｜");
		items.push({
			label: "最新季度財報",
			timing: latestQuarterDate,
			status: "已發生",
			signal: combinedSignal || "EPS / 營收成長 N/A",
		});
	}
	if (quote.forecast?.annualEps?.growthDisplay) {
		items.push({
			label: "本年度 EPS 預估",
			timing: "未來 12 個月",
			status: "預估",
			signal: quote.forecast.annualEps.growthDisplay,
		});
	}
	if (quote.forecast?.nextAnnualEps?.growthDisplay) {
		items.push({
			label: "下一年度 EPS 預估",
			timing: "下一財年",
			status: "預估",
			signal: quote.forecast.nextAnnualEps.growthDisplay,
		});
	}
	if (quote.forecast?.annualRevenue?.growthDisplay) {
		items.push({
			label: "本年度營收預估",
			timing: "未來 12 個月",
			status: "預估",
			signal: quote.forecast.annualRevenue.growthDisplay,
		});
	}
	if (quote.forecast?.nextAnnualRevenue?.growthDisplay) {
		items.push({
			label: "下一年度營收預估",
			timing: "下一財年",
			status: "預估",
			signal: quote.forecast.nextAnnualRevenue.growthDisplay,
		});
	}

	for (const catalyst of profile.catalysts || []) {
		items.push({
			label: catalyst,
			timing: "持續追蹤",
			status: "待確認",
			signal: "需用財報、新聞或管理層指引驗證",
		});
	}

	return items.slice(0, 8);
}

function buildValuationModels(profile, metrics) {
	const models = {
		growth: {
			label: "成長股模型",
			method: "Forward PE + PEG + EPS 成長",
			inputs: [
				`Forward PE ${formatMetric(metrics.forwardPe, "x")}`,
				`PEG ${formatMetric(metrics.pegRatio, "")}`,
				`EPS 成長 ${metrics.epsGrowth || "N/A"}`,
			],
			objectiveUse: "適合營收與 EPS 仍高速成長的公司。",
		},
		fcf: {
			label: "現金流模型",
			method: "FCF Yield + P/FCF + ROIC",
			inputs: [
				`FCF Yield ${formatMetric(metrics.fcfYield, "%")}`,
				`P/FCF ${formatMetric(metrics.pfcf, "x")}`,
				`營業利益率 ${metrics.operatingMargin || "N/A"}`,
			],
			objectiveUse: "適合高自由現金流、回購能力強、獲利穩定的公司。",
		},
		semiconductor: {
			label: "半導體週期模型",
			method: "Forward PE + 毛利率 + 營收成長 + CapEx週期",
			inputs: [
				`Forward PE ${formatMetric(metrics.forwardPe, "x")}`,
				`毛利率 ${metrics.grossMargin || "N/A"}`,
				`營收成長 ${metrics.revenueGrowth || "N/A"}`,
			],
			objectiveUse: "適合晶片、代工、設備與高資本支出週期公司。",
		},
		scenario: {
			label: "情境估值模型",
			method: "Base/Bull/Bear 成長假設 + 估值倍數折現",
			inputs: [
				`現價 ${price(metrics.current) || "N/A"}`,
				`Forward PE ${formatMetric(metrics.forwardPe, "x")}`,
				`平均目標價 ${metrics.targetMeanPrice || "N/A"}`,
			],
			objectiveUse: "適合商業模式仍在驗證、選擇權價值很高的公司。",
		},
		evManufacturing: {
			label: "製造業模型",
			method: "營收成長 + 毛利率 + CapEx + FCF",
			inputs: [
				`毛利率 ${metrics.grossMargin || "N/A"}`,
				`營收成長 ${metrics.revenueGrowth || "N/A"}`,
				`FCF Yield ${formatMetric(metrics.fcfYield, "%")}`,
			],
			objectiveUse: "適合車廠、硬體製造與重資產公司。",
		},
		ps: {
			label: "PS 成長模型",
			method: "PS + Forward PS +營收成長",
			inputs: [`PS ${formatMetric(metrics.ps, "x")}`, `營收成長 ${metrics.revenueGrowth || "N/A"}`],
			objectiveUse: "適合獲利尚未完全反映、但營收成長快速的公司。",
		},
		sumOfParts: {
			label: "分部估值模型",
			method: "核心業務 + 雲端/AI/其他業務分部估值",
			inputs: [
				`PE ${formatMetric(metrics.pe, "x")}`,
				`Forward PE ${formatMetric(metrics.forwardPe, "x")}`,
				`FCF Yield ${formatMetric(metrics.fcfYield, "%")}`,
			],
			objectiveUse: "適合有多個業務引擎、單一倍數容易失真的平台公司。",
		},
	};

	return (profile.valuationModels || fallbackProfile.valuationModels).map((key) => models[key]).filter(Boolean);
}

function formatMetric(value, suffix) {
	if (!Number.isFinite(value)) return "N/A";
	return `${value.toFixed(2)}${suffix}`;
}

function buildCatalysts(profile, context) {
	const dynamicCatalysts = [];

	if (context.latestQuarterRevenueGrowth) {
		dynamicCatalysts.push(`最新季度營收成長 ${context.latestQuarterRevenueGrowth}`);
	}
	if (context.revenueGrowth) {
		dynamicCatalysts.push(`本年度預估營收成長 ${context.revenueGrowth}`);
	}
	if (context.nextRevenueGrowth) {
		dynamicCatalysts.push(`下一年度預估營收成長 ${context.nextRevenueGrowth}`);
	}
	if (context.epsGrowth) {
		dynamicCatalysts.push(`本年度預估 EPS 成長 ${context.epsGrowth}`);
	}
	if (context.trend === "偏多") {
		dynamicCatalysts.push("股價站上關鍵均線，技術面支撐題材延續");
	}
	if (context.valuation === "明顯高估") {
		dynamicCatalysts.push("估值容錯率低，需等待更明確財報過商業化驗證");
	}

	return [...(profile.catalysts || []), ...dynamicCatalysts].slice(0, 8);
}

function buildValuationMethod(profile, metrics) {
	const method = profile.valuationMethod || fallbackProfile.valuationMethod;
	const evidence = [];

	if (Number.isFinite(metrics.forwardPe)) evidence.push(`Forward PE ${metrics.forwardPe.toFixed(2)}x`);
	if (Number.isFinite(metrics.pe)) evidence.push(`PE ${metrics.pe.toFixed(2)}x`);
	if (Number.isFinite(metrics.pegRatio)) evidence.push(`PEG ${metrics.pegRatio.toFixed(2)}`);
	if (Number.isFinite(metrics.fcfYield)) evidence.push(`FCF Yield ${metrics.fcfYield.toFixed(2)}%`);
	if (Number.isFinite(metrics.ps)) evidence.push(`PS ${metrics.ps.toFixed(2)}x`);
	if (metrics.epsGrowth) evidence.push(`EPS 5Y growth ${metrics.epsGrowth}`);
	if (metrics.revenueGrowth) evidence.push(`Revenue 5Y growth ${metrics.revenueGrowth}`);

	return {
		primary: method.primary,
		why: method.why,
		evidence,
		sources: metrics.source && metrics.sourceUrl ? [{ source: metrics.source, sourceUrl: metrics.sourceUrl }] : [],
	};
}

function buildPeterLynchSnapshot({ current, trailingEps, annualEps, nextAnnualEps, eps5y }) {
	const candidates = [
		{
			sourceKey: "annualEpsForecast",
			eps: annualEps?.current ?? null,
			growth: annualEps?.growth ?? null,
		},
		{
			sourceKey: "nextAnnualEpsForecast",
			eps: nextAnnualEps?.current ?? null,
			growth: nextAnnualEps?.growth ?? null,
		},
		{
			sourceKey: "eps5y",
			eps: trailingEps,
			growth: eps5y,
		},
	].filter((item) => Number.isFinite(item.eps) && Number.isFinite(item.growth) && item.growth > 0);

	const base = candidates[0];
	if (!base || !Number.isFinite(current) || current <= 0) {
		return {
			sourceKey: null,
			status: "insufficient",
			fairValue: null,
			fairValueDisplay: "N/A",
			ratio: null,
			ratioDisplay: "N/A",
			growthRate: null,
			growthRateDisplay: "N/A",
			baseEps: null,
			baseEpsDisplay: "N/A",
			fairPe: null,
			fairPeDisplay: "N/A",
		};
	}

	const fairPe = base.growth;
	const fairValue = base.eps * fairPe;
	const ratio = fairValue / current;
	let status = "fair";
	if (ratio >= 1.15) status = "undervalued";
	else if (ratio <= 0.85) status = "overvalued";

	return {
		sourceKey: base.sourceKey,
		status,
		fairValue,
		fairValueDisplay: price(fairValue),
		ratio,
		ratioDisplay: `${ratio.toFixed(2)}x`,
		growthRate: base.growth,
		growthRateDisplay: `${base.growth.toFixed(2)}%`,
		baseEps: base.eps,
		baseEpsDisplay: `$${base.eps.toFixed(2)}`,
		fairPe,
		fairPeDisplay: `${fairPe.toFixed(2)}x`,
	};
}

export function formatLargeNumber(value) {
	if (!Number.isFinite(value)) return "N/A";
	if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
	if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
	if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
	return value.toLocaleString("en-US");
}
