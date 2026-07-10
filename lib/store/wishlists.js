// Wishlists domain — thin wrapper over lib/csvStore.js.
import { readAll, mutate, newId } from '@/lib/csvStore';
import { removeItemsForWishlist } from './wishlistItems';

const FILE = 'wishlists.csv';
const COLUMNS = ['id', 'name', 'createdAt'];

export async function listWishlists() {
  return readAll(FILE, COLUMNS);
}

export async function createWishlist(name) {
  const wishlist = { id: newId(), name: String(name).trim(), createdAt: new Date().toISOString() };
  await mutate(FILE, COLUMNS, (rows) => [...rows, wishlist]);
  return wishlist;
}

export async function renameWishlist(id, name) {
  let updated = null;
  await mutate(FILE, COLUMNS, (rows) => rows.map((r) => {
    if (r.id !== id) return r;
    updated = { ...r, name: String(name).trim() };
    return updated;
  }));
  return updated;
}

export async function deleteWishlist(id) {
  await removeItemsForWishlist(id);
  await mutate(FILE, COLUMNS, (rows) => rows.filter((r) => r.id !== id));
}
