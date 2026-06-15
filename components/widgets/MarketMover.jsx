'use client';

import { useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import { fmtPrice, fmtPct, colorForDelta } from '@/lib/formatters';

const TABS = [
  { id: 'gainers', label: 'GAINERS' },
  { id: 'losers', label: 'LOSERS' },
  { id: 'active', label: 'MOST ACTIVE' },
];

export default function MarketMover({ data }) {
  const [tab, setTab] = useState('gainers');
  const navigate = useUIStore((s) => s.navigate);
  const rows = data?.[tab] || [];

  return (
    <div className="flex h-full flex-col">
      <div className="flex border-b border-terminal-divider">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 px-2 py-1 text-2xs font-bold ${
              tab === t.id ? 'bg-bb-orange/15 text-bb-orange' : 'text-bb-dark hover:text-bb-gray'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-auto thin-scroll">
        <table className="bb-table">
          <thead>
            <tr>
              <th>TICKER</th>
              <th>NAME</th>
              <th>LAST</th>
              <th>CHG%</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.symbol}
                onClick={() => navigate('equity', { symbol: r.symbol })}
                className="bb-row-hover cursor-pointer"
              >
                <td className="font-bold text-bb-blue">{r.symbol}</td>
                <td className="max-w-[120px] truncate text-bb-gray">{r.name}</td>
                <td className="text-right tabular-nums text-bb-white">{fmtPrice(r.price)}</td>
                <td className={`text-right tabular-nums ${colorForDelta(r.changePct)}`}>{fmtPct(r.changePct)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={4} className="py-4 text-center text-bb-dark">LOADING…</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
