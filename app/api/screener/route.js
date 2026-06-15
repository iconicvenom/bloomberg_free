import { getQuote, getMetrics, getProfile } from '@/lib/finnhub';
import { jsonResponse } from '@/lib/serverFetch';

export const dynamic = 'force-dynamic';

// Curated universe across sectors. Server-side, cached 1h via client-side TTL.
const UNIVERSE = [
  { symbol: 'AAPL', name: 'Apple Inc', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corp', sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corp', sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc', sector: 'Communication' },
  { symbol: 'META', name: 'Meta Platforms', sector: 'Communication' },
  { symbol: 'AMZN', name: 'Amazon.com', sector: 'Cons. Disc.' },
  { symbol: 'TSLA', name: 'Tesla Inc', sector: 'Cons. Disc.' },
  { symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Financials' },
  { symbol: 'BAC', name: 'Bank of America', sector: 'Financials' },
  { symbol: 'XOM', name: 'Exxon Mobil', sector: 'Energy' },
  { symbol: 'CVX', name: 'Chevron Corp', sector: 'Energy' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Health Care' },
  { symbol: 'PFE', name: 'Pfizer Inc', sector: 'Health Care' },
  { symbol: 'WMT', name: 'Walmart Inc', sector: 'Cons. Staples' },
  { symbol: 'KO', name: 'Coca-Cola Co', sector: 'Cons. Staples' },
  { symbol: 'BA', name: 'Boeing Co', sector: 'Industrials' },
];

export async function GET() {
  const rows = await Promise.all(UNIVERSE.map(async (u) => {
    const [quote, metric, profile] = await Promise.all([
      getQuote(u.symbol),
      getMetrics(u.symbol),
      getProfile(u.symbol),
    ]);
    return {
      ...u,
      price: quote?.price ?? null,
      change: quote?.change ?? null,
      changePct: quote?.changePct ?? null,
      pe: metric?.peTTM ?? null,
      marketCap: profile?.marketCapitalization ? profile.marketCapitalization * 1e6 : null,
      week52ChangePct: metric?.['52WeekPriceReturnDaily'] ?? null,
      dividendYield: metric?.dividendYieldIndicatedAnnual ?? null,
      beta: metric?.beta ?? null,
    };
  }));
  return jsonResponse({ rows, stale: rows.every((r) => r.price === null) });
}
