'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { useUIStore } from '@/store/uiStore';
import Panel from '@/components/ui/Panel';
import { StaleBadge } from '@/components/ui/Skeleton';
import { fmtDate, fmtNumber, fmtLarge } from '@/lib/formatters';

const TABS = [
  { id: 'earnings', label: 'EARNINGS' },
  { id: 'ipo', label: 'IPO' },
  { id: 'dividends', label: 'DIVIDENDS' },
];

function groupByDate(items, dateKey) {
  const map = {};
  items.forEach((it) => {
    const d = it[dateKey] || 'TBD';
    if (!map[d]) map[d] = [];
    map[d].push(it);
  });
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
}

export default function CalendarScreen() {
  const [tab, setTab] = useState('earnings');
  const navigate = useUIStore((s) => s.navigate);
  const apiTab = tab === 'dividends' ? 'earnings' : tab;
  const { data, stale } = useApi(`/api/calendar?tab=${apiTab}`, { ttl: 3600000, key: `cal:${apiTab}` });
  const items = data?.items || [];

  return (
    <div className="flex h-full flex-col gap-0.5 p-0.5">
      <Panel
        title="ECONOMIC CALENDAR · CAL"
        right={<StaleBadge stale={stale} />}
        noPad
        className="min-h-0 flex-1"
      >
        <div className="flex border-b border-terminal-divider">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 text-2xs font-bold ${tab === t.id ? 'bg-bb-orange/15 text-bb-orange' : 'text-bb-dark hover:text-bb-gray'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="overflow-auto thin-scroll">
          {tab === 'earnings' && (
            <table className="bb-table">
              <thead>
                <tr><th>DATE</th><th>SYMBOL</th><th>HOUR</th><th>EPS EST</th><th>EPS PRIOR</th><th>REV EST</th></tr>
              </thead>
              <tbody>
                {items.map((e, i) => (
                  <tr key={`${e.symbol}-${i}`} className="bb-row-hover cursor-pointer" onClick={() => navigate('equity', { symbol: e.symbol })}>
                    <td className="text-bb-gray">{fmtDate(e.date)}</td>
                    <td className="font-bold text-bb-blue">{e.symbol}</td>
                    <td className="text-right text-2xs text-bb-dark">{(e.hour || 'bmo').toUpperCase()}</td>
                    <td className="text-right tabular-nums text-bb-white">{e.epsEstimate != null ? fmtNumber(e.epsEstimate) : '—'}</td>
                    <td className="text-right tabular-nums text-bb-gray">{e.epsActual != null ? fmtNumber(e.epsActual) : '—'}</td>
                    <td className="text-right tabular-nums text-bb-gray">{e.revenueEstimate ? `$${fmtLarge(e.revenueEstimate)}` : '—'}</td>
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-bb-dark">NO UPCOMING EARNINGS DATA</td></tr>}
              </tbody>
            </table>
          )}

          {tab === 'ipo' && (
            <table className="bb-table">
              <thead>
                <tr><th>DATE</th><th>COMPANY</th><th>SYMBOL</th><th>EXCHANGE</th><th>PRICE RANGE</th><th>SHARES</th></tr>
              </thead>
              <tbody>
                {items.map((ipo, i) => (
                  <tr key={`${ipo.symbol}-${i}`} className="bb-row-hover">
                    <td className="text-bb-gray">{fmtDate(ipo.date)}</td>
                    <td className="max-w-[180px] truncate text-bb-white">{ipo.name}</td>
                    <td className="font-bold text-bb-blue">{ipo.symbol || '—'}</td>
                    <td className="text-2xs text-bb-dark">{ipo.exchange || '—'}</td>
                    <td className="text-right tabular-nums text-bb-amber">{ipo.price || '—'}</td>
                    <td className="text-right tabular-nums text-bb-gray">{ipo.numberOfShares ? fmtLarge(ipo.numberOfShares) : '—'}</td>
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-bb-dark">NO UPCOMING IPO DATA</td></tr>}
              </tbody>
            </table>
          )}

          {tab === 'dividends' && (
            <table className="bb-table">
              <thead>
                <tr><th>EX-DATE</th><th>SYMBOL</th><th>EST EPS</th><th>NOTE</th></tr>
              </thead>
              <tbody>
                {items.map((e, i) => (
                  <tr key={`${e.symbol}-${i}`} className="bb-row-hover cursor-pointer" onClick={() => navigate('equity', { symbol: e.symbol })}>
                    <td className="text-bb-gray">{fmtDate(e.date)}</td>
                    <td className="font-bold text-bb-blue">{e.symbol}</td>
                    <td className="text-right tabular-nums text-bb-white">{e.epsEstimate != null ? fmtNumber(e.epsEstimate) : '—'}</td>
                    <td className="text-right text-2xs text-bb-dark">Ex-div around earnings window</td>
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-bb-dark">NO UPCOMING DIVIDEND DATA</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </Panel>
    </div>
  );
}
