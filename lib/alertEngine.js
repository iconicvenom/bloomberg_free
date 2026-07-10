// Background alert-checking loop, started once from server.js. Reuses the
// existing server-side quote/history clients directly (no HTTP round-trip —
// same Node process), and shares the process-wide SSE registry with server.js.
import { listActiveAlerts, markTriggered } from './store/alerts.js';
import { getQuote } from './finnhub.js';
import { getYahooHistory } from './yahoo.js';
import { sseHub } from './sseHub.js';

const POLL_MS = 15000; // background/passive feature — no need for the 5s live-quote cadence
const MA_CACHE_TTL_MS = 3600000; // 1hr — MA-50 doesn't move materially intraday
const maCache = new Map(); // symbol -> { ma50, computedAt }
const maSide = new Map(); // symbol -> boolean (price currently above MA-50)

async function getMa50(symbol) {
  const cached = maCache.get(symbol);
  if (cached && Date.now() - cached.computedAt < MA_CACHE_TTL_MS) return cached.ma50;
  const candles = await getYahooHistory(symbol, '3M');
  if (!candles || candles.length < 50) return null;
  const last50 = candles.slice(-50);
  const ma50 = last50.reduce((sum, c) => sum + c.close, 0) / 50;
  maCache.set(symbol, { ma50, computedAt: Date.now() });
  return ma50;
}

async function checkAlerts() {
  const alerts = await listActiveAlerts();
  if (alerts.length === 0) return;

  const symbols = [...new Set(alerts.map((a) => a.symbol))];
  const quotes = {};
  await Promise.all(symbols.map(async (s) => {
    quotes[s] = await getQuote(s);
  }));

  for (const alert of alerts) {
    const q = quotes[alert.symbol];
    if (!q) continue;
    let hit = false;

    if (alert.type === 'price') {
      hit = alert.condition === 'above' ? q.price >= alert.value : q.price <= alert.value;
    } else if (alert.type === 'percent_change') {
      hit = alert.condition === 'above' ? q.changePct >= alert.value : q.changePct <= alert.value;
    } else if (alert.type === 'ma_cross') {
      const ma = await getMa50(alert.symbol);
      if (ma != null) {
        const prevAbove = maSide.get(alert.symbol);
        const nowAbove = q.price > ma;
        if (prevAbove != null && prevAbove !== nowAbove) {
          hit = alert.condition === 'above' ? nowAbove : !nowAbove;
        }
        maSide.set(alert.symbol, nowAbove);
      }
    }

    if (hit) {
      const updated = await markTriggered(alert.id);
      if (updated) sseHub.broadcast({ type: 'alert_triggered', alert: updated });
    }
  }
}

export function startAlertEngine() {
  checkAlerts().catch((err) => console.error('[alertEngine]', err));
  setInterval(() => checkAlerts().catch((err) => console.error('[alertEngine]', err)), POLL_MS);
}
