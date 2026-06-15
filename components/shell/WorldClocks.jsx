'use client';

import { useEffect, useState } from 'react';
import { fmtTime } from '@/lib/formatters';

const ZONES = [
  { label: 'NEW YORK', tz: 'America/New_York' },
  { label: 'LONDON', tz: 'Europe/London' },
  { label: 'TOKYO', tz: 'Asia/Tokyo' },
];

export default function WorldClocks() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="hidden items-center gap-4 lg:flex">
      {ZONES.map((z) => (
        <div key={z.tz} className="flex flex-col items-end leading-tight">
          <span className="text-2xs text-bb-dark">{z.label}</span>
          <span className="text-xs tabular-nums text-bb-amber">{fmtTime(now, z.tz)}</span>
        </div>
      ))}
    </div>
  );
}
