'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useAlertStore } from '@/store/alertStore';

const CONDITION_LABELS = {
  price: { above: 'ABOVE', below: 'BELOW' },
  percent_change: { above: 'ABOVE', below: 'BELOW' },
  ma_cross: { above: 'CROSS UPWARD', below: 'CROSS DOWNWARD' },
};

// Small form for creating an alert. When `symbol` is provided (launched from
// a portfolio/wishlist row), it's prefilled and read-only.
export default function AlertCreateForm({ symbol: fixedSymbol, onClose }) {
  const { create } = useAlertStore();
  const [symbol, setSymbol] = useState(fixedSymbol || '');
  const [type, setType] = useState('price');
  const [condition, setCondition] = useState('above');
  const [value, setValue] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!symbol) return;
    await create({ symbol, type, condition, value: type === 'ma_cross' ? null : value });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <form onSubmit={submit} className="w-80 border border-bb-orange/40 bg-terminal-bg p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-bold text-bb-orange">NEW ALERT</span>
          <X size={14} className="cursor-pointer text-bb-dark hover:text-bb-red" onClick={onClose} />
        </div>

        <div className="mb-2">
          <div className="bb-label mb-1">SYMBOL</div>
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            readOnly={!!fixedSymbol}
            className="w-full bg-terminal-header p-1 text-xs uppercase text-bb-white"
          />
        </div>

        <div className="mb-2">
          <div className="bb-label mb-1">TYPE</div>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-terminal-header p-1 text-xs text-bb-white">
            <option value="price">PRICE</option>
            <option value="percent_change">% CHANGE</option>
            <option value="ma_cross">50-DAY MA CROSS</option>
          </select>
        </div>

        <div className="mb-2">
          <div className="bb-label mb-1">CONDITION</div>
          <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full bg-terminal-header p-1 text-xs text-bb-white">
            <option value="above">{CONDITION_LABELS[type].above}</option>
            <option value="below">{CONDITION_LABELS[type].below}</option>
          </select>
        </div>

        {type !== 'ma_cross' && (
          <div className="mb-3">
            <div className="bb-label mb-1">{type === 'price' ? 'TARGET PRICE' : 'TARGET % CHANGE'}</div>
            <input
              type="number"
              step="any"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full bg-terminal-header p-1 text-xs text-bb-white"
            />
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1 text-2xs font-bold text-bb-gray hover:text-bb-white">CANCEL</button>
          <button type="submit" className="bg-bb-orange px-3 py-1 text-2xs font-bold text-black">CREATE</button>
        </div>
      </form>
    </div>
  );
}
