"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

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
			<ArrowUp size={18} aria-hidden="true" />
		</button>
	);
}
