import { setAlertStatus, removeAlert } from '@/lib/store/alerts';
import { jsonResponse } from '@/lib/serverFetch';

export const dynamic = 'force-dynamic';

// Only dismissed/active transitions are allowed from the client — the
// engine alone sets status to 'triggered'.
export async function PATCH(req, { params }) {
  const { status } = await req.json();
  if (status !== 'active' && status !== 'dismissed') {
    return jsonResponse({ error: "status must be 'active' or 'dismissed'" }, { status: 400 });
  }
  const alert = await setAlertStatus(params.id, status);
  if (!alert) return jsonResponse({ error: 'not found' }, { status: 404 });
  return jsonResponse(alert);
}

export async function DELETE(req, { params }) {
  await removeAlert(params.id);
  return jsonResponse({ ok: true });
}
