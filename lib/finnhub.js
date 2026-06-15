// Finnhub server-side client. Key read from env (server only).
import { serverFetch } from './serverFetch';
import { getYahooQuote } from './yahoo';

const BASE = 'https://finnhub.io/api/v1';
const KEY = () => process.env.FINNHUB_KEY || '';

function url(path, params = {}) {
  const qs = new URLSearchParams({ ...params, token: KEY() });
  return `${BASE}${path}?${qs.toString()}`;
}

export async function getQuote(symbol) {
  const { ok, data } = await serverFetch(url('/quote', { symbol }), { ttl: 4000 });
  // c: current, d: change, dp: pct, h/l/o: high/low/open, pc: prev close
  if (ok && data && data.c) {
    return {
      symbol,
      price: data.c,
      change: data.d,
      changePct: data.dp,
      high: data.h,
      low: data.l,
      open: data.o,
      prevClose: data.pc,
      time: data.t,
    };
  }
  // Fallback to Yahoo (covers foreign proxies / rate-limited cases).
  return getYahooQuote(symbol);
}

export async function getProfile(symbol) {
  const { ok, data } = await serverFetch(url('/stock/profile2', { symbol }), { ttl: 86400000 });
  if (!ok || !data) return null;
  return data;
}

export async function getMetrics(symbol) {
  const { ok, data } = await serverFetch(url('/stock/metric', { symbol, metric: 'all' }), { ttl: 3600000 });
  if (!ok || !data) return null;
  return data.metric || {};
}

export async function getRecommendations(symbol) {
  const { ok, data } = await serverFetch(url('/stock/recommendation', { symbol }), { ttl: 86400000 });
  if (!ok || !Array.isArray(data)) return [];
  return data;
}

export async function getEarnings(symbol) {
  const { ok, data } = await serverFetch(url('/stock/earnings', { symbol }), { ttl: 86400000 });
  if (!ok || !Array.isArray(data)) return [];
  return data;
}

export async function getCompanyNews(symbol, from, to) {
  const { ok, data } = await serverFetch(url('/company-news', { symbol, from, to }), { ttl: 600000 });
  if (!ok || !Array.isArray(data)) return [];
  return data;
}

export async function getMarketNews(category = 'general') {
  const { ok, data } = await serverFetch(url('/news', { category }), { ttl: 120000 });
  if (!ok || !Array.isArray(data)) return [];
  return data;
}

export async function symbolSearch(q) {
  const { ok, data } = await serverFetch(url('/search', { q }), { ttl: 3600000 });
  if (!ok || !data) return [];
  return data.result || [];
}

export async function getForexRates(base = 'USD') {
  // Finnhub /forex/rates is premium-only; use a free, keyless source instead.
  const { ok, data } = await serverFetch(`https://open.er-api.com/v6/latest/${base}`, { ttl: 60000 });
  if (!ok || !data || data.result !== 'success' || !data.rates) {
    // secondary free fallback
    const alt = await serverFetch(`https://api.exchangerate.host/latest?base=${base}`, { ttl: 60000 });
    if (alt.ok && alt.data?.rates) return { quote: alt.data.rates, base };
    return null;
  }
  return { quote: data.rates, base, updated: data.time_last_update_utc };
}

export async function getCandles(symbol, resolution, from, to) {
  const { ok, data } = await serverFetch(
    url('/stock/candle', { symbol, resolution, from, to }),
    { ttl: 300000 },
  );
  if (!ok || !data || data.s !== 'ok') return null;
  return data;
}

export async function getIpoCalendar(from, to) {
  const { ok, data } = await serverFetch(url('/calendar/ipo', { from, to }), { ttl: 3600000 });
  if (!ok || !data) return [];
  return data.ipoCalendar || [];
}

export async function getEarningsCalendar(from, to) {
  const { ok, data } = await serverFetch(url('/calendar/earnings', { from, to }), { ttl: 3600000 });
  if (!ok || !data) return [];
  return data.earningsCalendar || [];
}
