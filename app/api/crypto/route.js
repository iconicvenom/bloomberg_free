import { getCoinsMarkets, getGlobal, getTrending } from '@/lib/coinGecko';
import { jsonResponse } from '@/lib/serverFetch';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const perPage = parseInt(searchParams.get('perPage') || '50', 10);
  const ids = searchParams.get('ids') || undefined;
  const withGlobal = searchParams.get('global') !== 'false';

  const [coins, global, trending] = await Promise.all([
    getCoinsMarkets({ perPage, ids }),
    withGlobal ? getGlobal() : Promise.resolve(null),
    withGlobal ? getTrending() : Promise.resolve([]),
  ]);

  return jsonResponse({ coins, global, trending, stale: coins.length === 0 });
}
