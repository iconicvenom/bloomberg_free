'use client';

import { useState, useRef } from 'react';
import { Plus, X, GripVertical } from 'lucide-react';
import { useWatchlistStore } from '@/store/watchlistStore';
import { useUIStore } from '@/store/uiStore';
import { useLivePrice } from '@/hooks/useLivePrice';
import { useApi } from '@/hooks/useApi';
import Panel from '@/components/ui/Panel';
import MiniSparkline from '@/components/widgets/MiniSparkline';
import { fmtPrice, fmtDelta, fmtPct, colorForDelta } from '@/lib/formatters';

function PriceCell({ live, fallback }) {
  const ref = useRef(live?.price);
  const [flash, setFlash] = useState('');
  const price = live?.price ?? fallback?.price;
  if (price != null && ref.current != null && price !== ref.current) {
    const dir = price > ref.current ? 'flash-up' : 'flash-down';
    if (dir !== flash) {
      setFlash(dir);
      setTimeout(() => setFlash(''), 600);
    }
    ref.current = price;
  } else if (ref.current == null) {
    ref.current = price;
  }
  return <td className={`text-right tabular-nums text-bb-white ${flash}`}>{fmtPrice(price)}</td>;
}

export default function WatchlistScreen() {
  const { symbols, add, remove, reorder } = useWatchlistStore();
  const navigate = useUIStore((s) => s.navigate);
  const [input, setInput] = useState('');
  const dragIdx = useRef(null);

  const live = useLivePrice(symbols);
  // Pull 52w high/low + sparkline-ish data via batch profile is heavy; use quote highs from live + history sparkline lazily.

  const onDrop = (idx) => {
    if (dragIdx.current != null && dragIdx.current !== idx) reorder(dragIdx.current, idx);
    dragIdx.current = null;
  };

  return (
    <div className="flex h-full flex-col gap-0.5 p-0.5">
      <Panel title="WATCHLIST · WPX" right={`${symbols.length} SECURITIES`} noPad className="min-h-0 flex-1">
        <form
          onSubmit={(e) => { e.preventDefault(); add(input); setInput(''); }}
          className="flex items-center gap-2 border-b border-terminal-divider bg-terminal-header px-2 py-1.5"
        >
          <Plus size={13} className="text-bb-orange" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ADD SYMBOL (e.g. AAPL)"
            className="w-48 bg-transparent text-xs uppercase text-bb-white placeholder:text-bb-dark"
          />
          <button type="submit" className="bg-bb-orange px-2 py-0.5 text-2xs font-bold text-black">ADD</button>
        </form>

        <div className="overflow-auto thin-scroll">
          <table className="bb-table">
            <thead>
              <tr>
                <th />
                <th>SYMBOL</th>
                <th>LAST</th>
                <th>CHG</th>
                <th>CHG%</th>
                <th>OPEN</th>
                <th>HIGH</th>
                <th>LOW</th>
                <th>INTRADAY</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {symbols.map((sym, idx) => {
                const q = live[sym];
                const spark = q ? [q.prevClose ?? q.open ?? q.price, q.low, q.open ?? q.price, q.high, q.price].filter((v) => v != null) : [];
                return (
                  <tr
                    key={sym}
                    draggable
                    onDragStart={() => { dragIdx.current = idx; }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => onDrop(idx)}
                    className="bb-row-hover cursor-pointer"
                    onClick={() => navigate('equity', { symbol: sym })}
                  >
                    <td className="w-4 text-bb-dark" onClick={(e) => e.stopPropagation()}>
                      <GripVertical size={11} className="cursor-grab" />
                    </td>
                    <td className="font-bold text-bb-blue">{sym}</td>
                    <PriceCell live={q} fallback={q} />
                    <td className={`text-right tabular-nums ${colorForDelta(q?.change)}`}>{fmtDelta(q?.change)}</td>
                    <td className={`text-right tabular-nums ${colorForDelta(q?.changePct)}`}>{fmtPct(q?.changePct)}</td>
                    <td className="text-right tabular-nums text-bb-gray">{fmtPrice(q?.open)}</td>
                    <td className="text-right tabular-nums text-bb-green">{fmtPrice(q?.high)}</td>
                    <td className="text-right tabular-nums text-bb-red">{fmtPrice(q?.low)}</td>
                    <td className="text-right">
                      {spark.length > 1 && <div className="inline-block"><MiniSparkline data={spark} width={70} height={20} /></div>}
                    </td>
                    <td className="w-4" onClick={(e) => { e.stopPropagation(); remove(sym); }}>
                      <X size={12} className="text-bb-dark hover:text-bb-red" />
                    </td>
                  </tr>
                );
              })}
              {symbols.length === 0 && (
                <tr><td colSpan={10} className="py-6 text-center text-bb-dark">WATCHLIST EMPTY — ADD A SYMBOL ABOVE</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
