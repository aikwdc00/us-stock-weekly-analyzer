export const suggestedSymbols = [
  "NVDA",
  "TSLA",
  "AMD",
  "GOOGL",
  "TSM",
  "MSFT",
  "AMZN",
  "META",
  "AVGO",
  "ASML",
  "AAPL",
  "PLTR"
];

export const suggestedGroups = [
  {
    id: "steadyGrowth",
    title: "穩定成長",
    titleEn: "Stable Growth",
    symbols: ["MSFT", "GOOGL", "AAPL", "TSM", "AMZN", "META"],
    criteria:
      "護城河清楚、自由現金流與獲利品質較穩定，營收仍有中長期成長動能，適合作為長線核心追蹤清單。",
    criteriaEn:
      "Clear moat, stronger free cash flow and earnings quality, and durable medium-to-long-term revenue growth. Best used as a core long-term watchlist."
  },
  {
    id: "aggressiveGrowth",
    title: "積極成長",
    titleEn: "Aggressive Growth",
    symbols: ["NVDA", "TSLA", "AMD", "AVGO", "ASML", "PLTR"],
    criteria:
      "題材與催化劑較強，營收或 EPS 成長彈性較高，但估值波動也較大，適合用分批與價格區間控管風險。",
    criteriaEn:
      "Stronger themes and catalysts with higher revenue or EPS upside, but also higher valuation volatility. Better suited for staged entries and strict price zones."
  },
  {
    id: "aiInfrastructure",
    title: "AI / 半導體基礎建設",
    titleEn: "AI / Semiconductor Infrastructure",
    symbols: ["NVDA", "AMD", "TSM", "AVGO", "ASML"],
    criteria:
      "聚焦 AI capex、先進製程、GPU/ASIC、先進封裝與資料中心供應鏈，需同時看成長率、毛利率、CapEx 與庫存週期。",
    criteriaEn:
      "Focused on AI capex, advanced nodes, GPU/ASIC, advanced packaging, and data-center supply chains. Revenue growth, margins, capex, and inventory cycle all matter."
  }
];

export const stockProfiles = {
  NVDA: {
    theme: "AI 基礎建設、GPU、資料中心、AI factory",
    competitors: ["AMD", "Google TPU", "AWS Trainium", "Broadcom/Marvell ASIC", "客戶自研晶片"],
    suppliers: ["TSMC", "HBM 供應商", "CoWoS/先進封裝", "伺服器 ODM", "光通訊供應鏈"],
    customers: ["Hyperscalers", "雲端服務商", "AI 模型公司", "企業 AI", "主權 AI"],
    moat: "CUDA、生態系、整機櫃方案、網路/NVLink、供應鏈優先權與開發者心智。",
    catalysts: ["Blackwell/Rubin 產品週期", "Hyperscaler AI capex", "主權 AI", "企業 AI factory", "網路與整機櫃滲透"],
    monthlyRevenueNote: "美股公司通常不公告月營收，需以季度財報與指引追蹤。",
    valuationMethod: {
      primary: "Forward PE + PEG + FCF Yield",
      why: "高成長且高現金流的 AI 平台公司，單看 trailing PE 容易低估成長，也不能只看 PS。"
    },
    valuationModels: ["growth", "fcf", "semiconductor"],
    risks: [
      "AI 投資回報率 (ROI) 若不如預期，Hyperscaler 可能縮減 Capex。",
      "Blackwell 產品初期良率或供應鏈產能限制。",
      "地緣政治導致特定區域出口限制，或雲端客戶自研晶片進展過快。"
    ]
  },
  TSLA: {
    theme: "EV、FSD、Robotaxi、能源儲存、Optimus",
    competitors: ["BYD", "Waymo", "Zoox", "傳統車廠", "中國 EV 新勢力"],
    suppliers: ["電池材料", "電芯供應商", "車用晶片", "感測器", "功率半導體"],
    customers: ["個人車主", "車隊", "FSD 訂閱者", "能源儲存客戶", "公用事業"],
    moat: "品牌、車隊資料、製造經驗、充電網路、軟體迭代與垂直整合。",
    catalysts: ["FSD/Robotaxi 安全與商業化數據", "交車成長", "能源儲存部署", "Optimus 進展", "毛利率止穩"],
    monthlyRevenueNote: "Tesla 不公告月營收，需用季度交車、生產、儲能部署與財報追蹤。",
    valuationMethod: {
      primary: "情境式成長估值 + Forward PE + 題材折現",
      why: "Tesla 同時包含 EV、Robotaxi、能源與機器人選擇權，傳統車廠 PE 不足以解釋，但高估值也需要折現風險。"
    },
    valuationModels: ["scenario", "growth", "evManufacturing"],
    risks: [
      "FSD 監管審核進度與商業化節奏慢於預期。",
      "全球 EV 市場競爭加劇，導致價格戰與毛利率持續承壓。",
      "Robotaxi 與 Optimus 屬於長線期權，若進展不順會引發估值修正。"
    ]
  },
  AMD: {
    theme: "AI GPU、CPU、資料中心、PC 復甦",
    competitors: ["NVIDIA", "Intel", "客戶自研 ASIC", "ARM server CPU"],
    suppliers: ["TSMC", "封裝供應鏈", "HBM 供應商", "主機板/伺服器 ODM"],
    customers: ["雲端服務商", "企業資料中心", "PC OEM", "遊戲主機客戶"],
    moat: "CPU/GPU 產品組合、x86 生態、資料中心客戶關係與 TSMC 先進製程合作。",
    catalysts: ["MI 系列 AI GPU 放量", "資料中心 CPU/GPU 成長", "PC 復甦", "雲端客戶採用", "毛利率改善"],
    monthlyRevenueNote: "美股公司通常不公告月營收，需以季度財報與指引追蹤。",
    valuationMethod: {
      primary: "Forward PE + PS + AI GPU 成長率",
      why: "AMD 的獲利會隨 AI GPU 與資料中心規模放大，需同時看營收成長與未來 EPS 槓桿。"
    },
    valuationModels: ["growth", "semiconductor", "ps"]
  },
  GOOGL: {
    theme: "搜尋、廣告、雲端、Gemini、YouTube、TPU",
    competitors: ["Microsoft", "Amazon", "Meta", "OpenAI 生態", "TikTok"],
    suppliers: ["資料中心設備", "半導體供應鏈", "電力與能源", "網路基礎建設"],
    customers: ["廣告主", "Google Cloud 客戶", "YouTube 創作者/觀眾", "企業 AI 客戶"],
    moat: "搜尋資料、廣告網路、YouTube、Android、雲端與 TPU 自研基礎設施。",
    catalysts: ["Gemini/AI 搜尋商業化", "Google Cloud 成長", "廣告景氣", "TPU 與 AI 基礎建設", "成本控管與回購"],
    monthlyRevenueNote: "Alphabet 不公告月營收，需用季度廣告、Cloud 與 YouTube 表現追蹤。",
    valuationMethod: {
      primary: "Forward PE + FCF Yield + 分部成長",
      why: "Alphabet 是成熟高現金流平台，估值核心是廣告韌性、Cloud 成長與 AI 投資回報。"
    },
    valuationModels: ["fcf", "growth", "sumOfParts"]
  },
  TSM: {
    theme: "先進製程、AI/HPC、先進封裝、半導體代工",
    competitors: ["Samsung Foundry", "Intel Foundry", "成熟製程代工廠"],
    suppliers: ["ASML", "Applied Materials", "Lam Research", "Tokyo Electron", "材料/氣體/封裝供應鏈"],
    customers: ["NVIDIA", "Apple", "AMD", "Broadcom", "Qualcomm", "MediaTek"],
    moat: "良率、量產經驗、客戶信任、IP/EDA 生態、CoWoS/SoIC 與資本配置能力。",
    catalysts: ["月營收趨勢", "N3/N2 需求", "CoWoS/先進封裝擴產", "AI/HPC 客戶拉貨", "資本支出與毛利率指引"],
    monthlyRevenueNote: "TSMC 會公告月營收，app 目前先顯示提示；後續可再接官方月營收表。",
    valuationMethod: {
      primary: "Forward PE + FCF + 先進製程溢價",
      why: "TSMC 是重資本、高市占代工龍頭，需看 forward earnings、自由現金流與先進製程週期。"
    },
    valuationModels: ["semiconductor", "fcf", "growth"]
  }
};
