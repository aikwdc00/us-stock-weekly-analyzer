import { Handle, Position } from "@xyflow/react";

export function MindMapCoreNode({ data }) {
	return (
		<div className="mindMapFlowCore">
			<Handle type="source" position={Position.Top} id="top" className="mindMapFlowHandle" />
			<Handle type="source" position={Position.Right} id="right" className="mindMapFlowHandle" />
			<Handle type="source" position={Position.Bottom} id="bottom" className="mindMapFlowHandle" />
			<Handle type="source" position={Position.Left} id="left" className="mindMapFlowHandle" />
			<strong>{data.symbol}</strong>
			<span>{data.rating}</span>
		</div>
	);
}

export function MindMapBranchNode({ data }) {
	return (
		<div className="mindMapFlowBranch">
			<Handle type="target" position={Position.Top} className="mindMapFlowHandle" />
			<Handle type="target" position={Position.Right} className="mindMapFlowHandle" />
			<Handle type="target" position={Position.Bottom} className="mindMapFlowHandle" />
			<Handle type="target" position={Position.Left} className="mindMapFlowHandle" />
			<strong>{data.title}</strong>
			<p>{data.value}</p>
		</div>
	);
}

export const mindMapNodeTypes = {
	mindMapCore: MindMapCoreNode,
	mindMapBranch: MindMapBranchNode,
};
