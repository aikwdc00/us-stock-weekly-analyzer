"use client";

import { AppNav } from "../../components/layout/AppNav";
import { WatchlistAddPanel } from "../../components/layout/WatchlistAddPanel";
import { WatchlistBoard } from "../../components/layout/WatchlistBoard";
import { BackToTopButton } from "../../components/shared/BackToTopButton";
import { Icon } from "../../components/shared/Icon";
import { useStockAnalyzer } from "../../hooks/useStockAnalyzer";
import { cls, formatDate } from "../../hooks/utils";
import { useRouter } from "next/navigation";

export default function WatchlistPage() {
	const analyzer = useStockAnalyzer({ loadRecommendations: false });
	const router = useRouter();
	const {
		language,
		theme,
		toggleTheme,
		t,
		watchlist,
		selectedSymbol,
		setSelectedSymbol,
		quotes,
		updatedAt,
		isLoading,
		searchTerm,
		setSearchTerm,
		results,
		isSearching,
		searchSymbols,
		addSymbol,
		removeSymbol,
		refreshAll,
	} = analyzer;

	return (
		<main className="shell watchlistPage">
			<header className="pageHeader">
				<div>
					<p className="eyebrow">Watchlist & compare</p>
					<h1>{t.watchlist}</h1>
					<p className="subtitle">先掃描整體，再打開單一標的的完整證據。</p>
				</div>
				<div className="pageHeaderActions">
					<span className="timestamp">
						{t.lastUpdated}: {formatDate(updatedAt, language, t.notUpdated)}
					</span>
					<div className="topActions">
						<button className="themeToggle" type="button" onClick={toggleTheme}>
							{theme === "dark" ? <Icon name="Sun" size={17} /> : <Icon name="Moon" size={17} />}
							{theme === "dark" ? t.lightMode : t.darkMode}
						</button>
						<button className="primaryButton" type="button" onClick={refreshAll} disabled={isLoading}>
							<Icon name="RefreshCw" size={18} className={cls(isLoading && "spin")} />
							{isLoading ? t.refreshing : t.refresh}
						</button>
					</div>
				</div>
			</header>
			<AppNav active="watchlist" />
			<WatchlistBoard
				t={t}
				watchlist={watchlist}
				quotes={quotes}
				selectedSymbol={selectedSymbol}
				setSelectedSymbol={setSelectedSymbol}
				removeSymbol={removeSymbol}
				openSymbol={(symbol) => router.push(`/?symbol=${encodeURIComponent(symbol)}`)}
				showHeaderTitle={false}
				addPanel={
					<WatchlistAddPanel
						t={t}
						language={language}
						updatedAt={updatedAt}
						searchTerm={searchTerm}
						setSearchTerm={setSearchTerm}
						searchSymbols={searchSymbols}
						isSearching={isSearching}
						addSymbol={addSymbol}
						results={results}
					/>
				}
			/>
			<footer className="appFooter">
				<span>© 2026 Fred Li. All rights reserved.</span>
				<span>{t.footer}</span>
			</footer>
			<BackToTopButton label={t.backToTop} />
		</main>
	);
}
