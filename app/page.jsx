"use client";

import {
  Activity,
  BarChart3,
  Check,
  CircleDollarSign,
  Download,
  ExternalLink,
  Info as InfoIcon,
  Languages,
  ListPlus,
  Moon,
  Network,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2
} from "lucide-react";
import { useStockAnalyzer } from "../hooks/useStockAnalyzer";
import { useValuationModel } from "../hooks/useValuationModel";
import { cls, displayValue, downloadMarkdown, formatDate, getNewsUrl, thesisText } from "../hooks/utils";

export default function Page() {
  const {
    language,
    setLanguage,
    theme,
    toggleTheme,
    t,
    watchlist,
    selectedSymbol,
    setSelectedSymbol,
    quotes,
    updatedAt,
    isLoading,
    error,
    dataWarning,
    searchTerm,
    setSearchTerm,
    results,
    isSearching,
    searchSymbols,
    recommendationGroups,
    recommendationsUpdatedAt,
    isLoadingRecommendations,
    hasRecommendationItems,
    selectedQuote,
    coverageStats,
    addSymbol,
    removeSymbol,
    refreshAll,
    refreshIdeas
  } = useStockAnalyzer();

  return (
    <main className="shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">US Stock Weekly Analyzer</p>
          <h1>{t.appTitle}</h1>
          <p className="subtitle">{t.subtitle}</p>
        </div>
        <div className="topActions">
          <div className="languageToggle" aria-label="Language">
            <Languages size={17} />
            <button className={language === "zh" ? "active" : ""} onClick={() => setLanguage("zh")}>
              中
            </button>
            <button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>
              EN
            </button>
          </div>
          <button className="themeToggle" onClick={toggleTheme}>
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            {theme === "dark" ? t.lightMode : t.darkMode}
          </button>
          <button className="primaryButton" onClick={() => refreshAll()} disabled={isLoading}>
            <RefreshCw size={18} className={cls(isLoading && "spin")} />
            {isLoading ? t.refreshing : t.refresh}
          </button>
        </div>
      </section>

      <section className="metricGrid">
        <div className="metric">
          <Activity size={20} />
          <span>{t.tracked}</span>
          <strong>{watchlist.length}</strong>
        </div>
        <div className="metric">
          <ShieldCheck size={20} />
          <span>{t.loaded}</span>
          <strong>{coverageStats.loaded}</strong>
        </div>
        <div className="metric">
          <CircleDollarSign size={20} />
          <span>{t.positive}</span>
          <strong>{coverageStats.positive}</strong>
        </div>
        <div className="metric">
          <BarChart3 size={20} />
          <span>{t.avgMove}</span>
          <strong>{Number.isFinite(coverageStats.avgMove) ? `${coverageStats.avgMove.toFixed(2)}%` : "N/A"}</strong>
        </div>
      </section>

      {error ? <div className="alert">{error}</div> : null}
      {dataWarning ? (
        <div className="notice">
          <strong>{t.updateWarningPrefix}</strong>
          <span>{dataWarning}</span>
        </div>
      ) : null}

      <section className="workspace">
        <aside className="panel sidebar">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Watchlist</p>
              <h2>{t.watchlist}</h2>
            </div>
            <span className="timestamp">{formatDate(updatedAt)}</span>
          </div>

          <form className="searchBox" onSubmit={searchSymbols}>
            <Search size={18} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={t.searchPlaceholder}
            />
            <button type="submit" disabled={isSearching}>
              {isSearching ? t.searching : t.search}
            </button>
          </form>

          <button className="manualAdd" onClick={() => addSymbol(searchTerm)} disabled={!searchTerm.trim()}>
            <ListPlus size={17} />
            {t.addSymbol}
          </button>

          {results.length ? (
            <div className="searchResults">
              {results.map((result) => (
                <button key={`${result.symbol}-${result.exchange}`} onClick={() => addSymbol(result.symbol)}>
                  <span>
                    <strong>{result.symbol}</strong>
                    <small>{result.name}</small>
                  </span>
                  <ListPlus size={17} />
                </button>
              ))}
            </div>
          ) : null}

          <div className="watchlist">
            {watchlist.map((symbol) => {
              const quote = quotes.find((item) => item.symbol === symbol);
              return (
                <button
                  key={symbol}
                  className={cls("watchItem", selectedSymbol === symbol && "active")}
                  onClick={() => setSelectedSymbol(symbol)}
                >
                  <span className="watchItemMain">
                    <strong>{symbol}</strong>
                    <small>{quote?.name || t.waitQuote}</small>
                  </span>
                  <span className={cls("move", quote?.changePercent >= 0 ? "up" : "down")}>
                    {quote?.formatted.changePercent || "N/A"}
                  </span>
                  <span
                    className="watchItemRemove"
                    role="button"
                    tabIndex={0}
                    aria-label={`Remove ${symbol}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      removeSymbol(symbol);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        removeSymbol(symbol);
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="mainPanel">
          {selectedQuote ? (
            <StockReport quote={selectedQuote} peerQuotes={quotes} language={language} t={t} />
          ) : selectedSymbol ? (
            <div className="emptyState">
              <RefreshCw size={30} className={cls(isLoading && "spin")} />
              <h2>{t.loadingReport}</h2>
              <p>{t.loadingReportHint}</p>
            </div>
          ) : (
            <div className="emptyState">
              <Sparkles size={30} />
              <h2>{t.addFirst}</h2>
              <p>{t.addFirstHint}</p>
            </div>
          )}
        </section>

        <aside className="panel rightRail">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Ideas</p>
              <h2>{t.ideas}</h2>
            </div>
            <button className="railRefresh" onClick={() => refreshIdeas()} disabled={isLoadingRecommendations}>
              <RefreshCw size={15} className={cls(isLoadingRecommendations && "spin")} />
              {t.dynamicIdeas}
            </button>
          </div>

          <div className="suggestionBasis">
            <strong>{t.ideaBasis}</strong>
            <p>{t.ideaBasisText}</p>
            <small>
              {t.ideasUpdated}: {formatDate(recommendationsUpdatedAt)}
            </small>
          </div>

          <div className="suggestionGroups">
            {isLoadingRecommendations && !recommendationGroups.length ? (
              <section className="suggestionGroup">
                <h3>{t.loadingIdeas}</h3>
                <p>{t.ideaBasisText}</p>
              </section>
            ) : null}
            {!isLoadingRecommendations && !hasRecommendationItems ? (
              <section className="suggestionGroup">
                <h3>{t.noIdeas}</h3>
                <p>{t.ideaBasisText}</p>
              </section>
            ) : null}
            {recommendationGroups.map((group) => (
              <section key={group.id} className="suggestionGroup">
                <h3>{language === "en" ? group.titleEn : group.title}</h3>
                <p>{language === "en" ? group.criteriaEn : group.criteria}</p>
                <div className="suggestions">
                  {(group.items || []).map((item) => (
                    <button
                      key={`${group.id}-${item.symbol}`}
                      className="suggestionItem"
                      onClick={() => addSymbol(item.symbol)}
                      disabled={watchlist.includes(item.symbol)}
                    >
                      <span className="suggestionItemBody">
                        <strong>{item.symbol}</strong>
                        <small>{item.name}</small>
                        <em>
                          {t.score} {item.score} · {item.valuation} · {item.revenueGrowth}
                        </em>
                      </span>
                      <span className="suggestionItemAction">
                        {watchlist.includes(item.symbol) ? <Check size={16} /> : <ListPlus size={16} />}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="suggestionReasons">
                  {(group.items || []).slice(0, 3).map((item) => (
                    <p key={`${group.id}-${item.symbol}-reason`}>
                      <strong>{item.symbol}</strong>
                      {item.reasons.join("、")}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </aside>
      </section>

      <footer className="appFooter">
        <span>© 2026 Fred Li. All rights reserved.</span>
        <span>{t.footer}</span>
      </footer>
    </main>
  );
}

function StockReport({ quote, peerQuotes, language, t }) {
  const isUp = quote.changePercent >= 0;
  const { activeModel, selectedModel, setSelectedModel } = useValuationModel(quote);

  return (
    <article className="report">
      <header className="reportHero">
        <div>
          <p className="eyebrow">{quote.exchange}</p>
          <h2>
            {quote.symbol}
            <span>{quote.name}</span>
          </h2>
        </div>
        <div className="priceBlock">
          <strong>{quote.formatted.price || "N/A"}</strong>
          <span className={cls(isUp ? "up" : "down")}>{quote.formatted.changePercent || "N/A"}</span>
        </div>
      </header>

      <div className="decisionBar">
        <div>
          <span>{t.finalRating}</span>
          <strong>{displayValue(quote.rating, language)}</strong>
        </div>
        <div>
          <span>{t.valuation}</span>
          <strong>{displayValue(quote.valuation, language)}</strong>
        </div>
        <div>
          <span>{t.technical}</span>
          <strong>{displayValue(quote.trend, language)}</strong>
        </div>
        <button type="button" onClick={() => downloadMarkdown(quote, language)}>
          <Download size={17} />
          {t.exportMd}
        </button>
      </div>

      <section className="analysisSection conclusion">
        <h3>{t.conclusion}</h3>
        <p>{thesisText(quote, language)}</p>
      </section>

      <section className="analysisSection qualityBox">
        <h3>{t.dataQuality}</h3>
        <div className="qualityLayout">
          <div className="qualityScore">
            <strong>{quote.quality.score}</strong>
            <span>{displayValue(quote.quality.status, language)}</span>
          </div>
          <div>
            <p>
              {t.fieldsReady} {quote.quality.available}/{quote.quality.total} {t.coreFields}
              {quote.quality.missing.length ? ` ${t.missing}: ${quote.quality.missing.join("、")}。` : ` ${t.completeFields}`}
            </p>
          </div>
        </div>
      </section>

      <section className="analysisSection themeBox">
        <h3>{t.themes}</h3>
        <p>{quote.profile.theme}</p>
        <div className="catalystList">
          {quote.catalysts.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <section className="analysisSection">
        <h3>{t.majorNews}</h3>
        {quote.news.length ? (
          <div className="newsList">
            {quote.news.slice(0, 5).map((item) => (
              <a key={`${item.title}-${item.time}`} href={getNewsUrl(item, quote.symbol)} target="_blank" rel="noreferrer">
                <span>
                  {item.source}｜{item.time}
                </span>
                <strong>
                  {item.title}
                  <ExternalLink size={14} />
                </strong>
                <p>{item.text}</p>
                <em>{t.openNews}</em>
              </a>
            ))}
          </div>
        ) : (
          <p>{t.noNews}</p>
        )}
      </section>

      <section className="quoteGrid">
        <Info label="市值" value={quote.formatted.marketCap} />
        <Info label="成交量" value={quote.formatted.volume} />
        <Info label="PE" value={quote.formatted.pe} />
        <Info label="Forward PE" value={quote.formatted.forwardPe} />
        <Info label="PS" value={quote.formatted.ps} />
        <Info label="P/FCF" value={quote.formatted.pfcf} />
        <Info label="FCF Yield" value={quote.formatted.fcfYield} />
        <Info label="PEG" value={quote.formatted.pegRatio} />
        <Info label="50 日均線" value={quote.formatted.fiftyDay || "N/A"} />
        <Info label="200 日均線" value={quote.formatted.twoHundredDay || "N/A"} />
        <Info label="52 週區間" value={quote.formatted.range52} />
        <Info label="平均目標價" value={quote.formatted.targetMeanPrice || "N/A"} />
      </section>

      <section className="analysisSection methodBox">
        <div>
          <h3>{t.valuationMethod}</h3>
          <strong>{quote.valuationMethod.primary}</strong>
          <p>{quote.valuationMethod.why}</p>
        </div>
        <div className="methodEvidence">
          {quote.valuationMethod.evidence.length ? (
            quote.valuationMethod.evidence.map((item) => <span key={item}>{item}</span>)
          ) : (
            <span>資料不足</span>
          )}
        </div>
      </section>

      <section className="analysisSection">
        <h3>{t.valuationModels}</h3>
        <div className="modelTabs">
          {quote.valuationModels.map((model) => (
            <button
              key={model.label}
              type="button"
              className={model.label === activeModel?.label ? "active" : ""}
              onClick={() => setSelectedModel(model.label)}
            >
              {model.label}
            </button>
          ))}
        </div>
        {activeModel ? (
          <div className="modelPanel">
            <strong>{activeModel.method}</strong>
            <p>{activeModel.objectiveUse}</p>
            <div className="methodEvidence">
              {activeModel.inputs.map((input) => (
                <span key={input}>{input}</span>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="analysisSection">
        <h3>{t.catalystTimeline}</h3>
        <div className="timeline">
          {quote.catalystTimeline.map((item) => (
            <div key={`${item.label}-${item.timing}`}>
              <span>{item.timing}</span>
              <strong>{item.label}</strong>
              <small>
                {item.status}｜{item.signal}
              </small>
            </div>
          ))}
        </div>
      </section>

      <LongTermPlan quote={quote} t={t} />
      <InvestmentMindMap quote={quote} t={t} language={language} />

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
          <FinancialCharts chart={quote.detailedFinancials.chart} />
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

      <section className="analysisGrid">
        <AnalysisBlock title="競爭格局" items={quote.profile.competitors} />
        <AnalysisBlock title="供應鏈與夥伴" items={quote.profile.suppliers} />
        <AnalysisBlock title="客戶與需求" items={quote.profile.customers} />
      </section>

      <section className="analysisSection">
        <h3>{t.peerCompare}</h3>
        <PeerTable quotes={peerQuotes} selectedSymbol={quote.symbol} language={language} />
      </section>

      <section className="analysisSection">
        <h3>{t.targetPrice}</h3>
        <div className="zones">
          <Info label="平均目標價" value={quote.formatted.targetMeanPrice || "N/A"} />
          <Info label="目標價差距" value={quote.fundamentals.priceTargetChange || "N/A"} />
          <Info label="市場共識" value={quote.formatted.recommendation || "N/A"} />
        </div>
      </section>

      <section className="analysisSection">
        <h3>{t.priceZones}</h3>
        <div className="zones">
          <Info label="理想價" value={quote.zones.ideal} />
          <Info label="買入價" value={quote.zones.buy} />
          <Info label="觀察價" value={quote.zones.watch} />
        </div>
      </section>

      <section className="analysisSection">
        <h3>{t.moat}</h3>
        <p>{quote.profile.moat}</p>
      </section>

      <section className="analysisSection">
        <h3>{t.ownership}</h3>
        <div className="zones">
          <Info label="內部人持股" value={quote.ownership.insiders} />
          <Info label="法人持股" value={quote.ownership.institutions} />
          <Info
            label="異動資料"
            value={quote.ownership.filings?.length ? `${quote.ownership.filings.length} 筆 SEC ownership filings` : "近期未抓到 Form 3/4/5"}
          />
        </div>
        <p className="ownershipNote">{quote.ownership.transactionNote}</p>
        {quote.ownership.filings?.length ? (
          <div className="ownershipFilings">
            {quote.ownership.filings.slice(0, 6).map((filing) => (
              <a key={filing.accessionNumber} href={filing.indexUrl} target="_blank" rel="noreferrer">
                <span>
                  {filing.filingDate}｜{filing.form}
                </span>
                <strong>{filing.description}</strong>
                <small>Report date: {filing.reportDate || "N/A"}</small>
                <ExternalLink size={14} />
              </a>
            ))}
          </div>
        ) : null}
      </section>

      <section className="analysisSection">
        <h3>{t.risks}</h3>
        <ul className="riskList">
          <li>估值已反映部分成長預期，財報或指引放緩會提高波動。</li>
          <li>競爭對手、供應鏈瓶頸、客戶自研或需求轉弱可能影響毛利與成長。</li>
          <li>利率、監管、地緣政治與市場題材退燒可能造成估值壓縮。</li>
        </ul>
      </section>
    </article>
  );
}

function SectionTitle({ title, tip }) {
  return (
    <div className="sectionTitle">
      <h3>{title}</h3>
      <span className="tooltipAnchor" tabIndex={0}>
        <InfoIcon size={15} />
        <span className="tooltipBubble">{tip}</span>
      </span>
    </div>
  );
}

function LongTermPlan({ quote, t }) {
  const pillars = [
    quote.profile.theme,
    quote.profile.moat,
    `${t.strategicPillars}: ${quote.profile.customers.slice(0, 3).join("、")}`,
    `${t.executionSignals}: ${quote.profile.suppliers.slice(0, 3).join("、")}`
  ].filter(Boolean);
  const signals = (quote.catalystTimeline || []).slice(0, 5);
  const metrics = [
    ["Forward PE", quote.formatted.forwardPe],
    ["FCF Yield", quote.formatted.fcfYield],
    ["營收成長", quote.fundamentals.estimatedAnnualRevenueGrowth || "N/A"],
    ["毛利率", quote.fundamentals.grossMargin || "N/A"],
    ["ROIC", quote.fundamentals.roic || "N/A"]
  ];

  return (
    <section className="analysisSection longTermPlan">
      <div className="sectionTitle static">
        <h3>{t.longTermPlan}</h3>
        <p>{t.longTermPlanHint}</p>
      </div>
      <div className="planGrid">
        <div>
          <strong>{t.strategicPillars}</strong>
          <ul>
            {pillars.slice(0, 4).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <strong>{t.executionSignals}</strong>
          <ul>
            {signals.map((item) => (
              <li key={`${item.label}-${item.signal}`}>
                {item.label}：{item.signal}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <strong>{t.validationMetrics}</strong>
          <div className="planMetrics">
            {metrics.map(([label, value]) => (
              <span key={label}>
                {label}
                <b>{value}</b>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function InvestmentMindMap({ quote, t, language }) {
  const nodes = [
    { label: t.moat, value: quote.profile.moat },
    { label: t.themes, value: quote.profile.theme },
    { label: t.financials, value: `${quote.fundamentals.freeCashFlow || "FCF N/A"}｜${quote.fundamentals.grossMargin || "毛利率 N/A"}` },
    { label: t.valuation, value: `${quote.valuationMethod.primary}｜${quote.valuation}` },
    { label: t.risks, value: "估值、競爭、供應鏈、總經與監管" }
  ];

  return (
    <section className="analysisSection mindMapSection">
      <div className="sectionTitle static">
        <h3>{t.mindMap}</h3>
        <p>{t.mindMapHint}</p>
      </div>
      <div className="mindMap">
        <div className="mindMapCore">
          <Network size={20} />
          <strong>{quote.symbol}</strong>
          <span>{displayValue(quote.rating, language)}</span>
        </div>
        {nodes.map((node) => (
          <div className="mindMapNode" key={node.label}>
            <strong>{node.label}</strong>
            <p>{node.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PeerTable({ quotes, selectedSymbol, language }) {
  const rows = quotes.filter(Boolean);
  if (!rows.length) return <p>目前沒有可比較標的。</p>;

  return (
    <div className="peerTableWrap">
      <table className="peerTable">
        <thead>
          <tr>
            <th>標的</th>
            <th>市值</th>
            <th>PE</th>
            <th>Forward PE</th>
            <th>PS</th>
            <th>FCF Yield</th>
            <th>營收成長</th>
            <th>毛利率</th>
            <th>淨利率</th>
            <th>目標價差距</th>
            <th>評級</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.symbol} className={row.symbol === selectedSymbol ? "selected" : ""}>
              <td>{row.symbol}</td>
              <td>{row.formatted.marketCap}</td>
              <td>{row.formatted.pe}</td>
              <td>{row.formatted.forwardPe}</td>
              <td>{row.formatted.ps}</td>
              <td>{row.formatted.fcfYield}</td>
              <td>{row.fundamentals.estimatedAnnualRevenueGrowth || "N/A"}</td>
              <td>{row.fundamentals.grossMargin || "N/A"}</td>
              <td>{row.fundamentals.profitMargin || "N/A"}</td>
              <td>{row.fundamentals.priceTargetChange || "N/A"}</td>
              <td>{displayValue(row.valuation, language)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="info">
      <span>{label}</span>
      <strong>{value || "N/A"}</strong>
    </div>
  );
}

function AnalysisBlock({ title, items }) {
  return (
    <section className="analysisCard">
      <h3>{title}</h3>
      <div>
        {items.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </section>
  );
}

function FinancialCharts({ chart }) {
  const points = (chart || []).filter((point) => Number.isFinite(point.revenue));
  if (!points.length) return null;

  return (
    <div className="chartGrid">
      <div className="chartCard">
        <h4>營收 / 營業利益 / 淨利</h4>
        <LineChart
          points={points}
          series={[
            { key: "revenue", label: "營收", color: "#2563eb" },
            { key: "operatingIncome", label: "營業利益", color: "#117c8b" },
            { key: "netIncome", label: "淨利", color: "#0f8a5f" }
          ]}
        />
      </div>
      <div className="chartCard">
        <h4>成本結構河流圖</h4>
        <StreamChart
          points={points}
          series={[
            { key: "costOfRevenue", label: "營收成本", color: "#d97706" },
            { key: "operatingExpenses", label: "營業費用", color: "#7c3aed" },
            { key: "netIncome", label: "淨利", color: "#0f8a5f" }
          ]}
        />
      </div>
    </div>
  );
}

function LineChart({ points, series }) {
  const width = 640;
  const height = 220;
  const padding = 28;
  const max = Math.max(...points.flatMap((point) => series.map((item) => point[item.key] || 0)));
  const min = Math.min(0, ...points.flatMap((point) => series.map((item) => point[item.key] || 0)));
  const span = max - min || 1;

  const x = (index) => padding + (index * (width - padding * 2)) / Math.max(points.length - 1, 1);
  const y = (value) => height - padding - (((value || 0) - min) / span) * (height - padding * 2);

  return (
    <div className="svgChart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} />
        {series.map((item) => {
          const d = points.map((point, index) => `${index === 0 ? "M" : "L"} ${x(index)} ${y(point[item.key])}`).join(" ");
          return <path key={item.key} d={d} style={{ stroke: item.color }} />;
        })}
        {points.map((point, index) => (
          <text key={point.label} x={x(index)} y={height - 6} textAnchor="middle">
            {String(point.label).replace("20", "'")}
          </text>
        ))}
      </svg>
      <Legend series={series} />
    </div>
  );
}

function StreamChart({ points, series }) {
  const width = 640;
  const height = 220;
  const padding = 28;
  const totals = points.map((point) => series.reduce((sum, item) => sum + Math.abs(point[item.key] || 0), 0));
  const max = Math.max(...totals, 1);
  const bandWidth = (width - padding * 2) / points.length;

  return (
    <div className="svgChart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img">
        {points.map((point, pointIndex) => {
          let yCursor = height - padding;
          return series.map((item) => {
            const value = Math.abs(point[item.key] || 0);
            const barHeight = (value / max) * (height - padding * 2);
            yCursor -= barHeight;
            return (
              <rect
                key={`${point.label}-${item.key}`}
                x={padding + pointIndex * bandWidth + 6}
                y={yCursor}
                width={Math.max(bandWidth - 12, 8)}
                height={barHeight}
                rx="4"
                style={{ fill: item.color }}
              />
            );
          });
        })}
        {points.map((point, index) => (
          <text key={point.label} x={padding + index * bandWidth + bandWidth / 2} y={height - 6} textAnchor="middle">
            {String(point.label).replace("20", "'")}
          </text>
        ))}
      </svg>
      <Legend series={series} />
    </div>
  );
}

function Legend({ series }) {
  return (
    <div className="chartLegend">
      {series.map((item) => (
        <span key={item.key}>
          <i style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
