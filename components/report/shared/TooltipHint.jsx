"use client";

import { Info as InfoIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

function resolveTooltipLayout(anchor) {
	if (!anchor || typeof window === "undefined") {
		return { align: "center", maxWidth: 320 };
	}

	const rect = anchor.getBoundingClientRect();
	const viewportWidth = window.innerWidth || 375;
	const maxWidth = Math.min(320, Math.max(220, viewportWidth - 32));
	const gutter = 24;
	const halfWidth = maxWidth / 2;

	let align = "center";
	if (rect.left < halfWidth + gutter) {
		align = "start";
	} else if (viewportWidth - rect.right < halfWidth + gutter) {
		align = "end";
	}

	return { align, maxWidth };
}

export function TooltipHint({ content, ariaLabel = "顯示說明", iconSize = 15 }) {
	const tooltipId = useId();
	const anchorRef = useRef(null);
	const [hovered, setHovered] = useState(false);
	const [focused, setFocused] = useState(false);
	const [pinned, setPinned] = useState(false);
	const [layout, setLayout] = useState({ align: "center", maxWidth: 320 });
	const visible = hovered || focused || pinned;

	useEffect(() => {
		if (!visible) return undefined;

		const syncLayout = () => {
			setLayout(resolveTooltipLayout(anchorRef.current));
		};

		syncLayout();
		window.addEventListener("resize", syncLayout);
		return () => window.removeEventListener("resize", syncLayout);
	}, [visible]);

	useEffect(() => {
		if (!pinned) return undefined;

		const handlePointerDown = (event) => {
			if (!anchorRef.current?.contains(event.target)) {
				setPinned(false);
			}
		};

		const handleEscape = (event) => {
			if (event.key === "Escape") {
				setPinned(false);
			}
		};

		document.addEventListener("pointerdown", handlePointerDown);
		document.addEventListener("keydown", handleEscape);
		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			document.removeEventListener("keydown", handleEscape);
		};
	}, [pinned]);

	if (!content) return null;

	return (
		<span
			ref={anchorRef}
			className="tooltipAnchor"
			data-visible={visible ? "true" : "false"}
			data-align={layout.align}
			style={{ "--tooltip-max-width": `${layout.maxWidth}px` }}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			<button
				type="button"
				className="tooltipTrigger"
				aria-label={ariaLabel}
				aria-expanded={visible}
				aria-describedby={visible ? tooltipId : undefined}
				onClick={() => setPinned((value) => !value)}
				onFocus={() => setFocused(true)}
				onBlur={() => setFocused(false)}
			>
				<InfoIcon size={iconSize} />
			</button>
			<span id={tooltipId} role="tooltip" className="tooltipBubble">
				{content}
			</span>
		</span>
	);
}
