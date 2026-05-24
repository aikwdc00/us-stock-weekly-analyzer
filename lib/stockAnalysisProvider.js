const baseUrl = "https://stockanalysis.com/stocks";

function cleanHtmlText(value) {
  return value?.replace(/&amp;/g, "&").replace(/&#x27;/g, "'").trim() || null;
}

function parseMetricNumber(value) {
  if (value === null || value === undefined || value === "n/a" || value === "N/A") return null;
  const text = String(value).replace(/[$,%\s,]/g, "");
  const multiplier = /T$/i.test(text) ? 1e12 : /B$/i.test(text) ? 1e9 : /M$/i.test(text) ? 1e6 : 1;
  const normalized = text.replace(/[TBM]$/i, "");
  const number = Number(normalized);
  return Number.isFinite(number) ? number * multiplier : null;
}

function formatCompactCurrency(value) {
  if (!Number.isFinite(value)) return null;
  const abs = Math.abs(value);
  if (abs >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toLocaleString("en-US")}`;
}

function formatPercent(value) {
  return Number.isFinite(value) ? `${value >= 0 ? "+" : ""}${value.toFixed(2)}%` : null;
}

function metricFromHtml(html, id) {
  const regex = new RegExp(
    `id:"${id}"[^}]*?title:"([^"]+)"[^}]*?value:"([^"]*)"[^}]*?(?:hover:"([^"]*)")?`
  );
  const match = html.match(regex);
  if (!match) return null;

  return {
    title: cleanHtmlText(match[1]),
    value: cleanHtmlText(match[2]),
    hover: cleanHtmlText(match[3]),
    number: parseMetricNumber(match[3] || match[2])
  };
}

function numberFromQuoteBlock(html, key) {
  const match = html.match(new RegExp(`${key}:(-?\\d+(?:\\.\\d+)?)`));
  return match ? Number(match[1]) : null;
}

function stringFromQuoteBlock(html, key) {
  const match = html.match(new RegExp(`${key}:"([^"]+)"`));
  return match ? cleanHtmlText(match[1]) : null;
}

function parseForecastTriple(html, scope, key) {
  const scopeMatch = html.match(new RegExp(`${scope}:\\{([\\s\\S]*?)\\}\\},table:`));
  const scopeText = scopeMatch?.[1] || html;
  const match = scopeText.match(new RegExp(`${key}:\\{last:([^,}]+),this:([^,}]+),growth:([^,}]+)\\}`));
  if (!match) return null;

  const last = Number(match[1]);
  const current = Number(match[2]);
  const growth = Number(match[3]);

  return {
    last: Number.isFinite(last) ? last : null,
    current: Number.isFinite(current) ? current : null,
    growth: Number.isFinite(growth) ? growth : null,
    lastDisplay: formatCompactCurrency(last),
    currentDisplay: formatCompactCurrency(current),
    growthDisplay: formatPercent(growth)
  };
}

function parseForecastNumberList(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .map((item) => {
      if (item.startsWith('"') && item.endsWith('"')) return item.slice(1, -1);
      const number = Number(item);
      return Number.isFinite(number) ? number : null;
    });
}

function parseLiteralArray(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .map((item) => {
      if (item === "null" || item === "void 0") return null;
      if (item.startsWith('"') && item.endsWith('"')) return item.slice(1, -1);
      const number = Number(item);
      return Number.isFinite(number) ? number : null;
    });
}

function parseFinancialArray(block, key) {
  const match = block.match(new RegExp(`${key}:\\[([\\s\\S]*?)\\](?:,|\\})`));
  return match ? parseLiteralArray(match[1]) : [];
}

function parseFinancialStatement(html) {
  const block = html.match(/financialData:\{([\s\S]*?)\},map:\[/)?.[1];
  if (!block) return null;

  const datekey = parseFinancialArray(block, "datekey");
  const fiscalYear = parseFinancialArray(block, "fiscalYear");
  const rows = {
    revenue: parseFinancialArray(block, "revenue"),
    revenueGrowth: parseFinancialArray(block, "revenueGrowth"),
    costOfRevenue: parseFinancialArray(block, "cor"),
    grossProfit: parseFinancialArray(block, "grossProfit"),
    sgna: parseFinancialArray(block, "sgna"),
    rnd: parseFinancialArray(block, "rnd"),
    otherOperatingExpenses: parseFinancialArray(block, "otheropex"),
    totalOperatingExpenses: parseFinancialArray(block, "totalOperatingExpenses"),
    operatingIncome: parseFinancialArray(block, "operatingIncome"),
    interestIncome: parseFinancialArray(block, "interestIncome"),
    interestExpense: parseFinancialArray(block, "income_statement_interest_expense"),
    otherNonOperatingIncome: parseFinancialArray(block, "otherNonOperatingIncome"),
    totalNonOperatingIncome: parseFinancialArray(block, "totalNonOperatingIncome"),
    pretaxIncome: parseFinancialArray(block, "pretax"),
    taxProvision: parseFinancialArray(block, "income_statement_provision_for_income_taxes"),
    netIncome: parseFinancialArray(block, "netIncome"),
    netIncomeGrowth: parseFinancialArray(block, "netIncomeGrowth"),
    grossMargin: parseFinancialArray(block, "grossMargin"),
    operatingMargin: parseFinancialArray(block, "operatingMargin"),
    profitMargin: parseFinancialArray(block, "profitMargin")
  };

  return {
    datekey,
    fiscalYear,
    rows
  };
}

function parseCashFlowStatement(html) {
  const block = html.match(/financialData:\{([\s\S]*?)\},map:\[/)?.[1];
  if (!block) return null;

  return {
    datekey: parseFinancialArray(block, "datekey"),
    fiscalYear: parseFinancialArray(block, "fiscalYear"),
    rows: {
      operatingCashFlow: parseFinancialArray(block, "ncfo"),
      capex: parseFinancialArray(block, "capex"),
      purchasesOfInvestments: parseFinancialArray(block, "cash_flow_statement_purchases_of_investments"),
      businessAcquisitions: parseFinancialArray(block, "cash_flow_statement_payments_for_business_acquisitions"),
      investingCashFlow: parseFinancialArray(block, "ncfi"),
      commonRepurchased: parseFinancialArray(block, "commonrepurchased"),
      freeCashFlow: parseFinancialArray(block, "fcf"),
      fcfGrowth: parseFinancialArray(block, "fcfGrowth"),
      stockBasedCompensation: parseFinancialArray(block, "sbcomp")
    }
  };
}

function formatFinancialValue(value) {
  if (!Number.isFinite(value)) return "N/A";
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`;
  return `${sign}$${abs.toLocaleString("en-US")}`;
}

function formatRatio(value) {
  return Number.isFinite(value) ? `${(value * 100).toFixed(2)}%` : "N/A";
}

function rowAt(statement, key, index) {
  return statement?.rows?.[key]?.[index] ?? null;
}

function operatingExpensesAt(statement, index) {
  const explicit = rowAt(statement, "totalOperatingExpenses", index);
  if (Number.isFinite(explicit)) return explicit;
  const sgna = rowAt(statement, "sgna", index) || 0;
  const rnd = rowAt(statement, "rnd", index) || 0;
  const other = rowAt(statement, "otherOperatingExpenses", index) || 0;
  const total = sgna + rnd + other;
  return total || null;
}

function makeFinancialPoint(statement, index) {
  return {
    label: statement?.datekey?.[index] || statement?.fiscalYear?.[index] || "",
    revenue: rowAt(statement, "revenue", index),
    costOfRevenue: rowAt(statement, "costOfRevenue", index),
    grossProfit: rowAt(statement, "grossProfit", index),
    operatingExpenses: operatingExpensesAt(statement, index),
    operatingIncome: rowAt(statement, "operatingIncome", index),
    netIncome: rowAt(statement, "netIncome", index)
  };
}

function buildFinancialSummary(income, cashFlow) {
  if (!income) return null;

  const ttm = 0;
  const latestAnnual = 1;
  const previousAnnual = 2;
  const annualRevenue = rowAt(income, "revenue", latestAnnual);
  const previousRevenue = rowAt(income, "revenue", previousAnnual);
  const annualCost = rowAt(income, "costOfRevenue", latestAnnual);
  const previousCost = rowAt(income, "costOfRevenue", previousAnnual);
  const costGrowth =
    Number.isFinite(annualCost) && Number.isFinite(previousCost) && previousCost !== 0
      ? (annualCost - previousCost) / Math.abs(previousCost)
      : null;
  const revenueGrowth =
    Number.isFinite(annualRevenue) && Number.isFinite(previousRevenue) && previousRevenue !== 0
      ? (annualRevenue - previousRevenue) / Math.abs(previousRevenue)
      : null;
  const capex = cashFlow?.rows?.capex?.[latestAnnual] ?? null;
  const acquisitions = cashFlow?.rows?.businessAcquisitions?.[latestAnnual] ?? null;
  const rnd = rowAt(income, "rnd", latestAnnual);
  const previousRnd = rowAt(income, "rnd", previousAnnual);
  const rndGrowth =
    Number.isFinite(rnd) && Number.isFinite(previousRnd) && previousRnd !== 0
      ? (rnd - previousRnd) / Math.abs(previousRnd)
      : null;

  return {
    ttm: {
      revenue: formatFinancialValue(rowAt(income, "revenue", ttm)),
      costOfRevenue: formatFinancialValue(rowAt(income, "costOfRevenue", ttm)),
      grossProfit: formatFinancialValue(rowAt(income, "grossProfit", ttm)),
      operatingExpenses: formatFinancialValue(operatingExpensesAt(income, ttm)),
      operatingIncome: formatFinancialValue(rowAt(income, "operatingIncome", ttm)),
      interestIncome: formatFinancialValue(rowAt(income, "interestIncome", ttm)),
      interestExpense: formatFinancialValue(rowAt(income, "interestExpense", ttm)),
      otherNonOperatingIncome: formatFinancialValue(rowAt(income, "otherNonOperatingIncome", ttm)),
      totalNonOperatingIncome: formatFinancialValue(rowAt(income, "totalNonOperatingIncome", ttm)),
      pretaxIncome: formatFinancialValue(rowAt(income, "pretaxIncome", ttm)),
      taxProvision: formatFinancialValue(rowAt(income, "taxProvision", ttm)),
      netIncome: formatFinancialValue(rowAt(income, "netIncome", ttm)),
      grossMargin: formatRatio(rowAt(income, "grossMargin", ttm)),
      operatingMargin: formatRatio(rowAt(income, "operatingMargin", ttm)),
      profitMargin: formatRatio(rowAt(income, "profitMargin", ttm))
    },
    annual: {
      year: income.fiscalYear?.[latestAnnual] || income.datekey?.[latestAnnual],
      revenue: formatFinancialValue(annualRevenue),
      revenueGrowth: formatPercent(revenueGrowth ? revenueGrowth * 100 : null),
      costOfRevenue: formatFinancialValue(annualCost),
      costGrowth: formatPercent(costGrowth ? costGrowth * 100 : null),
      grossProfit: formatFinancialValue(rowAt(income, "grossProfit", latestAnnual)),
      sgna: formatFinancialValue(rowAt(income, "sgna", latestAnnual)),
      rnd: formatFinancialValue(rnd),
      rndGrowth: formatPercent(rndGrowth ? rndGrowth * 100 : null),
      operatingExpenses: formatFinancialValue(operatingExpensesAt(income, latestAnnual)),
      operatingIncome: formatFinancialValue(rowAt(income, "operatingIncome", latestAnnual)),
      otherNonOperatingIncome: formatFinancialValue(rowAt(income, "otherNonOperatingIncome", latestAnnual)),
      netIncome: formatFinancialValue(rowAt(income, "netIncome", latestAnnual)),
      netIncomeGrowth: formatRatio(rowAt(income, "netIncomeGrowth", latestAnnual)),
      capex: formatFinancialValue(capex),
      acquisitions: formatFinancialValue(acquisitions)
    },
    costAnalysis: analyzeCostChanges({ costGrowth, revenueGrowth, rndGrowth, capex, acquisitions }),
    chart: [4, 3, 2, 1, 0].map((index) => makeFinancialPoint(income, index)).filter((point) => point.label)
  };
}

function analyzeCostChanges({ costGrowth, revenueGrowth, rndGrowth, capex, acquisitions }) {
  if (!Number.isFinite(costGrowth)) {
    return "成本資料不足，暫時無法判斷變動原因。";
  }

  const costPct = costGrowth * 100;
  const revenuePct = Number.isFinite(revenueGrowth) ? revenueGrowth * 100 : null;
  const rndPct = Number.isFinite(rndGrowth) ? rndGrowth * 100 : null;
  const notes = [];

  if (costPct > 20 && revenuePct !== null && revenuePct >= costPct * 0.8) {
    notes.push(`營收同步成長 ${revenuePct.toFixed(1)}%，成本增加較像需求放大與出貨規模提升。`);
  } else if (costPct > 20) {
    notes.push("營收成本增幅明顯高於營收，需檢查毛利率壓力、價格競爭、原料/製造成本或產能利用率。");
  } else {
    notes.push("營收成本未出現異常大幅增加。");
  }

  if (rndPct !== null && rndPct > 20) {
    notes.push(`研發費用成長 ${rndPct.toFixed(1)}%，較可能是產品週期、AI/平台研發或長期投資。`);
  }
  if (Number.isFinite(capex) && Math.abs(capex) > 1e9) {
    notes.push(`資本支出約 ${formatFinancialValue(capex)}，可能與資料中心、廠房、設備或產能擴張有關。`);
  }
  if (Number.isFinite(acquisitions) && Math.abs(acquisitions) > 1e9) {
    notes.push(`併購/收購支出約 ${formatFinancialValue(acquisitions)}，成本與現金流變化可能含外部投資因素。`);
  }

  return notes.join(" ");
}

function parseNewsItems(html) {
  const match = html.match(/news:\{[\s\S]*?data:\[([\s\S]*?)\]\},chart:/);
  if (!match) return [];
  const items = [];
  const itemRegex = /\{url:"([^"]+)"[\s\S]*?title:"([^"]+)"[\s\S]*?text:"([^"]*)"[\s\S]*?source:"([^"]+)"[\s\S]*?time:"([^"]+)"/g;
  let item;

  while ((item = itemRegex.exec(match[1])) && items.length < 6) {
    items.push({
      url: item[1].startsWith("http") ? item[1] : `https://stockanalysis.com/news/${item[1]}/`,
      title: cleanHtmlText(item[2]),
      text: cleanHtmlText(item[3]),
      source: cleanHtmlText(item[4]),
      time: cleanHtmlText(item[5])
    });
  }

  return items;
}

function parseLatestQuarter(html) {
  const match = html.match(
    /quarterly:\{eps:\[([\s\S]*?)\],dates:\[([\s\S]*?)\],revenue:\[([\s\S]*?)\][\s\S]*?lastDate:(\d+)/
  );
  if (!match) return null;

  const eps = parseForecastNumberList(match[1]);
  const dates = parseForecastNumberList(match[2]);
  const revenue = parseForecastNumberList(match[3]);
  const lastDate = Number(match[4]);
  const latestRevenue = revenue[lastDate];
  const previousRevenue = revenue[lastDate - 4] ?? revenue[lastDate - 1];
  const latestEps = eps[lastDate];
  const previousEps = eps[lastDate - 4] ?? eps[lastDate - 1];

  return {
    date: dates[lastDate] || null,
    revenue: Number.isFinite(latestRevenue) ? latestRevenue : null,
    revenueDisplay: formatCompactCurrency(latestRevenue),
    revenueGrowth:
      Number.isFinite(latestRevenue) && Number.isFinite(previousRevenue) && previousRevenue !== 0
        ? ((latestRevenue - previousRevenue) / Math.abs(previousRevenue)) * 100
        : null,
    eps: Number.isFinite(latestEps) ? latestEps : null,
    epsDisplay: Number.isFinite(latestEps) ? `$${latestEps.toFixed(2)}` : null,
    epsGrowth:
      Number.isFinite(latestEps) && Number.isFinite(previousEps) && previousEps !== 0
        ? ((latestEps - previousEps) / Math.abs(previousEps)) * 100
        : null
  };
}

function parseForecastSnapshot(html) {
  const annualRevenue = parseForecastTriple(html, "annual", "revenueThis");
  const nextAnnualRevenue = parseForecastTriple(html, "annual", "revenueNext");
  const annualEps = parseForecastTriple(html, "annual", "epsThis");
  const nextAnnualEps = parseForecastTriple(html, "annual", "epsNext");
  const quarterlyRevenue = parseForecastTriple(html, "quarterly", "revenueThis");
  const nextQuarterRevenue = parseForecastTriple(html, "quarterly", "revenueNext");
  const quarterlyEps = parseForecastTriple(html, "quarterly", "epsThis");
  const nextQuarterEps = parseForecastTriple(html, "quarterly", "epsNext");
  const latestQuarter = parseLatestQuarter(html);

  return {
    annualRevenue,
    nextAnnualRevenue,
    annualEps,
    nextAnnualEps,
    quarterlyRevenue,
    nextQuarterRevenue,
    quarterlyEps,
    nextQuarterEps,
    latestQuarter: latestQuarter
      ? {
          ...latestQuarter,
          revenueGrowthDisplay: formatPercent(latestQuarter.revenueGrowth),
          epsGrowthDisplay: formatPercent(latestQuarter.epsGrowth)
        }
      : null
  };
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    },
    next: { revalidate: 300 }
  });

  if (!response.ok) {
    throw new Error(`StockAnalysis fetch failed: ${response.status}`);
  }

  return response.text();
}

export async function fetchStockAnalysisSnapshot(symbol) {
  const normalized = symbol.toLowerCase();

  try {
    const [overviewHtml, statisticsHtml, forecastHtml, financialsHtml, cashFlowHtml] = await Promise.all([
      fetchText(`${baseUrl}/${normalized}/`),
      fetchText(`${baseUrl}/${normalized}/statistics/`),
      fetchText(`${baseUrl}/${normalized}/forecast/`),
      fetchText(`${baseUrl}/${normalized}/financials/`),
      fetchText(`${baseUrl}/${normalized}/financials/cash-flow-statement/`)
    ]);

    const metricIds = [
      "marketcap",
      "enterpriseValue",
      "pe",
      "peForward",
      "ps",
      "psForward",
      "pfcf",
      "fcfYield",
      "pegRatio",
      "sma50",
      "sma200",
      "rsi",
      "averageVolume",
      "revenue",
      "eps",
      "grossMargin",
      "operatingMargin",
      "profitMargin",
      "fcf",
      "totalcash",
      "debt",
      "netcash",
      "roe",
      "roic",
      "priceTarget",
      "priceTargetChange",
      "analystRatings",
      "analystCount",
      "revenue5y",
      "eps5y",
      "sharesInsiders",
      "sharesInstitutions"
    ];

    const metrics = Object.fromEntries(metricIds.map((id) => [id, metricFromHtml(statisticsHtml, id)]));
    const income = parseFinancialStatement(financialsHtml);
    const cashFlow = parseCashFlowStatement(cashFlowHtml);

    return {
      source: "StockAnalysis",
      sourceUrl: `${baseUrl}/${normalized}/statistics/`,
      quoteSourceUrl: `${baseUrl}/${normalized}/`,
      name: stringFromQuoteBlock(overviewHtml, "nameFull") || stringFromQuoteBlock(overviewHtml, "name"),
      exchange: stringFromQuoteBlock(overviewHtml, "exchange"),
      price: numberFromQuoteBlock(overviewHtml, "p"),
      change: numberFromQuoteBlock(overviewHtml, "c"),
      changePercent: numberFromQuoteBlock(overviewHtml, "cp"),
      previousClose: numberFromQuoteBlock(overviewHtml, "cl"),
      dayHigh: numberFromQuoteBlock(overviewHtml, "h"),
      dayLow: numberFromQuoteBlock(overviewHtml, "l"),
      open: numberFromQuoteBlock(overviewHtml, "o"),
      volume: numberFromQuoteBlock(overviewHtml, "v"),
      high52: numberFromQuoteBlock(overviewHtml, "h52"),
      low52: numberFromQuoteBlock(overviewHtml, "l52"),
      updated: stringFromQuoteBlock(overviewHtml, "u"),
      metrics,
      forecast: parseForecastSnapshot(forecastHtml),
      financials: buildFinancialSummary(income, cashFlow),
      news: parseNewsItems(overviewHtml)
    };
  } catch (error) {
    return {
      source: "StockAnalysis",
      error: error.message,
      metrics: {}
    };
  }
}
