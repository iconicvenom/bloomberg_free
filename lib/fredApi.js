// FRED (St. Louis Fed) server-side client.
import { serverFetch } from './serverFetch';

const BASE = 'https://api.stlouisfed.org/fred';
const KEY = () => process.env.FRED_KEY || '';

export async function getSeries(seriesId, { limit = 120, start } = {}) {
  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: KEY(),
    file_type: 'json',
    sort_order: 'desc',
    limit: String(limit),
  });
  if (start) params.set('observation_start', start);
  const { ok, data } = await serverFetch(`${BASE}/series/observations?${params.toString()}`, {
    ttl: 3600000,
  });
  if (!ok || !data || !data.observations) return null;
  const observations = data.observations
    .filter((o) => o.value !== '.')
    .map((o) => ({ date: o.date, value: parseFloat(o.value) }))
    .reverse();
  return observations;
}

export async function getLatest(seriesId) {
  const obs = await getSeries(seriesId, { limit: 2 });
  if (!obs || obs.length === 0) return null;
  const latest = obs[obs.length - 1];
  const prev = obs.length > 1 ? obs[obs.length - 2] : null;
  return {
    value: latest.value,
    date: latest.date,
    change: prev ? latest.value - prev.value : null,
    changePct: prev && prev.value !== 0 ? ((latest.value - prev.value) / Math.abs(prev.value)) * 100 : null,
  };
}
