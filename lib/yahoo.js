// Yahoo Finance free chart API — primary historical OHLCV source.
// No API key required. Covers intraday + daily/weekly across all ranges.
import { serverFetch } from './serverFetch.js';

const RANGE_MAP = {
  '1D': { range: '1d', interval: '5m' },
  '5D': { range: '5d', interval: '30m' },
  '1M': { range: '1mo', interval: '1d' },
  '3M': { range: '3mo', interval: '1d' },
  '6M': { range: '6mo', interval: '1d' },
  '1Y': { range: '1y', interval: '1d' },
  '5Y': { range: '5y', interval: '1wk' },
};

export async function getYahooHistory(symbol, range = '1M') {
  const cfg = RANGE_MAP[range] || RANGE_MAP['1M'];
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${cfg.range}&interval=${cfg.interval}`;
  const { ok, data } = await serverFetch(url, {
    ttl: 300000,
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
  });
  if (!ok || !data?.chart?.result?.[0]) return null;

  const result = data.chart.result[0];
  const ts = result.timestamp || [];
  const q = result.indicators?.quote?.[0] || {};
  const candles = [];
  for (let i = 0; i < ts.length; i += 1) {
    const open = q.open?.[i];
    const high = q.high?.[i];
    const low = q.low?.[i];
    const close = q.close?.[i];
    if (open == null || close == null || high == null || low == null) continue;
    candles.push({
      time: ts[i],
      dateStr: new Date(ts[i] * 1000).toISOString().slice(0, 10),
      open,
      high,
      low,
      close,
      volume: q.volume?.[i] || 0,
    });
  }
  return candles.length ? candles : null;
}

// Quote fallback (used if Finnhub quote is unavailable).
export async function getYahooQuote(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`;
  const { ok, data } = await serverFetch(url, {
    ttl: 5000,
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  const meta = data?.chart?.result?.[0]?.meta;
  if (!ok || !meta) return null;
  const price = meta.regularMarketPrice;
  const prev = meta.chartPreviousClose ?? meta.previousClose;
  return {
    symbol,
    price,
    change: prev != null ? price - prev : null,
    changePct: prev ? ((price - prev) / prev) * 100 : null,
    high: meta.regularMarketDayHigh,
    low: meta.regularMarketDayLow,
    open: meta.regularMarketOpen,
    prevClose: prev,
    time: meta.regularMarketTime,
  };
}
