const windows = new Map();

function prune(now) {
	for (const [key, window] of windows) {
		if (window.expiresAt <= now) windows.delete(key);
	}
}

export function checkRateLimit(key, { limit = 60, windowMs = 60_000 } = {}) {
	const now = Date.now();
	prune(now);
	const current = windows.get(key);
	const window = current && current.expiresAt > now ? current : { count: 0, expiresAt: now + windowMs };
	window.count += 1;
	windows.set(key, window);

	return {
		allowed: window.count <= limit,
		remaining: Math.max(0, limit - window.count),
		retryAfter: Math.max(1, Math.ceil((window.expiresAt - now) / 1000)),
	};
}

export function rateLimitHeaders(result) {
	return {
		"X-RateLimit-Remaining": String(result.remaining),
		"Retry-After": String(result.retryAfter),
	};
}

export function resetRateLimits() {
	windows.clear();
}
