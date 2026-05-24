import { Download } from "lucide-react";
import { cls, displayValue, downloadMarkdown } from "../../hooks/utils";

export function ReportHeader({ quote, language, t }) {
	const isUp = quote.changePercent >= 0;

	return (
		<>
			<header className="reportHero">
				<div>
					<p className="eyebrow">{quote.exchange}</p>
					<h2>
						{quote.symbol}
						<span>{quote.name}</span>
					</h2>
				</div>
				<div className="priceBlock">
					<strong>{quote.formatted.price || "N/A"}</strong>
					<span className={cls(isUp ? "up" : "down")}>{quote.formatted.changePercent || "N/A"}</span>
				</div>
			</header>

			<div className="decisionBar">
				<div>
					<span>{t.finalRating}</span>
					<strong>{displayValue(quote.rating, language)}</strong>
				</div>
				<div>
					<span>{t.valuation}</span>
					<strong>{displayValue(quote.valuation, language)}</strong>
				</div>
				<div>
					<span>{t.technical}</span>
					<strong>{displayValue(quote.trend, language)}</strong>
				</div>
				<button type="button" onClick={() => downloadMarkdown(quote, language)}>
					<Download size={17} />
					{t.exportMd}
				</button>
			</div>
		</>
	);
}
