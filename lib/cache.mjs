const entries = new Map();
const inFlight = new Map();

export async function getOrCreateCached(key, producer, { ttlMs = 300_000 } = {}) {
	const now = Date.now();
	const cached = entries.get(key);
	if (cached && cached.expiresAt > now) return cached.value;

	const active = inFlight.get(key);
	if (active) {
		if (cached) return cached.value;
		return active;
	}

	const refresh = Promise.resolve()
		.then(producer)
		.then((value) => {
			entries.set(key, { value, expiresAt: Date.now() + ttlMs });
			return value;
		})
		.finally(() => {
			inFlight.delete(key);
		});

	inFlight.set(key, refresh);
	if (cached) {
		void refresh.catch(() => undefined);
		return cached.value;
	}

	return refresh;
}

export function clearCache() {
	entries.clear();
	inFlight.clear();
}
