'use client';

import { useEffect, useRef, useState } from 'react';
import { fmtPrice, fmtDelta, fmtPct, colorForDelta } from '@/lib/formatters';

// Real-time price box with flash-on-update. `quote` = { price, change, changePct }
export default function PriceQuote({ quote, size = 'lg', label }) {
  const [flash, setFlash] = useState('');
  const prevRef = useRef(quote?.price);

  useEffect(() => {
    if (quote?.price == null) return;
    const prev = prevRef.current;
    if (prev != null && quote.price !== prev) {
      setFlash(quote.price > prev ? 'flash-up' : 'flash-down');
      const t = setTimeout(() => setFlash(''), 600);
      prevRef.current = quote.price;
      return () => clearTimeout(t);
    }
    prevRef.current = quote.price;
    return undefined;
  }, [quote?.price]);

  if (!quote || quote.price == null) {
    return <div className="skeleton h-10 w-32" />;
  }

  const color = colorForDelta(quote.change ?? quote.changePct);
  const sizes = {
    lg: { price: 'text-3xl', delta: 'text-sm' },
    md: { price: 'text-xl', delta: 'text-xs' },
    sm: { price: 'text-sm', delta: 'text-2xs' },
  }[size];

  return (
    <div className={`inline-flex flex-col rounded-sm px-1 ${flash}`}>
      {label && <span className="bb-label">{label}</span>}
      <span className={`${sizes.price} font-bold tabular-nums text-bb-white`}>{fmtPrice(quote.price)}</span>
      <span className={`${sizes.delta} font-bold tabular-nums ${color}`}>
        {fmtDelta(quote.change)} ({fmtPct(quote.changePct)})
      </span>
    </div>
  );
}
