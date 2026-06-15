import { getCoinMarketChart } from '@/lib/coinGecko';
import { jsonResponse } from '@/lib/serverFetch';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const id = params.id;
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get('days') || '7', 10);
  const chart = await getCoinMarketChart(id, days);
  if (!chart) return jsonResponse({ id, candles: [], stale: true });
  const candles = (chart.prices || []).map(([t, price]) => ({
    time: Math.floor(t / 1000),
    value: price,
  }));
  return jsonResponse({ id, days, candles, marketCaps: chart.market_caps, volumes: chart.total_volumes });
}
