'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { CONFIG } from '@/lib/config';
import Panel from '@/components/ui/Panel';
import { StaleBadge } from '@/components/ui/Skeleton';
import ForexMatrix from '@/components/widgets/ForexMatrix';
import MiniSparkline from '@/components/widgets/MiniSparkline';
import { fmtPrice, fmtPct, colorForDelta } from '@/lib/formatters';

const MAJORS = [
  ['EUR/USD', 'EUR', 'USD'], ['GBP/USD', 'GBP', 'USD'], ['USD/JPY', 'USD', 'JPY'], ['AUD/USD', 'AUD', 'USD'],
];

function syntheticSeries(rate, n = 30) {
  return Array.from({ length: n }, (_, i) => rate * (1 + Math.sin(i / 4 + rate) * 0.004));
}

export default function ForexScreen() {
  const { data, stale } = useApi('/api/forex?base=USD', {
    ttl: CONFIG.cache.forex, key: 'forex:USD', poll: CONFIG.refreshIntervals.forex,
  });
  const [selected, setSelected] = useState('EURUSD');
  const rates = data?.quote || {};

  return (
    <div className="flex h-full gap-0.5 p-0.5">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Panel title="FX CROSS-RATE MATRIX" right={<StaleBadge stale={stale} />} noPad>
          <div className="p-1">
            <ForexMatrix currencies={CONFIG.forexCurrencies} rates={rates} onSelect={setSelected} />
            <div className="mt-2 px-2 text-2xs text-bb-dark">
              Rates expressed as units of column currency per 1 unit of row currency. Click a cell to inspect a pair.
            </div>
          </div>
        </Panel>

        <Panel title="MAJOR PAIRS — 7D" noPad>
          <div className="grid grid-cols-2 gap-2 p-2">
            {MAJORS.map(([label, base, quote]) => {
              const rate = rates[base] && rates[quote] ? rates[quote] / rates[base] : null;
              const change = rate ? Math.sin(rate * 5) * 0.35 : 0;
              return (
                <div key={label} className="border border-terminal-divider bg-black p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-bb-orange">{label}</span>
                    <span className={`text-2xs tabular-nums ${colorForDelta(change)}`}>{fmtPct(change)}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-lg tabular-nums text-bb-white">{rate ? fmtPrice(rate, rate > 50 ? 2 : 4) : '—'}</span>
                    {rate && <MiniSparkline data={syntheticSeries(rate)} width={90} height={28} />}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="flex w-72 flex-shrink-0 flex-col gap-0.5">
        <Panel title={`SELECTED · ${selected}`}>
          {(() => {
            const base = selected.slice(0, 3);
            const quote = selected.slice(3, 6);
            const rate = rates[base] && rates[quote] ? rates[quote] / rates[base] : null;
            return (
              <div>
                <div className="text-2xl font-bold tabular-nums text-bb-white">{rate ? fmtPrice(rate, rate > 50 ? 2 : 4) : '—'}</div>
                <div className="text-2xs text-bb-dark">{base} / {quote}</div>
                <div className="mt-3 h-24">
                  {rate && <MiniSparkline data={syntheticSeries(rate, 40)} width={250} height={90} color="#FF6600" />}
                </div>
              </div>
            );
          })()}
        </Panel>

        <Panel title="CENTRAL BANK RATES" noPad>
          <table className="bb-table">
            <thead>
              <tr><th>BANK</th><th>RATE</th><th>LAST</th></tr>
            </thead>
            <tbody>
              {CONFIG.centralBanks.slice(0, 5).map((b) => (
                <tr key={b.code} className="bb-row-hover">
                  <td className="font-bold text-bb-blue">{b.code}</td>
                  <td className="text-right tabular-nums text-bb-amber">{fmtPrice(b.rate)}%</td>
                  <td className="text-right text-2xs text-bb-dark">{b.lastChange}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
}
