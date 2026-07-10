'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';
import { SCREENS } from '@/lib/config';

export default function FunctionKeyBar() {
  const activeScreen = useUIStore((s) => s.activeScreen);
  const setScreen = useUIStore((s) => s.setScreen);

  useEffect(() => {
    const handler = (e) => {
      const match = e.key.match(/^F(\d{1,2})$/);
      if (match) {
        const idx = parseInt(match[1], 10) - 1;
        if (SCREENS[idx]) {
          e.preventDefault();
          setScreen(SCREENS[idx].id);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setScreen]);

  return (
    <nav className="flex h-8 flex-shrink-0 items-stretch border-b border-terminal-border bg-terminal-bg text-2xs">
      {SCREENS.filter((screen) => screen.key).map((screen) => {
        const active = activeScreen === screen.id;
        return (
          <button
            key={screen.id}
            onClick={() => setScreen(screen.id)}
            title={screen.label}
            className={`group relative flex flex-1 items-center justify-center gap-1 border-r border-terminal-divider px-1 transition-colors ${
              active
                ? 'bg-bb-orange/15 text-bb-orange bb-glow'
                : 'text-bb-gray hover:bg-white/5 hover:text-bb-white'
            }`}
          >
            <span className={`font-bold ${active ? 'text-bb-orange' : 'text-bb-dark'}`}>{screen.key}</span>
            <span className="font-bold tracking-wide">{screen.label}</span>
            {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-bb-orange" />}
          </button>
        );
      })}
    </nav>
  );
}
