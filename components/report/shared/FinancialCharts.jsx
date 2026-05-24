function Legend({ series }) {
  return (
    <div className="chartLegend">
      {series.map((item) => (
        <span key={item.key}>
          <i style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function LineChart({ points, series }) {
  const width = 640;
  const height = 220;
  const padding = 28;
  const max = Math.max(...points.flatMap((point) => series.map((item) => point[item.key] || 0)));
  const min = Math.min(0, ...points.flatMap((point) => series.map((item) => point[item.key] || 0)));
  const span = max - min || 1;

  const x = (index) => padding + (index * (width - padding * 2)) / Math.max(points.length - 1, 1);
  const y = (value) => height - padding - (((value || 0) - min) / span) * (height - padding * 2);

  return (
    <div className="svgChart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} />
        {series.map((item) => {
          const d = points.map((point, index) => `${index === 0 ? "M" : "L"} ${x(index)} ${y(point[item.key])}`).join(" ");
          return <path key={item.key} d={d} style={{ stroke: item.color }} />;
        })}
        {points.map((point, index) => (
          <text key={point.label} x={x(index)} y={height - 6} textAnchor="middle">
            {String(point.label).replace("20", "'")}
          </text>
        ))}
      </svg>
      <Legend series={series} />
    </div>
  );
}

function StreamChart({ points, series }) {
  const width = 640;
  const height = 220;
  const padding = 28;
  const totals = points.map((point) => series.reduce((sum, item) => sum + Math.abs(point[item.key] || 0), 0));
  const max = Math.max(...totals, 1);
  const bandWidth = (width - padding * 2) / points.length;

  return (
    <div className="svgChart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img">
        {points.map((point, pointIndex) => {
          let yCursor = height - padding;
          return series.map((item) => {
            const value = Math.abs(point[item.key] || 0);
            const barHeight = (value / max) * (height - padding * 2);
            yCursor -= barHeight;
            return (
              <rect
                key={`${point.label}-${item.key}`}
                x={padding + pointIndex * bandWidth + 6}
                y={yCursor}
                width={Math.max(bandWidth - 12, 8)}
                height={barHeight}
                rx="4"
                style={{ fill: item.color }}
              />
            );
          });
        })}
        {points.map((point, index) => (
          <text key={point.label} x={padding + index * bandWidth + bandWidth / 2} y={height - 6} textAnchor="middle">
            {String(point.label).replace("20", "'")}
          </text>
        ))}
      </svg>
      <Legend series={series} />
    </div>
  );
}

export function FinancialCharts({ chart }) {
  const points = (chart || []).filter((point) => Number.isFinite(point.revenue));
  if (!points.length) return null;

  return (
    <div className="chartGrid">
      <div className="chartCard">
        <h4>營收 / 營業利益 / 淨利</h4>
        <LineChart
          points={points}
          series={[
            { key: "revenue", label: "營收", color: "#2563eb" },
            { key: "operatingIncome", label: "營業利益", color: "#117c8b" },
            { key: "netIncome", label: "淨利", color: "#0f8a5f" }
          ]}
        />
      </div>
      <div className="chartCard">
        <h4>成本結構河流圖</h4>
        <StreamChart
          points={points}
          series={[
            { key: "costOfRevenue", label: "營收成本", color: "#d97706" },
            { key: "operatingExpenses", label: "營業費用", color: "#7c3aed" },
            { key: "netIncome", label: "淨利", color: "#0f8a5f" }
          ]}
        />
      </div>
    </div>
  );
}
