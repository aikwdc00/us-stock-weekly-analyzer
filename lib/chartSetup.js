import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from "chart.js";

let registered = false;

export function registerCharts() {
  if (registered) return;
  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler);
  registered = true;
}

export function getChartThemeColors() {
  if (typeof window === "undefined") {
    return {
      ink: "#172026",
      muted: "#66737f",
      grid: "#cbd5dd",
      panel: "#ffffff"
    };
  }

  const style = getComputedStyle(document.documentElement);
  return {
    ink: style.getPropertyValue("--ink").trim() || "#172026",
    muted: style.getPropertyValue("--muted").trim() || "#66737f",
    grid: style.getPropertyValue("--chart-grid").trim() || "#cbd5dd",
    panel: style.getPropertyValue("--panel").trim() || "#ffffff"
  };
}

/** Compact Y-axis tick (US stocks: raw USD). */
export function formatChartAxisValue(value, language = "zh") {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";

  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";

  if (language === "en") {
    if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(1)}T`;
    if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(1)}B`;
    if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`;
    if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(0)}K`;
    return `${sign}$${abs.toFixed(0)}`;
  }

  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(2)} 兆`;
  if (abs >= 1e8) return `${sign}${(abs / 1e8).toFixed(1)} 億`;
  if (abs >= 1e4) return `${sign}${(abs / 1e4).toFixed(0)} 萬`;
  return `${sign}${abs.toLocaleString("zh-TW", { maximumFractionDigits: 0 })}`;
}

export function formatChartTooltipValue(value, language = "zh") {
  const n = Number(value);
  if (!Number.isFinite(n)) return "N/A";

  if (language === "en") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2
    }).format(n);
  }

  if (Math.abs(n) >= 1e8) {
    return `${(n / 1e8).toFixed(2)} 億美元`;
  }

  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(n);
}

export function chartYAxisTitle(language = "zh") {
  return language === "en" ? "USD" : "美元 (USD)";
}

export function chartUnitCaption(language = "zh") {
  return language === "en" ? "Amounts in USD · axis uses B / M" : "金額單位：美元 · 縱軸以億為主";
}

export function baseChartOptions(themeColors, language = "zh") {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        labels: {
          color: themeColors.ink,
          boxWidth: 10,
          boxHeight: 10,
          font: { size: 11, weight: "700" }
        }
      },
      tooltip: {
        backgroundColor: themeColors.panel,
        titleColor: themeColors.ink,
        bodyColor: themeColors.muted,
        borderColor: themeColors.grid,
        borderWidth: 1,
        callbacks: {
          label(context) {
            const label = context.dataset.label || "";
            const value = context.parsed.y ?? context.parsed;
            return `${label}: ${formatChartTooltipValue(value, language)}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: themeColors.muted, maxRotation: 0 },
        grid: { color: themeColors.grid }
      },
      y: {
        ticks: {
          color: themeColors.muted,
          callback: (value) => formatChartAxisValue(value, language)
        },
        title: {
          display: true,
          text: chartYAxisTitle(language),
          color: themeColors.muted,
          font: { size: 11, weight: "600" }
        },
        grid: { color: themeColors.grid }
      }
    }
  };
}
