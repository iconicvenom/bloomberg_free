// CoinGecko server-side client. Demo key optional.
import { serverFetch } from './serverFetch';

const BASE = 'https://api.coingecko.com/api/v3';

function headers() {
  const key = process.env.COINGECKO_KEY;
  return key ? { 'x-cg-demo-api-key': key } : {};
}

export async function getCoinsMarkets({ perPage = 50, page = 1, ids } = {}) {
  const params = new URLSearchParams({
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: String(perPage),
    page: String(page),
    sparkline: 'true',
    price_change_percentage: '24h,7d',
  });
  if (ids) params.set('ids', ids);
  const { ok, data } = await serverFetch(`${BASE}/coins/markets?${params.toString()}`, {
    ttl: 30000,
    headers: headers(),
  });
  if (!ok || !Array.isArray(data)) return [];
  return data;
}

export async function getGlobal() {
  const { ok, data } = await serverFetch(`${BASE}/global`, { ttl: 60000, headers: headers() });
  if (!ok || !data) return null;
  return data.data || null;
}

export async function getTrending() {
  const { ok, data } = await serverFetch(`${BASE}/search/trending`, { ttl: 300000, headers: headers() });
  if (!ok || !data) return [];
  return data.coins || [];
}

export async function getCoinMarketChart(id, days = 7) {
  const { ok, data } = await serverFetch(
    `${BASE}/coins/${id}/market_chart?vs_currency=usd&days=${days}`,
    { ttl: 300000, headers: headers() },
  );
  if (!ok || !data) return null;
  return data;
}
