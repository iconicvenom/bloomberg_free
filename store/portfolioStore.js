'use client';

import { create } from 'zustand';

// Holdings are backed by the CSV file store (see lib/store/holdings.js) —
// no localStorage persist here, this store is a thin fetch-backed cache.
// selectedAccountId is pure client/view state: 'all' for the combined view,
// or a specific accountId for a single-account view.
export const usePortfolioStore = create((set, get) => ({
  holdings: [], // { id, accountId, symbol, qty, avgCost, date }
  selectedAccountId: 'all',

  fetchHoldings: async () => {
    const res = await fetch('/api/holdings');
    const holdings = await res.json();
    set({ holdings });
  },

  addHolding: async ({ accountId, symbol, qty, avgCost, date }) => {
    await fetch('/api/holdings', {
      method: 'POST',
      body: JSON.stringify({ accountId, symbol, qty, avgCost, date }),
    });
    await get().fetchHoldings();
  },

  removeHolding: async (id) => {
    await fetch(`/api/holdings/${id}`, { method: 'DELETE' });
    await get().fetchHoldings();
  },

  importRows: async (accountId, rows) => {
    await fetch('/api/holdings/import', {
      method: 'POST',
      body: JSON.stringify({ accountId, rows }),
    });
    await get().fetchHoldings();
  },

  setSelectedAccount: (id) => set({ selectedAccountId: id }),
}));
