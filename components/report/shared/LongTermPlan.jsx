export function LongTermPlan({ quote, t }) {
	const customers = quote.profile.customers || [];
	const suppliers = quote.profile.suppliers || [];
	const pillars = [
		quote.profile.theme,
		quote.profile.moat,
		customers.length ? `${t.strategicPillars}: ${customers.slice(0, 3).join("、")}` : null,
		suppliers.length ? `${t.executionSignals}: ${suppliers.slice(0, 3).join("、")}` : null,
	].filter(Boolean);
	const signals = (quote.catalystTimeline || []).slice(0, 5);
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
