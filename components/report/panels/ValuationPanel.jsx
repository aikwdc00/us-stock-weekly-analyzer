import { Info } from "../shared/Info";
import { SectionTitle } from "../shared/SectionTitle";
import { TooltipHint } from "../shared/TooltipHint";

export function ValuationPanel({ quote, t, language, activeModel, setSelectedModel }) {
	const text =
		language === "en"
			? {
					valuationMethodTip: "Summarizes the primary valuation lens currently used for this company and why it fits the business model.",
					valuationModelsTip:
						"Switch between different valuation frameworks. Each model highlights a different way to think about fair value.",
					catalystTimelineTip: "Shows the catalysts and checkpoints that can cause the market to re-rate valuation in the coming quarters.",
					targetPriceTip:
						"Compares analyst consensus target price with the current market price. Use as reference, not as a standalone decision rule.",
					priceZonesTip: "Suggested price zones based on valuation, trend, and risk/reward rather than a precise intrinsic value point.",
					peterLynch: "Peter Lynch Check",
					peterLynchTip:
						"A simplified Peter Lynch style check: fair value is approximated as EPS multiplied by growth rate (%). It is most useful for profitable growth companies.",
					fairValue: "Peter Lynch Fair Value",
					ratio: "Fair Value / Price",
					fairPe: "Implied Fair PE",
					growthBase: "Growth Assumption",
					baseEps: "Base EPS",
					targetMeanPrice: "Average Target Price",
					targetGap: "Target Price Gap",
					recommendation: "Market Consensus",
					idealPrice: "Ideal Price",
					buyPrice: "Buy Zone",
					watchPrice: "Watch Zone",
					formula: "Formula",
					formulaValue: "Fair Value = EPS × Growth Rate (%)",
					methodPrimary:
						"The main valuation framework selected for this company type, such as growth, semiconductor cycle, FCF, or sum-of-parts.",
					modelSwitcher: "Choose another valuation model to compare how the stock looks under different assumptions.",
					targetMeanPriceTip: "The average analyst 12-month price target compiled from public consensus sources.",
					targetGapTip: "The distance between current price and average target price. Positive values imply upside versus consensus.",
					recommendationTip: "The current aggregated analyst stance, such as Buy, Hold, or Strong Buy.",
					fairValueTip: "Peter Lynch style fair value estimate based on EPS times growth rate.",
					ratioTip: "A quick check of whether Peter Lynch fair value is above or below the current market price.",
					fairPeTip: "The implied PE multiple if growth rate is used as the fair PE anchor.",
					baseEpsTip: "The EPS figure used in the Peter Lynch calculation.",
					growthBaseTip: "The growth rate plugged into the Peter Lynch formula.",
					formulaTip: "The simplified formula used here for quick comparison.",
					idealPriceTip: "A more conservative price zone with better margin of safety.",
					buyPriceTip: "A reasonable accumulation zone if the long-term thesis remains intact.",
					watchPriceTip: "A zone where valuation is less attractive and patience may be better than chasing.",
					statusLabels: {
						undervalued: "Below Peter Lynch fair value",
						fair: "Near Peter Lynch fair value",
						overvalued: "Above Peter Lynch fair value",
						insufficient: "Insufficient data",
					},
					sourceLabels: {
						annualEpsForecast: "Current-year EPS forecast",
						nextAnnualEpsForecast: "Next-year EPS forecast",
						eps5y: "5Y EPS growth",
					},
				}
			: {
					valuationMethodTip: "這裡說明目前最適合這家公司的一套主要估值框架，以及為什麼用這個方法看比較合理。",
					valuationModelsTip: "可以切換不同估值模型，從成長、現金流、半導體週期或分部估值等角度交叉比對。",
					catalystTimelineTip: "列出接下來最可能影響市場重新評價估值的事件與檢查點。",
					targetPriceTip: "用分析師平均目標價與現價做參考比較，但不建議把它當成唯一決策依據。",
					priceZonesTip: "價格區間是綜合估值、技術面與風險報酬後的操作參考，不代表單一精確內在價值。",
					peterLynch: "彼得林區評估",
					peterLynchTip: "簡化版 Peter Lynch 檢查：合理價約等於 EPS × 成長率(% )。較適合已獲利、仍具成長性的公司。",
					fairValue: "彼得林區合理價",
					ratio: "合理價 / 現價",
					fairPe: "隱含合理 PE",
					growthBase: "成長假設",
					baseEps: "基準 EPS",
					targetMeanPrice: "平均目標價",
					targetGap: "目標價差距",
					recommendation: "市場共識",
					idealPrice: "理想價",
					buyPrice: "買入價",
					watchPrice: "觀察價",
					formula: "公式",
					formulaValue: "合理價 = EPS × 成長率(%)",
					methodPrimary: "目前替這家公司挑選的主要估值邏輯，例如成長股、半導體週期、FCF 或分部估值。",
					modelSwitcher: "切換不同估值模型，快速看同一檔股票在不同框架下是否仍然合理。",
					targetMeanPriceTip: "公開市場上分析師對未來 12 個月股價的平均目標值。",
					targetGapTip: "現價與平均目標價的差距。若為正，代表市場共識仍認為有上行空間。",
					recommendationTip: "分析師整體共識評級，例如 Buy、Hold、Strong Buy。",
					fairValueTip: "用 Peter Lynch 風格公式估出的簡化合理價。",
					ratioTip: "快速比較 Peter Lynch 合理價與現價之間的相對位置。",
					fairPeTip: "若用成長率當作合理 PE，對應出的隱含本益比。",
					baseEpsTip: "Peter Lynch 計算中採用的 EPS 基準值。",
					growthBaseTip: "Peter Lynch 公式中採用的成長率。",
					formulaTip: "本頁使用的簡化 Peter Lynch 公式，適合做快速比對，不是完整 DCF。",
					idealPriceTip: "安全邊際較高、風險報酬較好的價格區間。",
					buyPriceTip: "若長線 thesis 未變，屬於可分批布局的合理區間。",
					watchPriceTip: "估值偏高或風險報酬較弱，適合先觀察、不急著追價。",
					statusLabels: {
						undervalued: "低於彼得林區合理價",
						fair: "接近彼得林區合理價",
						overvalued: "高於彼得林區合理價",
						insufficient: "資料不足",
					},
					sourceLabels: {
						annualEpsForecast: "本年度預估 EPS 成長",
						nextAnnualEpsForecast: "下一年度預估 EPS 成長",
						eps5y: "EPS 5Y 成長",
					},
				};

	const peterLynch = quote.peterLynch || {};
	const chipTips =
		language === "en"
			? {
					"Forward PE":
						"Forward PE compares current price with expected next-year earnings. Lower is usually cheaper, but it should be judged together with growth quality.",
					PEG: "PEG compares PE to growth. For growth stocks, lower is generally better; around 1 is often seen as fair, below 1 can look attractive if growth is real and durable.",
					"EPS 成長":
						"Estimated EPS growth is often a stronger near-term catalyst than revenue growth for profitable companies because valuation is usually anchored to earnings or cash flow.",
					"Revenue 5Y growth":
						"Five-year revenue growth shows how consistently demand expanded. Useful for judging durability, but usually less direct than EPS for valuation re-rating.",
					"Revenue growth":
						"Revenue growth measures demand expansion. Strong revenue growth matters most when it can also convert into margin and EPS growth.",
					營收成長:
						"Revenue growth measures demand expansion. Strong revenue growth matters most when it can also convert into margin and EPS growth.",
					"EPS 5Y growth":
						"Five-year EPS growth shows how much profit per share compounded over time. Higher and steadier is generally better.",
					PE: "PE compares current price with trailing earnings. Lower is cheaper, but low PE alone can also mean the market expects weaker growth.",
					"FCF Yield":
						"Free cash flow yield shows how much free cash flow the company generates relative to market value. Higher is usually better.",
					"P/FCF":
						"Price-to-free-cash-flow compares valuation with cash generation. Lower is usually better if cash flow quality is reliable.",
					毛利率: "Higher gross margin usually means better pricing power, product mix, or cost structure.",
					營業利益率: "Higher operating margin usually means stronger operating leverage and better cost discipline.",
					現價: "Current market price. Useful as a reference anchor when comparing different valuation frameworks.",
					平均目標價: "Analyst consensus average target price. Treat it as reference rather than intrinsic value.",
				}
			: {
					"Forward PE": "Forward PE 是用現價對比未來一年預估獲利。通常越低越便宜，但要搭配成長品質一起看。",
					PEG: "PEG 是本益比相對成長率的比較。對成長股來說通常越低越好；接近 1 常被視為合理，低於 1 若成長可信通常較有吸引力。",
					"EPS 成長": "對已獲利公司來說，預估 EPS 成長通常比單看營收更容易成為短中期催化劑，因為估值多半直接錨定獲利或現金流。",
					"Revenue 5Y growth": "五年營收成長代表需求擴張的延續性，適合看 long-term durability，但對估值重評通常不如 EPS 直接。",
					"Revenue growth": "營收成長反映需求擴張，但真正有催化效果的是營收能否進一步轉成毛利、營益率與 EPS 成長。",
					營收成長: "營收成長反映需求擴張，但真正有催化效果的是營收能否進一步轉成毛利、營益率與 EPS 成長。",
					"EPS 5Y growth": "五年 EPS 成長反映每股獲利的長期複利能力，越高且越穩定通常越好。",
					PE: "PE 是用現價對比過去十二個月獲利。越低通常越便宜，但也可能代表市場預期成長轉弱。",
					"FCF Yield": "自由現金流殖利率代表公司相對市值產生多少現金流。通常越高越有利。",
					"P/FCF": "P/FCF 是股價對自由現金流的倍數。若現金流品質穩定，通常越低越便宜。",
					毛利率: "毛利率越高，通常代表定價能力、產品組合或成本結構較強。",
					營業利益率: "營業利益率越高，通常代表經營效率、規模效應或費用控管更好。",
					現價: "目前市場價格，用來當不同估值框架的比較基準。",
					平均目標價: "分析師平均目標價可當參考，但不是內在價值本身。",
				};

	function explainChip(item) {
		for (const [key, tip] of Object.entries(chipTips)) {
			if (item.startsWith(key)) return tip;
		}
		return null;
	}

	function renderEvidence(items) {
		return items.map((item) => {
			const tip = explainChip(item);
			return (
				<span key={item} className="metricChip">
					<span className="metricChipLabel">{item}</span>
					{tip ? <TooltipHint content={tip} ariaLabel={`${item} 說明`} iconSize={13} /> : null}
				</span>
			);
		});
	}

	return (
		<div className="reportTabPanel">
			<section className="analysisSection methodBox">
				<div>
					<SectionTitle title={t.valuationMethod} tip={text.valuationMethodTip} />
					<strong>{quote.valuationMethod.primary}</strong>
					<p>{quote.valuationMethod.why}</p>
				</div>
				<div className="methodEvidence">
					{quote.valuationMethod.evidence.length ? renderEvidence(quote.valuationMethod.evidence) : <span>資料不足</span>}
				</div>
			</section>

			<section className="analysisSection">
				<SectionTitle title={t.valuationModels} tip={text.valuationModelsTip} />
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
						<div className="methodEvidence">{renderEvidence(activeModel.inputs)}</div>
					</div>
				) : null}
			</section>

			<section className="analysisSection">
				<SectionTitle title={t.catalystTimeline} tip={text.catalystTimelineTip} />
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

			<section className="analysisSection">
				<SectionTitle title={t.targetPrice} tip={text.targetPriceTip} />
				<div className="zones">
					<Info label={text.targetMeanPrice} value={quote.formatted.targetMeanPrice || "N/A"} tip={text.targetMeanPriceTip} />
					<Info label={text.targetGap} value={quote.fundamentals.priceTargetChange || "N/A"} tip={text.targetGapTip} />
					<Info label={text.recommendation} value={quote.formatted.recommendation || "N/A"} tip={text.recommendationTip} />
				</div>
			</section>

			<section className="analysisSection">
				<SectionTitle title={text.peterLynch} tip={text.peterLynchTip} />
				<div className="zones">
					<Info label={text.fairValue} value={peterLynch.fairValueDisplay || "N/A"} tip={text.fairValueTip} />
					<Info label={text.ratio} value={peterLynch.ratioDisplay || "N/A"} tip={text.ratioTip} />
					<Info label={text.fairPe} value={peterLynch.fairPeDisplay || "N/A"} tip={text.fairPeTip} />
					<Info label={text.baseEps} value={peterLynch.baseEpsDisplay || "N/A"} tip={text.baseEpsTip} />
					<Info label={text.growthBase} value={peterLynch.growthRateDisplay || "N/A"} tip={text.growthBaseTip} />
					<Info label={text.formula} value={text.formulaValue} tip={text.formulaTip} />
				</div>
				<p className="ownershipNote">
					{text.statusLabels[peterLynch.status || "insufficient"]} ·{" "}
					{text.sourceLabels[peterLynch.sourceKey] || text.statusLabels.insufficient}
				</p>
			</section>

			<section className="analysisSection">
				<SectionTitle title={t.priceZones} tip={text.priceZonesTip} />
				<div className="zones">
					<Info label={text.idealPrice} value={quote.zones.ideal} tip={text.idealPriceTip} />
					<Info label={text.buyPrice} value={quote.zones.buy} tip={text.buyPriceTip} />
					<Info label={text.watchPrice} value={quote.zones.watch} tip={text.watchPriceTip} />
				</div>
			</section>
		</div>
	);
}
