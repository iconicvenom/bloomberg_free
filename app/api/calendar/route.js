import { getEarningsCalendar, getIpoCalendar } from '@/lib/finnhub';
import { jsonResponse } from '@/lib/serverFetch';

export const dynamic = 'force-dynamic';

function fmt(d) {
  return d.toISOString().slice(0, 10);
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const tab = searchParams.get('tab') || 'earnings';
  const today = new Date();
  const ahead = new Date(today.getTime() + 21 * 86400000);
  const from = fmt(today);
  const to = fmt(ahead);

  if (tab === 'ipo') {
    const ipos = await getIpoCalendar(from, to);
    return jsonResponse({ tab, from, to, items: ipos, stale: ipos.length === 0 });
  }

  // earnings (also drives the dividends approximation tab on the client)
  const earnings = await getEarningsCalendar(from, to);
  return jsonResponse({ tab, from, to, items: earnings, stale: earnings.length === 0 });
}
