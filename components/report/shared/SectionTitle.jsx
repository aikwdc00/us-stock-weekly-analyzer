import { Info as InfoIcon } from "lucide-react";

export function SectionTitle({ title, tip }) {
  return (
    <div className="sectionTitle">
      <h3>{title}</h3>
      <span className="tooltipAnchor" tabIndex={0}>
        <InfoIcon size={15} />
        <span className="tooltipBubble">{tip}</span>
      </span>
    </div>
  );
}
