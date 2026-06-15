import { getLatest, getSeries } from '@/lib/fredApi';
import { jsonResponse } from '@/lib/serverFetch';
import { CONFIG } from '@/lib/config';

export const dynamic = 'force-dynamic';

// Aggregate the economics dashboard: latest key indicators + yield curve points.
export async function GET() {
  const indicatorIds = CONFIG.fredSeries;
  const curveIds = CONFIG.yieldCurve;

  const [latests, curve] = await Promise.all([
    Promise.all(indicatorIds.map((s) => getLatest(s.id))),
    Promise.all(curveIds.map((c) => getLatest(c.id))),
  ]);

  const indicators = indicatorIds.map((s, i) => ({ ...s, latest: latests[i] }));
  const yieldCurve = curveIds.map((c, i) => ({
    label: c.label,
    id: c.id,
    value: curve[i]?.value ?? null,
  }));

  const spread = indicators.find((x) => x.id === 'T10Y2Y');
  const inverted = spread?.latest?.value != null && spread.latest.value < 0;

  return jsonResponse({ indicators, yieldCurve, inverted });
}
