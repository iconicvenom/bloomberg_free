import { getQuote } from '@/lib/finnhub';
import { jsonResponse } from '@/lib/serverFetch';

export const dynamic = 'force-dynamic';

// Batch quote fetch: /api/batch?symbols=AAPL,MSFT,...
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get('symbols') || '';
  const symbols = raw.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean).slice(0, 30);
  if (symbols.length === 0) return jsonResponse({ quotes: {} });

  const results = await Promise.all(symbols.map((s) => getQuote(s)));
  const quotes = {};
  symbols.forEach((s, i) => {
    if (results[i]) quotes[s] = results[i];
  });
  return jsonResponse({ quotes });
}
