function formatPlanItem(item) {
	if (typeof item === "string") return item;
	if (!item || typeof item !== "object") return null;

	const label = item.label || item.name || item.title;
	const detail = item.signal || item.role || item.detail || item.description;
	const identity = item.symbol || item.ticker ? `${item.symbol || item.ticker} · ${label || ""}`.trim() : label;
	if (identity && detail) return `${identity}：${detail}`;
	return identity || detail || null;
}

export function LongTermPlan({ quote, t }) {
	const customers = (quote.profile.customers || []).map(formatPlanItem).filter(Boolean);
	const suppliers = (quote.profile.suppliers || []).map(formatPlanItem).filter(Boolean);
	const pillars = [
		formatPlanItem(quote.profile.theme),
		formatPlanItem(quote.profile.moat),
		customers.length ? `${t.strategicPillars}: ${customers.slice(0, 3).join("、")}` : null,
		suppliers.length ? `${t.executionSignals}: ${suppliers.slice(0, 3).join("、")}` : null,
	].filter(Boolean);
	const signals = (quote.catalystTimeline || []).slice(0, 5).map(formatPlanItem).filter(Boolean);
	const metrics = [
		["Forward PE", quote.formatted.forwardPe],
		["FCF Yield", quote.formatted.fcfYield],
		["營收成長", quote.fundamentals.estimatedAnnualRevenueGrowth || "N/A"],
		["毛利率", quote.fundamentals.grossMargin || "N/A"],
		["ROIC", quote.fundamentals.roic || "N/A"],
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
					<ul>{pillars.length ? pillars.slice(0, 4).map((item) => <li key={item}>{item}</li>) : <li>{t.insufficientEvidence}</li>}</ul>
				</div>
				<div>
					<strong>{t.executionSignals}</strong>
					<ul>{signals.length ? signals.map((item) => <li key={item}>{item}</li>) : <li>{t.insufficientEvidence}</li>}</ul>
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
