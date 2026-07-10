'use client';

import { create } from 'zustand';

// Alerts are backed by the CSV file store (see lib/store/alerts.js) — no
// localStorage persist here. Subscribes to SSE for real-time trigger events;
// lastTriggeredEvent is an ephemeral field for AlertToastHost to react to.
let eventSource = null;

export const useAlertStore = create((set, get) => ({
  alerts: [],
  lastTriggeredEvent: null,

  fetchAll: async () => {
    const res = await fetch('/api/alerts');
    const alerts = await res.json();
    set({ alerts });
  },

  create: async ({ symbol, type, condition, value }) => {
    await fetch('/api/alerts', { method: 'POST', body: JSON.stringify({ symbol, type, condition, value }) });
    await get().fetchAll();
  },

  dismiss: async (id) => {
    await fetch(`/api/alerts/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'dismissed' }) });
    await get().fetchAll();
  },

  reactivate: async (id) => {
    await fetch(`/api/alerts/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'active' }) });
    await get().fetchAll();
  },

  remove: async (id) => {
    await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
    await get().fetchAll();
  },

  connectSSE: () => {
    if (eventSource || typeof window === 'undefined') return;
    eventSource = new EventSource('/api/alerts/stream');
    eventSource.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        if (event.type === 'alert_triggered') {
          const alerts = get().alerts.map((a) => (a.id === event.alert.id ? event.alert : a));
          set({ alerts, lastTriggeredEvent: event.alert });
        }
      } catch {
        // ignore malformed/heartbeat messages
      }
    };
  },
}));
