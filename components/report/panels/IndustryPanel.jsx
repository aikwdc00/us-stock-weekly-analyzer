import { ExternalLink } from "lucide-react";
import { AnalysisBlock } from "../shared/AnalysisBlock";
import { Info } from "../shared/Info";
import { PeerTable } from "../shared/PeerTable";

export function IndustryPanel({ quote, peerQuotes, language, t }) {
  return (
    <div className="reportTabPanel">
      <section className="analysisGrid">
        <AnalysisBlock title="競爭格局" items={quote.profile.competitors} />
        <AnalysisBlock title="供應鏈與夥伴" items={quote.profile.suppliers} />
        <AnalysisBlock title="客戶與需求" items={quote.profile.customers} />
      </section>

      <section className="analysisSection analysisSectionScroll">
        <h3>{t.peerCompare}</h3>
        <PeerTable quotes={peerQuotes} selectedSymbol={quote.symbol} language={language} />
      </section>

      <section className="analysisSection">
        <h3>{t.moat}</h3>
        <p>{quote.profile.moat}</p>
      </section>

      <section className="analysisSection">
        <h3>{t.ownership}</h3>
        <div className="zones">
          <Info label="內部人持股" value={quote.ownership.insiders} />
          <Info label="法人持股" value={quote.ownership.institutions} />
          <Info
            label="異動資料"
            value={
              quote.ownership.filings?.length ? `${quote.ownership.filings.length} 筆 SEC ownership filings` : "近期未抓到 Form 3/4/5"
            }
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
                <small>Report date: {filing.reportDate || "N/A"}</small>
                <ExternalLink size={14} />
              </a>
            ))}
          </div>
        ) : null}
      </section>

      <section className="analysisSection">
        <h3>{t.risks}</h3>
        <ul className="riskList">
          <li>估值已反映部分成長預期，財報或指引放緩會提高波動。</li>
          <li>競爭對手、供應鏈瓶頸、客戶自研或需求轉弱可能影響毛利與成長。</li>
          <li>利率、監管、地緣政治與市場題材退燒可能造成估值壓縮。</li>
        </ul>
      </section>
    </div>
  );
}
