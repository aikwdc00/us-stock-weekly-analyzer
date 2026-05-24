"use client";

import { useEffect, useMemo, useState } from "react";

export const REPORT_TAB_IDS = ["overview", "valuation", "financials", "industry"];

export function getReportTabs(t) {
  return [
    { id: "overview", label: t.tabOverview },
    { id: "valuation", label: t.tabValuation },
    { id: "financials", label: t.tabFinancials },
    { id: "industry", label: t.tabIndustry }
  ];
}

export function useReportTabs(symbol, t) {
  const [activeTab, setActiveTab] = useState(REPORT_TAB_IDS[0]);
  const tabs = useMemo(() => getReportTabs(t), [t]);

  useEffect(() => {
    setActiveTab(REPORT_TAB_IDS[0]);
  }, [symbol]);

  return { activeTab, setActiveTab, tabs };
}
