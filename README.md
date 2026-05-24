# 美股週報分析工作台

這是一個不需要 API key 的 Next.js app，會依照 `美股週報分析規則.md` 的邏輯追蹤美股標的、抓取公開行情、產出初步分析，並可匯出 Markdown 報告。

## 功能

- 搜尋美股標的並加入自訂清單
- 動態建議標的：從公開市場候選池抓取資料，依照長線成長、自由現金流、毛利率、估值、催化劑與風險報酬評分
- 每次開啟 app 會自動更新行情，行情每 15 分鐘刷新一次，建議標的每 1 小時刷新一次
- 依照規則輸出：結論、技術面、估值、估值模型、財報、成本判斷、競爭格局、供應鏈、客戶、護城河、價格區間與風險
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

## 注意

公開資料來源可能會因頻率限制或服務變動而失敗；Yahoo Finance 不可用時會 fallback 到 Stooq 行情。這個 app 是投資分析框架，不構成個人化投資建議，也不保證任何投資收益。
