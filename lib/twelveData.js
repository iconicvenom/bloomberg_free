// Twelve Data client — used specifically for Indian equities (NSE/BSE),
// which Finnhub's free tier doesn't cover. Symbols use the Yahoo-style
// suffix convention already used elsewhere in the app: RELIANCE.NS (NSE),
// TCS.BO (BSE).
import { serverFetch } from './serverFetch.js';

const BASE = 'https://api.twelvedata.com';
const KEY = () => process.env.TWELVE_DATA_KEY || '';

function parseIndianSymbol(symbol) {
  const upper = String(symbol || '').toUpperCase();
  if (upper.endsWith('.NS')) return { base: upper.slice(0, -3), exchange: 'NSE' };
  if (upper.endsWith('.BO')) return { base: upper.slice(0, -3), exchange: 'BSE' };
  return null;
}

export function isIndianSymbol(symbol) {
  return parseIndianSymbol(symbol) !== null;
}

export async function getTwelveDataQuote(symbol) {
  const parsed = parseIndianSymbol(symbol);
  if (!parsed || !KEY()) return null;
  const qs = new URLSearchParams({ symbol: parsed.base, exchange: parsed.exchange, apikey: KEY() });
  const { ok, data } = await serverFetch(`${BASE}/quote?${qs.toString()}`, { ttl: 5000 });
  if (!ok || !data || data.status === 'error' || data.code) return null;
  const price = Number(data.close);
  if (!price) return null;
  const prevClose = data.previous_close != null ? Number(data.previous_close) : null;
  return {
    symbol,
    price,
    change: data.change != null ? Number(data.change) : (prevClose ? price - prevClose : null),
    changePct: data.percent_change != null ? Number(data.percent_change) : null,
    high: data.high != null ? Number(data.high) : null,
    low: data.low != null ? Number(data.low) : null,
    open: data.open != null ? Number(data.open) : null,
    prevClose,
    time: data.timestamp,
  };
}

// Historical OHLCV, used as a fallback if Yahoo has no data for a symbol.
const RANGE_TO_INTERVAL = {
  '1D': { interval: '5min', outputsize: 78 },
  '5D': { interval: '30min', outputsize: 65 },
  '1M': { interval: '1day', outputsize: 30 },
  '3M': { interval: '1day', outputsize: 90 },
  '6M': { interval: '1day', outputsize: 180 },
  '1Y': { interval: '1day', outputsize: 365 },
  '5Y': { interval: '1week', outputsize: 260 },
};

export async function getTwelveDataHistory(symbol, range = '1M') {
  const parsed = parseIndianSymbol(symbol);
  if (!parsed || !KEY()) return null;
  const cfg = RANGE_TO_INTERVAL[range] || RANGE_TO_INTERVAL['1M'];
  const qs = new URLSearchParams({
    symbol: parsed.base,
    exchange: parsed.exchange,
    interval: cfg.interval,
    outputsize: String(cfg.outputsize),
    apikey: KEY(),
  });
  const { ok, data } = await serverFetch(`${BASE}/time_series?${qs.toString()}`, { ttl: 300000 });
  if (!ok || !data?.values) return null;
  return data.values
    .map((v) => ({
      time: Math.floor(new Date(v.datetime).getTime() / 1000),
      dateStr: v.datetime.slice(0, 10),
      open: Number(v.open),
      high: Number(v.high),
      low: Number(v.low),
      close: Number(v.close),
      volume: Number(v.volume) || 0,
    }))
    .reverse();
}

export async function twelveDataSymbolSearch(query) {
  if (!KEY()) return [];
  const qs = new URLSearchParams({ symbol: query, apikey: KEY() });
  const { ok, data } = await serverFetch(`${BASE}/symbol_search?${qs.toString()}`, { ttl: 3600000 });
  if (!ok || !Array.isArray(data?.data)) return [];
  return data.data
    .filter((r) => r.exchange === 'NSE' || r.exchange === 'BSE')
    .slice(0, 8)
    .map((r) => ({
      symbol: `${r.symbol}.${r.exchange === 'NSE' ? 'NS' : 'BO'}`,
      description: `${r.instrument_name} (${r.exchange})`,
      type: r.instrument_type,
    }));
}
