import { displayValue } from "../../../hooks/utils";

export function PeerTable({ quotes, selectedSymbol, language }) {
  const rows = quotes.filter(Boolean);
  if (!rows.length) return <p>目前沒有可比較標的。</p>;

  return (
    <div className="peerTableWrap">
      <table className="peerTable">
        <thead>
          <tr>
            <th>標的</th>
            <th>市值</th>
            <th>PE</th>
            <th>Forward PE</th>
            <th>PS</th>
            <th>FCF Yield</th>
            <th>營收成長</th>
            <th>毛利率</th>
            <th>淨利率</th>
            <th>目標價差距</th>
            <th>評級</th>
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
