export const PROVIDER_STATES = Object.freeze({
	CANDIDATE: "candidate",
	PROVISIONAL: "provisional",
	VERIFIED: "verified",
	REJECTED: "rejected",
});

export const providerRegistry = Object.freeze([
	{
		id: "sec-edgar",
		name: "SEC EDGAR",
		state: PROVIDER_STATES.VERIFIED,
		role: "primary",
		capabilities: ["identity", "filings", "ownership", "xbrl"],
		sourceUrl: "https://www.sec.gov/edgar/sec-api-documentation",
		fallback: null,
	},
	{
		id: "yahoo-finance",
		name: "Yahoo Finance",
		state: PROVIDER_STATES.PROVISIONAL,
		role: "supplementary",
		capabilities: ["quote", "chart", "consensus"],
		sourceUrl: "https://finance.yahoo.com/",
		fallback: "stooq",
	},
	{
		id: "stockanalysis",
		name: "StockAnalysis",
		state: PROVIDER_STATES.PROVISIONAL,
		role: "supplementary",
		capabilities: ["statistics", "forecast", "financials", "news"],
		sourceUrl: "https://stockanalysis.com/",
		fallback: null,
	},
	{
		id: "finnhub",
		name: "Finnhub",
		state: PROVIDER_STATES.PROVISIONAL,
		role: "supplementary",
		capabilities: ["profile", "recommendation"],
		sourceUrl: "https://finnhub.io/docs/api",
		fallback: null,
	},
	{
		id: "polygon",
		name: "Polygon.io",
		state: PROVIDER_STATES.CANDIDATE,
		role: "candidate",
		capabilities: ["quote", "corporate-actions", "fundamentals"],
		sourceUrl: "https://polygon.io/docs",
		fallback: null,
	},
	{
		id: "alphavantage",
		name: "Alpha Vantage",
		state: PROVIDER_STATES.CANDIDATE,
		role: "candidate",
		capabilities: ["quote", "fundamentals", "news"],
		sourceUrl: "https://www.alphavantage.co/documentation/",
		fallback: null,
	},
]);

export function getProvider(id) {
	return providerRegistry.find((provider) => provider.id === id) || null;
}

export function getVerifiedProviders(capability) {
	return providerRegistry.filter(
		(provider) => provider.state === PROVIDER_STATES.VERIFIED && (!capability || provider.capabilities.includes(capability))
	);
}

export function getProviderForUse(id, { capability, role = "primary" } = {}) {
	const provider = getProvider(id);
	if (!provider || (capability && !provider.capabilities.includes(capability))) return null;

	const isVerifiedPrimary = provider.state === PROVIDER_STATES.VERIFIED && provider.role === "primary";
	const isApprovedSupplementary = role === "supplementary" && provider.state === PROVIDER_STATES.PROVISIONAL && provider.role === "supplementary";
	return isVerifiedPrimary || isApprovedSupplementary ? provider : null;
}
