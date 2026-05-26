import { InvestmentMindMap } from "../shared/InvestmentMindMap";
import { TooltipHint } from "../shared/TooltipHint";

import { formatDate } from "../../../hooks/utils";

export function MindMapSwotPanel({ quote, t, language, updatedAt }) {
	const swot = quote.profile.swot;

	return (
		<div className="reportTabPanel">
			<InvestmentMindMap quote={quote} t={t} language={language} />

			{swot && (
				<section className="analysisSection swotSection">
					<div className="sectionTitle">
						<h3>{t.swot}</h3>
						<TooltipHint content={`${t.dataSource}: ${t.marketDataSourceHint}`} />
					</div>
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
					<p className="swotSource">{t.dataSource}: StockAnalysis / Yahoo Finance Consensus</p>
					<p className="swotSource">AI: {quote.profile?.aiSupplement?.enabled ? t.aiEnabled : t.aiDisabled}</p>
					<p className="swotSource">
						{t.lastUpdated}: {formatDate(updatedAt, language, t.notUpdated)}
					</p>
				</section>
			)}
		</div>
	);
}
