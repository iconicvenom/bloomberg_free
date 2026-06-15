import { getQuote, getProfile } from '@/lib/finnhub';
import { jsonResponse } from '@/lib/serverFetch';

export const dynamic = 'force-dynamic';

// Free tier has no movers endpoint — derive from a liquid universe.
const UNIVERSE = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'INTC',
  'JPM', 'BAC', 'WMT', 'DIS', 'BA', 'XOM', 'CVX', 'PFE', 'KO', 'PEP',
  'CSCO', 'ORCL', 'CRM', 'ADBE', 'PYPL', 'UBER', 'COIN', 'PLTR', 'SHOP', 'SQ',
];

const NAME_MAP = {
  AAPL: 'Apple Inc', MSFT: 'Microsoft Corp', GOOGL: 'Alphabet Inc', AMZN: 'Amazon.com',
  TSLA: 'Tesla Inc', NVDA: 'NVIDIA Corp', META: 'Meta Platforms', NFLX: 'Netflix Inc',
  AMD: 'Advanced Micro', INTC: 'Intel Corp', JPM: 'JPMorgan Chase', BAC: 'Bank of America',
  WMT: 'Walmart Inc', DIS: 'Walt Disney', BA: 'Boeing Co', XOM: 'Exxon Mobil',
  CVX: 'Chevron Corp', PFE: 'Pfizer Inc', KO: 'Coca-Cola Co', PEP: 'PepsiCo Inc',
  CSCO: 'Cisco Systems', ORCL: 'Oracle Corp', CRM: 'Salesforce', ADBE: 'Adobe Inc',
  PYPL: 'PayPal Holdings', UBER: 'Uber Tech', COIN: 'Coinbase', PLTR: 'Palantir',
  SHOP: 'Shopify Inc', SQ: 'Block Inc',
};

export async function GET() {
  const results = await Promise.all(UNIVERSE.map((s) => getQuote(s)));
  const rows = results
    .map((q, i) => (q && q.price ? {
      symbol: UNIVERSE[i],
      name: NAME_MAP[UNIVERSE[i]] || UNIVERSE[i],
      price: q.price,
      change: q.change,
      changePct: q.changePct,
    } : null))
    .filter(Boolean);

  const gainers = [...rows].sort((a, b) => b.changePct - a.changePct).slice(0, 10);
  const losers = [...rows].sort((a, b) => a.changePct - b.changePct).slice(0, 10);
  const active = [...rows].sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)).slice(0, 10);

  return jsonResponse({ gainers, losers, active, stale: rows.length === 0 });
}
