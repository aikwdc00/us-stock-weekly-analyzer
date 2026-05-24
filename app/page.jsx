"use client";

import { Activity, BarChart3, CircleDollarSign, Languages, Moon, RefreshCw, ShieldCheck, Sparkles, Sun } from "lucide-react";
import { IdeasRail } from "../components/layout/IdeasRail";
import { WatchlistSidebar } from "../components/layout/WatchlistSidebar";
import { StockReport } from "../components/report/StockReport";
import { useStockAnalyzer } from "../hooks/useStockAnalyzer";
import { cls } from "../hooks/utils";

export default function Page() {
	const analyzer = useStockAnalyzer();
	const {
		language,
		setLanguage,
		theme,
		toggleTheme,
		t,
		watchlist,
		selectedSymbol,
		setSelectedSymbol,
		quotes,
		updatedAt,
		isLoading,
		error,
		dataWarning,
		searchTerm,
		setSearchTerm,
		results,
		isSearching,
		searchSymbols,
		recommendationGroups,
		recommendationsUpdatedAt,
		isLoadingRecommendations,
		hasRecommendationItems,
		selectedQuote,
		coverageStats,
		addSymbol,
		removeSymbol,
		refreshAll,
		refreshIdeas,
	} = analyzer;

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
						<Languages size={17} />
						<button className={language === "zh" ? "active" : ""} onClick={() => setLanguage("zh")}>
							中
						</button>
						<button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>
							EN
						</button>
					</div>
					<button className="themeToggle" onClick={toggleTheme}>
						{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
						{theme === "dark" ? t.lightMode : t.darkMode}
					</button>
					<button className="primaryButton" onClick={() => refreshAll()} disabled={isLoading}>
						<RefreshCw size={18} className={cls(isLoading && "spin")} />
						{isLoading ? t.refreshing : t.refresh}
					</button>
					</div>
				</div>
			</section>

			<section className="metricGrid">
				<div className="metric">
					<Activity size={20} />
					<span>{t.tracked}</span>
					<strong>{watchlist.length}</strong>
				</div>
				<div className="metric">
					<ShieldCheck size={20} />
					<span>{t.loaded}</span>
					<strong>{coverageStats.loaded}</strong>
				</div>
				<div className="metric">
					<CircleDollarSign size={20} />
					<span>{t.positive}</span>
					<strong>{coverageStats.positive}</strong>
				</div>
				<div className="metric">
					<BarChart3 size={20} />
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

			<section className="workspace">
				<WatchlistSidebar
					t={t}
					language={language}
					updatedAt={updatedAt}
					searchTerm={searchTerm}
					setSearchTerm={setSearchTerm}
					searchSymbols={searchSymbols}
					isSearching={isSearching}
					addSymbol={addSymbol}
					results={results}
					watchlist={watchlist}
					quotes={quotes}
					selectedSymbol={selectedSymbol}
					setSelectedSymbol={setSelectedSymbol}
					removeSymbol={removeSymbol}
				/>

				<section className="mainPanel">
					{selectedQuote ? (
						<StockReport quote={selectedQuote} peerQuotes={quotes} language={language} t={t} updatedAt={updatedAt} />
					) : selectedSymbol ? (
						<div className="emptyState">
							<RefreshCw size={30} className={cls(isLoading && "spin")} />
							<h2>{t.loadingReport}</h2>
							<p>{t.loadingReportHint}</p>
						</div>
					) : (
						<div className="emptyState">
							<Sparkles size={30} />
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
		</main>
	);
}
