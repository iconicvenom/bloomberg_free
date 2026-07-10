'use client';

import { useEffect, useState, useRef } from 'react';
import { Plus, X, GripVertical, Pencil, Bell } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlistStore';
import { useUIStore } from '@/store/uiStore';
import { useLivePrice } from '@/hooks/useLivePrice';
import Panel from '@/components/ui/Panel';
import MiniSparkline from '@/components/widgets/MiniSparkline';
import AlertCreateForm from '@/components/alerts/AlertCreateForm';
import { promptDialog, confirmDialog } from '@/lib/dialog';
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
  const {
    wishlists, activeWishlistId, items,
    fetchWishlists, createWishlist, renameWishlist, removeWishlist, setActive,
    addItem, removeItem, reorder,
  } = useWishlistStore();
  const navigate = useUIStore((s) => s.navigate);
  const [input, setInput] = useState('');
  const [alertSymbol, setAlertSymbol] = useState(null);
  const dragIdx = useRef(null);

  useEffect(() => {
    fetchWishlists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeItems = items[activeWishlistId] || [];
  const symbols = activeItems.map((i) => i.symbol);
  const live = useLivePrice(symbols);

  const onDrop = (idx) => {
    if (dragIdx.current != null && dragIdx.current !== idx) {
      const arr = [...activeItems];
      const [moved] = arr.splice(dragIdx.current, 1);
      arr.splice(idx, 0, moved);
      reorder(activeWishlistId, arr.map((i) => i.id));
    }
    dragIdx.current = null;
  };

  const addWishlist = async () => {
    const name = await promptDialog('Wishlist name:', `List ${wishlists.length + 1}`);
    if (!name) return;
    createWishlist(name);
  };

  const renameActive = async (w) => {
    const name = await promptDialog('New name:', w.name);
    if (!name || name === w.name) return;
    renameWishlist(w.id, name);
  };

  const removeActive = async (w) => {
    if (!(await confirmDialog(`Delete wishlist "${w.name}" and its symbols?`))) return;
    removeWishlist(w.id);
  };

  return (
    <div className="flex h-full flex-col gap-0.5 p-0.5">
      <div className="flex flex-shrink-0 items-stretch border-b border-terminal-divider bg-terminal-header text-2xs">
        {wishlists.map((w) => {
          const active = w.id === activeWishlistId;
          return (
            <div
              key={w.id}
              className={`group flex items-center gap-1 border-r border-terminal-divider px-2 py-1 ${
                active ? 'bg-bb-orange/15 text-bb-orange' : 'text-bb-gray hover:bg-white/5 hover:text-bb-white'
              }`}
            >
              <button onClick={() => setActive(w.id)} className="font-bold tracking-wide">{w.name.toUpperCase()}</button>
              {active && (
                <>
                  <Pencil size={10} className="cursor-pointer text-bb-dark hover:text-bb-amber" onClick={() => renameActive(w)} />
                  <X size={10} className="cursor-pointer text-bb-dark hover:text-bb-red" onClick={() => removeActive(w)} />
                </>
              )}
            </div>
          );
        })}
        <button onClick={addWishlist} className="flex items-center gap-1 px-2 py-1 text-bb-orange hover:text-bb-amber">
          <Plus size={11} /> NEW
        </button>
      </div>

      <Panel title="WATCHLIST · WPX" right={`${activeItems.length} SECURITIES`} noPad className="min-h-0 flex-1">
        <form
          onSubmit={(e) => { e.preventDefault(); if (activeWishlistId) addItem(activeWishlistId, input); setInput(''); }}
          className="flex items-center gap-2 border-b border-terminal-divider bg-terminal-header px-2 py-1.5"
        >
          <Plus size={13} className="text-bb-orange" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ADD SYMBOL (e.g. AAPL)"
            disabled={!activeWishlistId}
            className="w-48 bg-transparent text-xs uppercase text-bb-white placeholder:text-bb-dark"
          />
          <button type="submit" disabled={!activeWishlistId} className="bg-bb-orange px-2 py-0.5 text-2xs font-bold text-black disabled:opacity-40">ADD</button>
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
                <th /><th />
              </tr>
            </thead>
            <tbody>
              {activeItems.map((item, idx) => {
                const sym = item.symbol;
                const q = live[sym];
                const spark = q ? [q.prevClose ?? q.open ?? q.price, q.low, q.open ?? q.price, q.high, q.price].filter((v) => v != null) : [];
                return (
                  <tr
                    key={item.id}
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
                    <td className="w-4" onClick={(e) => { e.stopPropagation(); setAlertSymbol(sym); }}>
                      <Bell size={12} className="text-bb-dark hover:text-bb-amber" />
                    </td>
                    <td className="w-4" onClick={(e) => { e.stopPropagation(); removeItem(activeWishlistId, item.id); }}>
                      <X size={12} className="text-bb-dark hover:text-bb-red" />
                    </td>
                  </tr>
                );
              })}
              {activeItems.length === 0 && (
                <tr><td colSpan={11} className="py-6 text-center text-bb-dark">{activeWishlistId ? 'WATCHLIST EMPTY — ADD A SYMBOL ABOVE' : 'CREATE A WISHLIST TO GET STARTED'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {alertSymbol && <AlertCreateForm symbol={alertSymbol} onClose={() => setAlertSymbol(null)} />}
    </div>
  );
}
