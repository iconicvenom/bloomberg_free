// Resolves a raw ticker/company name to a fully-qualified symbol — the
// single source of truth used by both the search bar and any
// save/navigate flow that touches a stock symbol. Necessary because Indian
// equities require an exchange suffix (RELIANCE.NS, SBIN.NS) that most
// users won't type themselves.
import { serverFetch } from './serverFetch.js';

// Fast path for common Indian names/tickers — resolves instantly with no
// network call, and still works if Yahoo's search endpoint is down/slow.
const INDIAN_ALIASES = {
  SBI: 'SBIN.NS',
  SBIN: 'SBIN.NS',
  'STATE BANK OF INDIA': 'SBIN.NS',
  TCS: 'TCS.NS',
  'TATA CONSULTANCY SERVICES': 'TCS.NS',
  INFY: 'INFY.NS',
  INFOSYS: 'INFY.NS',
  RELIANCE: 'RELIANCE.NS',
  'RELIANCE INDUSTRIES': 'RELIANCE.NS',
  HDFCBANK: 'HDFCBANK.NS',
  'HDFC BANK': 'HDFCBANK.NS',
  ICICIBANK: 'ICICIBANK.NS',
  'ICICI BANK': 'ICICIBANK.NS',
  WIPRO: 'WIPRO.NS',
  ITC: 'ITC.NS',
  HINDUNILVR: 'HINDUNILVR.NS',
  HUL: 'HINDUNILVR.NS',
  'HINDUSTAN UNILEVER': 'HINDUNILVR.NS',
  BAJFINANCE: 'BAJFINANCE.NS',
  'BAJAJ FINANCE': 'BAJFINANCE.NS',
  LT: 'LT.NS',
  'L&T': 'LT.NS',
  'LARSEN & TOUBRO': 'LT.NS',
  MARUTI: 'MARUTI.NS',
  SUNPHARMA: 'SUNPHARMA.NS',
  KOTAKBANK: 'KOTAKBANK.NS',
  AXISBANK: 'AXISBANK.NS',
  BHARTIARTL: 'BHARTIARTL.NS',
  AIRTEL: 'BHARTIARTL.NS',
  ONGC: 'ONGC.NS',
  NTPC: 'NTPC.NS',
  POWERGRID: 'POWERGRID.NS',
  TATAMOTORS: 'TATAMOTORS.NS',
  TATASTEEL: 'TATASTEEL.NS',
  ADANIENT: 'ADANIENT.NS',
  ASIANPAINT: 'ASIANPAINT.NS',
  ZOMATO: 'ZOMATO.NS',
  PAYTM: 'PAYTM.NS',
  NYKAA: 'NYKAA.NS',
};

const INDIAN_SUFFIX_RE = /\.(NS|BO)$/;

// Separate from serverFetch's per-URL TTL cache: this caches the *resolved
// outcome* per raw input, so repeated lookups of the same typed text (e.g.
// re-typing "sbin" across sessions) skip straight to a cached answer even
// across different underlying strategies (alias vs. Yahoo search).
//
// Successes and failures get very different TTLs on purpose: a resolved
// symbol->ticker mapping rarely changes (24h cache is fine), but a failure
// is often just a transient hiccup (Yahoo rate-limiting a burst of
// simultaneous first-time lookups — e.g. an entire portfolio's worth of
// unresolved holdings all resolving at once on page load). Caching a
// failure for 24h would leave that holding permanently stuck showing
// "price unavailable" until the cache expired or the server restarted, so
// failures get a short TTL and self-heal on the next 5s live-price poll.
const resolutionCache = new Map();
const SUCCESS_TTL_MS = 24 * 60 * 60 * 1000;
const FAILURE_TTL_MS = 30 * 1000;

function cacheGet(key) {
  const hit = resolutionCache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;
  return null;
}

function cacheSet(key, value) {
  const ttl = value.resolved ? SUCCESS_TTL_MS : FAILURE_TTL_MS;
  resolutionCache.set(key, { value, expires: Date.now() + ttl });
}

// Caps how many Yahoo search requests run at once across the whole
// process — resolving an entire portfolio's worth of never-before-seen
// symbols in one Promise.all burst (see app/api/batch/route.js) can
// otherwise fire 30-40 simultaneous requests and get rate-limited.
const MAX_CONCURRENT_SEARCHES = 5;
let activeSearches = 0;
const searchQueue = [];

function runNextQueued() {
  if (activeSearches >= MAX_CONCURRENT_SEARCHES || searchQueue.length === 0) return;
  activeSearches += 1;
  const { query, resolve, reject } = searchQueue.shift();
  searchYahooDirect(query).then(resolve, reject).finally(() => {
    activeSearches -= 1;
    runNextQueued();
  });
}

function searchYahoo(query) {
  return new Promise((resolve, reject) => {
    searchQueue.push({ query, resolve, reject });
    runNextQueued();
  });
}

async function searchYahooDirect(query) {
  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`;
  const { ok, data } = await serverFetch(url, {
    ttl: SUCCESS_TTL_MS,
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
  });
  if (!ok || !Array.isArray(data?.quotes)) return [];
  return data.quotes.filter((q) => q.symbol && (q.quoteType === 'EQUITY' || !q.quoteType));
}

// Returns { input, symbol, resolved }. `symbol` is always a best-effort
// value (falls back to the uppercased raw input); `resolved` is false only
// when nothing could be confidently matched, so callers can show a
// "symbol not found" state instead of silently using a bad guess.
export async function resolveSymbol(rawInput) {
  const input = String(rawInput || '').trim();
  if (!input) return { input, symbol: null, resolved: false };

  const upper = input.toUpperCase();
  const cached = cacheGet(upper);
  if (cached) return { input, ...cached };

  // Already fully qualified — pass through unchanged.
  if (INDIAN_SUFFIX_RE.test(upper)) {
    const result = { symbol: upper, resolved: true };
    cacheSet(upper, result);
    return { input, ...result };
  }

  // Fast local alias — no network call, works even if Yahoo is unreachable.
  if (INDIAN_ALIASES[upper]) {
    const result = { symbol: INDIAN_ALIASES[upper], resolved: true };
    cacheSet(upper, result);
    return { input, ...result };
  }

  // Ask Yahoo's autocomplete/search endpoint. This also correctly passes
  // through already-valid non-Indian tickers (e.g. "AAPL" search just
  // returns "AAPL" as the top match).
  let quotes = [];
  try {
    quotes = await searchYahoo(upper);
  } catch {
    quotes = [];
  }

  if (quotes.length > 0) {
    const nse = quotes.find((q) => q.exchange === 'NSI');
    const match = nse || quotes[0];
    const result = { symbol: match.symbol.toUpperCase(), resolved: true };
    cacheSet(upper, result);
    return { input, ...result };
  }

  // Nothing matched — let the caller decide how to surface "not found".
  const result = { symbol: upper, resolved: false };
  cacheSet(upper, result);
  return { input, ...result };
}
