import { ExternalLink } from "lucide-react";
import { FinancialCharts } from "../shared/FinancialCharts";
import { Info } from "../shared/Info";
import { SectionTitle } from "../shared/SectionTitle";

export function FinancialsPanel({ quote, t, language }) {
  return (
    <div className="reportTabPanel">
      <section className="analysisSection">
        <h3>{t.revenueTrend}</h3>
        <div className="fundamentalGrid">
          <Info label="月營收" value={quote.fundamentals.monthlyRevenue || "N/A"} />
          <Info
            label="最新季度營收"
            value={
              quote.fundamentals.latestQuarterRevenue
                ? `${quote.fundamentals.latestQuarterRevenue} / ${quote.fundamentals.latestQuarterRevenueGrowth || "成長 N/A"}`
                : "N/A"
            }
          />
          <Info
            label="最新季度 EPS"
            value={
              quote.fundamentals.latestQuarterEps
                ? `${quote.fundamentals.latestQuarterEps} / ${quote.fundamentals.latestQuarterEpsGrowth || "成長 N/A"}`
                : "N/A"
            }
          />
          <Info label="季度日期" value={quote.fundamentals.latestQuarterDate || "N/A"} />
          <Info
            label="本年度預估營收"
            value={
              quote.fundamentals.estimatedAnnualRevenue
                ? `${quote.fundamentals.estimatedAnnualRevenue} / ${quote.fundamentals.estimatedAnnualRevenueGrowth || "成長 N/A"}`
                : "N/A"
            }
          />
          <Info
            label="下一年度預估營收"
            value={
              quote.fundamentals.estimatedNextAnnualRevenue
                ? `${quote.fundamentals.estimatedNextAnnualRevenue} / ${quote.fundamentals.estimatedNextAnnualRevenueGrowth || "成長 N/A"}`
                : "N/A"
            }
          />
          <Info
            label="本年度預估 EPS"
            value={
              quote.fundamentals.estimatedAnnualEps
                ? `${quote.fundamentals.estimatedAnnualEps} / ${quote.fundamentals.estimatedAnnualEpsGrowth || "成長 N/A"}`
                : "N/A"
            }
          />
          <Info
            label="下一年度預估 EPS"
            value={
              quote.fundamentals.estimatedNextAnnualEps
                ? `${quote.fundamentals.estimatedNextAnnualEps} / ${quote.fundamentals.estimatedNextAnnualEpsGrowth || "成長 N/A"}`
                : "N/A"
            }
          />
        </div>
        {quote.fundamentals.forecastSourceUrl ? (
          <a className="sourceLink" href={quote.fundamentals.forecastSourceUrl} target="_blank" rel="noreferrer">
            預估資料來源：StockAnalysis Forecast
            <ExternalLink size={14} />
          </a>
        ) : null}
      </section>

      {quote.detailedFinancials ? (
        <section className="analysisSection">
          <SectionTitle title={t.financialDetail} tip={t.financialDetailTip} />
          <div className="fundamentalGrid">
            <Info label="TTM 營收" value={quote.detailedFinancials.ttm.revenue} />
            <Info label="TTM 營收成本" value={quote.detailedFinancials.ttm.costOfRevenue} />
            <Info label="TTM 毛利" value={quote.detailedFinancials.ttm.grossProfit} />
            <Info label="TTM 營業費用" value={quote.detailedFinancials.ttm.operatingExpenses} />
            <Info label="TTM 營業利益" value={quote.detailedFinancials.ttm.operatingIncome} />
            <Info label="TTM 業外收入/費用" value={quote.detailedFinancials.ttm.totalNonOperatingIncome} />
            <Info label="TTM 稅前淨利" value={quote.detailedFinancials.ttm.pretaxIncome} />
            <Info label="TTM 所得稅" value={quote.detailedFinancials.ttm.taxProvision} />
            <Info label="TTM 淨利" value={quote.detailedFinancials.ttm.netIncome} />
            <Info label="毛利率" value={quote.detailedFinancials.ttm.grossMargin} />
            <Info label="營業利益率" value={quote.detailedFinancials.ttm.operatingMargin} />
            <Info label="淨利率" value={quote.detailedFinancials.ttm.profitMargin} />
            <Info
              label="年度營收"
              value={`${quote.detailedFinancials.annual.revenue} / ${quote.detailedFinancials.annual.revenueGrowth}`}
            />
            <Info
              label="年度營收成本"
              value={`${quote.detailedFinancials.annual.costOfRevenue} / ${quote.detailedFinancials.annual.costGrowth}`}
            />
            <Info
              label="年度研發費用"
              value={`${quote.detailedFinancials.annual.rnd} / ${quote.detailedFinancials.annual.rndGrowth}`}
            />
            <Info label="年度資本支出" value={quote.detailedFinancials.annual.capex} />
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
          <Info label="營收 TTM" value={quote.fundamentals.revenue || "N/A"} />
          <Info label="EPS TTM" value={quote.fundamentals.eps || "N/A"} />
          <Info label="自由現金流" value={quote.fundamentals.freeCashFlow || "N/A"} />
          <Info label="毛利率" value={quote.fundamentals.grossMargin || "N/A"} />
          <Info label="營業利益率" value={quote.fundamentals.operatingMargin || "N/A"} />
          <Info label="淨利率" value={quote.fundamentals.profitMargin || "N/A"} />
          <Info label="現金" value={quote.fundamentals.totalCash || "N/A"} />
          <Info label="總負債" value={quote.fundamentals.debt || "N/A"} />
          <Info label="淨現金" value={quote.fundamentals.netCash || "N/A"} />
          <Info label="ROE" value={quote.fundamentals.roe || "N/A"} />
          <Info label="ROIC" value={quote.fundamentals.roic || "N/A"} />
          <Info label="內部人持股" value={quote.ownership.insiders} />
          <Info label="法人持股" value={quote.ownership.institutions} />
          <Info label="分析師數" value={quote.fundamentals.analystCount || "N/A"} />
        </div>
        {quote.fundamentals.sourceUrl ? (
          <a className="sourceLink" href={quote.fundamentals.sourceUrl} target="_blank" rel="noreferrer">
            資料來源：{quote.fundamentals.source}
            <ExternalLink size={14} />
          </a>
        ) : null}
      </section>
    </div>
  );
}
