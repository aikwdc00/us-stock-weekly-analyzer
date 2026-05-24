import { ExternalLink } from "lucide-react";
import { displayValue, getNewsUrl, thesisText } from "../../../hooks/utils";
import { Info } from "../shared/Info";
import { LongTermPlan } from "../shared/LongTermPlan";

export function OverviewPanel({ quote, language, t }) {
	return (
		<div className="reportTabPanel">
			<section className="analysisSection conclusion">
				<h3>{t.conclusion}</h3>
				<p>{thesisText(quote, language)}</p>
			</section>

			<section className="analysisSection qualityBox">
				<h3>{t.dataQuality}</h3>
				<div className="qualityLayout">
					<div className="qualityScore">
						<strong>{quote.quality.score}</strong>
						<span>{displayValue(quote.quality.status, language)}</span>
					</div>
					<div>
						<p>
							{t.fieldsReady} {quote.quality.available}/{quote.quality.total} {t.coreFields}
							{quote.quality.missing.length ? ` ${t.missing}: ${quote.quality.missing.join("、")}。` : ` ${t.completeFields}`}
						</p>
					</div>
				</div>
			</section>

			<section className="analysisSection themeBox">
				<h3>{t.themes}</h3>
				<p>{quote.profile.theme}</p>
				<div className="catalystList">
					{quote.catalysts.map((item) => (
						<span key={item}>{item}</span>
					))}
				</div>
			</section>

			<section className="analysisSection">
				<h3>{t.majorNews}</h3>
				{quote.news.length ? (
					<div className="newsList">
						{quote.news.slice(0, 5).map((item) => (
							<a key={`${item.title}-${item.time}`} href={getNewsUrl(item, quote.symbol)} target="_blank" rel="noreferrer">
								<span>
									{item.source}｜{item.time}
								</span>
								<strong>
									{item.title}
									<ExternalLink size={14} />
								</strong>
								<p>{item.text}</p>
								<em>{t.openNews}</em>
							</a>
						))}
					</div>
				) : (
					<p>{t.noNews}</p>
				)}
			</section>

			<section className="quoteGrid">
				<Info label="市值" value={quote.formatted.marketCap} />
				<Info label="成交量" value={quote.formatted.volume} />
				<Info label="PE" value={quote.formatted.pe} />
				<Info label="Forward PE" value={quote.formatted.forwardPe} />
				<Info label="PS" value={quote.formatted.ps} />
				<Info label="P/FCF" value={quote.formatted.pfcf} />
				<Info label="FCF Yield" value={quote.formatted.fcfYield} />
				<Info label="PEG" value={quote.formatted.pegRatio} />
				<Info label="50 日均線" value={quote.formatted.fiftyDay || "N/A"} />
				<Info label="200 日均線" value={quote.formatted.twoHundredDay || "N/A"} />
				<Info label="52 週區間" value={quote.formatted.range52} />
				<Info label="平均目標價" value={quote.formatted.targetMeanPrice || "N/A"} />
			</section>

			<LongTermPlan quote={quote} t={t} />
		</div>
	);
}
