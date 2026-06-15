'use client';

import { useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine,
} from 'recharts';
import { useEconomicsDashboard, useEconomicSeries } from '@/hooks/useEconomicSeries';
import { CONFIG } from '@/lib/config';
import Panel from '@/components/ui/Panel';
import { StaleBadge } from '@/components/ui/Skeleton';
import EconChart from '@/components/widgets/EconChart';
import { fmtNumber, fmtDelta, colorForDelta, fmtDate } from '@/lib/formatters';

const AXIS = { fontSize: 9, fill: '#555555', fontFamily: 'JetBrains Mono' };

function IndicatorRow({ ind, active, onSelect }) {
  const l = ind.latest;
  return (
    <button
      onClick={() => onSelect(ind)}
      className={`bb-row-hover flex w-full items-center justify-between border-b border-terminal-divider px-2 py-1.5 text-left ${
        active ? 'bg-bb-orange/10' : ''
      }`}
    >
      <div>
        <div className="text-2xs font-bold text-bb-blue">{ind.label}</div>
        <div className="text-[9px] text-bb-dark">{ind.freq} · {l ? fmtDate(l.date) : '—'}</div>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold tabular-nums text-bb-white">{l ? fmtNumber(l.value, 2) : '—'}</div>
        {l?.change != null && (
          <div className={`text-[9px] tabular-nums ${colorForDelta(l.change)}`}>{fmtDelta(l.change, 2)}</div>
        )}
      </div>
    </button>
  );
}

export default function EconomicsScreen() {
  const { data, loading } = useEconomicsDashboard();
  const [selected, setSelected] = useState(null);
  const selectedId = selected?.id || 'DGS10';
  const { observations } = useEconomicSeries(selectedId, { limit: 130 });

  const indicators = data?.indicators || [];
  const yieldCurve = data?.yieldCurve || [];
  const inverted = data?.inverted;

  return (
    <div className="flex h-full gap-0.5 p-0.5">
      {/* Left — indicators */}
      <div className="flex w-72 flex-shrink-0 flex-col">
        <Panel title="KEY INDICATORS" right={<StaleBadge stale={loading && indicators.length === 0} />} noPad>
          {indicators.length === 0 ? (
            <div className="p-4 text-center text-2xs text-bb-dark">LOADING FRED DATA…</div>
          ) : (
            indicators.map((ind) => (
              <IndicatorRow key={ind.id} ind={ind} active={selectedId === ind.id} onSelect={setSelected} />
            ))
          )}
        </Panel>
      </div>

      {/* Center — selected series + central banks */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Panel title={`${selected?.label || '10Y TREASURY YIELD'} — TIME SERIES`} className="flex-1" noPad>
          <div className="h-full p-2">
            <EconChart
              data={observations.map((o) => ({ date: o.date.slice(0, 7), value: o.value }))}
              color="#FF6600"
              type="area"
              zeroLine={selectedId === 'T10Y2Y'}
            />
          </div>
        </Panel>

        <Panel title="GLOBAL CENTRAL BANKS" noPad className="flex-shrink-0">
          <table className="bb-table">
            <thead>
              <tr><th>BANK</th><th>RATE</th><th>LAST CHANGE</th><th>NEXT MEETING</th></tr>
            </thead>
            <tbody>
              {CONFIG.centralBanks.map((b) => (
                <tr key={b.code} className="bb-row-hover">
                  <td className="font-bold text-bb-blue">{b.bank}</td>
                  <td className="text-right tabular-nums text-bb-amber">{fmtNumber(b.rate, 2)}%</td>
                  <td className="text-right text-2xs text-bb-gray">{b.lastChange}</td>
                  <td className="text-right text-2xs text-bb-dark">{b.next}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>

      {/* Right — yield curve */}
      <div className="flex w-80 flex-shrink-0 flex-col">
        <Panel title="US TREASURY YIELD CURVE" right={inverted ? <span className="text-2xs font-bold text-bb-red">INVERTED</span> : null}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yieldCurve} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#161616" vertical={false} />
                <XAxis dataKey="label" tick={AXIS} axisLine={{ stroke: '#222' }} tickLine={false} />
                <YAxis tick={AXIS} width={36} axisLine={{ stroke: '#222' }} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ background: '#000', border: '1px solid #FF660066', fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={inverted ? '#FF3131' : '#00FF41'}
                  strokeWidth={2}
                  dot={{ r: 3, fill: inverted ? '#FF3131' : '#00FF41' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1">
            {yieldCurve.map((p) => (
              <div key={p.label} className="border border-terminal-divider bg-black p-1 text-center">
                <div className="text-[9px] text-bb-dark">{p.label}</div>
                <div className="text-2xs font-bold tabular-nums text-bb-white">{p.value != null ? `${fmtNumber(p.value, 2)}%` : '—'}</div>
              </div>
            ))}
          </div>
          {inverted && (
            <div className="mt-2 border border-bb-red/40 bg-bb-red/10 px-2 py-1 text-2xs text-bb-red">
              ⚠ YIELD CURVE INVERTED — 10Y below 2Y. Historically a recession indicator.
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
