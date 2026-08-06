"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";

function scrollToTop() {
	const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	window.scrollTo({
		top: 0,
		left: 0,
		behavior: prefersReducedMotion ? "auto" : "smooth",
	});
}

export function BackToTopButton({ label = "Back to top" }) {
	const [visible, setVisible] = useState(false);
	const scrollingToTopRef = useRef(false);

	useEffect(() => {
		function handleScroll() {
			const atTop = window.scrollY <= 0;

			if (atTop) {
				scrollingToTopRef.current = false;
			}

			setVisible(scrollingToTopRef.current || window.scrollY > 480);
		}

		handleScroll();
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	function handleClick() {
		scrollingToTopRef.current = true;
		scrollToTop();
	}

	return (
		<button type="button" className="backToTop" aria-label={label} title={label} hidden={!visible} onClick={handleClick}>
			<Icon name="ArrowUp" size={18} />
		</button>
	);
}
