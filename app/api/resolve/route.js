import { resolveSymbol } from '@/lib/symbolResolver';
import { jsonResponse } from '@/lib/serverFetch';

export const dynamic = 'force-dynamic';

// GET /api/resolve?q=sbin -> { input, symbol: "SBIN.NS", resolved: true }
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const result = await resolveSymbol(q);
  return jsonResponse(result);
}
