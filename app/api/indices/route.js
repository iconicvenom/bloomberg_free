import { getQuote } from '@/lib/finnhub';
import { jsonResponse } from '@/lib/serverFetch';
import { CONFIG } from '@/lib/config';

export const dynamic = 'force-dynamic';

// Use liquid ETF proxies for index-like exposure (free-tier friendly).
export async function GET() {
  const results = await Promise.all(CONFIG.indices.map((idx) => getQuote(idx.proxy)));
  const rows = CONFIG.indices.map((idx, i) => {
    const q = results[i];
    return {
      name: idx.name,
      symbol: idx.symbol,
      proxy: idx.proxy,
      price: q?.price ?? null,
      change: q?.change ?? null,
      changePct: q?.changePct ?? null,
      time: q?.time ?? null,
    };
  });
  return jsonResponse({ indices: rows, stale: rows.every((r) => r.price === null) });
}
