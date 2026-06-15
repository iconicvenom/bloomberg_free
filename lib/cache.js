// localStorage cache with TTL. SSR-safe (no-ops on the server).
const MEM = new Map();
const PREFIX = 'bbt:';

function now() {
  return Date.now();
}

export function cacheGet(key) {
  const k = PREFIX + key;
  // Memory layer first (fast, works on server)
  const mem = MEM.get(k);
  if (mem && (mem.expires === 0 || mem.expires > now())) {
    return { data: mem.data, stale: false, ts: mem.ts };
  }
  if (typeof window === 'undefined') {
    if (mem) return { data: mem.data, stale: true, ts: mem.ts };
    return null;
  }
  try {
    const raw = window.localStorage.getItem(k);
    if (!raw) return mem ? { data: mem.data, stale: true, ts: mem.ts } : null;
    const parsed = JSON.parse(raw);
    const stale = parsed.expires !== 0 && parsed.expires < now();
    return { data: parsed.data, stale, ts: parsed.ts };
  } catch {
    return mem ? { data: mem.data, stale: true, ts: mem.ts } : null;
  }
}

export function cacheSet(key, data, ttl = 60000) {
  const k = PREFIX + key;
  const record = { data, ts: now(), expires: ttl === 0 ? 0 : now() + ttl };
  MEM.set(k, record);
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(k, JSON.stringify(record));
  } catch {
    /* quota or disabled — memory layer still serves */
  }
}

export function cacheGetFresh(key) {
  const res = cacheGet(key);
  if (res && !res.stale) return res.data;
  return null;
}

// Fetch-through-cache helper used by client hooks.
export async function cachedFetch(url, { ttl = 60000, key } = {}) {
  const cacheKey = key || url;
  const cached = cacheGet(cacheKey);
  if (cached && !cached.stale) {
    return { data: cached.data, stale: false, ts: cached.ts };
  }
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    cacheSet(cacheKey, json, ttl);
    return { data: json, stale: false, ts: now() };
  } catch (err) {
    if (cached) return { data: cached.data, stale: true, ts: cached.ts, error: err.message };
    return { data: null, stale: true, ts: 0, error: err.message };
  }
}
