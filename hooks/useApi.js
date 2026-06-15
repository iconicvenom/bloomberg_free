'use client';

import { useEffect, useState, useCallback } from 'react';
import { cachedFetch } from '@/lib/cache';

// Generic cached + polled fetch hook used by most screens.
export function useApi(url, { ttl = 30000, key, poll = 0, enabled = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stale, setStale] = useState(false);

  const load = useCallback(async () => {
    if (!url || !enabled) return;
    const res = await cachedFetch(url, { ttl, key: key || url });
    setData(res.data);
    setStale(res.stale || res.data?.stale || false);
    setLoading(false);
  }, [url, ttl, key, enabled]);

  useEffect(() => {
    if (!enabled) return undefined;
    setLoading(true);
    load();
    if (poll > 0) {
      const t = setInterval(load, poll);
      return () => clearInterval(t);
    }
    return undefined;
  }, [load, poll, enabled]);

  return { data, loading, stale, refresh: load };
}
