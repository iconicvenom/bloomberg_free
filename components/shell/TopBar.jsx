'use client';

import { Circle } from 'lucide-react';
import { useMarketStore } from '@/store/marketStore';
import CommandInput from './CommandInput';
import WorldClocks from './WorldClocks';

const STATUS = {
  live: { color: 'text-bb-green', label: 'LIVE' },
  delayed: { color: 'text-bb-amber', label: 'DELAYED' },
  disconnected: { color: 'text-bb-red', label: 'OFFLINE' },
  connecting: { color: 'text-bb-gray', label: 'CONNECTING' },
};

export default function TopBar() {
  const connection = useMarketStore((s) => s.connection);
  const status = STATUS[connection] || STATUS.connecting;

  return (
    <header className="flex h-11 flex-shrink-0 items-center gap-3 border-b border-terminal-border bg-terminal-header px-2">
      <div className="flex items-center gap-2">
        <div className="bg-bb-orange px-2 py-1 text-sm font-extrabold tracking-tight text-black">
          BLOOMBERG
        </div>
        <span className="hidden text-2xs text-bb-dark xl:inline">PROFESSIONAL</span>
      </div>

      <CommandInput />

      <div className="ml-auto flex items-center gap-4">
        <WorldClocks />
        <div className="flex items-center gap-1.5 border-l border-terminal-divider pl-3">
          <Circle size={8} className={`${status.color} fill-current ${connection === 'live' ? 'animate-pulse' : ''}`} />
          <span className={`text-2xs font-bold ${status.color}`}>{status.label}</span>
        </div>
      </div>
    </header>
  );
}
