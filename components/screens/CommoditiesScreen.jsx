'use client';

import { useState, useMemo } from 'react';
import { useApi } from '@/hooks/useApi';
import { useHistoricalData } from '@/hooks/useHistoricalData';
import Panel from '@/components/ui/Panel';
import { StaleBadge } from '@/components/ui/Skeleton';
import CandlestickChart from '@/components/widgets/CandlestickChart';
import { fmtPrice, fmtDelta, fmtPct, colorForDelta } from '@/lib/formatters';

const GROUP_LABELS = {
  energy: 'ENERGY', metals: 'METALS', agriculture: 'AGRICULTURE', softs: 'SOFTS',
};

function CommodityTable({ title, rows, onSelect, selected }) {
  return (
    <div>
      <div className="bb-panel-header">{title}</div>
      <table className="bb-table">
        <thead>
          <tr><th>NAME</th><th>LAST</th><th>CHG</th><th>CHG%</th><th>UNIT</th></tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr
              key={c.symbol}
              onClick={() => onSelect(c)}
              className={`bb-row-hover cursor-pointer ${selected === c.symbol ? 'bg-bb-orange/10' : ''}`}
            >
              <td className="font-bold text-bb-blue">{c.name}</td>
              <td className="text-right tabular-nums text-bb-white">{fmtPrice(c.price)}</td>
              <td className={`text-right tabular-nums ${colorForDelta(c.change)}`}>{fmtDelta(c.change)}</td>
              <td className={`text-right tabular-nums ${colorForDelta(c.changePct)}`}>{fmtPct(c.changePct)}</td>
              <td className="text-right text-2xs text-bb-dark">{c.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CommoditiesScreen() {
  const { data, stale } = useApi('/api/commodities', { ttl: 30000, key: 'commodities', poll: 20000 });
  const [selected, setSelected] = useState({ symbol: 'GC=F', name: 'Gold', proxy: 'GLD', unit: 'USD/oz' });
  const { candles } = useHistoricalData(selected.proxy || 'GLD', '6M');

  const groups = data?.commodities || {};
  const oil = useMemo(() => {
    const e = groups.energy || [];
    return e.find((c) => c.symbol === 'CL=F') || null;
  }, [groups]);

  return (
    <div className="flex h-full flex-col gap-0.5 p-0.5">
      <div className="flex gap-0.5">
        <Panel title="CRUDE OIL WTI" className="w-64 flex-shrink-0">
          <div className="text-3xl font-bold tabular-nums text-bb-white">{oil ? fmtPrice(oil.price) : '—'}</div>
          <div className={`text-sm tabular-nums ${colorForDelta(oil?.change)}`}>
            {fmtDelta(oil?.change)} ({fmtPct(oil?.changePct)})
          </div>
          <div className="mt-1 text-2xs text-bb-dark">USD / barrel · via {oil?.proxy}</div>
        </Panel>
        <Panel title="SELECTED CONTRACT CHART" right={`${selected.name} · ${selected.proxy}`} className="flex-1" noPad>
          <div className="h-44">
            <CandlestickChart candles={candles} chartType="area" overlays={{ sma50: true }} />
          </div>
        </Panel>
      </div>

      <Panel title="COMMODITY FUTURES" right={<StaleBadge stale={stale} />} noPad>
        <div className="grid grid-cols-1 gap-0.5 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(GROUP_LABELS).map(([key, label]) => (
            <CommodityTable
              key={key}
              title={label}
              rows={groups[key] || []}
              onSelect={setSelected}
              selected={selected.symbol}
            />
          ))}
        </div>
      </Panel>
    </div>
  );
}
