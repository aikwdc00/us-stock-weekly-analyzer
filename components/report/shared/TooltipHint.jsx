"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "../../shared/Icon";

function resolveTooltipLayout(anchor) {
	if (!anchor || typeof window === "undefined") {
		return { maxWidth: 320, placement: "bottom", top: 0, left: 0 };
	}

	const rect = anchor.getBoundingClientRect();
	const viewportWidth = window.innerWidth || 375;
	const viewportHeight = window.innerHeight || 700;
	const maxWidth = Math.min(320, Math.max(220, viewportWidth - 32));
	const gap = 8;
	const placement = viewportHeight - rect.bottom < 180 && rect.top > 180 ? "top" : "bottom";
	const idealLeft = rect.left + rect.width / 2 - maxWidth / 2;
	const left = Math.min(Math.max(16, idealLeft), Math.max(16, viewportWidth - maxWidth - 16));
	const top = placement === "top" ? Math.max(16, rect.top - gap) : Math.min(viewportHeight - 16, rect.bottom + gap);

	return { maxWidth, placement, top, left };
}

export function TooltipHint({ content, ariaLabel = "顯示說明", iconSize = 15 }) {
	const tooltipId = useId();
	const anchorRef = useRef(null);
	const [hovered, setHovered] = useState(false);
	const [focused, setFocused] = useState(false);
	const [pinned, setPinned] = useState(false);
	const [layout, setLayout] = useState({ maxWidth: 320, placement: "bottom", top: 0, left: 0 });
	const visible = hovered || focused || pinned;

	useEffect(() => {
		if (!visible) return undefined;

		const syncLayout = () => {
			setLayout(resolveTooltipLayout(anchorRef.current));
		};

		syncLayout();
		window.addEventListener("resize", syncLayout);
		window.addEventListener("scroll", syncLayout, true);
		return () => {
			window.removeEventListener("resize", syncLayout);
			window.removeEventListener("scroll", syncLayout, true);
		};
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
				<Icon name="Info" size={iconSize} />
			</button>
			{visible && typeof document !== "undefined"
				? createPortal(
						<span
							id={tooltipId}
							role="tooltip"
							className="tooltipBubble"
							data-placement={layout.placement}
							style={{
								"--tooltip-left": `${layout.left}px`,
								"--tooltip-max-width": `${layout.maxWidth}px`,
								"--tooltip-top": `${layout.top}px`,
							}}
						>
							{content}
						</span>,
						document.body
					)
				: null}
		</span>
	);
}
