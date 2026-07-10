import { listWishlists, createWishlist } from '@/lib/store/wishlists';
import { jsonResponse } from '@/lib/serverFetch';

export const dynamic = 'force-dynamic';

export async function GET() {
  const wishlists = await listWishlists();
  return jsonResponse(wishlists);
}

export async function POST(req) {
  const { name } = await req.json();
  if (!name || !String(name).trim()) return jsonResponse({ error: 'name required' }, { status: 400 });
  const wishlist = await createWishlist(name);
  return jsonResponse(wishlist);
}
