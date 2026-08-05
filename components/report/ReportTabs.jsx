"use client";

import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { OverviewPanel } from "./panels/OverviewPanel";
import { ValuationPanel } from "./panels/ValuationPanel";

const FinancialsPanel = dynamic(() => import("./panels/FinancialsPanel").then((module) => module.FinancialsPanel), {
	loading: () => <PanelLoading />,
});
const IndustryPanel = dynamic(() => import("./panels/IndustryPanel").then((module) => module.IndustryPanel), {
	loading: () => <PanelLoading />,
});
const MindMapSwotPanel = dynamic(() => import("./panels/MindMapSwotPanel").then((module) => module.MindMapSwotPanel), {
	loading: () => <PanelLoading />,
});
const SupplyChainPanel = dynamic(() => import("./panels/SupplyChainPanel").then((module) => module.SupplyChainPanel), {
	loading: () => <PanelLoading />,
});

function PanelLoading() {
	return <div className="panelLoading" role="status" aria-live="polite" />;
}

const panelMotion = {
	initial: { opacity: 0, y: 14 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -10 },
	transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
};

export function ReportTabs({ quote, language, t, tabs, activeTab, onTabChange, activeModel, setSelectedModel, updatedAt }) {
	return (
		<div className="reportTabs">
			<div className="reportTabScroller">
				<div className="reportTabList" role="tablist" aria-label="Report sections" style={{ "--tab-count": tabs.length }}>
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
			</div>

			<div className="reportTabContent">
				<AnimatePresence mode="wait" initial={false}>
					<motion.div key={`${quote.symbol}-${activeTab}`} className="reportTabPane" {...panelMotion}>
						{activeTab === "overview" ? <OverviewPanel quote={quote} language={language} t={t} /> : null}
						{activeTab === "valuation" ? (
							<ValuationPanel quote={quote} t={t} language={language} activeModel={activeModel} setSelectedModel={setSelectedModel} />
						) : null}
						{activeTab === "financials" ? <FinancialsPanel quote={quote} t={t} language={language} /> : null}
						{activeTab === "industry" ? <IndustryPanel quote={quote} language={language} t={t} /> : null}
						{activeTab === "supplyChain" ? <SupplyChainPanel quote={quote} language={language} t={t} /> : null}
						{activeTab === "mindmapSwot" ? <MindMapSwotPanel quote={quote} language={language} t={t} updatedAt={updatedAt} /> : null}
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	);
}
