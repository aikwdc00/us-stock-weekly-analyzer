import { AnalysisBlock } from "../shared/AnalysisBlock";
import { Info } from "../shared/Info";
import { PeerTable } from "../shared/PeerTable";
import { TooltipHint } from "../shared/TooltipHint";
import { useIndustryPeers } from "../../../hooks/useIndustryPeers";
import { translateTerm } from "../../../lib/translationMap";
import { Icon } from "../../shared/Icon";

export function IndustryPanel({ quote, language, t }) {
	const { peers: industryPeers, isLoading: isLoadingPeers, error: peerError } = useIndustryPeers(quote.symbol);

	return (
		<div className="reportTabPanel">
			<section className="analysisGrid">
				<AnalysisBlock
					title={t.industry || "產業分類"}
					items={[translateTerm(quote.profile.sector, language), translateTerm(quote.profile.industry, language)].filter(Boolean)}
					emptyLabel={t.insufficientEvidence}
				/>
				<AnalysisBlock title={t.competitorWatchlist} items={quote.profile.competitors} emptyLabel={t.insufficientEvidence} />
				<div className="analysisCard">
					<div className="sectionTitle">
						<h3>{t.companySummary}</h3>
						{quote.fundamentals.sourceUrl && (
							<a
								href={quote.fundamentals.sourceUrl.replace("/statistics/", "/")}
								target="_blank"
								rel="noreferrer"
								className="sourceIconLink"
								aria-label={`${t.dataSource}: ${quote.fundamentals.source || t.insufficientEvidence}`}
							>
								<Icon name="ExternalLink" size={14} />
							</a>
						)}
					</div>
					<p className="summaryText">{quote.profile.description ? `${quote.profile.description.slice(0, 300)}...` : t.noDescription}</p>
				</div>
			</section>

			<section className="analysisSection analysisSectionScroll">
				<div className="sectionTitle">
					<h3>{t.industryPeers}</h3>
					<TooltipHint
						content={
							<>
								{t.peerSource}: Yahoo Finance Recommendations
								<br />
								{t.dataSource}: StockAnalysis
							</>
						}
					/>
				</div>

				{isLoadingPeers ? (
					<p>{t.industryLoading}</p>
				) : industryPeers.length ? (
					<PeerTable quotes={industryPeers} language={language} t={t} />
				) : peerError ? (
					<p>{t.industryUnavailable}</p>
				) : (
					<p>{t.industryEmpty}</p>
				)}
			</section>

			<section className="analysisSection">
				<h3>{t.moat}</h3>
				<p>{quote.profile.moat || t.insufficientEvidence}</p>
			</section>

			<section className="analysisSection">
				<h3>{t.ownership}</h3>
				<div className="zones">
					<Info label={language === "zh" ? "內部人持股" : "Insider Ownership"} value={quote.ownership.insiders} />
					<Info label={language === "zh" ? "法人持股" : "Institutional Ownership"} value={quote.ownership.institutions} />
					<Info
						label={t.ownershipChanges}
						value={quote.ownership.filings?.length ? `${quote.ownership.filings.length} SEC ownership filings` : t.recentNoForm345}
					/>
				</div>
				<p className="ownershipNote">{quote.ownership.transactionNote}</p>
				{quote.ownership.filings?.length ? (
					<div className="ownershipFilings">
						{quote.ownership.filings.slice(0, 6).map((filing) => (
							<a key={filing.accessionNumber} href={filing.indexUrl} target="_blank" rel="noreferrer">
								<span>
									{filing.filingDate}｜{filing.form}
								</span>
								<strong>{filing.description}</strong>
								<small>
									{t.reportDate}: {filing.reportDate || "N/A"}
								</small>
								<Icon name="ExternalLink" size={14} />
							</a>
						))}
					</div>
				) : null}
			</section>

			<section className="analysisSection">
				<h3>{t.risks}</h3>
				{quote.profile.risks?.length ? (
					<ul className="riskList">
						{quote.profile.risks.map((risk, index) => (
							<li key={index}>{risk}</li>
						))}
					</ul>
				) : (
					<p className="evidenceEmpty">{t.insufficientEvidence}</p>
				)}
				{quote.fundamentals.sourceUrl ? (
					<a className="sourceLink" href={quote.fundamentals.sourceUrl} target="_blank" rel="noreferrer">
						{t.dataSource}: {quote.fundamentals.source || t.insufficientEvidence}
						<Icon name="ExternalLink" size={14} />
					</a>
				) : null}
			</section>
		</div>
	);
}
