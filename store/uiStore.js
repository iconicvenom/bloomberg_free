'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUIStore = create(
  persist(
    (set, get) => ({
      booted: false,
      activeScreen: 'home',
      activeSymbol: 'AAPL',
      activeCrypto: 'bitcoin',
      activeForexPair: 'EURUSD',
      activeCommodity: 'GC=F',
      commandHistory: [],
      panelSizes: {},

      setBooted: (v) => set({ booted: v }),
      setScreen: (screen) => set({ activeScreen: screen }),
      setSymbol: (symbol) => set({ activeSymbol: symbol }),
      setCrypto: (id) => set({ activeCrypto: id }),
      setForexPair: (pair) => set({ activeForexPair: pair }),
      setCommodity: (sym) => set({ activeCommodity: sym }),

      navigate: (screen, payload = {}) => {
        const patch = { activeScreen: screen };
        if (payload.symbol) patch.activeSymbol = payload.symbol;
        if (payload.crypto) patch.activeCrypto = payload.crypto;
        if (payload.forexPair) patch.activeForexPair = payload.forexPair;
        if (payload.commodity) patch.activeCommodity = payload.commodity;
        set(patch);
      },

      pushCommand: (cmd) => {
        const hist = get().commandHistory.filter((c) => c !== cmd);
        set({ commandHistory: [cmd, ...hist].slice(0, 50) });
      },

      savePanelSizes: (id, sizes) => set({ panelSizes: { ...get().panelSizes, [id]: sizes } }),
    }),
    {
      name: 'bbt-ui',
      partialize: (s) => ({
        activeScreen: s.activeScreen,
        activeSymbol: s.activeSymbol,
        activeCrypto: s.activeCrypto,
        commandHistory: s.commandHistory,
        panelSizes: s.panelSizes,
      }),
    },
  ),
);
