// Server-side fetch helper with a small in-process TTL cache + timeout.
const serverCache = new Map();

export async function serverFetch(url, { ttl = 0, headers = {}, timeout = 12000 } = {}) {
  const key = url + JSON.stringify(headers);
  const hit = serverCache.get(key);
  if (hit && hit.expires > Date.now()) {
    return { ok: true, data: hit.data, cached: true };
  }
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { headers, signal: controller.signal, cache: 'no-store' });
    clearTimeout(t);
    if (!res.ok) {
      // serve stale on error if available
      if (hit) return { ok: true, data: hit.data, cached: true, stale: true };
      return { ok: false, status: res.status, data: null };
    }
    const data = await res.json();
    if (ttl > 0) serverCache.set(key, { data, expires: Date.now() + ttl });
    return { ok: true, data, cached: false };
  } catch (err) {
    clearTimeout(t);
    if (hit) return { ok: true, data: hit.data, cached: true, stale: true };
    return { ok: false, error: err.message, data: null };
  }
}

export function jsonResponse(payload, init = {}) {
  return new Response(JSON.stringify(payload), {
    status: init.status || 200,
    headers: { 'content-type': 'application/json', ...(init.headers || {}) },
  });
}

export function errorResponse(message, status = 500, fallback = null) {
  return jsonResponse({ error: message, data: fallback, stale: true }, { status: 200 });
}
