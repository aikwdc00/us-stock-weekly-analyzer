"use client";

import { useEffect, useMemo, useState } from "react";
import { copy, STORAGE_KEYS } from "./copy";

export function usePreferences() {
	const [language, setLanguage] = useState("zh");
	const [theme, setTheme] = useState("light");

	const t = useMemo(() => copy[language], [language]);

	useEffect(() => {
		const savedLanguage = window.localStorage.getItem(STORAGE_KEYS.language);
		const savedTheme = window.localStorage.getItem(STORAGE_KEYS.theme);
		if (savedLanguage === "zh" || savedLanguage === "en") {
			setLanguage(savedLanguage);
		}
		if (savedTheme === "light" || savedTheme === "dark") {
			setTheme(savedTheme);
		}
	}, []);

	useEffect(() => {
		window.localStorage.setItem(STORAGE_KEYS.language, language);
	}, [language]);

	useEffect(() => {
		document.documentElement.dataset.theme = theme;
		window.localStorage.setItem(STORAGE_KEYS.theme, theme);
	}, [theme]);

	function toggleTheme() {
		setTheme((current) => (current === "dark" ? "light" : "dark"));
	}

	return {
		language,
		setLanguage,
		theme,
		setTheme,
		toggleTheme,
		t,
	};
}
