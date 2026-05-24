const NODE_WIDTH = { core: 168, branch: 196 };
const NODE_HEIGHT = { core: 96, branch: 118 };

function radialPosition(index, total, radius, centerX, centerY, nodeType) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  const width = NODE_WIDTH[nodeType];
  const height = NODE_HEIGHT[nodeType];

  return {
    x: centerX + radius * Math.cos(angle) - width / 2,
    y: centerY + radius * Math.sin(angle) - height / 2
  };
}

function truncate(text, max = 88) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function buildMindMapGraph({ quote, language, t, displayValue }) {
  const centerX = 360;
  const centerY = 240;
  const radius = 250;
  const coreId = "core";

  const branches = [
    { id: "moat", title: t.moat, value: quote.profile.moat },
    { id: "themes", title: t.themes, value: quote.profile.theme },
    {
      id: "financials",
      title: t.financials,
      value: `${quote.fundamentals.freeCashFlow || "FCF N/A"}｜${quote.fundamentals.grossMargin || "毛利率 N/A"}`
    },
    {
      id: "valuation",
      title: t.valuation,
      value: `${quote.valuationMethod.primary}｜${quote.valuation}`
    },
    { id: "risks", title: t.risks, value: "估值、競爭、供應鏈、總經與監管" }
  ];

  const nodes = [
    {
      id: coreId,
      type: "mindMapCore",
      position: { x: centerX - NODE_WIDTH.core / 2, y: centerY - NODE_HEIGHT.core / 2 },
      data: {
        symbol: quote.symbol,
        rating: displayValue(quote.rating, language)
      },
      draggable: false
    },
    ...branches.map((branch, index) => ({
      id: branch.id,
      type: "mindMapBranch",
      position: radialPosition(index, branches.length, radius, centerX, centerY, "branch"),
      data: {
        title: branch.title,
        value: truncate(branch.value)
      },
      draggable: false
    }))
  ];

  const edges = branches.map((branch) => ({
    id: `edge-${branch.id}`,
    source: coreId,
    target: branch.id,
    type: "smoothstep",
    animated: true,
    style: { stroke: "#8fc8ce", strokeWidth: 2 }
  }));

  return { nodes, edges };
}
