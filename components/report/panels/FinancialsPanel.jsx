import { ExternalLink } from "lucide-react";
import { FinancialCharts } from "../shared/FinancialCharts";
import { Info } from "../shared/Info";
import { SectionTitle } from "../shared/SectionTitle";

export function FinancialsPanel({ quote, t, language }) {
	const text = language === "en"
		? {
				monthlyRevenue: "Monthly Revenue",
				latestQuarterRevenue: "Latest Quarterly Revenue",
				latestQuarterEps: "Latest Quarterly EPS",
				quarterDate: "Quarter Date",
				estAnnualRevenue: "Estimated Annual Revenue",
				estNextAnnualRevenue: "Estimated Next Annual Revenue",
				estAnnualEps: "Estimated Annual EPS",
				estNextAnnualEps: "Estimated Next Annual EPS",
				ttmRevenue: "TTM Revenue",
				ttmCostOfRevenue: "TTM Cost of Revenue",
				ttmGrossProfit: "TTM Gross Profit",
				ttmOpex: "TTM Operating Expenses",
				ttmOperatingIncome: "TTM Operating Income",
				ttmNonOperating: "TTM Non-operating Income/Expense",
				ttmPretax: "TTM Pretax Income",
				ttmTax: "TTM Tax Provision",
				ttmNetIncome: "TTM Net Income",
				grossMargin: "Gross Margin",
				operatingMargin: "Operating Margin",
				netMargin: "Net Margin",
				annualRevenue: "Annual Revenue",
				annualCostOfRevenue: "Annual Cost of Revenue",
				annualRnd: "Annual R&D",
				annualCapex: "Annual CapEx",
				revenueTtm: "Revenue TTM",
				epsTtm: "EPS TTM",
				fcf: "Free Cash Flow",
				cash: "Cash",
				totalDebt: "Total Debt",
				netCash: "Net Cash",
				insiderOwnership: "Insider Ownership",
				instOwnership: "Institutional Ownership",
				analystCount: "Analyst Count",
		  }
		: {
				monthlyRevenue: "月營收",
				latestQuarterRevenue: "最新季度營收",
				latestQuarterEps: "最新季度 EPS",
				quarterDate: "季度日期",
				estAnnualRevenue: "本年度預估營收",
				estNextAnnualRevenue: "下一年度預估營收",
				estAnnualEps: "本年度預估 EPS",
				estNextAnnualEps: "下一年度預估 EPS",
				ttmRevenue: "TTM 營收",
				ttmCostOfRevenue: "TTM 營收成本",
				ttmGrossProfit: "TTM 毛利",
				ttmOpex: "TTM 營業費用",
				ttmOperatingIncome: "TTM 營業利益",
				ttmNonOperating: "TTM 業外收入/費用",
				ttmPretax: "TTM 稅前淨利",
				ttmTax: "TTM 所得稅",
				ttmNetIncome: "TTM 淨利",
				grossMargin: "毛利率",
				operatingMargin: "營業利益率",
				netMargin: "淨利率",
				annualRevenue: "年度營收",
				annualCostOfRevenue: "年度營收成本",
				annualRnd: "年度研發費用",
				annualCapex: "年度資本支出",
				revenueTtm: "營收 TTM",
				epsTtm: "EPS TTM",
				fcf: "自由現金流",
				cash: "現金",
				totalDebt: "總負債",
				netCash: "淨現金",
				insiderOwnership: "內部人持股",
				instOwnership: "法人持股",
				analystCount: "分析師數",
		  };
	return (
		<div className="reportTabPanel">
			<section className="analysisSection">
				<h3>{t.revenueTrend}</h3>
				<div className="fundamentalGrid">
					<Info label={text.monthlyRevenue} value={quote.fundamentals.monthlyRevenue || "N/A"} />
					<Info
						label={text.latestQuarterRevenue}
						value={
							quote.fundamentals.latestQuarterRevenue
								? `${quote.fundamentals.latestQuarterRevenue} / ${quote.fundamentals.latestQuarterRevenueGrowth || t.growthNA}`
								: "N/A"
						}
					/>
					<Info
						label={text.latestQuarterEps}
						value={
							quote.fundamentals.latestQuarterEps
								? `${quote.fundamentals.latestQuarterEps} / ${quote.fundamentals.latestQuarterEpsGrowth || t.growthNA}`
								: "N/A"
						}
					/>
					<Info label={text.quarterDate} value={quote.fundamentals.latestQuarterDate || "N/A"} />
					<Info
						label={text.estAnnualRevenue}
						value={
							quote.fundamentals.estimatedAnnualRevenue
								? `${quote.fundamentals.estimatedAnnualRevenue} / ${quote.fundamentals.estimatedAnnualRevenueGrowth || t.growthNA}`
								: "N/A"
						}
					/>
					<Info
						label={text.estNextAnnualRevenue}
						value={
							quote.fundamentals.estimatedNextAnnualRevenue
								? `${quote.fundamentals.estimatedNextAnnualRevenue} / ${quote.fundamentals.estimatedNextAnnualRevenueGrowth || t.growthNA}`
								: "N/A"
						}
					/>
					<Info
						label={text.estAnnualEps}
						value={
							quote.fundamentals.estimatedAnnualEps
								? `${quote.fundamentals.estimatedAnnualEps} / ${quote.fundamentals.estimatedAnnualEpsGrowth || t.growthNA}`
								: "N/A"
						}
					/>
					<Info
						label={text.estNextAnnualEps}
						value={
							quote.fundamentals.estimatedNextAnnualEps
								? `${quote.fundamentals.estimatedNextAnnualEps} / ${quote.fundamentals.estimatedNextAnnualEpsGrowth || t.growthNA}`
								: "N/A"
						}
					/>
				</div>
				{quote.fundamentals.forecastSourceUrl ? (
					<a className="sourceLink" href={quote.fundamentals.forecastSourceUrl} target="_blank" rel="noreferrer">
						{t.forecastSource}: StockAnalysis Forecast
						<ExternalLink size={14} />
					</a>
				) : null}
			</section>

			{quote.detailedFinancials ? (
				<section className="analysisSection">
					<SectionTitle title={t.financialDetail} tip={t.financialDetailTip} />
					<div className="fundamentalGrid">
						<Info label={text.ttmRevenue} value={quote.detailedFinancials.ttm.revenue} />
						<Info label={text.ttmCostOfRevenue} value={quote.detailedFinancials.ttm.costOfRevenue} />
						<Info label={text.ttmGrossProfit} value={quote.detailedFinancials.ttm.grossProfit} />
						<Info label={text.ttmOpex} value={quote.detailedFinancials.ttm.operatingExpenses} />
						<Info label={text.ttmOperatingIncome} value={quote.detailedFinancials.ttm.operatingIncome} />
						<Info label={text.ttmNonOperating} value={quote.detailedFinancials.ttm.totalNonOperatingIncome} />
						<Info label={text.ttmPretax} value={quote.detailedFinancials.ttm.pretaxIncome} />
						<Info label={text.ttmTax} value={quote.detailedFinancials.ttm.taxProvision} />
						<Info label={text.ttmNetIncome} value={quote.detailedFinancials.ttm.netIncome} />
						<Info label={text.grossMargin} value={quote.detailedFinancials.ttm.grossMargin} />
						<Info label={text.operatingMargin} value={quote.detailedFinancials.ttm.operatingMargin} />
						<Info label={text.netMargin} value={quote.detailedFinancials.ttm.profitMargin} />
						<Info
							label={text.annualRevenue}
							value={`${quote.detailedFinancials.annual.revenue} / ${quote.detailedFinancials.annual.revenueGrowth}`}
						/>
						<Info
							label={text.annualCostOfRevenue}
							value={`${quote.detailedFinancials.annual.costOfRevenue} / ${quote.detailedFinancials.annual.costGrowth}`}
						/>
						<Info label={text.annualRnd} value={`${quote.detailedFinancials.annual.rnd} / ${quote.detailedFinancials.annual.rndGrowth}`} />
						<Info label={text.annualCapex} value={quote.detailedFinancials.annual.capex} />
					</div>
					<div className="costCallout">
						<strong>{t.costJudgement}</strong>
						<p>{quote.detailedFinancials.costAnalysis}</p>
					</div>
					<FinancialCharts chart={quote.detailedFinancials.chart} language={language} />
				</section>
			) : null}

			<section className="analysisSection">
				<SectionTitle title={t.financials} tip={t.financialsTip} />
				<div className="fundamentalGrid">
					<Info label={text.revenueTtm} value={quote.fundamentals.revenue || "N/A"} />
					<Info label={text.epsTtm} value={quote.fundamentals.eps || "N/A"} />
					<Info label={text.fcf} value={quote.fundamentals.freeCashFlow || "N/A"} />
					<Info label={text.grossMargin} value={quote.fundamentals.grossMargin || "N/A"} />
					<Info label={text.operatingMargin} value={quote.fundamentals.operatingMargin || "N/A"} />
					<Info label={text.netMargin} value={quote.fundamentals.profitMargin || "N/A"} />
					<Info label={text.cash} value={quote.fundamentals.totalCash || "N/A"} />
					<Info label={text.totalDebt} value={quote.fundamentals.debt || "N/A"} />
					<Info label={text.netCash} value={quote.fundamentals.netCash || "N/A"} />
					<Info label="ROE" value={quote.fundamentals.roe || "N/A"} />
					<Info label="ROIC" value={quote.fundamentals.roic || "N/A"} />
					<Info label={text.insiderOwnership} value={quote.ownership.insiders} />
					<Info label={text.instOwnership} value={quote.ownership.institutions} />
					<Info label={text.analystCount} value={quote.fundamentals.analystCount || "N/A"} />
				</div>
				{quote.fundamentals.sourceUrl ? (
					<a className="sourceLink" href={quote.fundamentals.sourceUrl} target="_blank" rel="noreferrer">
						{t.source}：{quote.fundamentals.source}
						<ExternalLink size={14} />
					</a>
				) : null}
			</section>
		</div>
	);
}
