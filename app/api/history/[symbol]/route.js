import { getHistory } from '@/lib/alphaVantage';
import { getYahooHistory } from '@/lib/yahoo';
import { jsonResponse } from '@/lib/serverFetch';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const symbol = (params.symbol || '').toUpperCase();
  const { searchParams } = new URL(req.url);
  const range = searchParams.get('range') || '1M';
  if (!symbol) return jsonResponse({ error: 'symbol required', candles: [] }, { status: 400 });

  // Primary: Yahoo (free, no key, all ranges). Fallback: Alpha Vantage.
  let candles = await getYahooHistory(symbol, range);
  let source = 'yahoo';
  if (!candles || candles.length === 0) {
    candles = await getHistory(symbol, range);
    source = 'alphavantage';
  }

  if (!candles || candles.length === 0) {
    return jsonResponse({ symbol, range, candles: [], stale: true, note: 'no-data' });
  }
  return jsonResponse({ symbol, range, candles, source });
}
