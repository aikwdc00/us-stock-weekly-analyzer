import { Network } from "lucide-react";
import { displayValue } from "../../../hooks/utils";

export function InvestmentMindMap({ quote, t, language }) {
  const nodes = [
    { label: t.moat, value: quote.profile.moat },
    { label: t.themes, value: quote.profile.theme },
    {
      label: t.financials,
      value: `${quote.fundamentals.freeCashFlow || "FCF N/A"}｜${quote.fundamentals.grossMargin || "毛利率 N/A"}`
    },
    { label: t.valuation, value: `${quote.valuationMethod.primary}｜${quote.valuation}` },
    { label: t.risks, value: "估值、競爭、供應鏈、總經與監管" }
  ];

  return (
    <section className="analysisSection mindMapSection">
      <div className="sectionTitle static">
        <h3>{t.mindMap}</h3>
        <p>{t.mindMapHint}</p>
      </div>
      <div className="mindMap">
        <div className="mindMapCore">
          <Network size={20} />
          <strong>{quote.symbol}</strong>
          <span>{displayValue(quote.rating, language)}</span>
        </div>
        {nodes.map((node) => (
          <div className="mindMapNode" key={node.label}>
            <strong>{node.label}</strong>
            <p>{node.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
