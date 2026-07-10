'use client';

import { create } from 'zustand';

// Accounts are backed by the CSV file store (see lib/store/accounts.js) —
// no localStorage persist here, this store is a thin fetch-backed cache.
export const useAccountStore = create((set, get) => ({
  accounts: [],
  loaded: false,

  fetchAll: async () => {
    const res = await fetch('/api/accounts');
    const accounts = await res.json();
    set({ accounts, loaded: true });
  },

  create: async (label) => {
    await fetch('/api/accounts', { method: 'POST', body: JSON.stringify({ label }) });
    await get().fetchAll();
  },

  rename: async (id, label) => {
    await fetch(`/api/accounts/${id}`, { method: 'PATCH', body: JSON.stringify({ label }) });
    await get().fetchAll();
  },

  remove: async (id) => {
    await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
    await get().fetchAll();
  },
}));
