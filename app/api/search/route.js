import { symbolSearch } from '@/lib/finnhub';
import { jsonResponse } from '@/lib/serverFetch';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  if (q.length < 1) return jsonResponse({ results: [] });
  const results = await symbolSearch(q);
  const slim = results
    .filter((r) => r.type === 'Common Stock' || r.type === 'ETP' || !r.type)
    .slice(0, 12)
    .map((r) => ({ symbol: r.symbol, description: r.description, type: r.type }));
  return jsonResponse({ results: slim });
}
