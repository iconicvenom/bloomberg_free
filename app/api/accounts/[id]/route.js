import { renameAccount, deleteAccount } from '@/lib/store/accounts';
import { removeHoldingsForAccount } from '@/lib/store/holdings';
import { jsonResponse } from '@/lib/serverFetch';

export const dynamic = 'force-dynamic';

export async function PATCH(req, { params }) {
  const { label } = await req.json();
  if (!label || !String(label).trim()) return jsonResponse({ error: 'label required' }, { status: 400 });
  const account = await renameAccount(params.id, label);
  if (!account) return jsonResponse({ error: 'not found' }, { status: 404 });
  return jsonResponse(account);
}

export async function DELETE(req, { params }) {
  await removeHoldingsForAccount(params.id);
  await deleteAccount(params.id);
  return jsonResponse({ ok: true });
}
