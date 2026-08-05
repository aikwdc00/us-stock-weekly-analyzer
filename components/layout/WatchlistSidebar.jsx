import { ListPlus, Search } from "lucide-react";
import { formatDate } from "../../hooks/utils";

export function WatchlistSidebar({ t, language, updatedAt, searchTerm, setSearchTerm, searchSymbols, isSearching, addSymbol, results }) {
	return (
		<aside className="panel sidebar">
			<div className="panelHeader">
				<div>
					<p className="eyebrow">Add to watchlist</p>
					<h2>{t.addToWatchlist}</h2>
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
		</aside>
	);
}
