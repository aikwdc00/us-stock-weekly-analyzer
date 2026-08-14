export function AnalysisBlock({ title, items, emptyLabel = "資料不足" }) {
	const normalizedItems = Array.isArray(items) ? items.filter(Boolean) : [];

	return (
		<section className="analysisCard">
			<h3>{title}</h3>
			{normalizedItems.length ? (
				<div className="analysisCardTags">
					{normalizedItems.map((item) => (
						<span key={item}>{item}</span>
					))}
				</div>
			) : (
				<p className="evidenceEmpty">{emptyLabel}</p>
			)}
		</section>
	);
}
