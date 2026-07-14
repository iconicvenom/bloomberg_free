'use client';

// Client-side wrapper around GET /api/resolve, going through the same
// cache layer as the rest of the app (cache.js) so repeat lookups of the
// same raw text don't re-hit the server. Used imperatively (await) at
// save time — see hooks/useResolvedSymbol.js for the reactive version
// used at view time.
import { cachedFetch } from './cache';

export async function resolveSymbolClient(rawSymbol) {
  const input = String(rawSymbol || '').trim();
  if (!input) return { input, symbol: null, resolved: false };
  const res = await cachedFetch(`/api/resolve?q=${encodeURIComponent(input)}`, {
    ttl: 86400000,
    key: `resolve:${input.toUpperCase()}`,
  });
  if (res.data?.symbol) return res.data;
  return { input, symbol: input.toUpperCase(), resolved: false };
}
