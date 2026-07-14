'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { parseCommand } from '@/lib/commandParser';
import { resolveSymbolClient } from '@/lib/resolveSymbolClient';
import { alertDialog } from '@/lib/dialog';

export default function CommandInput() {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [histIdx, setHistIdx] = useState(-1);
  const [resolving, setResolving] = useState(false);
  const inputRef = useRef(null);
  const navigate = useUIStore((s) => s.navigate);
  const pushCommand = useUIStore((s) => s.pushCommand);
  const commandHistory = useUIStore((s) => s.commandHistory);

  // Autocomplete via server proxy (keeps key server-side)
  useEffect(() => {
    const q = value.trim();
    if (q.length < 1 || q.includes(' ') || q.includes('<')) {
      setSuggestions([]);
      return undefined;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        setSuggestions(json.results || []);
        setOpen((json.results || []).length > 0);
      } catch {
        setSuggestions([]);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [value]);

  const run = useCallback(async (raw) => {
    const cmd = (raw ?? value).trim();
    if (!cmd) return;
    const intent = parseCommand(cmd);
    if (intent) {
      // Bare tickers/company names typed directly (not picked from the
      // autocomplete dropdown, which already returns fully-qualified
      // symbols) need resolving — e.g. "sbin" -> "SBIN.NS".
      if ((intent.screen === 'equity' || intent.screen === 'chart') && intent.payload?.symbol) {
        setResolving(true);
        const { symbol, resolved } = await resolveSymbolClient(intent.payload.symbol);
        setResolving(false);
        if (!resolved) {
          await alertDialog(`Symbol "${intent.payload.symbol}" not found.`);
          return;
        }
        navigate(intent.screen, { ...intent.payload, symbol });
      } else {
        navigate(intent.screen, intent.payload || {});
      }
      pushCommand(cmd.toUpperCase());
    }
    setValue('');
    setSuggestions([]);
    setOpen(false);
    setHistIdx(-1);
  }, [value, navigate, pushCommand]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      run();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const idx = Math.min(histIdx + 1, commandHistory.length - 1);
        setHistIdx(idx);
        setValue(commandHistory[idx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx > 0) {
        const idx = histIdx - 1;
        setHistIdx(idx);
        setValue(commandHistory[idx]);
      } else {
        setHistIdx(-1);
        setValue('');
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const pickSuggestion = (sym) => {
    // Suggestions from /api/search are already fully-qualified symbols —
    // navigate directly instead of round-tripping through resolveSymbol again.
    navigate('equity', { symbol: sym });
    pushCommand(`${sym} EQUITY`);
    setValue('');
    setSuggestions([]);
    setOpen(false);
    setHistIdx(-1);
  };

  return (
    <div className="relative flex-1 max-w-2xl">
      <div className="flex items-center gap-2 border border-bb-orange/40 bg-black px-2 py-1 focus-within:bb-glow">
        <Search size={13} className="text-bb-orange" />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => suggestions.length && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="ENTER COMMAND  e.g.  AAPL <EQUITY> <GO>"
          spellCheck={false}
          className="flex-1 bg-transparent text-xs uppercase tracking-wide text-bb-white placeholder:text-bb-dark"
        />
        <button
          onClick={() => run()}
          disabled={resolving}
          className="flex items-center gap-1 bg-bb-orange px-2 py-0.5 text-2xs font-bold text-black hover:bg-bb-amber disabled:opacity-60"
        >
          {resolving ? <><Loader2 size={11} className="animate-spin" /> RESOLVING</> : 'GO'}
        </button>
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-0.5 max-h-72 overflow-y-auto border border-bb-orange/40 bg-terminal-panel thin-scroll">
          {suggestions.map((s) => (
            <button
              key={s.symbol}
              onMouseDown={() => pickSuggestion(s.symbol)}
              className="flex w-full items-center justify-between border-b border-terminal-divider px-3 py-1.5 text-left hover:bg-bb-orange/10"
            >
              <span className="text-xs font-bold text-bb-blue">{s.symbol}</span>
              <span className="ml-3 truncate text-2xs text-bb-gray">{s.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
