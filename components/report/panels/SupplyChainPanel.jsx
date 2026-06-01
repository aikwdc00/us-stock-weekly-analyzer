import { TooltipHint } from "../shared/TooltipHint";

function normalizeSupplyChainItem(item) {
	if (typeof item === "string") {
		return { name: item, role: "" };
	}

	return {
		name: item?.name || "",
		role: item?.role || "",
	};
}

function CompanyList({ title, description, items, tip }) {
	return (
		<section className="analysisCard supplyChainColumn">
			<div className="sectionTitle">
				<h3>{title}</h3>
				{tip ? <TooltipHint content={tip} ariaLabel={`${title} 說明`} /> : null}
			</div>
			<p className="summaryText">{description}</p>
			<div className="supplyChainItems">
				{items.map((rawItem) => {
					const item = normalizeSupplyChainItem(rawItem);
					return (
						<div key={`${item.name}-${item.role}`} className="supplyChainItem">
							<strong className="supplyChainItemName">{item.name}</strong>
							{item.role ? <span className="supplyChainItemRole">{item.role}</span> : null}
						</div>
					);
				})}
			</div>
		</section>
	);
}

export function SupplyChainPanel({ quote, language, t }) {
	const supplyChain = quote.profile.supplyChain || {};
	const upstreamItems = supplyChain.upstream?.length
		? supplyChain.upstream
		: quote.profile.suppliers?.length
			? quote.profile.suppliers
			: [language === "en" ? "Need more supplier context" : "需補充上游供應商"];
	const downstreamItems = supplyChain.downstream?.length
		? supplyChain.downstream
		: quote.profile.customers?.length
			? quote.profile.customers
			: [language === "en" ? "Need more customer context" : "需補充下游客戶"];

	return (
		<div className="reportTabPanel">
			<section className="analysisSection supplyChainIntro">
				<div className="sectionTitle">
					<h3>{t.supplyChainView}</h3>
					<TooltipHint content={t.supplyChainTip} ariaLabel={`${t.supplyChainView} 說明`} />
				</div>
				<p>{t.supplyChainNote}</p>
				{quote.profile.supplyChain?.note ? <p className="supplyChainDisclosure">{quote.profile.supplyChain.note}</p> : null}
				<div className="supplyChainCurrent">
					<span>{t.currentPosition}</span>
					<strong>{quote.symbol}</strong>
					<small>{quote.name}</small>
				</div>
			</section>

			<section className="supplyChainGrid">
				<CompanyList
					title={t.upstreamPartners}
					description={t.upstreamDescription}
					items={upstreamItems}
					tip={t.upstreamTip}
				/>
				<CompanyList
					title={t.downstreamCustomers}
					description={t.downstreamDescription}
					items={downstreamItems}
					tip={t.downstreamTip}
				/>
			</section>
		</div>
	);
}
