import { displayValue } from "../../../hooks/utils";

export function PeerTable({ quotes, selectedSymbol, language, t }) {
  const rows = quotes.filter(Boolean);
  if (!rows.length) return <p>目前沒有可比較標的。</p>;

  // Fallback if t is not provided (though it should be)
  const headers = {
    symbol: t?.tableSymbol || "Symbol",
    marketCap: t?.tableMarketCap || "Market Cap",
    pe: t?.tablePE || "PE",
    forwardPe: t?.tableForwardPE || "Forward PE",
    ps: t?.tablePS || "PS",
    fcfYield: t?.tableFCFYield || "FCF Yield",
    revGrowth: t?.tableRevGrowth || "Rev Growth",
    grossMargin: t?.tableGrossMargin || "Gross Margin",
    netMargin: t?.tableNetMargin || "Net Margin",
    priceTarget: t?.tablePriceTarget || "Target Gap",
    rating: t?.tableRating || "Rating"
  };

  return (
    <div className="peerTableWrap">
      <table className="peerTable">
        <thead>
          <tr>
            <th>{headers.symbol}</th>
            <th>{headers.marketCap}</th>
            <th>{headers.pe}</th>
            <th>{headers.forwardPe}</th>
            <th>{headers.ps}</th>
            <th>{headers.fcfYield}</th>
            <th>{headers.revGrowth}</th>
            <th>{headers.grossMargin}</th>
            <th>{headers.netMargin}</th>
            <th>{headers.priceTarget}</th>
            <th>{headers.rating}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.symbol} className={row.symbol === selectedSymbol ? "selected" : ""}>
              <td>{row.symbol}</td>
              <td>{row.formatted.marketCap}</td>
              <td>{row.formatted.pe}</td>
              <td>{row.formatted.forwardPe}</td>
              <td>{row.formatted.ps}</td>
              <td>{row.formatted.fcfYield}</td>
              <td>{row.fundamentals.estimatedAnnualRevenueGrowth || "N/A"}</td>
              <td>{row.fundamentals.grossMargin || "N/A"}</td>
              <td>{row.fundamentals.profitMargin || "N/A"}</td>
              <td>{row.fundamentals.priceTargetChange || "N/A"}</td>
              <td>{displayValue(row.valuation, language)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
