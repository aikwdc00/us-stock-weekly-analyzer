import Link from "next/link";
import { cls, formatDate } from "../../hooks/utils";
import { Icon } from "../shared/Icon";

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
		<aside id="ideas-rail" className="panel rightRail">
			<div className="panelHeader">
				<div>
					<p className="eyebrow">Ideas</p>
					<h2>{t.ideas}</h2>
				</div>
				<button className="railRefresh" onClick={() => refreshIdeas()} disabled={isLoadingRecommendations}>
					<Icon name="RefreshCw" size={15} className={cls(isLoadingRecommendations && "spin")} />
					{t.dynamicIdeas}
				</button>
			</div>

			<div className="suggestionBasis">
				<strong>{t.ideaBasis}</strong>
				<p>{t.ideaBasisText}</p>
				<small>
					{t.ideasUpdated}: {formatDate(recommendationsUpdatedAt, language, t.notUpdated)}
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
						{group.selectionNote ? <small className="suggestionSelectionNote">{group.selectionNote}</small> : null}
						<div className="suggestions">
							{(group.items || []).map((item) => {
								const isTracked = watchlist.includes(item.symbol);

								return (
									<article key={`${group.id}-${item.symbol}`} className="suggestionItem">
										<Link
											className="suggestionItemPreview"
											href={{ pathname: "/", query: { symbol: item.symbol } }}
											aria-label={`${item.symbol} ${item.name || ""} ${t.tabOverview}`.trim()}
										>
											<span className="suggestionItemBody">
												<strong>{item.symbol}</strong>
												<small>{item.name}</small>
												<em>
													{t.score} {item.score} · {item.valuation} · {item.revenueGrowth}
												</em>
											</span>
										</Link>
										<button
											type="button"
											className="suggestionItemAction"
											onClick={() => addSymbol(item.symbol)}
											disabled={isTracked}
											aria-label={`${item.symbol} ${isTracked ? t.alreadyTracked : t.addToWatchlist}`}
											title={isTracked ? t.alreadyTracked : t.addToWatchlist}
										>
											<Icon name={isTracked ? "Check" : "ListPlus"} size={16} />
										</button>
									</article>
								);
							})}
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
