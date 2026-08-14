export async function mapWithConcurrency(items, limit, worker) {
	const values = Array.from(items || []);
	const results = new Array(values.length);
	let nextIndex = 0;

	async function consume() {
		while (nextIndex < values.length) {
			const index = nextIndex;
			nextIndex += 1;
			results[index] = await worker(values[index], index);
		}
	}

	const workers = Array.from({ length: Math.min(Math.max(1, limit), values.length) }, () => consume());
	await Promise.all(workers);
	return results;
}

export function allSettledWithConcurrency(items, limit, worker) {
	return mapWithConcurrency(items, limit, async (item, index) => {
		try {
			return { status: "fulfilled", value: await worker(item, index) };
		} catch (reason) {
			return { status: "rejected", reason };
		}
	});
}
