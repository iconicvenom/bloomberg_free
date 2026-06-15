import { getQuote } from '@/lib/finnhub';
import { jsonResponse } from '@/lib/serverFetch';
import { CONFIG } from '@/lib/config';

export const dynamic = 'force-dynamic';

// Map commodity futures to liquid ETF/ETN proxies that the free tier serves.
const PROXY = {
  'CL=F': 'USO', 'BZ=F': 'BNO', 'NG=F': 'UNG', 'RB=F': 'UGA',
  'GC=F': 'GLD', 'SI=F': 'SLV', 'PL=F': 'PPLT', 'HG=F': 'CPER', 'PA=F': 'PALL',
  'ZC=F': 'CORN', 'ZW=F': 'WEAT', 'ZS=F': 'SOYB', 'KC=F': 'JO', 'SB=F': 'CANE', 'CT=F': 'BAL',
  'CC=F': 'NIB', 'OJ=F': 'JO', 'LBS=F': 'WOOD',
};

export async function GET() {
  const groups = Object.entries(CONFIG.commodities);
  const out = {};
  await Promise.all(groups.map(async ([group, items]) => {
    const quotes = await Promise.all(items.map((c) => getQuote(PROXY[c.symbol] || c.symbol)));
    out[group] = items.map((c, i) => {
      const q = quotes[i];
      return {
        ...c,
        proxy: PROXY[c.symbol] || c.symbol,
        price: q?.price ?? null,
        change: q?.change ?? null,
        changePct: q?.changePct ?? null,
      };
    });
  }));
  return jsonResponse({ commodities: out });
}
