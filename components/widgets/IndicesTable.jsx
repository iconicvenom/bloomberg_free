'use client';

import { useRef, useEffect, useState } from 'react';
import { fmtPrice, fmtDelta, fmtPct, colorForDelta, fmtTime } from '@/lib/formatters';

function PriceCell({ value }) {
  const [flash, setFlash] = useState('');
  const prev = useRef(value);
  useEffect(() => {
    if (value != null && prev.current != null && value !== prev.current) {
      setFlash(value > prev.current ? 'flash-up' : 'flash-down');
      const t = setTimeout(() => setFlash(''), 600);
      prev.current = value;
      return () => clearTimeout(t);
    }
    prev.current = value;
    return undefined;
  }, [value]);
  return <td className={`text-right tabular-nums text-bb-white ${flash}`}>{fmtPrice(value)}</td>;
}

export default function IndicesTable({ indices = [] }) {
  return (
    <table className="bb-table">
      <thead>
        <tr>
          <th>INDEX</th>
          <th>LAST</th>
          <th>CHG</th>
          <th>CHG%</th>
          <th>TIME</th>
        </tr>
      </thead>
      <tbody>
        {indices.map((idx) => (
          <tr key={idx.name} className="bb-row-hover">
            <td className="font-bold text-bb-blue">{idx.name}</td>
            <PriceCell value={idx.price} />
            <td className={`text-right tabular-nums ${colorForDelta(idx.change)}`}>{fmtDelta(idx.change)}</td>
            <td className={`text-right tabular-nums ${colorForDelta(idx.changePct)}`}>{fmtPct(idx.changePct)}</td>
            <td className="text-right text-2xs text-bb-dark">{idx.time ? fmtTime(new Date(idx.time * 1000)) : '—'}</td>
          </tr>
        ))}
        {indices.length === 0 && (
          <tr><td colSpan={5} className="py-4 text-center text-bb-dark">LOADING INDICES…</td></tr>
        )}
      </tbody>
    </table>
  );
}
