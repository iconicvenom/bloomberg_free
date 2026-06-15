'use client';

import { create } from 'zustand';

// Live prices keyed by symbol. Updated via WebSocket trade events or polling.
export const useMarketStore = create((set, get) => ({
  prices: {}, // { SYMBOL: { price, change, changePct, prevPrice, ts, dir } }
  connection: 'connecting', // 'live' | 'delayed' | 'disconnected' | 'connecting'

  setConnection: (status) => set({ connection: status }),

  updatePrice: (symbol, payload) => {
    const prev = get().prices[symbol];
    const prevPrice = prev?.price ?? payload.price;
    let dir = 'flat';
    if (payload.price > prevPrice) dir = 'up';
    else if (payload.price < prevPrice) dir = 'down';
    set({
      prices: {
        ...get().prices,
        [symbol]: { ...prev, ...payload, prevPrice, dir, ts: Date.now() },
      },
    });
  },

  updateMany: (map) => {
    const cur = get().prices;
    const next = { ...cur };
    Object.entries(map).forEach(([symbol, payload]) => {
      const prev = cur[symbol];
      const prevPrice = prev?.price ?? payload.price;
      let dir = 'flat';
      if (payload.price > prevPrice) dir = 'up';
      else if (payload.price < prevPrice) dir = 'down';
      next[symbol] = { ...prev, ...payload, prevPrice, dir, ts: Date.now() };
    });
    set({ prices: next });
  },

  getPrice: (symbol) => get().prices[symbol] || null,
}));
