'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

let idCounter = 1;

export const usePortfolioStore = create(
  persist(
    (set, get) => ({
      holdings: [], // { id, symbol, quantity, cost, date }

      addHolding: ({ symbol, quantity, cost, date }) => {
        const h = {
          id: `${symbol}-${get().holdings.length}-${idCounter++}`,
          symbol: symbol.toUpperCase().trim(),
          quantity: Number(quantity),
          cost: Number(cost),
          date: date || new Date().toISOString().slice(0, 10),
        };
        set({ holdings: [...get().holdings, h] });
      },

      removeHolding: (id) => set({ holdings: get().holdings.filter((h) => h.id !== id) }),

      clear: () => set({ holdings: [] }),
    }),
    { name: 'bbt-portfolio' },
  ),
);
