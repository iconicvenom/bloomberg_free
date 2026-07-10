'use client';

import { create } from 'zustand';

// Backs the in-app prompt/confirm/alert dialogs (see lib/dialog.js) — a
// single pending `request` rendered by components/ui/DialogHost, mounted
// once at the shell root. Replaces native window.prompt/confirm/alert, which
// can be blocked or behave inconsistently depending on the browsing context.
export const useDialogStore = create((set) => ({
  request: null,
  open: (request) => set({ request }),
  close: () => set({ request: null }),
}));
