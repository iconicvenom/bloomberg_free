'use client';

import { useEffect, useState } from 'react';
import { cachedFetch } from '@/lib/cache';
import { CONFIG } from '@/lib/config';

export function useHistoricalData(symbol, range = '1M') {
  const [candles, setCandles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stale, setStale] = useState(false);

  useEffect(() => {
    let active = true;
    if (!symbol) return undefined;
    setLoading(true);
    cachedFetch(`/api/history/${symbol}?range=${range}`, {
      ttl: CONFIG.cache.historical,
      key: `hist:${symbol}:${range}`,
    }).then((res) => {
      if (!active) return;
      setCandles(res.data?.candles || []);
      setStale(res.stale || res.data?.stale || false);
      setLoading(false);
    });
    return () => { active = false; };
  }, [symbol, range]);

  return { candles, loading, stale };
}
