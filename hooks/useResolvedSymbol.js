'use client';

import { useEffect, useState } from 'react';
import { resolveSymbolClient } from '@/lib/resolveSymbolClient';

// Resolves a raw symbol (which may be a bare Indian ticker/name stored
// without its exchange suffix) before the caller fetches quote/chart/news
// data for it. Used by EquityScreen so every click-through — from
// Portfolio, Watchlist, Screener, Calendar, Market Movers, or a typed
// command — resolves through the same path rather than duplicating this
// per screen.
export function useResolvedSymbol(rawSymbol) {
  const [state, setState] = useState({ resolvedSymbol: rawSymbol, resolving: true, notFound: false });

  useEffect(() => {
    if (!rawSymbol) {
      setState({ resolvedSymbol: rawSymbol, resolving: false, notFound: false });
      return undefined;
    }
    let cancelled = false;
    setState({ resolvedSymbol: rawSymbol, resolving: true, notFound: false });
    resolveSymbolClient(rawSymbol).then(({ symbol, resolved }) => {
      if (cancelled) return;
      setState({ resolvedSymbol: symbol || rawSymbol, resolving: false, notFound: !resolved });
    }).catch(() => {
      if (!cancelled) setState({ resolvedSymbol: rawSymbol, resolving: false, notFound: true });
    });
    return () => { cancelled = true; };
  }, [rawSymbol]);

  return state;
}
