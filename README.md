# 美股週報分析工作台

這是一個不需要 API key 的 Next.js app，會依照 `美股週報分析規則.md` 的邏輯追蹤美股標的、抓取公開行情、產出初步分析，並可匯出 Markdown 報告。

## 功能

- 搜尋美股標的並加入自訂清單
- 動態建議標的：從公開市場候選池抓取資料，依照長線成長、自由現金流、毛利率、估值、催化劑與風險報酬評分
- 每次開啟 app 會自動更新行情，行情每 15 分鐘刷新一次，建議標的每 1 小時刷新一次
- 依照規則輸出：結論、技術面、估值、估值模型、財報、成本判斷、競爭格局、供應鏈、客戶、護城河、價格區間與風險
- 主要風險改為「量化規則引擎」動態產生（可選擇接入 AI 補充）
- SWOT 改為「資料驅動 + 可選 AI 補充整理」
- AI 防呆：同一標的的 AI 風險/SWOT 預設一週更新一次（可用 debug bypass 關閉限制）
- 支援中英文介面、日夜模式、財報 tooltip、長期計劃、投資心智圖與 Markdown 匯出
- 透過 SEC EDGAR 顯示近期 Form 3/4/5 ownership filings 與官方文件連結
- 可將單一標的分析匯出為 `.md`
- 不使用 OpenAI API key；市場資料來自公開 Yahoo Finance、Stooq、StockAnalysis 與 SEC EDGAR

## 本機啟動

```bash
npm install
npm run dev
```

開啟：

```text
http://localhost:3000
```

## 部署

### GitHub

把整個資料夾推到 GitHub repo。

### Render

Render 可直接讀取 `render.yaml`：

- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Node version: `20.13.1`

### Firebase

目前專案沒有使用 Firebase SDK。若未來要跨裝置同步清單、保存歷史報告或登入帳號，可再加入 Firebase Auth + Firestore。

## 可選 AI 功能

若要啟用 AI 輔助的「主要風險」與「SWOT 補充整理」，可設定：

```bash
OPENAI_API_KEY=你的金鑰
OPENAI_RISK_MODEL=gpt-4.1-mini
OPENAI_SWOT_MODEL=gpt-4.1-mini
AI_DEBUG_BYPASS=false
```

說明：

- 沒有設定 API key 時，系統仍可正常運作，會使用純資料驅動分析。
- AI 只做補充整理，不會覆蓋原本的量化事實。
- AI 一週節流只影響 AI 補充，不影響行情、財報、新聞抓取；即使 AI 失敗也會回退到舊快取，避免頁面無資料。

## 注意

公開資料來源可能會因頻率限制或服務變動而失敗；Yahoo Finance 不可用時會 fallback 到 Stooq 行情。這個 app 是投資分析框架，不構成個人化投資建議，也不保證任何投資收益。
