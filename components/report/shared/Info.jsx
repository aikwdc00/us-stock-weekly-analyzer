import { TooltipHint } from "./TooltipHint";

export function Info({ label, value, tip }) {
	return (
		<div className="info">
			<div className="infoLabelRow">
				<span>{label}</span>
				{tip ? <TooltipHint content={tip} ariaLabel={`${label} 說明`} /> : null}
			</div>
			<strong>{value || "N/A"}</strong>
		</div>
	);
}
