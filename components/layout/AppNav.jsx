import Link from "next/link";

const items = [
	{ href: "/", id: "overview", label: "總覽" },
	{ href: "/today", id: "today", label: "Today" },
	{ href: "/watchlist", id: "watchlist", label: "追蹤清單" },
	{ href: "/explore", id: "discover", label: "探索標的" },
];

export function AppNav({ active, className = "appNav" }) {
	return (
		<nav className={className} aria-label="研究區域">
			{items.map((item) => (
				<Link
					key={item.id}
					className={active === item.id ? "active" : ""}
					href={item.href}
					aria-current={active === item.id ? "page" : undefined}
				>
					{item.label}
				</Link>
			))}
		</nav>
	);
}
