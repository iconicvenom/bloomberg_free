import { symbolSearch } from '@/lib/finnhub';
import { twelveDataSymbolSearch } from '@/lib/twelveData';
import { jsonResponse } from '@/lib/serverFetch';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  if (q.length < 1) return jsonResponse({ results: [] });

  const [results, indianResults] = await Promise.all([
    symbolSearch(q),
    twelveDataSymbolSearch(q),
  ]);
  const slim = results
    .filter((r) => r.type === 'Common Stock' || r.type === 'ETP' || !r.type)
    .map((r) => ({ symbol: r.symbol, description: r.description, type: r.type }));
  // NSE/BSE matches first — Finnhub's free tier can't find these at all,
  // so surfacing them is the main gap this fixes.
  const merged = [...indianResults, ...slim].slice(0, 12);
  return jsonResponse({ results: merged });
}
