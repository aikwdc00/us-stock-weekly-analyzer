"use client";

import {
  Activity,
  BarChart3,
  Check,
  CircleDollarSign,
  Download,
  ExternalLink,
  GitBranch,
  Info as InfoIcon,
  Languages,
  ListPlus,
  Moon,
  Network,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { normalizeSymbol } from "../lib/analysis";

const defaultWatchlist = ["NVDA", "TSLA", "AMD", "GOOGL", "TSM"];
const storageKey = "us-stock-weekly-analyzer.watchlist";
const languageKey = "us-stock-weekly-analyzer.language";
const themeKey = "us-stock-weekly-analyzer.theme";

const copy = {
  zh: {
    appTitle: "美股週報分析工作台",
    subtitle: "依照你的美股週報規則，自動抓取公開行情、整理標的清單、輸出可重複使用的 Markdown 報告。",
    refresh: "更新行情",
    refreshing: "更新中",
    updateWarningPrefix: "資料提醒",
    watchlist: "我的清單",
    searchPlaceholder: "搜尋公司名，或輸入代號直接加入",
    searching: "搜尋中",
    search: "搜尋",
    addSymbol: "直接加入代號",
    waitQuote: "等待行情",
    addFirst: "先加入一個美股標的",
    addFirstHint: "搜尋代號或從右側建議清單加入，app 會在開啟時自動更新行情。",
    ideas: "建議標的",
    ideaBasis: "建議標準",
    ideaBasisText:
      "建議標的會從公開市場候選池即時抓取，再依照你的週報規則評分：長線成長、護城河、自由現金流、毛利率、估值合理性、催化劑強度與風險報酬。建議清單不是買進指令，而是優先研究名單。",
    dynamicIdeas: "動態篩選",
    loadingIdeas: "篩選建議中",
    ideasUpdated: "建議更新",
    noIdeas: "目前沒有符合條件的新建議標的。",
    score: "分數",
    loadingReport: "正在更新這個標的",
    loadingReportHint: "已加入清單，正在抓取行情、估值、財報與新聞資料。",
    darkMode: "夜間",
    lightMode: "日間",
    tracked: "追蹤標的",
    loaded: "已載入分析",
    positive: "偏正面評級",
    avgMove: "平均日漲跌",
    finalRating: "最終評級",
    valuation: "估值判斷",
    technical: "技術面",
    exportMd: "匯出 .md",
    conclusion: "一句話結論",
    dataQuality: "資料品質檢查",
    fieldsReady: "已取得",
    coreFields: "個核心欄位。",
    missing: "缺少",
    completeFields: "核心欄位完整。",
    themes: "題材與當前催化劑",
    majorNews: "重大新聞",
    noNews: "目前沒有抓到重大新聞。",
    openNews: "閱讀完整內容",
    valuationMethod: "估值方法",
    valuationModels: "估值模型切換",
    catalystTimeline: "催化劑時間表",
    revenueTrend: "營收與獲利趨勢",
    financialDetail: "財報細項與成本判斷",
    financialDetailTip:
      "這裡拆解 TTM 與年度損益表，重點看營收成本、營業費用、研發費用、資本支出與成本變動原因，用來判斷成本上升是投資擴張還是獲利壓力。",
    costJudgement: "成本增加判斷",
    financials: "財報與財務狀況",
    financialsTip:
      "這裡看公司目前財務體質，包括營收、EPS、自由現金流、毛利率、營業利益率、淨利率、現金、負債、ROE、ROIC 與持股結構。",
    longTermPlan: "長期計劃與發展路線",
    longTermPlanHint: "依據公司題材、催化劑、護城河、客戶/供應鏈與財報預估整理，作為未來 thesis 追蹤清單。",
    mindMap: "投資心智圖",
    mindMapHint: "把長線 thesis 拆成護城河、成長催化、財務品質、估值紀律與主要風險，方便快速複盤。",
    strategicPillars: "發展主軸",
    executionSignals: "追蹤訊號",
    validationMetrics: "驗證指標",
    peerCompare: "同業比較",
    targetPrice: "目標價與市場預期",
    priceZones: "價格區間",
    moat: "護城河分析",
    ownership: "董監事持股 / 異動",
    risks: "主要風險",
    footer: "資料僅供研究流程使用，不構成個人化投資建議。"
  },
  en: {
    appTitle: "US Stock Weekly Analysis Workbench",
    subtitle:
      "A reusable weekly research workflow that refreshes public market data, organizes your watchlist, and exports Markdown reports.",
    refresh: "Refresh Data",
    refreshing: "Refreshing",
    updateWarningPrefix: "Data Notice",
    watchlist: "My Watchlist",
    searchPlaceholder: "Search company name, or enter a ticker",
    searching: "Searching",
    search: "Search",
    addSymbol: "Add Ticker",
    waitQuote: "Waiting for quote",
    addFirst: "Add a US stock first",
    addFirstHint: "Search for a ticker or add one from the idea list. Data refreshes automatically when the app opens.",
    ideas: "Suggested Ideas",
    ideaBasis: "Selection Criteria",
    ideaBasisText:
      "Ideas are fetched from a live public-market candidate pool and scored by your weekly-report rules: long-term growth, moat, free cash flow, gross margin, valuation discipline, catalyst strength, and risk/reward. These are research ideas, not buy signals.",
    dynamicIdeas: "Dynamic Screen",
    loadingIdeas: "Screening Ideas",
    ideasUpdated: "Ideas Updated",
    noIdeas: "No new suggested ideas currently match the screen.",
    score: "Score",
    loadingReport: "Updating This Stock",
    loadingReportHint: "Added to your watchlist. Fetching quote, valuation, financials, and news.",
    darkMode: "Dark",
    lightMode: "Light",
    tracked: "Tracked Stocks",
    loaded: "Loaded Reports",
    positive: "Positive Ratings",
    avgMove: "Avg Daily Move",
    finalRating: "Final Rating",
    valuation: "Valuation",
    technical: "Technical",
    exportMd: "Export .md",
    conclusion: "One-Line Conclusion",
    dataQuality: "Data Quality Check",
    fieldsReady: "Collected",
    coreFields: "core fields.",
    missing: "Missing",
    completeFields: "Core fields are complete.",
    themes: "Themes and Current Catalysts",
    majorNews: "Major News",
    noNews: "No major news was fetched.",
    openNews: "Read full article",
    valuationMethod: "Valuation Method",
    valuationModels: "Valuation Model Switcher",
    catalystTimeline: "Catalyst Timeline",
    revenueTrend: "Revenue and Profit Trend",
    financialDetail: "Detailed Financials and Cost Check",
    financialDetailTip:
      "Breaks down TTM and annual income-statement details, focusing on cost of revenue, operating expenses, R&D, capex, and whether cost increases look like investment or margin pressure.",
    costJudgement: "Cost Increase Assessment",
    financials: "Financial Position",
    financialsTip:
      "Checks the company’s financial health: revenue, EPS, free cash flow, gross margin, operating margin, net margin, cash, debt, ROE, ROIC, and ownership structure.",
    longTermPlan: "Long-Term Plan and Roadmap",
    longTermPlanHint:
      "Built from the company theme, catalysts, moat, customers/supply chain, and forward financial estimates. Use it as a thesis-tracking checklist.",
    mindMap: "Investment Mind Map",
    mindMapHint:
      "Connects long-term thesis, moat, growth catalysts, financial quality, valuation discipline, and key risks for faster review.",
    strategicPillars: "Strategic Pillars",
    executionSignals: "Execution Signals",
    validationMetrics: "Validation Metrics",
    peerCompare: "Peer Comparison",
    targetPrice: "Target Price and Market Expectations",
    priceZones: "Price Zones",
    moat: "Moat Analysis",
    ownership: "Insider / Institutional Ownership",
    risks: "Key Risks",
    footer: "Data is for research workflow only and is not personalized investment advice."
  }
};

const valueCopy = {
  en: {
    "強力買入": "Strong Buy",
    "分批買入": "Staged Buy",
    "續抱": "Hold",
    "觀望": "Watch",
    "減碼": "Trim",
    "避開": "Avoid",
    "明顯低估": "Clearly Undervalued",
    "合理偏低": "Reasonably Low",
    "合理": "Fair",
    "合理偏高": "Reasonably High",
    "明顯高估": "Clearly Overvalued",
    "資料不足": "Insufficient Data",
    "偏多": "Bullish",
    "中性": "Neutral",
    "偏空": "Bearish",
    "完整": "Complete",
    "可用但需補強": "Usable, Needs More Data"
  }
};

function displayValue(value, language) {
  return language === "en" ? valueCopy.en[value] || value : value;
}

function thesisText(quote, language) {
  if (language !== "en") return quote.thesis;
  return `Theme focus: ${quote.profile.theme}. Current rating is ${displayValue(quote.rating, language)}, valuation is ${displayValue(
    quote.valuation,
    language
  )}, and the technical view is ${displayValue(quote.trend, language)}. Use staged entries and the price zones rather than chasing strength.`;
}

function cls(...names) {
  return names.filter(Boolean).join(" ");
}

function safeNumber(value) {
  return Number.isFinite(value) ? value : null;
}

function getNewsUrl(item, symbol) {
  if (item?.url) return item.url;
  const query = [symbol, item?.source, item?.title].filter(Boolean).join(" ");
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function formatDate(value) {
  if (!value) return "尚未更新";
  return new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: false
  }).format(new Date(value));
}

function generateMarkdown(quote, language = "zh") {
  const locale = language === "en" ? "en-US" : "zh-TW";
  const today = new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date());
  const profile = quote.profile;
  const c = copy[language] || copy.zh;

  if (language === "en") {
    return `# ${quote.symbol} / ${quote.name}: Weekly Analysis Report

Last updated: ${today}

## ${c.conclusion}

**Rating: ${displayValue(quote.rating, language)}.** ${thesisText(quote, language)}

## Price and Technicals

- Latest price: ${quote.formatted.price || "N/A"}
- Daily move: ${quote.formatted.changePercent || "N/A"}
- 50-day average: ${quote.formatted.fiftyDay || "N/A"}
- 200-day average: ${quote.formatted.twoHundredDay || "N/A"}
- 52-week range: ${quote.formatted.range52 || "N/A"}
- Technical view: ${displayValue(quote.trend, language)}

## ${c.themes}

Theme: ${profile.theme}

Catalysts:
${quote.catalysts.map((item) => `- ${item}`).join("\n")}

Major news:
${quote.news.length ? quote.news.map((item) => `- ${item.time} | ${item.source} | ${item.title} | ${getNewsUrl(item, quote.symbol)}`).join("\n") : "- No major news was fetched"}

## ${c.financials}

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

## ${c.valuationMethod}

Assessment: **${displayValue(quote.valuation, language)}**

Primary method: ${quote.valuationMethod.primary}

Rationale: ${quote.valuationMethod.why}

Evidence: ${quote.valuationMethod.evidence.join(", ") || "Insufficient data"}

## ${c.priceZones}

- Ideal price: ${quote.zones.ideal}
- Buy zone: ${quote.zones.buy}
- Watch zone: ${quote.zones.watch}

## ${c.risks}

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

重大新聞、財報電話會議與公司公告仍建議搭配人工檢查。

重大新聞：
${quote.news.length ? quote.news.map((item) => `- ${item.time}｜${item.source}｜${item.title}｜${getNewsUrl(item, quote.symbol)}`).join("\n") : "- 目前沒有抓到重大新聞"}

## 財報與財務狀況

- 月營收：${quote.fundamentals.monthlyRevenue || "N/A"}
- 最新季度營收：${quote.fundamentals.latestQuarterRevenue || "N/A"}，成長：${quote.fundamentals.latestQuarterRevenueGrowth || "N/A"}
- 最新季度 EPS：${quote.fundamentals.latestQuarterEps || "N/A"}，成長：${quote.fundamentals.latestQuarterEpsGrowth || "N/A"}
- 本年度預估營收：${quote.fundamentals.estimatedAnnualRevenue || "N/A"}，預估成長：${quote.fundamentals.estimatedAnnualRevenueGrowth || "N/A"}
- 下一年度預估營收：${quote.fundamentals.estimatedNextAnnualRevenue || "N/A"}，預估成長：${quote.fundamentals.estimatedNextAnnualRevenueGrowth || "N/A"}
- 本年度預估 EPS：${quote.fundamentals.estimatedAnnualEps || "N/A"}，預估成長：${quote.fundamentals.estimatedAnnualEpsGrowth || "N/A"}
- TTM 營收：${quote.detailedFinancials?.ttm?.revenue || "N/A"}
- TTM 營收成本：${quote.detailedFinancials?.ttm?.costOfRevenue || "N/A"}
- TTM 營業費用：${quote.detailedFinancials?.ttm?.operatingExpenses || "N/A"}
- TTM 業外收入/費用：${quote.detailedFinancials?.ttm?.totalNonOperatingIncome || "N/A"}
- TTM 淨利：${quote.detailedFinancials?.ttm?.netIncome || "N/A"}
- 最新年度營收：${quote.detailedFinancials?.annual?.revenue || "N/A"}，成長：${quote.detailedFinancials?.annual?.revenueGrowth || "N/A"}
- 最新年度營收成本：${quote.detailedFinancials?.annual?.costOfRevenue || "N/A"}，成長：${quote.detailedFinancials?.annual?.costGrowth || "N/A"}
- 最新年度研發費用：${quote.detailedFinancials?.annual?.rnd || "N/A"}，成長：${quote.detailedFinancials?.annual?.rndGrowth || "N/A"}
- 最新年度資本支出：${quote.detailedFinancials?.annual?.capex || "N/A"}
- 成本變動判斷：${quote.detailedFinancials?.costAnalysis || "N/A"}
- PE：${quote.formatted.pe}
- Forward PE：${quote.formatted.forwardPe}
- PS：${quote.formatted.ps}
- P/FCF：${quote.formatted.pfcf}
- FCF Yield：${quote.formatted.fcfYield}
- PEG：${quote.formatted.pegRatio}
- EPS：${quote.fundamentals.eps || quote.eps || "N/A"}
- 營收：${quote.fundamentals.revenue || "N/A"}
- 自由現金流：${quote.fundamentals.freeCashFlow || "N/A"}
- 毛利率：${quote.fundamentals.grossMargin || "N/A"}
- 營業利益率：${quote.fundamentals.operatingMargin || "N/A"}
- 市值：${quote.formatted.marketCap}
- 成交量：${quote.formatted.volume}

## 競爭格局、供應鏈與客戶

- 主要題材：${profile.theme}
- 競爭對手：${profile.competitors.join("、")}
- 供應商/夥伴：${profile.suppliers.join("、")}
- 客戶/需求來源：${profile.customers.join("、")}

## 估值分析

估值判斷：**${quote.valuation}**。目前以 PE、Forward PE、股價相對 52 週區間與長線成長題材做初步判斷。

使用方法：${quote.valuationMethod.primary}

原因：${quote.valuationMethod.why}

依據：${quote.valuationMethod.evidence.join("、") || "資料不足"}

## 護城河分析

${profile.moat}

## 董監事持股 / 異動

- 內部人持股：${quote.ownership.insiders}
- 法人持股：${quote.ownership.institutions}
- 異動說明：${quote.ownership.transactionNote}
${quote.ownership.filings?.length ? `- 近期 SEC ownership filings：\n${quote.ownership.filings.map((item) => `  - ${item.filingDate}｜${item.form}｜${item.description}｜${item.indexUrl}`).join("\n")}` : ""}

## 目標價與市場預期

- 分析師平均目標價：${quote.formatted.targetMeanPrice || "N/A"}
- 市場評級：${quote.recommendation || "N/A"}

## 價格區間

- 理想價：${quote.zones.ideal}
- 買入價：${quote.zones.buy}
- 觀察價：${quote.zones.watch}

## 主要風險

1. 估值已反映部分成長預期，若財報或指引放緩，股價可能重新定價。
2. 競爭對手、客戶自研、供應鏈瓶頸或成本上升，可能影響毛利率與市占率。
3. 利率、總經、監管與產業題材退燒，可能造成估值壓縮。

## 最終評級

${quote.rating}

## 我會怎麼做

若已持有：依照基本面與價格區間續抱或分批調整。若尚未持有：避免一次追高，優先等買入價或理想價區間。

## 免責提醒

本報告是依照固定規則整理的投資分析框架，用於輔助比較風險報酬；不構成個人化投資建議，也不保證任何投資收益。
`;
}

function downloadMarkdown(quote, language = "zh") {
  const blob = new Blob([generateMarkdown(quote, language)], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${quote.symbol}-${language}.md`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function Page() {
  const [watchlist, setWatchlist] = useState(defaultWatchlist);
  const [selectedSymbol, setSelectedSymbol] = useState(defaultWatchlist[0]);
  const [quotes, setQuotes] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [dataWarning, setDataWarning] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [language, setLanguage] = useState("zh");
  const [recommendationGroups, setRecommendationGroups] = useState([]);
  const [recommendationsUpdatedAt, setRecommendationsUpdatedAt] = useState(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [theme, setTheme] = useState("light");
  const t = copy[language];

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    const savedLanguage = window.localStorage.getItem(languageKey);
    const savedTheme = window.localStorage.getItem(themeKey);
    if (savedLanguage === "zh" || savedLanguage === "en") {
      setLanguage(savedLanguage);
    }
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length) {
        setWatchlist(parsed);
        setSelectedSymbol(parsed[0]);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    window.localStorage.setItem(languageKey, language);
  }, [language]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(themeKey, theme);
  }, [theme]);

  async function refreshQuotes(symbols = watchlist) {
    if (!symbols.length) {
      setQuotes([]);
      return;
    }

    setIsLoading(true);
    setError("");
    setDataWarning("");

    try {
      const response = await fetch(`/api/quotes?symbols=${symbols.join(",")}`, {
        cache: "no-store"
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "行情更新失敗");
      }

      setQuotes(payload.quotes || []);
      setUpdatedAt(payload.updatedAt);
      setDataWarning(payload.warning || "");
    } catch (quoteError) {
      setError(quoteError.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshRecommendations(excludedSymbols = watchlist) {
    setIsLoadingRecommendations(true);

    try {
      const response = await fetch(`/api/recommendations?exclude=${excludedSymbols.join(",")}`, {
        cache: "no-store"
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "建議標的更新失敗");
      }

      setRecommendationGroups(payload.groups || []);
      setRecommendationsUpdatedAt(payload.updatedAt);
    } catch (recommendationError) {
      setError(recommendationError.message);
      setRecommendationGroups([]);
    } finally {
      setIsLoadingRecommendations(false);
    }
  }

  useEffect(() => {
    refreshQuotes(watchlist);
    const interval = window.setInterval(() => refreshQuotes(watchlist), 15 * 60 * 1000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchlist.join(",")]);

  useEffect(() => {
    refreshRecommendations(watchlist);
    const interval = window.setInterval(() => refreshRecommendations(watchlist), 60 * 60 * 1000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchlist.join(",")]);

  async function searchSymbols(event) {
    event?.preventDefault();
    const query = searchTerm.trim();
    if (!query) return;

    setIsSearching(true);
    setError("");

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
        cache: "no-store"
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "搜尋失敗");
      }

      setSearchResults(payload.results || []);
    } catch (searchError) {
      setError(searchError.message);
    } finally {
      setIsSearching(false);
    }
  }

  function addSymbol(rawSymbol) {
    const symbol = normalizeSymbol(rawSymbol);
    if (!symbol || watchlist.includes(symbol)) {
      setSelectedSymbol(symbol || selectedSymbol);
      return;
    }

    const next = [...watchlist, symbol];
    setWatchlist(next);
    setSelectedSymbol(symbol);
    setSearchTerm("");
    setSearchResults([]);
    refreshQuotes(next);
    refreshRecommendations(next);
  }

  function removeSymbol(symbol) {
    const next = watchlist.filter((item) => item !== symbol);
    setWatchlist(next);
    if (selectedSymbol === symbol) {
      setSelectedSymbol(next[0] || "");
    }
  }

  const selectedQuote = useMemo(
    () => quotes.find((quote) => quote.symbol === selectedSymbol),
    [quotes, selectedSymbol]
  );

  const coverageStats = useMemo(() => {
    const loaded = quotes.length;
    const positive = quotes.filter((quote) => ["分批買入", "續抱"].includes(quote.rating)).length;
    const avgMove =
      quotes.reduce((sum, quote) => sum + (safeNumber(quote.changePercent) ?? 0), 0) / Math.max(loaded, 1);

    return { loaded, positive, avgMove };
  }, [quotes]);

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
          <button className="themeToggle" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            {theme === "dark" ? t.lightMode : t.darkMode}
          </button>
          <button className="primaryButton" onClick={() => refreshQuotes()} disabled={isLoading}>
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

          {searchResults.length ? (
            <div className="searchResults">
              {searchResults.map((result) => (
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
                  <span>
                    <strong>{symbol}</strong>
                    <small>{quote?.name || t.waitQuote}</small>
                  </span>
                  <span className={cls("move", quote?.changePercent >= 0 ? "up" : "down")}>
                    {quote?.formatted.changePercent || "N/A"}
                  </span>
                  <Trash2
                    size={16}
                    onClick={(event) => {
                      event.stopPropagation();
                      removeSymbol(symbol);
                    }}
                  />
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
            <button className="railRefresh" onClick={() => refreshRecommendations()} disabled={isLoadingRecommendations}>
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
            {!isLoadingRecommendations && !recommendationGroups.some((group) => group.items?.length) ? (
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
                      <span>
                        <strong>{item.symbol}</strong>
                        <small>{item.name}</small>
                        <em>{t.score} {item.score}｜{item.valuation}｜{item.revenueGrowth}</em>
                      </span>
                      {watchlist.includes(item.symbol) ? <Check size={16} /> : <ListPlus size={16} />}
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

          <div className="deployBox">
            <p className="eyebrow">Deploy</p>
            <h3>部署入口</h3>
            <a href="https://github.com/" target="_blank" rel="noreferrer">
              <GitBranch size={17} />
              GitHub
              <ExternalLink size={14} />
            </a>
            <a href="https://dashboard.render.com/" target="_blank" rel="noreferrer">
              <Server size={17} />
              Render
              <ExternalLink size={14} />
            </a>
            <a href="https://console.firebase.google.com/?pli=1" target="_blank" rel="noreferrer">
              <Sparkles size={17} />
              Firebase
              <ExternalLink size={14} />
            </a>
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
  const [selectedModel, setSelectedModel] = useState(quote.valuationModels?.[0]?.label || "");
  const activeModel = quote.valuationModels?.find((model) => model.label === selectedModel) || quote.valuationModels?.[0];

  useEffect(() => {
    setSelectedModel(quote.valuationModels?.[0]?.label || "");
  }, [quote.symbol, quote.valuationModels]);

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
        <button onClick={() => downloadMarkdown(quote, language)}>
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
                <span>{item.source}｜{item.time}</span>
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
              <small>{item.status}｜{item.signal}</small>
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
            <Info label="年度營收" value={`${quote.detailedFinancials.annual.revenue} / ${quote.detailedFinancials.annual.revenueGrowth}`} />
            <Info label="年度營收成本" value={`${quote.detailedFinancials.annual.costOfRevenue} / ${quote.detailedFinancials.annual.costGrowth}`} />
            <Info label="年度研發費用" value={`${quote.detailedFinancials.annual.rnd} / ${quote.detailedFinancials.annual.rndGrowth}`} />
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
          <Info label="異動資料" value={quote.ownership.filings?.length ? `${quote.ownership.filings.length} 筆 SEC ownership filings` : "近期未抓到 Form 3/4/5"} />
        </div>
        <p className="ownershipNote">{quote.ownership.transactionNote}</p>
        {quote.ownership.filings?.length ? (
          <div className="ownershipFilings">
            {quote.ownership.filings.slice(0, 6).map((filing) => (
              <a key={filing.accessionNumber} href={filing.indexUrl} target="_blank" rel="noreferrer">
                <span>{filing.filingDate}｜{filing.form}</span>
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
