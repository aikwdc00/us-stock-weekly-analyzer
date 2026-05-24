"use client";

import { ReactFlow, ReactFlowProvider, useEdgesState, useNodesState, useReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect, useMemo } from "react";
import { buildMindMapGraph } from "../../../lib/buildMindMapGraph";
import { displayValue } from "../../../hooks/utils";
import { mindMapNodeTypes } from "../mindmap/MindMapNodes";

function MindMapCanvas({ quote, language, t }) {
  const { fitView } = useReactFlow();
  const graph = useMemo(
    () => buildMindMapGraph({ quote, language, t, displayValue }),
    [quote, language, t]
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(graph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph.edges);

  useEffect(() => {
    setNodes(graph.nodes);
    setEdges(graph.edges);
  }, [graph, setEdges, setNodes]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fitView({ padding: 0.22, duration: 320 });
    }, 50);
    return () => window.clearTimeout(timer);
  }, [fitView, quote.symbol, nodes.length]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={mindMapNodeTypes}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnScroll
      zoomOnScroll
      minZoom={0.45}
      maxZoom={1.4}
      proOptions={{ hideAttribution: true }}
    />
  );
}

export function InvestmentMindMap({ quote, t, language }) {
  return (
    <section className="analysisSection mindMapSection">
      <div className="sectionTitle static">
        <h3>{t.mindMap}</h3>
        <p>{t.mindMapHint}</p>
      </div>
      <div className="mindMapFlow">
        <ReactFlowProvider>
          <MindMapCanvas quote={quote} language={language} t={t} />
        </ReactFlowProvider>
      </div>
    </section>
  );
}
