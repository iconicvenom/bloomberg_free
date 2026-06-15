import { getQuote } from '@/lib/finnhub';
import { jsonResponse } from '@/lib/serverFetch';

export const dynamic = 'force-dynamic';

export async function GET(_req, { params }) {
  const symbol = (params.symbol || '').toUpperCase();
  if (!symbol) return jsonResponse({ error: 'symbol required', data: null }, { status: 400 });
  const quote = await getQuote(symbol);
  if (!quote) return jsonResponse({ error: 'no data', data: null, stale: true });
  return jsonResponse(quote);
}
