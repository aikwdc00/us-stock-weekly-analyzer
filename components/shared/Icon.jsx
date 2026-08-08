import {
	Activity,
	ArrowDownAZ,
	ArrowUp,
	ArrowUpAZ,
	ArrowUpRight,
	BarChart3,
	Check,
	ChevronDown,
	CircleDollarSign,
	Download,
	ExternalLink,
	Filter,
	Info,
	Languages,
	ListFilter,
	ListPlus,
	Moon,
	Plus,
	RefreshCw,
	Search,
	ShieldCheck,
	SlidersHorizontal,
	Sparkles,
	Sun,
	Trash2,
} from "lucide-react";

const iconRegistry = {
	Activity,
	ArrowDownAZ,
	ArrowUp,
	ArrowUpAZ,
	ArrowUpRight,
	BarChart3,
	Check,
	ChevronDown,
	CircleDollarSign,
	Download,
	ExternalLink,
	Filter,
	Info,
	Languages,
	ListFilter,
	ListPlus,
	Moon,
	Plus,
	RefreshCw,
	Search,
	ShieldCheck,
	SlidersHorizontal,
	Sparkles,
	Sun,
	Trash2,
};

export function Icon({ name, size = 16, strokeWidth = 2, decorative = true, ...props }) {
	const IconComponent = iconRegistry[name];
	if (!IconComponent) return null;

	return <IconComponent size={size} strokeWidth={strokeWidth} aria-hidden={decorative ? "true" : undefined} {...props} />;
}
