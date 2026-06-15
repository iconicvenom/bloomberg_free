'use client';

import { useMemo } from 'react';
import { fmtPrice, fmtNumber } from '@/lib/formatters';

// Simulated bid/ask depth around a mid price (free APIs don't expose L2 depth).
export default function OrderBook({ price }) {
  const { bids, asks } = useMemo(() => {
    const mid = price || 100;
    const tick = Math.max(0.01, mid * 0.0004);
    // Deterministic pseudo-depth from the price so it doesn't jitter every render.
    const seed = (n) => {
      const x = Math.sin((mid + n) * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };
    const b = [];
    const a = [];
    for (let i = 1; i <= 8; i += 1) {
      b.push({ price: mid - tick * i, size: Math.round(200 + seed(i) * 4000) });
      a.push({ price: mid + tick * i, size: Math.round(200 + seed(i + 50) * 4000) });
    }
    return { bids: b, asks: a };
  }, [price]);

  const maxSize = Math.max(...bids.map((b) => b.size), ...asks.map((a) => a.size));

  const Row = ({ row, side }) => {
    const color = side === 'bid' ? 'text-bb-green' : 'text-bb-red';
    const bar = side === 'bid' ? 'bg-bb-green/15' : 'bg-bb-red/15';
    return (
      <div className="relative flex items-center justify-between px-2 py-px text-2xs tabular-nums">
        <div className={`absolute inset-y-0 ${side === 'bid' ? 'right-0' : 'left-0'} ${bar}`} style={{ width: `${(row.size / maxSize) * 100}%` }} />
        <span className={`relative z-10 ${color}`}>{fmtPrice(row.price)}</span>
        <span className="relative z-10 text-bb-gray">{fmtNumber(row.size, 0)}</span>
      </div>
    );
  };

  return (
    <div className="text-2xs">
      <div className="flex justify-between px-2 pb-1 text-bb-dark">
        <span>PRICE</span>
        <span>SIZE</span>
      </div>
      {asks.slice().reverse().map((a, i) => <Row key={`a${i}`} row={a} side="ask" />)}
      <div className="my-1 border-y border-terminal-divider px-2 py-0.5 text-center text-bb-amber">
        {fmtPrice(price)} <span className="text-bb-dark">MID</span>
      </div>
      {bids.map((b, i) => <Row key={`b${i}`} row={b} side="bid" />)}
    </div>
  );
}
