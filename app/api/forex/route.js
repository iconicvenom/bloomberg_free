import { getForexRates } from '@/lib/finnhub';
import { jsonResponse } from '@/lib/serverFetch';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const base = (searchParams.get('base') || 'USD').toUpperCase();
  const data = await getForexRates(base);
  if (!data || !data.quote) {
    return jsonResponse({ base, quote: {}, stale: true });
  }
  return jsonResponse({ base, quote: data.quote });
}
