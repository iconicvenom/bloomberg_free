import { importHoldings } from '@/lib/store/holdings';
import { jsonResponse } from '@/lib/serverFetch';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const { accountId, rows } = await req.json();
  if (!accountId || !Array.isArray(rows)) {
    return jsonResponse({ error: 'accountId and rows required' }, { status: 400 });
  }
  const imported = await importHoldings(accountId, rows);
  return jsonResponse(imported);
}
