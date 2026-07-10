import { updateHolding, removeHolding } from '@/lib/store/holdings';
import { jsonResponse } from '@/lib/serverFetch';

export const dynamic = 'force-dynamic';

export async function PATCH(req, { params }) {
  const { qty, avgCost, date } = await req.json();
  const holding = await updateHolding(params.id, { qty, avgCost, date });
  if (!holding) return jsonResponse({ error: 'not found' }, { status: 404 });
  return jsonResponse(holding);
}

export async function DELETE(req, { params }) {
  await removeHolding(params.id);
  return jsonResponse({ ok: true });
}
