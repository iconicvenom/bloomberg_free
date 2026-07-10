import { removeItem } from '@/lib/store/wishlistItems';
import { jsonResponse } from '@/lib/serverFetch';

export const dynamic = 'force-dynamic';

export async function DELETE(req, { params }) {
  await removeItem(params.id, params.itemId);
  return jsonResponse({ ok: true });
}
