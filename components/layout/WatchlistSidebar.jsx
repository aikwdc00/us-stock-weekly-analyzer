import { ListPlus, RefreshCw, Search, Trash2 } from "lucide-react";
import { cls, formatDate } from "../../hooks/utils";

export function WatchlistSidebar({
	t,
	language,
	updatedAt,
	searchTerm,
	setSearchTerm,
	searchSymbols,
	isSearching,
	addSymbol,
	results,
	watchlist,
	quotes,
	selectedSymbol,
	setSelectedSymbol,
	removeSymbol,
}) {
	return (
		<aside className="panel sidebar">
			<div className="panelHeader">
				<div>
					<p className="eyebrow">Watchlist</p>
					<h2>{t.watchlist}</h2>
				</div>
				<span className="timestamp">
					{t.lastUpdated}: {formatDate(updatedAt, language, t.notUpdated)}
				</span>
			</div>

			<form className="searchBox" onSubmit={searchSymbols}>
				<Search size={18} />
				<input
					value={searchTerm}
					onChange={(event) => setSearchTerm(event.target.value)}
					placeholder={t.searchPlaceholder}
					autoComplete="off"
					suppressHydrationWarning
				/>
				<button type="submit" disabled={isSearching}>
					{isSearching ? t.searching : t.search}
				</button>
			</form>

			<button className="manualAdd" onClick={() => addSymbol(searchTerm)} disabled={!searchTerm.trim()}>
				<ListPlus size={17} />
				{t.addSymbol}
			</button>

			{results.length ? (
				<div className="searchResults">
					{results.map((result) => (
						<button key={`${result.symbol}-${result.exchange}`} onClick={() => addSymbol(result.symbol)}>
							<span>
								<strong>{result.symbol}</strong>
								<small>{result.name}</small>
							</span>
							<ListPlus size={17} />
						</button>
					))}
				</div>
			) : null}

			<div className="watchlist">
				{watchlist.map((symbol) => {
					const quote = quotes.find((item) => item.symbol === symbol);
					return (
						<button
							key={symbol}
							className={cls("watchItem", selectedSymbol === symbol && "active")}
							onClick={() => setSelectedSymbol(symbol)}
						>
							<span className="watchItemMain">
								<strong>{symbol}</strong>
								<small>{quote?.name || t.waitQuote}</small>
							</span>
							<span className={cls("move", quote?.changePercent >= 0 ? "up" : "down")}>{quote?.formatted.changePercent || "N/A"}</span>
							<span
								className="watchItemRemove"
								role="button"
								tabIndex={0}
								aria-label={`Remove ${symbol}`}
								onClick={(event) => {
									event.stopPropagation();
									removeSymbol(symbol);
								}}
								onKeyDown={(event) => {
									if (event.key === "Enter" || event.key === " ") {
										event.preventDefault();
										event.stopPropagation();
										removeSymbol(symbol);
									}
								}}
							>
								<Trash2 size={16} />
							</span>
						</button>
					);
				})}
			</div>
		</aside>
	);
}
