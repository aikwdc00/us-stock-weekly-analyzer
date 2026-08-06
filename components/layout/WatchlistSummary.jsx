import Link from "next/link";
import { Icon } from "../shared/Icon";

const EMPTY = "N/A";

export function WatchlistSummary({ t, watchlist, quotes, selectedSymbol, setSelectedSymbol }) {
	return (
		<section className="watchlistSummary" aria-labelledby="watchlist-summary-title">
			<div className="watchlistSummaryHeader">
				<div>
					<p className="eyebrow">{t.watchlistWorkspace}</p>
					<h2 id="watchlist-summary-title">{t.watchlist}</h2>
					<p>{watchlist.length ? `${watchlist.length} 個標的，快速查看行情與資料狀態。` : t.noTracked}</p>
				</div>
				<Link className="secondaryButton" href="/watchlist">
					<Icon name="ListFilter" size={16} />
					查看完整清單
				</Link>
			</div>
			<div className="watchlistSummaryList">
				{watchlist.length ? (
					watchlist.slice(0, 5).map((symbol) => {
						const quote = quotes.find((item) => item.symbol === symbol);
						const selected = selectedSymbol === symbol;
						return (
							<button
								key={symbol}
								type="button"
								className={`watchlistSummaryRow${selected ? " selected" : ""}`}
								onClick={() => setSelectedSymbol(symbol)}
							>
								<span>
									<strong>{symbol}</strong>
									<small>{quote?.name || symbol}</small>
								</span>
								<span>{quote?.formatted?.price || EMPTY}</span>
								<span className={quote?.changePercent >= 0 ? "positiveText" : "negativeText"}>
									{quote?.formatted?.changePercent || EMPTY}
								</span>
								<Icon name="ArrowUpRight" size={15} />
							</button>
						);
					})
				) : (
					<p className="watchlistSummaryEmpty">{t.noTracked}</p>
				)}
			</div>
			{watchlist.length > 5 ? <p className="watchlistSummaryMore">還有 {watchlist.length - 5} 個標的，請到完整清單查看。</p> : null}
		</section>
	);
}
