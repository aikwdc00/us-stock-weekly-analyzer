"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BarChart3, Check, ChevronDown, Filter, ListFilter, Moon, Plus, Search, ShieldCheck, Sun } from "lucide-react";
import { BackToTopButton } from "../../components/shared/BackToTopButton";
import { prototypeDiscover, prototypeEvidence, prototypeWatchlist } from "../../lib/prototypeFixtures";

const views = [
	{ id: "today", label: "Today" },
	{ id: "watchlist", label: "追蹤清單" },
	{ id: "research", label: "公司研究" },
	{ id: "discover", label: "探索標的" },
];

function StatusBadge({ tone = "muted", children }) {
	return <span className={`prototypeBadge ${tone}`}>{children}</span>;
}

function PrototypeHeader({ view, setView, dark, setDark }) {
	return (
		<header className="prototypeHeader">
			<div className="prototypeBrand">
				<div className="prototypeBrandMark">
					<BarChart3 size={19} />
				</div>
				<div>
					<p className="eyebrow">2.0 Prototype</p>
					<h1>美股週報分析工作台</h1>
					<p>先看需要注意什麼，再回到證據與長線 thesis。</p>
				</div>
			</div>
			<div className="prototypeActions">
				<span className="prototypeFreshness">
					<span className="prototypeLiveDot" />
					資料快照 8 分鐘前
				</span>
				<button className="prototypeIconButton" type="button" aria-label="切換深色模式" onClick={() => setDark(!dark)}>
					{dark ? <Sun size={17} /> : <Moon size={17} />}
				</button>
			</div>
			<nav className="prototypeNav" aria-label="研究區域">
				{views.map((item) => (
					<button key={item.id} className={view === item.id ? "active" : ""} type="button" onClick={() => setView(item.id)}>
						{item.label}
					</button>
				))}
			</nav>
		</header>
	);
}

function TodayView({ setView, selected, setSelected }) {
	return (
		<div className="prototypeView">
			<div className="prototypeViewIntro">
				<div>
					<p className="eyebrow">Weekly review queue</p>
					<h2>今天先看這些</h2>
					<p>依事件、資料新鮮度與 thesis 變化排序，不把所有標的都當成同樣緊急。</p>
				</div>
				<button className="prototypeQuietButton" type="button" onClick={() => setView("watchlist")}>
					<ListFilter size={16} /> 管理追蹤清單
				</button>
			</div>
			<div className="prototypeQueueGrid">
				<section className="prototypePanel prototypeQueuePanel">
					<div className="prototypeSectionHeading">
						<div>
							<span className="prototypeSectionNumber">01</span>
							<h3>需要複查</h3>
						</div>
						<StatusBadge tone="warning">1 個標的</StatusBadge>
					</div>
					{prototypeWatchlist.slice(0, 2).map((item) => (
						<button
							key={item.symbol}
							type="button"
							className={`prototypeQueueRow ${selected === item.symbol ? "selected" : ""}`}
							onClick={() => {
								setSelected(item.symbol);
								setView("research");
							}}
						>
							<span className="prototypeTicker">{item.symbol}</span>
							<span className="prototypeQueueCopy">
								<strong>{item.status}</strong>
								<small>{item.thesis}</small>
							</span>
							<ArrowUpRight size={16} />
						</button>
					))}
				</section>
				<section className="prototypePanel prototypeHealthPanel">
					<div className="prototypeSectionHeading">
						<div>
							<span className="prototypeSectionNumber">02</span>
							<h3>研究健康度</h3>
						</div>
						<ShieldCheck size={18} />
					</div>
					<div className="prototypeHealthScore">
						<strong>78</strong>
						<span>/ 100</span>
						<small>資料完整且可追蹤</small>
					</div>
					<div className="prototypeHealthList">
						<span>
							<i className="positive" />2 筆資料新鮮
						</span>
						<span>
							<i className="warning" />1 筆需要更新
						</span>
						<span>
							<i className="muted" />
							所有顯示欄位均有能力標記
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
					<button className="prototypeTextButton" type="button" onClick={() => setView("watchlist")}>
						查看全部 <ArrowUpRight size={15} />
					</button>
				</div>
				<div className="prototypeEventGrid">
					{prototypeWatchlist.map((item) => (
						<div key={item.symbol} className="prototypeEvent">
							<strong>{item.event}</strong>
							<span>
								{item.symbol} · {item.industry}
							</span>
							<small>{item.freshness}</small>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}

function WatchlistView({ selected, setSelected, compare, setCompare }) {
	const [query, setQuery] = useState("");
	const filtered = useMemo(
		() => prototypeWatchlist.filter((item) => `${item.symbol} ${item.name} ${item.industry}`.toLowerCase().includes(query.toLowerCase())),
		[query]
	);
	return (
		<div className="prototypeView">
			<div className="prototypeViewIntro">
				<div>
					<p className="eyebrow">Watchlist & compare</p>
					<h2>追蹤清單</h2>
					<p>先掃描整體，再打開單一標的的完整證據。</p>
				</div>
				<StatusBadge tone="positive">{prototypeWatchlist.length} 個標的</StatusBadge>
			</div>
			<section className="prototypePanel">
				<div className="prototypeToolbar">
					<label className="prototypeSearch">
						<Search size={16} />
						<input
							aria-label="搜尋追蹤清單"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="搜尋代號、公司或產業"
						/>
					</label>
					<button className="prototypeQuietButton" type="button">
						<Filter size={16} />
						篩選
						<ChevronDown size={15} />
					</button>
					<button className="prototypePrimaryButton" type="button">
						<Plus size={16} />
						建立標的
					</button>
				</div>
				{compare.length ? (
					<div className="prototypeCompareBar">
						<span>已選 {compare.length} 檔</span>
						<button type="button" onClick={() => setCompare([])}>
							清除選擇
						</button>
						<button type="button" className="prototypePrimaryButton" disabled={compare.length < 2}>
							比較標的
						</button>
					</div>
				) : null}
				<div className="prototypeTableWrap">
					<table className="prototypeTable">
						<thead>
							<tr>
								<th>標的</th>
								<th>現價 / 本週</th>
								<th>估值</th>
								<th>資料品質</th>
								<th>研究狀態</th>
								<th>下一事件</th>
								<th>比較</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((item) => (
								<tr key={item.symbol} className={selected === item.symbol ? "selected" : ""}>
									<td>
										<button type="button" className="prototypeTableTicker" onClick={() => setSelected(item.symbol)}>
											<strong>{item.symbol}</strong>
											<span>{item.name}</span>
											<small>{item.industry}</small>
										</button>
									</td>
									<td>
										<strong>{item.price}</strong>
										<span className={item.move.startsWith("+") ? "positiveText" : "negativeText"}>
											{item.move} · {item.week}
										</span>
									</td>
									<td>{item.valuation}</td>
									<td>
										<strong>{item.quality}</strong>
										<small>{item.freshness}</small>
									</td>
									<td>
										<StatusBadge tone={item.statusTone}>{item.status}</StatusBadge>
									</td>
									<td>{item.event}</td>
									<td>
										<button
											type="button"
											className={`prototypeCheckButton ${compare.includes(item.symbol) ? "checked" : ""}`}
											aria-label={`選取 ${item.symbol} 比較`}
											onClick={() =>
												setCompare(
													compare.includes(item.symbol)
														? compare.filter((symbol) => symbol !== item.symbol)
														: [...compare, item.symbol]
												)
											}
										>
											{compare.includes(item.symbol) ? <Check size={15} /> : null}
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>
		</div>
	);
}

function ResearchView({ selected }) {
	const item = prototypeWatchlist.find((candidate) => candidate.symbol === selected) || prototypeWatchlist[0];
	return (
		<div className="prototypeView">
			<div className="prototypeResearchHero">
				<div>
					<p className="eyebrow">Company research / {item.industry}</p>
					<h2>
						{item.symbol} <span>{item.name}</span>
					</h2>
					<p>{item.thesis}</p>
				</div>
				<div className="prototypeResearchPrice">
					<strong>{item.price}</strong>
					<span className="positiveText">{item.move}</span>
					<StatusBadge tone={item.statusTone}>{item.status}</StatusBadge>
				</div>
			</div>
			<div className="prototypeResearchGrid">
				<section className="prototypePanel">
					<div className="prototypeSectionHeading">
						<div>
							<span className="prototypeSectionNumber">01</span>
							<h3>決策摘要</h3>
						</div>
						<StatusBadge tone="positive">資料可追蹤</StatusBadge>
					</div>
					<div className="prototypeThesis">
						<strong>目前判斷</strong>
						<p>{item.thesis}</p>
						<div>
							<span>支持：營收成長仍為正</span>
							<span>反證：Forward PE 高於同業中位數</span>
						</div>
					</div>
					<div className="prototypeResearchAction">
						<button type="button" className="prototypePrimaryButton">
							設定下次複查
						</button>
						<span>上次複查：2026-08-01</span>
					</div>
				</section>
				<section className="prototypePanel">
					<div className="prototypeSectionHeading">
						<div>
							<span className="prototypeSectionNumber">02</span>
							<h3>核心證據</h3>
						</div>
						<a
							className="prototypeTextButton"
							href={prototypeEvidence.find((row) => row.value !== null)?.sourceUrl || "https://www.sec.gov/edgar/search/"}
							target="_blank"
							rel="noreferrer"
						>
							查看來源 <ArrowUpRight size={15} />
						</a>
					</div>
					<div className="prototypeEvidenceList">
						{prototypeEvidence
							.filter((row) => row.value !== null)
							.map((row) => (
								<div key={row.label} className="prototypeEvidenceRow">
									<span>
										<strong>{row.label}</strong>
										<small>{row.meta}</small>
									</span>
									<b className={row.tone}>{row.value}</b>
								</div>
							))}
					</div>
				</section>
			</div>
			<section className="prototypePanel prototypeIndustryPanel">
				<div className="prototypeSectionHeading">
					<div>
						<span className="prototypeSectionNumber">03</span>
						<h3>產業與長線監控</h3>
					</div>
					<StatusBadge tone="muted">Semiconductors</StatusBadge>
				</div>
				<div className="prototypeIndustryGrid">
					<div>
						<small>產業驅動</small>
						<strong>AI 資本支出、先進製程需求</strong>
						<span>Fact + inference · 2026-07-31</span>
					</div>
					<div>
						<small>供給限制</small>
						<strong>產能擴張與地區集中</strong>
						<span>需以 filing 與公司 IR 驗證</span>
					</div>
					<div>
						<small>下一個驗證</small>
						<strong>財報指引與毛利率變化</strong>
						<span>事件：財報 8/19</span>
					</div>
				</div>
			</section>
		</div>
	);
}

function DiscoverView({ onAdd, added }) {
	return (
		<div className="prototypeView">
			<div className="prototypeViewIntro">
				<div>
					<p className="eyebrow">Discover</p>
					<h2>探索標的</h2>
					<p>候選池與研究清單分開，候選分數只代表研究優先級。</p>
				</div>
				<StatusBadge tone="muted">資料快照 1 小時前</StatusBadge>
			</div>
			<section className="prototypeDiscoverGrid">
				{prototypeDiscover.map((item) => (
					<article className="prototypePanel prototypeDiscoverCard" key={item.symbol}>
						<div className="prototypeDiscoverTop">
							<span className="prototypeTicker">{item.symbol}</span>
							<strong>{item.score}</strong>
						</div>
						<h3>{item.name}</h3>
						<span>{item.industry}</span>
						<p>{item.reason}</p>
						<button
							className="prototypePrimaryButton"
							type="button"
							onClick={() => onAdd(item.symbol)}
							disabled={added.includes(item.symbol)}
						>
							{added.includes(item.symbol) ? (
								<>
									<Check size={15} /> 已加入
								</>
							) : (
								<>
									<Plus size={15} /> 加入研究清單
								</>
							)}
						</button>
					</article>
				))}
			</section>
		</div>
	);
}

export default function PrototypePage() {
	const [view, setView] = useState("today");
	const [selected, setSelected] = useState("NVDA");
	const [compare, setCompare] = useState([]);
	const [added, setAdded] = useState([]);
	const [dark, setDark] = useState(false);

	useEffect(() => {
		document.documentElement.dataset.theme = dark ? "dark" : "light";
		return () => {
			delete document.documentElement.dataset.theme;
		};
	}, [dark]);

	return (
		<main className="prototypeShell" data-testid="prototype-shell">
			<PrototypeHeader view={view} setView={setView} dark={dark} setDark={setDark} />
			{view === "today" ? <TodayView setView={setView} selected={selected} setSelected={setSelected} /> : null}
			{view === "watchlist" ? (
				<WatchlistView
					selected={selected}
					setSelected={(symbol) => {
						setSelected(symbol);
						setView("research");
					}}
					compare={compare}
					setCompare={setCompare}
				/>
			) : null}
			{view === "research" ? <ResearchView selected={selected} /> : null}
			{view === "discover" ? <DiscoverView added={added} onAdd={(symbol) => setAdded((current) => [...current, symbol])} /> : null}
			<footer className="prototypeFooter">Prototype data only · 不代表即時行情或投資建議</footer>
			<BackToTopButton label="回到頂部" />
		</main>
	);
}
