'use client';

export function SkeletonRows({ rows = 6, cols = 4 }) {
  return (
    <div className="space-y-1.5 p-1">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-2">
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="skeleton h-4 rounded-sm"
              style={{ width: c === 0 ? '30%' : `${18 + (c % 2) * 6}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonBlock({ className = 'h-full w-full' }) {
  return <div className={`skeleton ${className}`} />;
}

export function StaleBadge({ stale, label = 'DELAYED' }) {
  if (!stale) return null;
  return (
    <span className="ml-2 rounded-sm border border-bb-amber/50 px-1 py-px text-2xs font-bold text-bb-amber">
      [{label}]
    </span>
  );
}
