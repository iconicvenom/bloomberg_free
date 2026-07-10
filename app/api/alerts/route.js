import { listAlerts, createAlert } from '@/lib/store/alerts';
import { jsonResponse } from '@/lib/serverFetch';

export const dynamic = 'force-dynamic';

export async function GET() {
  const alerts = await listAlerts();
  return jsonResponse(alerts);
}

export async function POST(req) {
  const { symbol, type, condition, value } = await req.json();
  if (!symbol || !type || !condition) {
    return jsonResponse({ error: 'symbol, type, condition required' }, { status: 400 });
  }
  const alert = await createAlert({ symbol, type, condition, value });
  return jsonResponse(alert);
}
