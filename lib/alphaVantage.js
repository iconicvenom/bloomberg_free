// Alpha Vantage server-side client.
import { serverFetch } from './serverFetch';

const BASE = 'https://www.alphavantage.co/query';
const KEY = () => process.env.ALPHA_VANTAGE_KEY || '';

function url(params = {}) {
  const qs = new URLSearchParams({ ...params, apikey: KEY() });
  return `${BASE}?${qs.toString()}`;
}

const RANGE_TO_FUNCTION = {
  '1D': { function: 'TIME_SERIES_INTRADAY', interval: '5min', key: 'Time Series (5min)' },
  '5D': { function: 'TIME_SERIES_INTRADAY', interval: '30min', key: 'Time Series (30min)' },
  '1M': { function: 'TIME_SERIES_DAILY', key: 'Time Series (Daily)' },
  '3M': { function: 'TIME_SERIES_DAILY', key: 'Time Series (Daily)' },
  '6M': { function: 'TIME_SERIES_DAILY', key: 'Time Series (Daily)' },
  '1Y': { function: 'TIME_SERIES_DAILY', key: 'Time Series (Daily)' },
  '5Y': { function: 'TIME_SERIES_WEEKLY', key: 'Weekly Time Series' },
};

const RANGE_LIMITS = {
  '1D': 78, '5D': 130, '1M': 22, '3M': 66, '6M': 132, '1Y': 252, '5Y': 260,
};

export async function getHistory(symbol, range = '1M') {
  const cfg = RANGE_TO_FUNCTION[range] || RANGE_TO_FUNCTION['1M'];
  const params = { function: cfg.function, symbol, outputsize: 'full' };
  if (cfg.interval) params.interval = cfg.interval;
  const { ok, data } = await serverFetch(url(params), { ttl: 3600000 });
  if (!ok || !data) return null;
  const series = data[cfg.key];
  if (!series) return null; // likely rate-limited or invalid symbol

  const candles = Object.entries(series)
    .map(([date, ohlc]) => ({
      time: Math.floor(new Date(date.includes(' ') ? date.replace(' ', 'T') : `${date}T00:00:00`).getTime() / 1000),
      dateStr: date,
      open: parseFloat(ohlc['1. open']),
      high: parseFloat(ohlc['2. high']),
      low: parseFloat(ohlc['3. low']),
      close: parseFloat(ohlc['4. close']),
      volume: parseFloat(ohlc['5. volume'] || ohlc['6. volume'] || 0),
    }))
    .sort((a, b) => a.time - b.time);

  const limit = RANGE_LIMITS[range] || candles.length;
  return candles.slice(-limit);
}

export async function getSectorPerformance() {
  const { ok, data } = await serverFetch(url({ function: 'SECTOR' }), { ttl: 600000 });
  if (!ok || !data) return null;
  return data['Rank A: Real-Time Performance'] || data['Rank B: 1 Day Performance'] || null;
}

export async function getFxIntraday(from, to) {
  const { ok, data } = await serverFetch(
    url({ function: 'FX_DAILY', from_symbol: from, to_symbol: to, outputsize: 'compact' }),
    { ttl: 600000 },
  );
  if (!ok || !data) return null;
  const series = data['Time Series FX (Daily)'];
  if (!series) return null;
  return Object.entries(series)
    .map(([date, ohlc]) => ({
      time: Math.floor(new Date(`${date}T00:00:00`).getTime() / 1000),
      close: parseFloat(ohlc['4. close']),
    }))
    .sort((a, b) => a.time - b.time)
    .slice(-30);
}
