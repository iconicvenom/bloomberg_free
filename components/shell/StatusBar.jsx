'use client';

import { useEffect, useState } from 'react';
import { useMarketStore } from '@/store/marketStore';
import { useUIStore } from '@/store/uiStore';
import { SCREENS } from '@/lib/config';
import { fmtTime } from '@/lib/formatters';

export default function StatusBar() {
  const connection = useMarketStore((s) => s.connection);
  const activeScreen = useUIStore((s) => s.activeScreen);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const screen = SCREENS.find((s) => s.id === activeScreen);
  const connColor =
    connection === 'live' ? 'text-bb-green' : connection === 'delayed' ? 'text-bb-amber' : 'text-bb-red';

  return (
    <footer className="flex h-6 flex-shrink-0 items-center justify-between border-t border-terminal-border bg-terminal-header px-3 text-2xs text-bb-dark">
      <div className="flex items-center gap-4">
        <span className="text-bb-orange">●</span>
        <span>SCREEN: <span className="text-bb-gray">{screen?.label || '—'}</span></span>
        <span className="hidden md:inline">FUNC: <span className="text-bb-gray">{screen?.key}</span></span>
        <span className={connColor}>FEED: {connection.toUpperCase()}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden sm:inline">MODE: <span className="text-bb-gray">PROD</span></span>
        <span className="tabular-nums text-bb-amber">{fmtTime(now)} EST</span>
        <span className="hidden lg:inline text-bb-dark">BLOOMBERG REPLICA v1.0</span>
      </div>
    </footer>
  );
}
