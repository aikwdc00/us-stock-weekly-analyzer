import { formatDate } from "../../hooks/utils";
import { Icon } from "../shared/Icon";

export function WatchlistAddPanel({ t, language, updatedAt, searchTerm, setSearchTerm, searchSymbols, isSearching, addSymbol, results }) {
	return (
		<div className="watchlistAddPanel">
			<div className="panelHeader">
				<div>
					<p className="eyebrow">Add to watchlist</p>
					<h3>{t.addToWatchlist}</h3>
				</div>
				<span className="timestamp">
					{t.lastUpdated}: {formatDate(updatedAt, language, t.notUpdated)}
				</span>
			</div>

			<form className="searchBox" onSubmit={searchSymbols}>
				<Icon name="Search" size={18} />
				<label className="srOnly" htmlFor="watchlist-add-search">
					{t.searchPlaceholder}
				</label>
				<input
					id="watchlist-add-search"
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

			<button className="manualAdd" type="button" onClick={() => addSymbol(searchTerm)} disabled={!searchTerm.trim()}>
				<Icon name="ListPlus" size={17} />
				{t.addSymbol}
			</button>

			{results.length ? (
				<div className="searchResults">
					{results.map((result) => (
						<button key={`${result.symbol}-${result.exchange}`} type="button" onClick={() => addSymbol(result.symbol)}>
							<span>
								<strong>{result.symbol}</strong>
								<small>{result.name}</small>
							</span>
							<Icon name="ListPlus" size={17} />
						</button>
					))}
				</div>
			) : null}
		</div>
	);
}
