'use client';

// Client-side live price feed. Keeps API keys server-side by polling the
// /api/batch proxy on an interval. Acts as the "real-time" layer with a
// subscription model so screens only poll the symbols they display.
import { useMarketStore } from '@/store/marketStore';
import { CONFIG } from '@/lib/config';

class LiveFeed {
  constructor() {
    this.subs = new Map(); // symbol -> refcount
    this.timer = null;
    this.started = false;
  }

  start() {
    if (this.started) return;
    this.started = true;
    this.tick();
    this.timer = setInterval(() => this.tick(), CONFIG.refreshIntervals.quotes);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.started = false;
  }

  subscribe(symbols) {
    const list = Array.isArray(symbols) ? symbols : [symbols];
    list.forEach((s) => {
      const sym = s.toUpperCase();
      this.subs.set(sym, (this.subs.get(sym) || 0) + 1);
    });
    this.start();
    this.tick();
  }

  unsubscribe(symbols) {
    const list = Array.isArray(symbols) ? symbols : [symbols];
    list.forEach((s) => {
      const sym = s.toUpperCase();
      const c = this.subs.get(sym) || 0;
      if (c <= 1) this.subs.delete(sym);
      else this.subs.set(sym, c - 1);
    });
  }

  async tick() {
    const symbols = [...this.subs.keys()];
    if (symbols.length === 0) return;
    const store = useMarketStore.getState();
    try {
      // batch route caps at 30 symbols; chunk if needed
      const chunks = [];
      for (let i = 0; i < symbols.length; i += 30) chunks.push(symbols.slice(i, i + 30));
      const all = {};
      await Promise.all(chunks.map(async (chunk) => {
        // encodeURIComponent is required, not cosmetic: a raw "&" inside a
        // symbol (e.g. the NSE ticker "ARE&M") would otherwise be parsed as
        // a query-string delimiter, truncating every symbol after it in
        // this chunk from being requested at all.
        const res = await fetch(`/api/batch?symbols=${encodeURIComponent(chunk.join(','))}`);
        if (!res.ok) throw new Error('batch failed');
        const json = await res.json();
        Object.assign(all, json.quotes || {});
      }));
      if (Object.keys(all).length > 0) {
        store.updateMany(all);
        store.setConnection('live');
      } else {
        store.setConnection('delayed');
      }
    } catch {
      store.setConnection('delayed');
    }
  }
}

export const liveFeed = typeof window !== 'undefined' ? new LiveFeed() : null;
