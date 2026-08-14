# 視覺化與互動套件評估

這份評估以目前的 Next.js、React 19、SCSS 與既有使用情境為基準。正式依賴必須固定版本，並在加入前重新確認 peer dependencies、license、安全公告、client boundary、bundle 影響、RWD、keyboard、focus、dark mode 與 reduced motion。

## 目前採用

| 能力          | 套件                       | 決策 | 原因                                                                          |
| ------------- | -------------------------- | ---- | ----------------------------------------------------------------------------- |
| 一般圖表      | Chart.js + react-chartjs-2 | 保留 | 專案已使用；足以支援財務趨勢、比較圖與摘要圖，暫不引入第二套通用圖表庫。      |
| 心智圖/關係圖 | React Flow                 | 保留 | 專案已使用；適合證據節點、產業關係與可互動的研究脈絡。                        |
| 動畫          | Framer Motion              | 保留 | 專案已使用；只用於狀態轉場，並配合 `prefers-reduced-motion`。                 |
| 圖示          | Lucide                     | 保留 | 專案已使用；維持按鈕圖示一致性，不新增 icon font。                            |
| 色票          | SCSS semantic tokens       | 保留 | 集中管理 surface、text、border、positive、negative、warning、focus 等語意色。 |

## 候選套件

| 套件                                                                     | 適用時機                                                          | 評估結論                                                                                                              |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| [TanStack Table](https://tanstack.com/table/latest/docs/framework/react) | 追蹤清單需要欄位排序、篩選、欄位狀態與大量資料列時                | 通過初步相容性檢查；官方文件標示支援 React 19。先使用目前的原生 table，待欄位與資料量真的超出維護成本再固定版本安裝。 |
| [Lightweight Charts](https://tradingview.github.io/lightweight-charts/)  | 需要高頻金融時間序列、十字線、縮放與大量 OHLC/candlestick 資料時  | 候選；金融圖表定位清楚且 Apache-2.0，但目前的 Chart.js 已足夠，避免同時維護兩種時間序列模型。                         |
| [React Aria](https://react-spectrum.adobe.com/react-aria/)               | 自製 menu、dialog、combobox、keyboard navigation 出現無障礙缺口時 | 候選；先以原生互動元素與現有測試維持簡單邊界，只有複雜互動需要時才引入。                                              |
| [dnd-kit](https://docs.dndkit.com/)                                      | 追蹤清單要支援拖曳排序或跨群組搬移時                              | 候選；先完成鍵盤可用的排序/保存流程，再評估拖曳對行動裝置與 reduced motion 的影響。                                   |
| TanStack Virtual                                                         | 追蹤清單達到實際渲染瓶頸時                                        | 暫不安裝；目前資料量小，虛擬化會增加 focus、測試與可讀性複雜度。                                                      |

## 評估門檻

- 未通過 React/Next.js SSR 與 client component 邊界檢查，不安裝。
- 未確認 license、維護狀態、peer dependencies 與安全公告，不進正式依賴。
- bundle、Web Vitals 或 E2E RWD 沒有改善，不為了視覺效果增加套件。
- 金融圖表必須標示資料來源、`asOf`、時區與 stale 狀態；圖表不能把缺失資料補成零。
- 所有互動元件都需要 focus、keyboard、error、loading、empty、dark mode 與 reduced-motion 測試。
