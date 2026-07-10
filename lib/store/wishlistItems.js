// Wishlist items domain — thin wrapper over lib/csvStore.js.
import { readAll, mutate, newId } from '@/lib/csvStore';

const FILE = 'wishlist_items.csv';
const COLUMNS = ['id', 'wishlistId', 'symbol', 'order'];

function toNumberedRows(rows) {
  return rows.map((r) => ({ ...r, order: Number(r.order) }));
}

export async function listItems(wishlistId) {
  const rows = await readAll(FILE, COLUMNS);
  return toNumberedRows(rows.filter((r) => r.wishlistId === wishlistId)).sort((a, b) => a.order - b.order);
}

export async function addItem(wishlistId, symbol) {
  const sym = String(symbol).toUpperCase().trim();
  let created = null;
  await mutate(FILE, COLUMNS, (rows) => {
    const existing = rows.filter((r) => r.wishlistId === wishlistId);
    if (existing.some((r) => r.symbol === sym)) {
      created = existing.find((r) => r.symbol === sym);
      return rows;
    }
    const maxOrder = existing.reduce((max, r) => Math.max(max, Number(r.order)), -1);
    created = { id: newId(), wishlistId, symbol: sym, order: String(maxOrder + 1) };
    return [...rows, created];
  });
  return { ...created, order: Number(created.order) };
}

// Bulk variant used by the one-time legacy-data migration to avoid N round-trips.
export async function addItems(wishlistId, symbols) {
  const created = [];
  await mutate(FILE, COLUMNS, (rows) => {
    let next = [...rows];
    let existingSymbols = new Set(next.filter((r) => r.wishlistId === wishlistId).map((r) => r.symbol));
    let order = next.filter((r) => r.wishlistId === wishlistId).reduce((max, r) => Math.max(max, Number(r.order)), -1);
    for (const raw of symbols) {
      const sym = String(raw).toUpperCase().trim();
      if (!sym || existingSymbols.has(sym)) continue;
      order += 1;
      const item = { id: newId(), wishlistId, symbol: sym, order: String(order) };
      next.push(item);
      created.push(item);
      existingSymbols.add(sym);
    }
    return next;
  });
  return created.map((r) => ({ ...r, order: Number(r.order) }));
}

export async function removeItem(wishlistId, itemId) {
  await mutate(FILE, COLUMNS, (rows) => rows.filter((r) => !(r.wishlistId === wishlistId && r.id === itemId)));
}

export async function removeItemsForWishlist(wishlistId) {
  await mutate(FILE, COLUMNS, (rows) => rows.filter((r) => r.wishlistId !== wishlistId));
}

// Rewrites the `order` column for the whole list per the given itemId ordering.
export async function reorderItems(wishlistId, orderedItemIds) {
  await mutate(FILE, COLUMNS, (rows) => rows.map((r) => {
    if (r.wishlistId !== wishlistId) return r;
    const idx = orderedItemIds.indexOf(r.id);
    return idx === -1 ? r : { ...r, order: String(idx) };
  }));
  return listItems(wishlistId);
}
