"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";

export function BackToTopButton({ label = "Back to top" }) {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		function handleScroll() {
			setVisible(window.scrollY > 480);
		}

		handleScroll();
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<button
			type="button"
			className="backToTop"
			aria-label={label}
			title={label}
			hidden={!visible}
			onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
		>
			<Icon name="ArrowUp" size={18} />
		</button>
	);
}
