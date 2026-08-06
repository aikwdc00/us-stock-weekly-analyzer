"use client";

import { TodayWorkspace } from "../../components/workspace/TodayWorkspace";
import { useStockAnalyzer } from "../../hooks/useStockAnalyzer";

export default function TodayPage() {
	const analyzer = useStockAnalyzer({ loadRecommendations: false });
	return <TodayWorkspace analyzer={analyzer} />;
}
