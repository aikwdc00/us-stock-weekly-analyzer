import { TooltipHint } from "./TooltipHint";

export function SectionTitle({ title, tip }) {
	return (
		<div className="sectionTitle">
			<h3>{title}</h3>
			<TooltipHint content={tip} />
		</div>
	);
}
