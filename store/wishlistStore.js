'use client';

import { create } from 'zustand';
import { useUIStore } from '@/store/uiStore';

// Wishlists are backed by the CSV file store (see lib/store/wishlists.js,
// lib/store/wishlistItems.js) — no localStorage persist here, this store is
// a thin fetch-backed cache. activeWishlistId is remembered via uiStore so the
// last-viewed list survives a reload.
export const useWishlistStore = create((set, get) => ({
  wishlists: [],
  activeWishlistId: null,
  items: {}, // wishlistId -> [{id, symbol, order}]

  fetchWishlists: async () => {
    const res = await fetch('/api/wishlists');
    const wishlists = await res.json();
    set({ wishlists });
    if (!get().activeWishlistId && wishlists.length > 0) {
      const remembered = useUIStore.getState().activeWishlistId;
      const initial = wishlists.find((w) => w.id === remembered)?.id || wishlists[0].id;
      get().setActive(initial);
    }
  },

  createWishlist: async (name) => {
    const res = await fetch('/api/wishlists', { method: 'POST', body: JSON.stringify({ name }) });
    const wishlist = await res.json();
    await get().fetchWishlists();
    get().setActive(wishlist.id);
    return wishlist;
  },

  renameWishlist: async (id, name) => {
    await fetch(`/api/wishlists/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) });
    await get().fetchWishlists();
  },

  removeWishlist: async (id) => {
    await fetch(`/api/wishlists/${id}`, { method: 'DELETE' });
    const remaining = get().wishlists.filter((w) => w.id !== id);
    if (get().activeWishlistId === id) set({ activeWishlistId: remaining[0]?.id || null });
    await get().fetchWishlists();
  },

  setActive: (id) => {
    set({ activeWishlistId: id });
    useUIStore.getState().setActiveWishlistId(id);
    if (id) get().fetchItems(id);
  },

  fetchItems: async (wishlistId) => {
    const res = await fetch(`/api/wishlists/${wishlistId}/items`);
    const items = await res.json();
    set({ items: { ...get().items, [wishlistId]: items } });
  },

  addItem: async (wishlistId, symbol) => {
    await fetch(`/api/wishlists/${wishlistId}/items`, { method: 'POST', body: JSON.stringify({ symbol }) });
    await get().fetchItems(wishlistId);
  },

  removeItem: async (wishlistId, itemId) => {
    await fetch(`/api/wishlists/${wishlistId}/items/${itemId}`, { method: 'DELETE' });
    await get().fetchItems(wishlistId);
  },

  reorder: async (wishlistId, orderedItemIds) => {
    await fetch(`/api/wishlists/${wishlistId}/items/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ order: orderedItemIds }),
    });
    await get().fetchItems(wishlistId);
  },
}));
