# Provider Evaluation

這份紀錄是 2.0 的 provider decision gate。候選來源不能因為「看起來有資料」就直接進入正式分析；必須先通過 identity、日期、schema、錯誤處理、成本與公開展示條件的驗證。

## Source Priority

1. SEC EDGAR：公司 identity、10-K/10-Q/8-K、XBRL 與 Form 3/4/5 的 primary source。
2. 公司 IR / filing 原文：用於交叉驗證重大財報與事件，但目前尚未接入抓取流程。
3. Yahoo Finance：行情與共識的 supplementary source，不能取代 SEC filing。
4. StockAnalysis：統計、預估與財務摘要的 provisional source；目前以 HTML parser 讀取，必須監控 schema drift。
5. Finnhub：需要 API key 的 supplementary source，只提供其 API 明確支援的 profile/recommendation 欄位。

## Decision Matrix

| Provider      | State       | 正式用途                               | 尚未通過的門檻                                        | Fallback                |
| ------------- | ----------- | -------------------------------------- | ----------------------------------------------------- | ----------------------- |
| SEC EDGAR     | verified    | identity、ownership、filings           | 需要在部署環境確認 `SEC_USER_AGENT` 與 rate budget    | none                    |
| Yahoo Finance | provisional | quote、chart、部分 consensus           | 非正式公開 API、429/5xx、公司行動與授權條件需持續驗證 | Stooq，再回 Yahoo chart |
| StockAnalysis | provisional | statistics、forecast、financials、news | HTML schema drift、公開展示條件、p95 latency          | none                    |
| Finnhub       | provisional | profile、recommendation                | API quota、費用與展示授權、缺失欄位                   | none                    |
| Polygon.io    | candidate   | quote、corporate actions、fundamentals | 50 檔跨類型測試、成本與展示授權                       | none                    |
| Alpha Vantage | candidate   | quote、fundamentals、news              | 50 檔跨類型測試、rate limit、成本與展示授權           | none                    |

## Required Evaluation Run

候選來源進入 `verified` 前，評估器要對至少 50 檔不同類型標的記錄：

- ticker/CIK/company identity 是否一致。
- reported period、資料日期、timezone 與 stale 判定。
- price、corporate actions、缺失值與 ADR/foreign issuer 行為。
- timeout、429、5xx 與 schema drift。
- success rate、p95 latency、cache hit ratio 與 provider concurrency。
- API 限制、license、公開展示與成本。
- 與 SEC、公司 IR 或既有 verified/provisional source 的交叉比對。

每次 run 應輸出 JSON fixture，包含 `provider`, `symbol`, `capability`, `status`, `latencyMs`, `errorClass`, `sourceUrl`, `asOf`。只有 `status: verified` 的 capability 可以進入 primary path；失敗來源只能進 fallback 或顯示 `missing`，不能用一般化文字補齊。

## Rollback

- provider 出現 schema drift、p95 超過 budget、連續 5xx 或 cross-check mismatch 時，立即停止 promotion。
- 回退至上一個 verified/provisional adapter，保留 stale 資料並顯示資料日期。
- 不因 fallback 成功就把來源升級為 verified。
- 不在 log 寫入 API key、完整 prompt、私人筆記或完整 provider payload。
