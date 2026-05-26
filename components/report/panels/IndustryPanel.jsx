import { ExternalLink } from "lucide-react";
import { AnalysisBlock } from "../shared/AnalysisBlock";
import { Info } from "../shared/Info";
import { PeerTable } from "../shared/PeerTable";
import { TooltipHint } from "../shared/TooltipHint";
import { useIndustryPeers } from "../../../hooks/useIndustryPeers";
import { displayValue } from "../../../hooks/utils";
import { translateTerm } from "../../../lib/translationMap";

export function IndustryPanel({ quote, peerQuotes, language, t }) {
	const { peers: industryPeers, isLoading: isLoadingPeers } = useIndustryPeers(quote.symbol);

	return (
		<div className="reportTabPanel">
			<section className="analysisGrid">
				<AnalysisBlock
					title={t.industry || "產業分類"}
					items={[translateTerm(quote.profile.sector, language), translateTerm(quote.profile.industry, language)].filter(Boolean)}
				/>
				<AnalysisBlock title={t.competitorWatchlist} items={quote.profile.competitors} />
				<div className="analysisCard">
					<div className="sectionTitle">
						<h3>{t.companySummary}</h3>
						{quote.fundamentals.sourceUrl && (
							<a
								href={quote.fundamentals.sourceUrl.replace("/statistics/", "/")}
								target="_blank"
								rel="noreferrer"
								className="sourceIconLink"
							>
								<ExternalLink size={14} />
							</a>
						)}
					</div>
					<p className="summaryText">{quote.profile.description ? `${quote.profile.description.slice(0, 300)}...` : t.noDescription}</p>
				</div>
			</section>

			<section className="analysisSection analysisSectionScroll">
				<h3>{t.watchlistCompare}</h3>
				<PeerTable quotes={peerQuotes} selectedSymbol={quote.symbol} language={language} t={t} />
			</section>

			{/* 新增的同業比較區塊 */}
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
				) : (
					<p>{t.industryEmpty}</p>
				)}
			</section>

			<section className="analysisSection">
				<h3>{t.moat}</h3>
				<p>{quote.profile.moat}</p>
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
								<ExternalLink size={14} />
							</a>
						))}
					</div>
				) : null}
			</section>

			<section className="analysisSection">
				<h3>{t.risks}</h3>
				<ul className="riskList">
					{(quote.profile.risks || []).map((risk, index) => (
						<li key={index}>{risk}</li>
					))}
				</ul>
			</section>
		</div>
	);
}
