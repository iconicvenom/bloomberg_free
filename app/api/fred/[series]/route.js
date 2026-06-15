import { getSeries, getLatest } from '@/lib/fredApi';
import { jsonResponse } from '@/lib/serverFetch';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const series = params.series;
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '120', 10);
  const start = searchParams.get('start') || undefined;
  const mode = searchParams.get('mode') || 'series';

  if (mode === 'latest') {
    const latest = await getLatest(series);
    return jsonResponse({ series, latest, stale: !latest });
  }

  const observations = await getSeries(series, { limit, start });
  return jsonResponse({ series, observations: observations || [], stale: !observations });
}
