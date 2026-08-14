"use client";

import { AppNav } from "../layout/AppNav";
import { IdeasRail } from "../layout/IdeasRail";
import { BackToTopButton } from "../shared/BackToTopButton";
import { Icon } from "../shared/Icon";
import { useStockAnalyzer } from "../../hooks/useStockAnalyzer";
import { cls } from "../../hooks/utils";

export function ExploreWorkspace() {
	const analyzer = useStockAnalyzer();
	const {
		language,
		theme,
		toggleTheme,
		t,
		watchlist,
		recommendationGroups,
		recommendationsUpdatedAt,
		isLoadingRecommendations,
		hasRecommendationItems,
		addSymbol,
		refreshIdeas,
		error,
	} = analyzer;
	const candidateCount = new Set(recommendationGroups.flatMap((group) => (group.items || []).map((item) => item.symbol))).size;

	return (
		<main className="shell exploreShell">
			<section className="topbar exploreTopbar">
				<div>
					<p className="eyebrow">Market discovery</p>
					<h1>{t.ideas}</h1>
					<p className="subtitle">從公開候選池與週報規則找出值得進一步研究的標的。</p>
				</div>
				<div className="topActions">
					<button className="themeToggle" onClick={toggleTheme} type="button">
						{theme === "dark" ? <Icon name="Sun" size={17} /> : <Icon name="Moon" size={17} />}
						{theme === "dark" ? t.lightMode : t.darkMode}
					</button>
					<button className="primaryButton" onClick={() => refreshIdeas()} disabled={isLoadingRecommendations} type="button">
						<Icon name="RefreshCw" size={17} className={cls(isLoadingRecommendations && "spin")} />
						{isLoadingRecommendations ? t.refreshing : t.dynamicIdeas}
					</button>
				</div>
			</section>

			<AppNav active="discover" />
			{error ? <div className="alert">{error}</div> : null}

			<section className="exploreLayout">
				<section className="exploreIntro">
					<p className="eyebrow">Research candidates</p>
					<h2>探索標的</h2>
					<p>{t.ideaBasisText}</p>
					<div className="exploreStats" aria-label="探索摘要">
						<div>
							<strong>{candidateCount}</strong>
							<span>目前候選</span>
						</div>
						<div>
							<strong>{watchlist.length}</strong>
							<span>已追蹤</span>
						</div>
					</div>
					<div className="exploreStatus">
						<span className={isLoadingRecommendations ? "statusDot loading" : "statusDot"} />
						{isLoadingRecommendations ? t.loadingIdeas : `${candidateCount} 個候選標的可供研究`}
					</div>
				</section>

				<IdeasRail
					t={t}
					language={language}
					refreshIdeas={refreshIdeas}
					isLoadingRecommendations={isLoadingRecommendations}
					recommendationsUpdatedAt={recommendationsUpdatedAt}
					recommendationGroups={recommendationGroups}
					hasRecommendationItems={hasRecommendationItems}
					watchlist={watchlist}
					addSymbol={addSymbol}
				/>
			</section>

			<footer className="appFooter">
				<span>© 2026 Fred Li. All rights reserved.</span>
				<span>{t.footer}</span>
			</footer>
			<BackToTopButton label={t.backToTop} />
		</main>
	);
}
