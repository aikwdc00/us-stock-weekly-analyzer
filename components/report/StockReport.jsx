"use client";

import { useValuationModel } from "../../hooks/useValuationModel";
import { useReportTabs } from "../../hooks/useReportTabs";
import { ReportHeader } from "./ReportHeader";
import { ReportTabs } from "./ReportTabs";

export function StockReport({ quote, peerQuotes, language, t }) {
  const { activeTab, setActiveTab, tabs } = useReportTabs(quote.symbol, t);
  const { activeModel, setSelectedModel } = useValuationModel(quote);

  return (
    <article className="report">
      <ReportHeader quote={quote} language={language} t={t} />
      <ReportTabs
        quote={quote}
        peerQuotes={peerQuotes}
        language={language}
        t={t}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeModel={activeModel}
        setSelectedModel={setSelectedModel}
      />
    </article>
  );
}
