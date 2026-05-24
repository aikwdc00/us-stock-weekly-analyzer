const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
const TOKEN = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

export async function fetchFinnhubData(symbol) {
  if (!TOKEN) return null;

  try {
    const [recommendationRes, profileRes] = await Promise.all([
      fetch(`${FINNHUB_BASE_URL}/stock/recommendation?symbol=${symbol}&token=${TOKEN}`, { next: { revalidate: 3600 } }),
      fetch(`${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${TOKEN}`, { next: { revalidate: 86400 } })
    ]);

    if (!recommendationRes.ok || !profileRes.ok) {
      return null;
    }

    const recommendations = await recommendationRes.json();
    const profile = await profileRes.json();

    // Get the latest recommendation trend
    const latestRec = recommendations?.[0] || null;

    return {
      recommendations: latestRec,
      finnhubProfile: profile
    };
  } catch (error) {
    console.error("Finnhub fetch error:", error);
    return null;
  }
}
