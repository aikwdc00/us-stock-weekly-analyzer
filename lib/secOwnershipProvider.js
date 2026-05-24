const SEC_TICKERS_URL = "https://www.sec.gov/files/company_tickers_exchange.json";
const SEC_SUBMISSIONS_URL = "https://data.sec.gov/submissions";
const SEC_ARCHIVES_URL = "https://www.sec.gov/Archives/edgar/data";
const OWNERSHIP_FORMS = new Set(["3", "4", "5", "3/A", "4/A", "5/A"]);
const cache = new Map();

function secHeaders(accept = "application/json") {
	return {
		"User-Agent": process.env.SEC_USER_AGENT || "fredli-us-stock-weekly-analyzer fredli@example.com",
		Accept: accept,
		"Accept-Encoding": "gzip, deflate",
	};
}

function accessionPath(accessionNumber) {
	return accessionNumber.replaceAll("-", "");
}

function cik10(cik) {
	return String(cik).padStart(10, "0");
}

async function fetchTickerMap() {
	const cached = cache.get("tickerMap");
	if (cached && Date.now() - cached.createdAt < 24 * 60 * 60 * 1000) {
		return cached.value;
	}

	const response = await fetch(SEC_TICKERS_URL, {
		headers: secHeaders(),
		next: { revalidate: 24 * 60 * 60 },
	});

	if (!response.ok) {
		throw new Error(`SEC ticker map failed: ${response.status}`);
	}

	const payload = await response.json();
	const map = new Map();

	for (const row of payload.data || []) {
		const [cik, name, ticker, exchange] = row;
		map.set(String(ticker).toUpperCase(), { cik, name, ticker, exchange });
	}

	cache.set("tickerMap", { createdAt: Date.now(), value: map });
	return map;
}

export async function fetchSecOwnershipFilings(symbol, limit = 8) {
	const normalized = symbol?.toUpperCase();
	if (!normalized) return { status: "no-symbol", filings: [] };

	const cached = cache.get(`ownership:${normalized}`);
	if (cached && Date.now() - cached.createdAt < 30 * 60 * 1000) {
		return cached.value;
	}

	const tickerMap = await fetchTickerMap();
	const company = tickerMap.get(normalized);

	if (!company?.cik) {
		return {
			status: "no-cik",
			source: "SEC EDGAR",
			filings: [],
			note: "SEC ticker map 找不到 CIK，可能是非 SEC 普通股代號、基金、ADR 或資料尚未涵蓋。",
		};
	}

	const cik = cik10(company.cik);
	const response = await fetch(`${SEC_SUBMISSIONS_URL}/CIK${cik}.json`, {
		headers: secHeaders(),
		next: { revalidate: 30 * 60 },
	});

	if (!response.ok) {
		throw new Error(`SEC submissions failed for ${normalized}: ${response.status}`);
	}

	const payload = await response.json();
	const recent = payload.filings?.recent || {};
	const forms = recent.form || [];
	const filings = [];

	for (let index = 0; index < forms.length && filings.length < limit; index += 1) {
		const form = forms[index];
		if (!OWNERSHIP_FORMS.has(form)) continue;

		const accessionNumber = recent.accessionNumber?.[index];
		const primaryDocument = recent.primaryDocument?.[index];
		if (!accessionNumber || !primaryDocument) continue;

		const basePath = `${SEC_ARCHIVES_URL}/${Number(company.cik)}/${accessionPath(accessionNumber)}`;
		filings.push({
			form,
			filingDate: recent.filingDate?.[index] || null,
			reportDate: recent.reportDate?.[index] || null,
			acceptedAt: recent.acceptanceDateTime?.[index] || null,
			accessionNumber,
			description: recent.primaryDocDescription?.[index] || "Ownership filing",
			documentUrl: `${basePath}/${primaryDocument}`,
			indexUrl: `${basePath}/${accessionNumber}-index.htm`,
		});
	}

	const result = {
		status: filings.length ? "ok" : "empty",
		source: "SEC EDGAR Forms 3/4/5",
		cik,
		companyName: company.name || payload.name,
		filings,
		note: filings.length
			? "SEC Form 3/4/5 是美股內部人持股與異動的正式公告來源；目前顯示近期 filing 與原文連結。"
			: "近期沒有抓到 SEC Form 3/4/5。外國私人發行人或部分 ADR 通常不一定適用 Section 16 Form 4。",
	};

	cache.set(`ownership:${normalized}`, { createdAt: Date.now(), value: result });
	return result;
}
