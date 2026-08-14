import { AnalysisBlock } from "../shared/AnalysisBlock";
import { Info } from "../shared/Info";
import { PeerTable } from "../shared/PeerTable";
import { useIndustryPeers } from "../../../hooks/useIndustryPeers";
import { translateTerm } from "../../../lib/translationMap";
import { Icon } from "../../shared/Icon";

export function IndustryPanel({ quote, language, t }) {
	const { peers: industryPeers, isLoading: isLoadingPeers } = useIndustryPeers(quote.symbol);
	const peerItems = industryPeers.map((peer) => (peer?.symbol ? `${peer.symbol} · ${peer.name || peer.symbol}` : null)).filter(Boolean);
	const competitorItems = peerItems.length ? peerItems : quote.profile.competitors || [];

	return (
		<div className="reportTabPanel">
			<section className="analysisGrid">
				<AnalysisBlock
					title={t.industry || "產業分類"}
					items={[translateTerm(quote.profile.sector, language), translateTerm(quote.profile.industry, language)].filter(Boolean)}
					emptyLabel={t.insufficientEvidence}
				/>
				<AnalysisBlock title={t.competitorWatchlist} items={competitorItems} />
				<div className="analysisCard">
					<div className="sectionTitle">
						<h3>{t.companySummary}</h3>
					</div>
					<p className="summaryText">{quote.profile.description ? `${quote.profile.description.slice(0, 300)}...` : t.noDescription}</p>
				</div>
			</section>

			<section className="analysisSection analysisSectionScroll">
				<h3>{t.industryPeers}</h3>

				{isLoadingPeers ? (
					<p>{t.industryLoading}</p>
				) : industryPeers.length ? (
					<PeerTable quotes={industryPeers} language={language} t={t} />
				) : (
					<div className="analysisCardTags">
						{competitorItems.map((item) => (
							<span key={item}>{item}</span>
						))}
					</div>
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
								<Icon name="ExternalLink" size={14} />
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
