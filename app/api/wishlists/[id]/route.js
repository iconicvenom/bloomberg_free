import { renameWishlist, deleteWishlist } from '@/lib/store/wishlists';
import { jsonResponse } from '@/lib/serverFetch';

export const dynamic = 'force-dynamic';

export async function PATCH(req, { params }) {
  const { name } = await req.json();
  if (!name || !String(name).trim()) return jsonResponse({ error: 'name required' }, { status: 400 });
  const wishlist = await renameWishlist(params.id, name);
  if (!wishlist) return jsonResponse({ error: 'not found' }, { status: 404 });
  return jsonResponse(wishlist);
}

export async function DELETE(req, { params }) {
  await deleteWishlist(params.id);
  return jsonResponse({ ok: true });
}
