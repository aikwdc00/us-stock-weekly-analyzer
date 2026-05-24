import { Info } from "../shared/Info";

export function ValuationPanel({ quote, t, activeModel, setSelectedModel }) {
	return (
		<div className="reportTabPanel">
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
		</div>
	);
}
