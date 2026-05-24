"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FinancialsPanel } from "./panels/FinancialsPanel";
import { IndustryPanel } from "./panels/IndustryPanel";
import { MindMapSwotPanel } from "./panels/MindMapSwotPanel";
import { OverviewPanel } from "./panels/OverviewPanel";
import { ValuationPanel } from "./panels/ValuationPanel";

const panelMotion = {
	initial: { opacity: 0, y: 14 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -10 },
	transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
};

export function ReportTabs({ quote, peerQuotes, language, t, tabs, activeTab, onTabChange, activeModel, setSelectedModel, updatedAt }) {
	return (
		<div className="reportTabs">
			<div className="reportTabList" role="tablist" aria-label="Report sections">
				{tabs.map((tab) => {
					const isActive = tab.id === activeTab;
					return (
						<button
							key={tab.id}
							type="button"
							role="tab"
							aria-selected={isActive}
							className={`reportTabButton${isActive ? " active" : ""}`}
							onClick={() => onTabChange(tab.id)}
						>
							{isActive ? (
								<motion.span
									layoutId="reportTabIndicator"
									className="reportTabIndicator"
									transition={{ type: "spring", stiffness: 420, damping: 34 }}
								/>
							) : null}
							<span className="reportTabLabel">{tab.label}</span>
						</button>
					);
				})}
			</div>

			<div className="reportTabContent">
				<AnimatePresence mode="wait" initial={false}>
					<motion.div key={`${quote.symbol}-${activeTab}`} className="reportTabPane" {...panelMotion}>
						{activeTab === "overview" ? <OverviewPanel quote={quote} language={language} t={t} /> : null}
						{activeTab === "valuation" ? (
							<ValuationPanel quote={quote} t={t} activeModel={activeModel} setSelectedModel={setSelectedModel} />
						) : null}
						{activeTab === "financials" ? <FinancialsPanel quote={quote} t={t} language={language} /> : null}
						{activeTab === "industry" ? <IndustryPanel quote={quote} peerQuotes={peerQuotes} language={language} t={t} /> : null}
						{activeTab === "mindmapSwot" ? <MindMapSwotPanel quote={quote} language={language} t={t} updatedAt={updatedAt} /> : null}
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	);
}
