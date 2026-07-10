import { listHoldings, addHolding } from '@/lib/store/holdings';
import { jsonResponse } from '@/lib/serverFetch';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('accountId') || undefined;
  const holdings = await listHoldings(accountId);
  return jsonResponse(holdings);
}

export async function POST(req) {
  const { accountId, symbol, qty, avgCost, date } = await req.json();
  if (!accountId || !symbol || qty == null || avgCost == null) {
    return jsonResponse({ error: 'accountId, symbol, qty, avgCost required' }, { status: 400 });
  }
  const holding = await addHolding({ accountId, symbol, qty, avgCost, date });
  return jsonResponse(holding);
}
