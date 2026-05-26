import { ExternalLink } from "lucide-react";
import { FinancialCharts } from "../shared/FinancialCharts";
import { Info } from "../shared/Info";
import { SectionTitle } from "../shared/SectionTitle";

export function FinancialsPanel({ quote, t, language }) {
	const text =
		language === "en"
			? {
					monthlyRevenue: "Monthly Revenue",
					latestQuarterRevenue: "Latest Quarterly Revenue",
					latestQuarterEps: "Latest Quarterly EPS",
					quarterDate: "Quarter Date",
					estAnnualRevenue: "Estimated Annual Revenue",
					estNextAnnualRevenue: "Estimated Next Annual Revenue",
					estAnnualGrossProfit: "Estimated Annual Gross Profit",
					estNextAnnualGrossProfit: "Estimated Next Annual Gross Profit",
					estAnnualOperatingIncome: "Estimated Annual Operating Income",
					estNextAnnualOperatingIncome: "Estimated Next Annual Operating Income",
					estAnnualEps: "Estimated Annual EPS",
					estNextAnnualEps: "Estimated Next Annual EPS",
					estQuarterEps: "Estimated Current Quarter EPS",
					estNextQuarterEps: "Estimated Next Quarter EPS",
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
					profitForecast: "Estimated Profit Growth",
					profitForecastTip:
						"Gross profit and operating income estimates are derived from analyst revenue forecasts multiplied by the latest annual gross margin and operating margin.",
					profitForecastAssumption: "Estimation assumption",
					epsTable: "EPS Tracking Table",
					epsTableTip: "Shows recent actual EPS and the market's current quarter / annual EPS expectations in one place.",
					tableItem: "Item",
					tablePeriod: "Period",
					tableValue: "Value",
					tableGrowth: "Growth",
					latestQuarterActual: "Latest quarter actual",
					currentQuarterEstimate: "Current quarter estimate",
					nextQuarterEstimate: "Next quarter estimate",
					ttmEps: "TTM EPS",
					currentYearEstimate: "Current year estimate",
					nextYearEstimate: "Next year estimate",
				}
			: {
					monthlyRevenue: "月營收",
					latestQuarterRevenue: "最新季度營收",
					latestQuarterEps: "最新季度 EPS",
					quarterDate: "季度日期",
					estAnnualRevenue: "本年度預估營收",
					estNextAnnualRevenue: "下一年度預估營收",
					estAnnualGrossProfit: "本年度預估毛利",
					estNextAnnualGrossProfit: "下一年度預估毛利",
					estAnnualOperatingIncome: "本年度預估營業利益",
					estNextAnnualOperatingIncome: "下一年度預估營業利益",
					estAnnualEps: "本年度預估 EPS",
					estNextAnnualEps: "下一年度預估 EPS",
					estQuarterEps: "本季度預估 EPS",
					estNextQuarterEps: "下季度預估 EPS",
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
					profitForecast: "預估獲利成長",
					profitForecastTip: "毛利與營業利益目前不是直接 analyst consensus，而是用最新年度毛利率與營業利益率套用到預估營收推估。",
					profitForecastAssumption: "推估假設",
					epsTable: "EPS 追蹤表",
					epsTableTip: "把最近實際 EPS、季度預估與年度預估放在同一張表，方便快速比對。",
					tableItem: "項目",
					tablePeriod: "期間",
					tableValue: "數值",
					tableGrowth: "成長",
					latestQuarterActual: "最新季度實際值",
					currentQuarterEstimate: "本季度預估",
					nextQuarterEstimate: "下季度預估",
					ttmEps: "TTM EPS",
					currentYearEstimate: "本年度預估",
					nextYearEstimate: "下一年度預估",
				};

	const tips =
		language === "en"
			? {
					monthlyRevenue:
						"Most US companies do not report monthly revenue. Use this field as a note about the company's reporting cadence.",
					latestQuarterRevenue: "The latest reported quarter's revenue and its year-over-year growth.",
					latestQuarterEps: "The latest reported quarter's EPS and its year-over-year growth.",
					quarterDate: "The fiscal quarter-end date tied to the latest reported revenue and EPS.",
					estAnnualRevenue: "Consensus estimate for the current fiscal year's revenue and expected growth versus last year.",
					estNextAnnualRevenue: "Consensus estimate for next fiscal year's revenue and growth versus the current fiscal year estimate.",
					estAnnualGrossProfit: "Estimated current-year gross profit based on forecast revenue times the latest annual gross margin.",
					estNextAnnualGrossProfit: "Estimated next-year gross profit using next-year forecast revenue and the latest annual gross margin.",
					estAnnualOperatingIncome:
						"Estimated current-year operating income based on forecast revenue times the latest annual operating margin.",
					estNextAnnualOperatingIncome:
						"Estimated next-year operating income using next-year forecast revenue and the latest annual operating margin.",
					estAnnualEps: "Consensus estimate for current-year EPS and expected growth versus last year.",
					estNextAnnualEps: "Consensus estimate for next-year EPS and expected growth versus the current-year estimate.",
					ttmRevenue: "Revenue generated over the trailing twelve months.",
					ttmCostOfRevenue: "Direct costs required to produce goods or deliver services over the trailing twelve months.",
					ttmGrossProfit: "TTM revenue minus TTM cost of revenue. This shows how much gross profit is left before opex.",
					ttmOpex: "Operating expenses such as SG&A and R&D over the trailing twelve months.",
					ttmOperatingIncome: "Profit after cost of revenue and operating expenses, before non-operating items and taxes.",
					ttmNonOperating: "Income or expense outside the core operating business, such as interest or investment gains/losses.",
					ttmPretax: "Profit before income tax expense.",
					ttmTax: "Income tax expense recognized over the trailing twelve months.",
					ttmNetIncome: "Bottom-line profit after operating items, non-operating items, and taxes.",
					grossMargin: "Gross profit divided by revenue. Higher levels usually mean better pricing power or cost efficiency.",
					operatingMargin: "Operating income divided by revenue. Shows how much operating profit is left after opex.",
					netMargin: "Net income divided by revenue. Measures final profitability after all expenses.",
					annualRevenue: "The latest full fiscal year's revenue and growth versus the prior year.",
					annualCostOfRevenue: "The latest full fiscal year's direct revenue cost and growth versus the prior year.",
					annualRnd: "The latest full fiscal year's R&D spending and its year-over-year growth.",
					annualCapex: "Capital expenditures in the latest full fiscal year.",
					revenueTtm: "Revenue over the last twelve months from the market data snapshot.",
					epsTtm: "Trailing-twelve-month EPS from the market data snapshot.",
					fcf: "Free cash flow after operating cash flow minus capex.",
					cash: "Cash and short-term liquid resources on hand.",
					totalDebt: "Interest-bearing debt obligations.",
					netCash: "Cash minus total debt. Positive values mean net cash.",
					insiderOwnership: "Ownership held by executives, directors, or founders.",
					instOwnership: "Ownership held by institutions such as funds and asset managers.",
					analystCount: "Number of analysts included in the estimate/ratings consensus.",
					roe: "Return on equity. Measures profit generated from shareholder equity.",
					roic: "Return on invested capital. Measures efficiency of capital allocation across debt and equity.",
				}
			: {
					monthlyRevenue: "多數美股公司不公告月營收，這裡主要提示公司通常用什麼節奏揭露營收。",
					latestQuarterRevenue: "最近一季已公布的營收，以及相對去年同期的成長幅度。",
					latestQuarterEps: "最近一季已公布的 EPS，以及相對去年同期的成長幅度。",
					quarterDate: "最新一季財報對應的季度截止日期。",
					estAnnualRevenue: "市場共識對本財年營收的預估，以及相對去年的預估成長。",
					estNextAnnualRevenue: "市場共識對下一財年營收的預估，以及相對本財年預估的成長。",
					estAnnualGrossProfit: "以本年度預估營收乘上最近年度毛利率推估的本年度毛利。",
					estNextAnnualGrossProfit: "以下一年度預估營收乘上最近年度毛利率推估的下一年度毛利。",
					estAnnualOperatingIncome: "以本年度預估營收乘上最近年度營業利益率推估的本年度營業利益。",
					estNextAnnualOperatingIncome: "以下一年度預估營收乘上最近年度營業利益率推估的下一年度營業利益。",
					estAnnualEps: "市場共識對本財年 EPS 的預估，以及相對去年的預估成長。",
					estNextAnnualEps: "市場共識對下一財年 EPS 的預估，以及相對本財年預估的成長。",
					ttmRevenue: "過去十二個月累計營收，能用來看公司目前規模。",
					ttmCostOfRevenue: "過去十二個月的營收成本，包含生產或提供服務的直接成本。",
					ttmGrossProfit: "TTM 營收扣掉 TTM 營收成本後的毛利，代表主業第一層獲利能力。",
					ttmOpex: "過去十二個月的營業費用，通常包含銷管費與研發費。",
					ttmOperatingIncome: "扣掉營收成本與營業費用後的營業利益，反映核心本業獲利。",
					ttmNonOperating: "非核心營運產生的收入或費用，例如利息、投資損益或一次性項目。",
					ttmPretax: "稅前淨利，代表在扣稅前公司賺了多少。",
					ttmTax: "過去十二個月認列的所得稅費用。",
					ttmNetIncome: "最終淨利，扣掉本業成本、業外項目與稅後剩下的獲利。",
					grossMargin: "毛利率 = 毛利 / 營收。越高通常代表定價能力或成本控制越強。",
					operatingMargin: "營業利益率 = 營業利益 / 營收。用來看本業經營效率。",
					netMargin: "淨利率 = 淨利 / 營收。反映最後真正留下的獲利比例。",
					annualRevenue: "最近完整財年的年度營收，以及相對前一年的成長率。",
					annualCostOfRevenue: "最近完整財年的營收成本，以及相對前一年的成長率。",
					annualRnd: "最近完整財年的研發費用，以及相對前一年的變化。",
					annualCapex: "最近完整財年的資本支出，常用來看擴產、資料中心或設備投資。",
					revenueTtm: "由市場資料快照整理的近十二個月營收。",
					epsTtm: "由市場資料快照整理的近十二個月 EPS。",
					fcf: "自由現金流，通常等於營運現金流扣掉資本支出。",
					cash: "帳上現金與短期流動資產，可用來衡量資金彈性。",
					totalDebt: "有息負債總額，包含短期與長期借款。",
					netCash: "淨現金 = 現金 - 總負債，為正代表現金多於負債。",
					insiderOwnership: "高層、董事、創辦人等內部人持股比重。",
					instOwnership: "基金、資產管理機構等法人持股比重。",
					analystCount: "納入目前預估與評級共識的分析師家數。",
					roe: "股東權益報酬率，衡量公司用股東資本賺錢的效率。",
					roic: "投入資本報酬率，衡量公司對整體資本配置的使用效率。",
				};

	const epsRows = [
		{
			item: text.latestQuarterActual,
			period: quote.fundamentals.latestQuarterDate || "N/A",
			value: quote.fundamentals.latestQuarterEps || "N/A",
			growth: quote.fundamentals.latestQuarterEpsGrowth || t.growthNA,
		},
		{
			item: text.currentQuarterEstimate,
			period: language === "en" ? "Next 3 months" : "未來 3 個月",
			value: quote.fundamentals.estimatedQuarterEps || "N/A",
			growth: quote.fundamentals.estimatedQuarterEpsGrowth || t.growthNA,
		},
		{
			item: text.nextQuarterEstimate,
			period: language === "en" ? "Following quarter" : "下一季",
			value: quote.fundamentals.estimatedNextQuarterEps || "N/A",
			growth: quote.fundamentals.estimatedNextQuarterEpsGrowth || t.growthNA,
		},
		{
			item: text.ttmEps,
			period: "TTM",
			value: quote.fundamentals.eps || "N/A",
			growth: "—",
		},
		{
			item: text.currentYearEstimate,
			period: language === "en" ? "Current fiscal year" : "本財年",
			value: quote.fundamentals.estimatedAnnualEps || "N/A",
			growth: quote.fundamentals.estimatedAnnualEpsGrowth || t.growthNA,
		},
		{
			item: text.nextYearEstimate,
			period: language === "en" ? "Next fiscal year" : "下一財年",
			value: quote.fundamentals.estimatedNextAnnualEps || "N/A",
			growth: quote.fundamentals.estimatedNextAnnualEpsGrowth || t.growthNA,
		},
	];

	return (
		<div className="reportTabPanel">
			<section className="analysisSection">
				<h3>{t.revenueTrend}</h3>
				<div className="fundamentalGrid">
					<Info label={text.monthlyRevenue} value={quote.fundamentals.monthlyRevenue || "N/A"} tip={tips.monthlyRevenue} />
					<Info
						label={text.latestQuarterRevenue}
						value={
							quote.fundamentals.latestQuarterRevenue
								? `${quote.fundamentals.latestQuarterRevenue} / ${quote.fundamentals.latestQuarterRevenueGrowth || t.growthNA}`
								: "N/A"
						}
						tip={tips.latestQuarterRevenue}
					/>
					<Info
						label={text.latestQuarterEps}
						value={
							quote.fundamentals.latestQuarterEps
								? `${quote.fundamentals.latestQuarterEps} / ${quote.fundamentals.latestQuarterEpsGrowth || t.growthNA}`
								: "N/A"
						}
						tip={tips.latestQuarterEps}
					/>
					<Info label={text.quarterDate} value={quote.fundamentals.latestQuarterDate || "N/A"} tip={tips.quarterDate} />
					<Info
						label={text.estAnnualRevenue}
						value={
							quote.fundamentals.estimatedAnnualRevenue
								? `${quote.fundamentals.estimatedAnnualRevenue} / ${quote.fundamentals.estimatedAnnualRevenueGrowth || t.growthNA}`
								: "N/A"
						}
						tip={tips.estAnnualRevenue}
					/>
					<Info
						label={text.estNextAnnualRevenue}
						value={
							quote.fundamentals.estimatedNextAnnualRevenue
								? `${quote.fundamentals.estimatedNextAnnualRevenue} / ${quote.fundamentals.estimatedNextAnnualRevenueGrowth || t.growthNA}`
								: "N/A"
						}
						tip={tips.estNextAnnualRevenue}
					/>
					<Info
						label={text.estAnnualEps}
						value={
							quote.fundamentals.estimatedAnnualEps
								? `${quote.fundamentals.estimatedAnnualEps} / ${quote.fundamentals.estimatedAnnualEpsGrowth || t.growthNA}`
								: "N/A"
						}
						tip={tips.estAnnualEps}
					/>
					<Info
						label={text.estNextAnnualEps}
						value={
							quote.fundamentals.estimatedNextAnnualEps
								? `${quote.fundamentals.estimatedNextAnnualEps} / ${quote.fundamentals.estimatedNextAnnualEpsGrowth || t.growthNA}`
								: "N/A"
						}
						tip={tips.estNextAnnualEps}
					/>
				</div>
				{quote.fundamentals.forecastSourceUrl ? (
					<a className="sourceLink" href={quote.fundamentals.forecastSourceUrl} target="_blank" rel="noreferrer">
						{t.forecastSource}: StockAnalysis Forecast
						<ExternalLink size={14} />
					</a>
				) : null}
			</section>

			<section className="analysisSection">
				<SectionTitle title={text.profitForecast} tip={text.profitForecastTip} />
				<div className="fundamentalGrid">
					<Info
						label={text.estAnnualGrossProfit}
						value={
							quote.fundamentals.estimatedAnnualGrossProfit
								? `${quote.fundamentals.estimatedAnnualGrossProfit} / ${quote.fundamentals.estimatedAnnualGrossProfitGrowth || t.growthNA}`
								: "N/A"
						}
						tip={tips.estAnnualGrossProfit}
					/>
					<Info
						label={text.estNextAnnualGrossProfit}
						value={
							quote.fundamentals.estimatedNextAnnualGrossProfit
								? `${quote.fundamentals.estimatedNextAnnualGrossProfit} / ${quote.fundamentals.estimatedNextAnnualGrossProfitGrowth || t.growthNA}`
								: "N/A"
						}
						tip={tips.estNextAnnualGrossProfit}
					/>
					<Info
						label={text.estAnnualOperatingIncome}
						value={
							quote.fundamentals.estimatedAnnualOperatingIncome
								? `${quote.fundamentals.estimatedAnnualOperatingIncome} / ${quote.fundamentals.estimatedAnnualOperatingIncomeGrowth || t.growthNA}`
								: "N/A"
						}
						tip={tips.estAnnualOperatingIncome}
					/>
					<Info
						label={text.estNextAnnualOperatingIncome}
						value={
							quote.fundamentals.estimatedNextAnnualOperatingIncome
								? `${quote.fundamentals.estimatedNextAnnualOperatingIncome} / ${quote.fundamentals.estimatedNextAnnualOperatingIncomeGrowth || t.growthNA}`
								: "N/A"
						}
						tip={tips.estNextAnnualOperatingIncome}
					/>
				</div>
				{quote.fundamentals.forecastAssumptionNote ? (
					<div className="costCallout forecastCallout">
						<strong>{text.profitForecastAssumption}</strong>
						<p>{quote.fundamentals.forecastAssumptionNote}</p>
						<p>
							{language === "en" ? "Margin reference" : "參考利潤率"}: {text.grossMargin}{" "}
							{quote.fundamentals.forecastGrossMarginReference || "N/A"} / {text.operatingMargin}{" "}
							{quote.fundamentals.forecastOperatingMarginReference || "N/A"}
						</p>
					</div>
				) : null}
			</section>

			{quote.detailedFinancials ? (
				<section className="analysisSection">
					<SectionTitle title={t.financialDetail} tip={t.financialDetailTip} />
					<div className="fundamentalGrid">
						<Info label={text.ttmRevenue} value={quote.detailedFinancials.ttm.revenue} tip={tips.ttmRevenue} />
						<Info label={text.ttmCostOfRevenue} value={quote.detailedFinancials.ttm.costOfRevenue} tip={tips.ttmCostOfRevenue} />
						<Info label={text.ttmGrossProfit} value={quote.detailedFinancials.ttm.grossProfit} tip={tips.ttmGrossProfit} />
						<Info label={text.ttmOpex} value={quote.detailedFinancials.ttm.operatingExpenses} tip={tips.ttmOpex} />
						<Info label={text.ttmOperatingIncome} value={quote.detailedFinancials.ttm.operatingIncome} tip={tips.ttmOperatingIncome} />
						<Info label={text.ttmNonOperating} value={quote.detailedFinancials.ttm.totalNonOperatingIncome} tip={tips.ttmNonOperating} />
						<Info label={text.ttmPretax} value={quote.detailedFinancials.ttm.pretaxIncome} tip={tips.ttmPretax} />
						<Info label={text.ttmTax} value={quote.detailedFinancials.ttm.taxProvision} tip={tips.ttmTax} />
						<Info label={text.ttmNetIncome} value={quote.detailedFinancials.ttm.netIncome} tip={tips.ttmNetIncome} />
						<Info label={text.grossMargin} value={quote.detailedFinancials.ttm.grossMargin} tip={tips.grossMargin} />
						<Info label={text.operatingMargin} value={quote.detailedFinancials.ttm.operatingMargin} tip={tips.operatingMargin} />
						<Info label={text.netMargin} value={quote.detailedFinancials.ttm.profitMargin} tip={tips.netMargin} />
						<Info
							label={text.annualRevenue}
							value={`${quote.detailedFinancials.annual.revenue} / ${quote.detailedFinancials.annual.revenueGrowth}`}
							tip={tips.annualRevenue}
						/>
						<Info
							label={text.annualCostOfRevenue}
							value={`${quote.detailedFinancials.annual.costOfRevenue} / ${quote.detailedFinancials.annual.costGrowth}`}
							tip={tips.annualCostOfRevenue}
						/>
						<Info
							label={text.annualRnd}
							value={`${quote.detailedFinancials.annual.rnd} / ${quote.detailedFinancials.annual.rndGrowth}`}
							tip={tips.annualRnd}
						/>
						<Info label={text.annualCapex} value={quote.detailedFinancials.annual.capex} tip={tips.annualCapex} />
					</div>
					<div className="costCallout">
						<strong>{t.costJudgement}</strong>
						<p>{quote.detailedFinancials.costAnalysis}</p>
					</div>
					<FinancialCharts chart={quote.detailedFinancials.chart} language={language} />
				</section>
			) : null}

			<section className="analysisSection">
				<SectionTitle title={text.epsTable} tip={text.epsTableTip} />
				<div className="dataTableWrap">
					<table className="dataTable compactTable">
						<thead>
							<tr>
								<th>{text.tableItem}</th>
								<th>{text.tablePeriod}</th>
								<th>{text.tableValue}</th>
								<th>{text.tableGrowth}</th>
							</tr>
						</thead>
						<tbody>
							{epsRows.map((row) => (
								<tr key={`${row.item}-${row.period}`}>
									<td>{row.item}</td>
									<td>{row.period}</td>
									<td>{row.value}</td>
									<td>{row.growth}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>

			<section className="analysisSection">
				<SectionTitle title={t.financials} tip={t.financialsTip} />
				<div className="fundamentalGrid">
					<Info label={text.revenueTtm} value={quote.fundamentals.revenue || "N/A"} tip={tips.revenueTtm} />
					<Info label={text.epsTtm} value={quote.fundamentals.eps || "N/A"} tip={tips.epsTtm} />
					<Info label={text.fcf} value={quote.fundamentals.freeCashFlow || "N/A"} tip={tips.fcf} />
					<Info label={text.grossMargin} value={quote.fundamentals.grossMargin || "N/A"} tip={tips.grossMargin} />
					<Info label={text.operatingMargin} value={quote.fundamentals.operatingMargin || "N/A"} tip={tips.operatingMargin} />
					<Info label={text.netMargin} value={quote.fundamentals.profitMargin || "N/A"} tip={tips.netMargin} />
					<Info label={text.cash} value={quote.fundamentals.totalCash || "N/A"} tip={tips.cash} />
					<Info label={text.totalDebt} value={quote.fundamentals.debt || "N/A"} tip={tips.totalDebt} />
					<Info label={text.netCash} value={quote.fundamentals.netCash || "N/A"} tip={tips.netCash} />
					<Info label="ROE" value={quote.fundamentals.roe || "N/A"} tip={tips.roe} />
					<Info label="ROIC" value={quote.fundamentals.roic || "N/A"} tip={tips.roic} />
					<Info label={text.insiderOwnership} value={quote.ownership.insiders} tip={tips.insiderOwnership} />
					<Info label={text.instOwnership} value={quote.ownership.institutions} tip={tips.instOwnership} />
					<Info label={text.analystCount} value={quote.fundamentals.analystCount || "N/A"} tip={tips.analystCount} />
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
