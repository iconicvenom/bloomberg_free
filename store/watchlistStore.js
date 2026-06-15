'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CONFIG } from '@/lib/config';

export const useWatchlistStore = create(
  persist(
    (set, get) => ({
      symbols: CONFIG.defaultWatchlist,

      add: (symbol) => {
        const s = symbol.toUpperCase().trim();
        if (!s || get().symbols.includes(s)) return;
        set({ symbols: [...get().symbols, s] });
      },

      remove: (symbol) => set({ symbols: get().symbols.filter((s) => s !== symbol) }),

      reorder: (from, to) => {
        const arr = [...get().symbols];
        const [moved] = arr.splice(from, 1);
        arr.splice(to, 0, moved);
        set({ symbols: arr });
      },

      has: (symbol) => get().symbols.includes(symbol.toUpperCase()),
    }),
    { name: 'bbt-watchlist' },
  ),
);
