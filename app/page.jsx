"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AppNav } from "../components/layout/AppNav";
import { IdeasRail } from "../components/layout/IdeasRail";
import { StockReport } from "../components/report/StockReport";
import { BackToTopButton } from "../components/shared/BackToTopButton";
import { Icon } from "../components/shared/Icon";
import { useStockAnalyzer } from "../hooks/useStockAnalyzer";
import { cls } from "../hooks/utils";

function PageContent() {
	const searchParams = useSearchParams();
	const requestedSymbol = searchParams.get("symbol");
	const analyzer = useStockAnalyzer({ preferredSymbol: requestedSymbol });
	const {
		language,
		setLanguage,
		theme,
		toggleTheme,
		t,
		watchlist,
		selectedSymbol,
		setSelectedSymbol,
		updatedAt,
		isLoading,
		error,
		dataWarning,
		recommendationGroups,
		recommendationsUpdatedAt,
		isLoadingRecommendations,
		hasRecommendationItems,
		selectedQuote,
		runAiAnalysis,
		isAiLoading,
		coverageStats,
		addSymbol,
		removeSymbol,
		refreshAll,
		refreshIdeas,
	} = analyzer;

	useEffect(() => {
		if (!requestedSymbol && selectedSymbol && !watchlist.includes(selectedSymbol)) {
			setSelectedSymbol(watchlist[0] || "");
		}
	}, [requestedSymbol, selectedSymbol, setSelectedSymbol, watchlist]);

	return (
		<main className="shell">
			<section className="topbar">
				<div>
					<p className="eyebrow">US Stock Weekly Analyzer</p>
					<h1>{t.appTitle}</h1>
					<p className="subtitle">{t.subtitle}</p>
				</div>
				<div className="topRight">
					<span className="timestamp topTimestamp">
						{t.lastUpdated}:{" "}
						{updatedAt
							? new Intl.DateTimeFormat(language === "en" ? "en-US" : "zh-TW", {
									dateStyle: "medium",
									timeStyle: "medium",
									hour12: language === "en",
								}).format(new Date(updatedAt))
							: t.notUpdated}
					</span>
					<div className="topActions">
						<div className="languageToggle" aria-label="Language">
							<Icon name="Languages" size={17} />
							<button className={language === "zh" ? "active" : ""} onClick={() => setLanguage("zh")}>
								中
							</button>
							<button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>
								EN
							</button>
						</div>
						<button className="themeToggle" onClick={toggleTheme}>
							{theme === "dark" ? <Icon name="Sun" size={17} /> : <Icon name="Moon" size={17} />}
							{theme === "dark" ? t.lightMode : t.darkMode}
						</button>
						<button className="primaryButton" onClick={() => refreshAll()} disabled={isLoading}>
							<Icon name="RefreshCw" size={18} className={cls(isLoading && "spin")} />
							{isLoading ? t.refreshing : t.refresh}
						</button>
					</div>
				</div>
			</section>

			<section className="metricGrid">
				<div className="metric">
					<Icon name="Activity" size={20} />
					<span>{t.tracked}</span>
					<strong>{watchlist.length}</strong>
				</div>
				<div className="metric">
					<Icon name="ShieldCheck" size={20} />
					<span>{t.loaded}</span>
					<strong>{coverageStats.loaded}</strong>
				</div>
				<div className="metric">
					<Icon name="CircleDollarSign" size={20} />
					<span>{t.positive}</span>
					<strong>{coverageStats.positive}</strong>
				</div>
				<div className="metric">
					<Icon name="BarChart3" size={20} />
					<span>{t.avgMove}</span>
					<strong>{Number.isFinite(coverageStats.avgMove) ? `${coverageStats.avgMove.toFixed(2)}%` : "N/A"}</strong>
				</div>
			</section>

			{error ? <div className="alert">{error}</div> : null}
			{dataWarning ? (
				<div className="notice">
					<strong>{t.updateWarningPrefix}</strong>
					<span>{dataWarning}</span>
				</div>
			) : null}

			<AppNav active="overview" />

			<section className="workspace">
				<section className="mainPanel">
					{selectedQuote ? (
						<StockReport
							quote={selectedQuote}
							language={language}
							t={t}
							updatedAt={updatedAt}
							runAiAnalysis={runAiAnalysis}
							isAiLoading={isAiLoading}
						/>
					) : selectedSymbol ? (
						<div className="emptyState">
							<Icon name="RefreshCw" size={30} className={cls(isLoading && "spin")} />
							<h2>{t.loadingReport}</h2>
							<p>{t.loadingReportHint}</p>
						</div>
					) : (
						<div className="emptyState">
							<Icon name="Sparkles" size={30} />
							<h2>{t.addFirst}</h2>
							<p>{t.addFirstHint}</p>
						</div>
					)}
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

export default function Page() {
	return (
		<Suspense fallback={<main className="shell" aria-busy="true" />}>
			<PageContent />
		</Suspense>
	);
}
