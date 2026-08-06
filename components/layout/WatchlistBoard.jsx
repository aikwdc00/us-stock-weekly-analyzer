"use client";

import { useMemo, useState } from "react";
import { Icon } from "../shared/Icon";

const EMPTY = "N/A";

function sortRows(rows, sortKey, direction) {
	return [...rows].sort((a, b) => {
		const left = a[sortKey];
		const right = b[sortKey];
		if (typeof left === "string" || typeof right === "string") {
			return String(left || "").localeCompare(String(right || "")) * direction;
		}
		return ((left ?? -Infinity) - (right ?? -Infinity)) * direction;
	});
}

export function WatchlistBoard({
	watchlist,
	quotes,
	selectedSymbol,
	setSelectedSymbol,
	removeSymbol,
	t,
	addPanel,
	openSymbol,
	showHeaderTitle = true,
}) {
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState("all");
	const [sortKey, setSortKey] = useState("symbol");
	const [direction, setDirection] = useState(1);
	const [compareSymbols, setCompareSymbols] = useState([]);

	const rows = useMemo(() => {
		const normalizedQuery = query.trim().toUpperCase();
		const base = watchlist.map((symbol) => {
			const quote = quotes.find((item) => item.symbol === symbol);
			return {
				symbol,
				quote,
				name: quote?.name || symbol,
				industry: quote?.profile?.industry || EMPTY,
				price: quote?.price,
				changePercent: quote?.changePercent,
				valuation: quote?.valuation || EMPTY,
				quality: quote?.quality?.score ?? -1,
				needsReview: quote?.rating === "資料不足" || quote?.quality?.score < 65,
			};
		});

		const filtered = base.filter((row) => {
			const matchesQuery = !normalizedQuery || `${row.symbol} ${row.name} ${row.industry}`.toUpperCase().includes(normalizedQuery);
			const matchesFilter = filter === "all" || (filter === "review" && row.needsReview) || (filter === "loaded" && row.quote);
			return matchesQuery && matchesFilter;
		});

		return sortRows(filtered, sortKey, direction);
	}, [direction, filter, query, quotes, sortKey, watchlist]);

	function toggleSort(nextKey) {
		if (sortKey === nextKey) {
			setDirection((current) => current * -1);
			return;
		}
		setSortKey(nextKey);
		setDirection(1);
	}

	function toggleCompare(symbol) {
		setCompareSymbols((current) => {
			if (current.includes(symbol)) return current.filter((item) => item !== symbol);
			return current.length < 4 ? [...current, symbol] : current;
		});
	}

	function selectSymbol(symbol) {
		setSelectedSymbol(symbol);
		openSymbol?.(symbol);
	}

	return (
		<section className="watchlistBoard" aria-labelledby={showHeaderTitle ? "watchlist-board-title" : undefined}>
			<div className={`watchlistBoardHeader${showHeaderTitle ? "" : " noTitle"}`}>
				{showHeaderTitle ? (
					<div>
						<p className="eyebrow">{t.watchlistWorkspace}</p>
						<h2 id="watchlist-board-title">{t.watchlist}</h2>
					</div>
				) : null}
				<div className="watchlistBoardControls">
					<label className="watchlistControl">
						<span>{t.filter}</span>
						<select suppressHydrationWarning value={filter} onChange={(event) => setFilter(event.target.value)}>
							<option value="all">{t.all}</option>
							<option value="review">{t.needsReview}</option>
							<option value="loaded">{t.loaded}</option>
						</select>
						<Icon name="ChevronDown" size={14} />
					</label>
					<label className="watchlistControl">
						<span>{t.sort}</span>
						<select suppressHydrationWarning value={sortKey} onChange={(event) => toggleSort(event.target.value)}>
							<option value="symbol">{t.tableSymbol}</option>
							<option value="changePercent">{t.move}</option>
							<option value="quality">{t.dataQuality}</option>
							<option value="industry">{t.industry}</option>
						</select>
						{direction === 1 ? <Icon name="ArrowDownAZ" size={14} /> : <Icon name="ArrowUpAZ" size={14} />}
					</label>
					<label className="watchlistSearch">
						<Icon name="SlidersHorizontal" size={15} />
						<span className="srOnly">{t.search}</span>
						<input
							suppressHydrationWarning
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder={t.filterWatchlist}
						/>
					</label>
				</div>
			</div>
			{addPanel ? <div className="watchlistBoardAdd">{addPanel}</div> : null}

			{compareSymbols.length ? (
				<div className="watchlistCompareBar" role="status">
					<strong>{t.compareSelected.replace("{count}", String(compareSymbols.length))}</strong>
					<span>{compareSymbols.join(" · ")}</span>
					<button type="button" onClick={() => setCompareSymbols([])}>
						{t.clearSelection}
					</button>
				</div>
			) : null}

			<div className="watchlistTableWrap">
				<table className="watchlistTable">
					<thead>
						<tr>
							<th>{t.compare}</th>
							<th>{t.tableSymbol}</th>
							<th>{t.price}</th>
							<th>{t.move}</th>
							<th>{t.industry}</th>
							<th>{t.valuation}</th>
							<th>{t.dataQuality}</th>
							<th aria-label={t.remove} />
						</tr>
					</thead>
					<tbody>
						{rows.length ? (
							rows.map((row) => {
								const selected = row.symbol === selectedSymbol;
								const compared = compareSymbols.includes(row.symbol);
								return (
									<tr key={row.symbol} className={selected ? "selected" : ""}>
										<td data-label={t.compare}>
											<button
												type="button"
												className={`watchlistCheck${compared ? " checked" : ""}`}
												aria-label={`${t.selectForCompare} ${row.symbol}`}
												onClick={() => toggleCompare(row.symbol)}
											>
												{compared ? <Icon name="Check" size={14} /> : null}
											</button>
										</td>
										<td data-label={t.tableSymbol}>
											<button type="button" className="watchlistSymbolButton" onClick={() => selectSymbol(row.symbol)}>
												<strong>{row.symbol}</strong>
												<span>{row.name}</span>
											</button>
										</td>
										<td data-label={t.price}>{row.quote?.formatted?.price || EMPTY}</td>
										<td data-label={t.move} className={row.changePercent >= 0 ? "positiveText" : "negativeText"}>
											{row.quote?.formatted?.changePercent || EMPTY}
										</td>
										<td data-label={t.industry}>{row.industry}</td>
										<td data-label={t.valuation}>{row.valuation}</td>
										<td data-label={t.dataQuality}>{row.quote ? `${row.quality}/100` : t.waitQuote}</td>
										<td>
											<button
												type="button"
												className="iconButton"
												aria-label={`${t.remove} ${row.symbol}`}
												onClick={() => removeSymbol(row.symbol)}
											>
												<Icon name="Trash2" size={15} />
											</button>
										</td>
									</tr>
								);
							})
						) : (
							<tr>
								<td colSpan="8" className="watchlistEmpty">
									{watchlist.length ? t.noMatchingWatchlist : t.noTracked}
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</section>
	);
}
