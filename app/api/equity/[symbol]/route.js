import { getQuote, getProfile, getMetrics, getRecommendations, getEarnings } from '@/lib/finnhub';
import { jsonResponse } from '@/lib/serverFetch';

export const dynamic = 'force-dynamic';

// Aggregated equity payload for the Equity screen left column.
export async function GET(_req, { params }) {
  const symbol = (params.symbol || '').toUpperCase();
  if (!symbol) return jsonResponse({ error: 'symbol required', data: null }, { status: 400 });

  const [quote, profile, metrics, recommendations, earnings] = await Promise.all([
    getQuote(symbol),
    getProfile(symbol),
    getMetrics(symbol),
    getRecommendations(symbol),
    getEarnings(symbol),
  ]);

  return jsonResponse({ symbol, quote, profile, metrics, recommendations, earnings });
}
