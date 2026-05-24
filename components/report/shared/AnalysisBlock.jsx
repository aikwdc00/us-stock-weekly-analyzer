export function AnalysisBlock({ title, items }) {
  return (
    <section className="analysisCard">
      <h3>{title}</h3>
      <div className="analysisCardTags">
        {items.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </section>
  );
}
