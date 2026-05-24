import { Check, ListPlus, RefreshCw } from "lucide-react";
import { cls, formatDate } from "../../hooks/utils";

export function IdeasRail({
	t,
	language,
	refreshIdeas,
	isLoadingRecommendations,
	recommendationsUpdatedAt,
	recommendationGroups,
	hasRecommendationItems,
	watchlist,
	addSymbol,
}) {
	return (
		<aside className="panel rightRail">
			<div className="panelHeader">
				<div>
					<p className="eyebrow">Ideas</p>
					<h2>{t.ideas}</h2>
				</div>
				<button className="railRefresh" onClick={() => refreshIdeas()} disabled={isLoadingRecommendations}>
					<RefreshCw size={15} className={cls(isLoadingRecommendations && "spin")} />
					{t.dynamicIdeas}
				</button>
			</div>

			<div className="suggestionBasis">
				<strong>{t.ideaBasis}</strong>
				<p>{t.ideaBasisText}</p>
				<small>
					{t.ideasUpdated}: {formatDate(recommendationsUpdatedAt)}
				</small>
			</div>

			<div className="suggestionGroups">
				{isLoadingRecommendations && !recommendationGroups.length ? (
					<section className="suggestionGroup">
						<h3>{t.loadingIdeas}</h3>
						<p>{t.ideaBasisText}</p>
					</section>
				) : null}
				{!isLoadingRecommendations && !hasRecommendationItems ? (
					<section className="suggestionGroup">
						<h3>{t.noIdeas}</h3>
						<p>{t.ideaBasisText}</p>
					</section>
				) : null}
				{recommendationGroups.map((group) => (
					<section key={group.id} className="suggestionGroup">
						<h3>{language === "en" ? group.titleEn : group.title}</h3>
						<p>{language === "en" ? group.criteriaEn : group.criteria}</p>
						<div className="suggestions">
							{(group.items || []).map((item) => (
								<button
									key={`${group.id}-${item.symbol}`}
									className="suggestionItem"
									onClick={() => addSymbol(item.symbol)}
									disabled={watchlist.includes(item.symbol)}
								>
									<span className="suggestionItemBody">
										<strong>{item.symbol}</strong>
										<small>{item.name}</small>
										<em>
											{t.score} {item.score} · {item.valuation} · {item.revenueGrowth}
										</em>
									</span>
									<span className="suggestionItemAction">
										{watchlist.includes(item.symbol) ? <Check size={16} /> : <ListPlus size={16} />}
									</span>
								</button>
							))}
						</div>
						<div className="suggestionReasons">
							{(group.items || []).slice(0, 3).map((item) => (
								<p key={`${group.id}-${item.symbol}-reason`}>
									<strong>{item.symbol}</strong>
									{item.reasons.join("、")}
								</p>
							))}
						</div>
					</section>
				))}
			</div>
		</aside>
	);
}
