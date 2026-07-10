import { reorderItems } from '@/lib/store/wishlistItems';
import { jsonResponse } from '@/lib/serverFetch';

export const dynamic = 'force-dynamic';

export async function PATCH(req, { params }) {
  const { order } = await req.json();
  if (!Array.isArray(order)) return jsonResponse({ error: 'order array required' }, { status: 400 });
  const items = await reorderItems(params.id, order);
  return jsonResponse(items);
}
