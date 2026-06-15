'use client';

import { fmtPct } from '@/lib/formatters';

// S&P 500 sector heatmap. cells: [{ name, weight, perf }]
function bgFor(perf) {
  if (perf == null) return 'rgba(40,40,40,0.6)';
  const clamped = Math.max(-3, Math.min(3, perf));
  const intensity = Math.min(0.85, 0.18 + Math.abs(clamped) / 3 * 0.67);
  return clamped >= 0
    ? `rgba(0,255,65,${intensity})`
    : `rgba(255,49,49,${intensity})`;
}

export default function HeatMap({ cells = [] }) {
  const total = cells.reduce((acc, c) => acc + (c.weight || 1), 0) || 1;
  return (
    <div className="flex h-full flex-wrap content-stretch gap-0.5">
      {cells.map((c) => {
        const w = ((c.weight || 1) / total) * 100;
        return (
          <div
            key={c.name}
            className="flex min-h-[54px] flex-col justify-center overflow-hidden p-1.5 transition-transform hover:z-10 hover:scale-[1.02] hover:outline hover:outline-1 hover:outline-bb-orange"
            style={{ background: bgFor(c.perf), flex: `1 1 ${w}%`, minWidth: '90px' }}
          >
            <span className="truncate text-2xs font-bold text-white drop-shadow">{c.name}</span>
            <span className="text-2xs font-bold tabular-nums text-white drop-shadow">{fmtPct(c.perf)}</span>
          </div>
        );
      })}
    </div>
  );
}
