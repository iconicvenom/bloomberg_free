// Finnhub server-side client. Key read from env (server only).
import { serverFetch } from './serverFetch.js';
import { getYahooQuote } from './yahoo.js';
import { isIndianSymbol, getTwelveDataQuote } from './twelveData.js';
import { resolveSymbol } from './symbolResolver.js';

const BASE = 'https://finnhub.io/api/v1';
const KEY = () => process.env.FINNHUB_KEY || '';

function url(path, params = {}) {
  const qs = new URLSearchParams({ ...params, token: KEY() });
  return `${BASE}${path}?${qs.toString()}`;
}

// Rejects a quote whose currency doesn't match what's expected for an
// NSE/BSE-suffixed symbol — the specific guard against e.g. a bare "INFY"
// silently resolving to the US-listed ADR instead of INFY.NS.
function isValidIndianQuote(quote) {
  return !!quote && quote.price != null && quote.currency === 'INR';
}

export async function getQuote(rawSymbol) {
  // Every quote fetch resolves the symbol first (alias map + live search,
  // same utility used by the search bar / save flows — see
  // lib/symbolResolver.js) so a bare "INFY"/"ITC"/"BALAMINES" always ends
  // up as "INFY.NS"/"ITC.NS"/"BALAMINES.NS" before any provider is called,
  // instead of silently querying the wrong (or no) instrument.
  const { symbol, resolved } = await resolveSymbol(rawSymbol);
  if (!resolved) return null;

  if (isIndianSymbol(symbol)) {
    const td = await getTwelveDataQuote(symbol);
    if (isValidIndianQuote(td)) return td;
    const yq = await getYahooQuote(symbol);
    if (isValidIndianQuote(yq)) return yq;
    // Both sources failed or returned a currency/exchange mismatch —
    // surface as unavailable rather than returning bad data.
    return null;
  }

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
