'use client';

import { useEffect } from 'react';
import { useMarketStore } from '@/store/marketStore';
import { liveFeed } from '@/lib/liveFeed';

// Subscribe to live updates for one or many symbols; returns the price map.
export function useLivePrice(symbols) {
  const list = Array.isArray(symbols) ? symbols : symbols ? [symbols] : [];
  const key = list.join(',');
  const prices = useMarketStore((s) => s.prices);

  useEffect(() => {
    if (!liveFeed || list.length === 0) return undefined;
    liveFeed.subscribe(list);
    return () => liveFeed.unsubscribe(list);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (!Array.isArray(symbols)) return prices[symbols?.toUpperCase()] || null;
  const out = {};
  list.forEach((s) => { out[s] = prices[s.toUpperCase()] || null; });
  return out;
}
