"use client";

import { Bar, Line } from "react-chartjs-2";
import { useEffect, useMemo, useState } from "react";
import { baseChartOptions, chartUnitCaption, getChartThemeColors, registerCharts } from "../../../lib/chartSetup";

registerCharts();

const INCOME_SERIES = [
	{ key: "revenue", label: "營收", color: "#2563eb" },
	{ key: "operatingIncome", label: "營業利益", color: "#117c8b" },
	{ key: "netIncome", label: "淨利", color: "#0f8a5f" },
];

const COST_SERIES = [
	{ key: "costOfRevenue", label: "營收成本", color: "#d97706" },
	{ key: "operatingExpenses", label: "營業費用", color: "#7c3aed" },
	{ key: "netIncome", label: "淨利", color: "#0f8a5f" },
];

function formatLabel(label) {
	return String(label).replace("20", "'");
}

function useChartTheme() {
	const [themeColors, setThemeColors] = useState(getChartThemeColors);

	useEffect(() => {
		const sync = () => setThemeColors(getChartThemeColors());
		sync();
		const observer = new MutationObserver(sync);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["data-theme"],
		});
		return () => observer.disconnect();
	}, []);

	return themeColors;
}

export function FinancialCharts({ chart, language = "zh" }) {
	const points = (chart || []).filter((point) => Number.isFinite(point.revenue));
	const themeColors = useChartTheme();
	const unitCaption = chartUnitCaption(language);

	const labels = useMemo(() => points.map((point) => formatLabel(point.label)), [points]);

	const lineData = useMemo(
		() => ({
			labels,
			datasets: INCOME_SERIES.map((series) => ({
				label: series.label,
				data: points.map((point) => point[series.key] ?? null),
				borderColor: series.color,
				backgroundColor: series.color,
				tension: 0.32,
				pointRadius: 3,
				pointHoverRadius: 5,
				borderWidth: 2,
			})),
		}),
		[labels, points]
	);

	const barData = useMemo(
		() => ({
			labels,
			datasets: COST_SERIES.map((series) => ({
				label: series.label,
				data: points.map((point) => Math.abs(point[series.key] ?? 0)),
				backgroundColor: series.color,
				borderRadius: 4,
				stack: "cost",
			})),
		}),
		[labels, points]
	);

	const lineOptions = useMemo(
		() => ({
			...baseChartOptions(themeColors, language),
			plugins: {
				...baseChartOptions(themeColors, language).plugins,
				legend: { position: "bottom" },
			},
		}),
		[language, themeColors]
	);

	const barOptions = useMemo(
		() => ({
			...baseChartOptions(themeColors, language),
			plugins: {
				...baseChartOptions(themeColors, language).plugins,
				legend: { position: "bottom" },
			},
			scales: {
				x: { ...baseChartOptions(themeColors, language).scales.x, stacked: true },
				y: { ...baseChartOptions(themeColors, language).scales.y, stacked: true },
			},
		}),
		[language, themeColors]
	);

	if (!points.length) return null;

	return (
		<div className="chartGrid">
			<div className="chartCard">
				<div className="chartCardHeader">
					<h4>營收 / 營業利益 / 淨利</h4>
					<span className="chartUnitNote">{unitCaption}</span>
				</div>
				<div className="chartCanvas">
					<Line data={lineData} options={lineOptions} />
				</div>
			</div>
			<div className="chartCard">
				<div className="chartCardHeader">
					<h4>成本結構堆疊圖</h4>
					<span className="chartUnitNote">{unitCaption}</span>
				</div>
				<div className="chartCanvas">
					<Bar data={barData} options={barOptions} />
				</div>
			</div>
		</div>
	);
}
