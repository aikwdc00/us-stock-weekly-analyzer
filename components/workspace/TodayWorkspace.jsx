"use client";

import Link from "next/link";
import { formatDate } from "../../hooks/utils";
import { AppNav } from "../layout/AppNav";
import { BackToTopButton } from "../shared/BackToTopButton";
import { Icon } from "../shared/Icon";

function reviewItems(watchlist, quotes) {
	return watchlist
		.map((symbol) => quotes.find((quote) => quote.symbol === symbol) || { symbol, name: symbol })
		.filter((quote) => !quote.price || quote.rating === "資料不足" || (quote.quality?.score ?? 0) < 65 || quote.events?.length)
		.sort((left, right) => (left.quality?.score ?? 0) - (right.quality?.score ?? 0));
}

function StatusBadge({ tone = "muted", children }) {
	return <span className={`prototypeBadge ${tone}`}>{children}</span>;
}

export function TodayWorkspace({ analyzer }) {
	const {
		language,
		theme,
		toggleTheme,
		t,
		watchlist,
		quotes,
		updatedAt,
		selectedSymbol,
		selectedQuote,
		setSelectedSymbol,
		isLoading,
		error,
		dataWarning,
	} = analyzer;
	const selected = selectedQuote || quotes[0] || null;
	const queue = isLoading && !quotes.length ? [] : reviewItems(watchlist, quotes);
	const events = quotes.flatMap((quote) => (quote.events || []).slice(0, 2).map((event) => ({ ...event, symbol: quote.symbol })));
	const health = quotes.length ? Math.round(quotes.reduce((sum, quote) => sum + (quote.quality?.score || 0), 0) / quotes.length) : 0;
	const loadedCount = quotes.filter((quote) => quote.quality?.score).length;
	const staleCount = quotes.filter((quote) => quote.quality?.stale).length;

	return (
		<main className="prototypeShell">
			<header className="prototypeHeader">
				<div className="prototypeBrand">
					<div className="prototypeBrandMark">
						<Icon name="BarChart3" size={19} />
					</div>
					<div>
						<p className="eyebrow">2.0 Live workspace</p>
						<h1>{t.appTitle}</h1>
						<p>先看需要注意什麼，再回到證據與長線 thesis。</p>
					</div>
				</div>
				<div className="prototypeActions">
					<span className="prototypeFreshness">
						<span className="prototypeLiveDot" />
						資料快照 {formatDate(updatedAt, language, t.notUpdated)}
					</span>
					<button
						className="prototypeIconButton"
						type="button"
						aria-label={theme === "dark" ? t.lightMode : t.darkMode}
						onClick={toggleTheme}
					>
						{theme === "dark" ? <Icon name="Sun" size={17} /> : <Icon name="Moon" size={17} />}
					</button>
				</div>
				<AppNav active="today" className="prototypeNav" />
			</header>
			{error ? (
				<div className="prototypeAlert" role="alert">
					<strong>資料載入失敗</strong>
					<span>{error}</span>
				</div>
			) : null}
			{dataWarning ? (
				<div className="prototypeNotice">
					<strong>{t.updateWarningPrefix}</strong>
					<span>{dataWarning}</span>
				</div>
			) : null}

			<div className="prototypeView">
				<div className="prototypeViewIntro">
					<div>
						<p className="eyebrow">Weekly review queue</p>
						<h2>今天先看這些</h2>
						<p>依事件、資料新鮮度與 thesis 變化排序，不把所有標的都當成同樣緊急。</p>
					</div>
					<Link className="prototypeQuietButton" href="/watchlist">
						<Icon name="ListFilter" size={16} /> 管理追蹤清單
					</Link>
				</div>

				<div className="prototypeQueueGrid">
					<section className="prototypePanel prototypeQueuePanel">
						<div className="prototypeSectionHeading">
							<div>
								<span className="prototypeSectionNumber">01</span>
								<h3>需要複查</h3>
							</div>
							<StatusBadge tone={queue.length ? "warning" : "positive"}>{queue.length} 個標的</StatusBadge>
						</div>
						{queue.length ? (
							queue.slice(0, 6).map((quote) => (
								<button
									key={quote.symbol}
									type="button"
									className={`prototypeQueueRow ${selectedSymbol === quote.symbol ? "selected" : ""}`}
									onClick={() => setSelectedSymbol(quote.symbol)}
								>
									<span className="prototypeTicker">{quote.symbol}</span>
									<span className="prototypeQueueCopy">
										<strong>{quote.rating || t.insufficientEvidence}</strong>
										<small>
											{quote.quality?.score ?? 0}/100 · {quote.name}
										</small>
									</span>
									<Icon name="ArrowUpRight" size={16} />
								</button>
							))
						) : (
							<p className="prototypeEmpty">目前沒有需要優先複查的標的。</p>
						)}
					</section>

					<section className="prototypePanel prototypeHealthPanel">
						<div className="prototypeSectionHeading">
							<div>
								<span className="prototypeSectionNumber">02</span>
								<h3>研究健康度</h3>
							</div>
							<Icon name="ShieldCheck" size={18} />
						</div>
						<div className="prototypeHealthScore">
							<strong>{quotes.length ? health : isLoading ? "..." : "N/A"}</strong>
							<span>/ 100</span>
							<small>{quotes.length ? "依目前已載入標的計算" : isLoading ? "等待追蹤清單資料" : "資料不足，暫不評估"}</small>
						</div>
						<div className="prototypeHealthList">
							<span>
								<i className="positive" />
								{loadedCount} 筆資料已載入
							</span>
							<span>
								<i className="warning" />
								{queue.length} 筆需要複查
							</span>
							<span>
								<i className={staleCount ? "warning" : "muted"} />
								{staleCount ? `${staleCount} 筆資料可能過期` : "目前沒有過期標記"}
							</span>
						</div>
					</section>
				</div>

				<section className="prototypePanel prototypeNextPanel">
					<div className="prototypeSectionHeading">
						<div>
							<span className="prototypeSectionNumber">03</span>
							<h3>接下來的事件</h3>
						</div>
						<Link className="prototypeTextButton" href="/watchlist">
							查看完整清單 <Icon name="ArrowUpRight" size={15} />
						</Link>
					</div>
					{events.length ? (
						<div className="prototypeEventGrid">
							{events.slice(0, 8).map((event) => (
								<a
									key={`${event.symbol}-${event.label}-${event.date}`}
									className="prototypeEvent"
									href={event.sourceUrl || `/?symbol=${encodeURIComponent(event.symbol)}`}
									target={event.sourceUrl ? "_blank" : undefined}
									rel={event.sourceUrl ? "noreferrer" : undefined}
								>
									<strong>{event.date || "N/A"}</strong>
									<span>
										{event.symbol} · {event.label}
									</span>
									<small>{event.detail || event.source || t.insufficientEvidence}</small>
								</a>
							))}
						</div>
					) : (
						<p className="prototypeEmpty">{t.noEvents}</p>
					)}
				</section>

				{selected ? (
					<section className="prototypeResearchHero">
						<div>
							<p className="eyebrow">Selected research</p>
							<h2>
								{selected.symbol} <span>{selected.name}</span>
							</h2>
							<p>{selected.thesis || t.insufficientEvidence}</p>
						</div>
						<div className="prototypeResearchPrice">
							<strong>{selected.formatted?.price || "N/A"}</strong>
							<span className={selected.changePercent >= 0 ? "positiveText" : "negativeText"}>
								{selected.formatted?.changePercent || "N/A"}
							</span>
							<StatusBadge>
								{selected.rating || t.insufficientEvidence} · {selected.quality?.score ?? 0}/100
							</StatusBadge>
							<Link className="prototypeTextButton" href={`/?symbol=${encodeURIComponent(selected.symbol)}`}>
								查看完整研究 <Icon name="ArrowUpRight" size={15} />
							</Link>
						</div>
					</section>
				) : null}

				{isLoading ? <p className="prototypeLoading">{t.loadingReport}</p> : null}
			</div>
			<footer className="prototypeFooter">© 2026 Fred Li · {t.footer}</footer>
			<BackToTopButton label={t.backToTop} />
		</main>
	);
}
