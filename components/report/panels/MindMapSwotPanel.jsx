import { InvestmentMindMap } from "../shared/InvestmentMindMap";

export function MindMapSwotPanel({ quote, t, language, updatedAt }) {
	const swot = quote.profile.swot || { s: [], w: [], o: [], t: [] };

	return (
		<div className="reportTabPanel">
			<InvestmentMindMap quote={quote} t={t} language={language} />

			<section className="analysisSection swotSection">
				<h3>{t.swot}</h3>
				<div className="swotGrid">
					<div className="swotItem s">
						<h4>{t.swotS}</h4>
						<ul>
							{swot.s.map((item, i) => (
								<li key={i}>{item}</li>
							))}
						</ul>
					</div>
					<div className="swotItem w">
						<h4>{t.swotW}</h4>
						<ul>
							{swot.w.map((item, i) => (
								<li key={i}>{item}</li>
							))}
						</ul>
					</div>
					<div className="swotItem o">
						<h4>{t.swotO}</h4>
						<ul>
							{swot.o.map((item, i) => (
								<li key={i}>{item}</li>
							))}
						</ul>
					</div>
					<div className="swotItem t">
						<h4>{t.swotT}</h4>
						<ul>
							{swot.t.map((item, i) => (
								<li key={i}>{item}</li>
							))}
						</ul>
					</div>
				</div>
			</section>
		</div>
	);
}
