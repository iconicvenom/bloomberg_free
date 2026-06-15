'use client';

import { useEffect, useState, useCallback } from 'react';
import { cachedFetch } from '@/lib/cache';
import { CONFIG } from '@/lib/config';

export function useNews({ category = 'all', q = '', poll = true } = {}) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stale, setStale] = useState(false);

  const load = useCallback(async () => {
    const params = new URLSearchParams({ category });
    if (q) params.set('q', q);
    const res = await cachedFetch(`/api/news?${params.toString()}`, {
      ttl: CONFIG.cache.news,
      key: `news:${category}:${q}`,
    });
    setArticles(res.data?.articles || []);
    setStale(res.stale || false);
    setLoading(false);
  }, [category, q]);

  useEffect(() => {
    setLoading(true);
    load();
    if (!poll) return undefined;
    const t = setInterval(load, CONFIG.refreshIntervals.news);
    return () => clearInterval(t);
  }, [load, poll]);

  return { articles, loading, stale, refresh: load };
}
