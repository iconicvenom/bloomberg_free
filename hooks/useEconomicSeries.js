'use client';

import { useEffect, useState } from 'react';
import { cachedFetch } from '@/lib/cache';
import { CONFIG } from '@/lib/config';

export function useEconomicSeries(seriesId, { limit = 120 } = {}) {
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!seriesId) return undefined;
    setLoading(true);
    cachedFetch(`/api/fred/${seriesId}?limit=${limit}`, {
      ttl: CONFIG.cache.fred,
      key: `fred:${seriesId}:${limit}`,
    }).then((res) => {
      if (!active) return;
      setObservations(res.data?.observations || []);
      setLoading(false);
    });
    return () => { active = false; };
  }, [seriesId, limit]);

  return { observations, loading };
}

export function useEconomicsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    cachedFetch('/api/economics', { ttl: CONFIG.cache.fred, key: 'econ:dashboard' }).then((res) => {
      if (!active) return;
      setData(res.data);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  return { data, loading };
}
