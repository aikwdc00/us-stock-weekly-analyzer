const DEFAULT_TIMEOUT_MS = 12_000;

export function fetchWithTimeout(url, options = {}) {
	const { timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options;
	const signal = fetchOptions.signal || AbortSignal.timeout(timeoutMs);
	return fetch(url, { ...fetchOptions, signal });
}
