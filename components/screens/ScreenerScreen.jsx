'use client';

import { useState, useMemo } from 'react';
import { Star } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { useUIStore } from '@/store/uiStore';
import { useWatchlistStore } from '@/store/watchlistStore';
import Panel from '@/components/ui/Panel';
import { StaleBadge } from '@/components/ui/Skeleton';
import FxSlider from '@/components/ui/FxSlider';
import { fmtPrice, fmtPct, fmtNumber, fmtLarge, colorForDelta } from '@/lib/formatters';

const MARKET_CAPS = [
  { id: 'mega', label: 'MEGA (>$200B)', min: 200e9, max: Infinity },
  { id: 'large', label: 'LARGE ($10-200B)', min: 10e9, max: 200e9 },
  { id: 'mid', label: 'MID ($2-10B)', min: 2e9, max: 10e9 },
  { id: 'small', label: 'SMALL (<$2B)', min: 0, max: 2e9 },
];

const SECTORS = ['ALL', 'Technology', 'Communication', 'Cons. Disc.', 'Financials', 'Energy', 'Health Care', 'Cons. Staples', 'Industrials'];

export default function ScreenerScreen() {
  const { data, stale } = useApi('/api/screener', { ttl: 3600000, key: 'screener' });
  const navigate = useUIStore((s) => s.navigate);
  const wl = useWatchlistStore();

  const [caps, setCaps] = useState([]);
  const [sector, setSector] = useState('ALL');
  const [pe, setPe] = useState([0, 100]);
  const [chg52, setChg52] = useState([-100, 200]);
  const [minVolume, setMinVolume] = useState(0);
  const [minDiv, setMinDiv] = useState(0);

  const rows = data?.rows || [];
  const filtered = useMemo(() => rows.filter((r) => {
    if (sector !== 'ALL' && r.sector !== sector) return false;
    if (caps.length > 0) {
      const ok = caps.some((cid) => {
        const c = MARKET_CAPS.find((m) => m.id === cid);
        return c && r.marketCap != null && r.marketCap >= c.min && r.marketCap < c.max;
      });
      if (!ok) return false;
    }
    if (r.pe != null && (r.pe < pe[0] || r.pe > pe[1])) return false;
    if (r.week52ChangePct != null && (r.week52ChangePct < chg52[0] || r.week52ChangePct > chg52[1])) return false;
    if (minDiv > 0 && (r.dividendYield == null || r.dividendYield < minDiv)) return false;
    return true;
  }), [rows, sector, caps, pe, chg52, minDiv]);

  const toggleCap = (id) => setCaps((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  return (
    <div className="flex h-full gap-0.5 p-0.5">
      <div className="flex w-64 flex-shrink-0 flex-col">
        <Panel title="SCREENER FILTERS">
          <div className="space-y-3">
            <div>
              <div className="bb-label mb-1">MARKET CAP</div>
              <div className="space-y-1">
                {MARKET_CAPS.map((c) => (
                  <label key={c.id} className="flex cursor-pointer items-center gap-2 text-2xs text-bb-gray">
                    <input type="checkbox" checked={caps.includes(c.id)} onChange={() => toggleCap(c.id)} className="accent-bb-orange" />
                    {c.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="bb-label mb-1">SECTOR</div>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full border border-terminal-divider bg-black px-2 py-1 text-2xs text-bb-white"
              >
                {SECTORS.map((s) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
              </select>
            </div>

            <FxSlider label="P/E RATIO" min={0} max={100} value={pe} onChange={setPe} />
            <FxSlider label="52W CHANGE %" min={-100} max={200} value={chg52} onChange={setChg52} suffix="%" />

            <div>
              <div className="bb-label mb-1">MIN DIVIDEND YIELD %</div>
              <input
                type="number" step="0.1" min="0" value={minDiv}
                onChange={(e) => setMinDiv(Number(e.target.value))}
                className="w-full border border-terminal-divider bg-black px-2 py-1 text-2xs text-bb-white"
              />
            </div>
            <div>
              <div className="bb-label mb-1">MIN VOLUME</div>
              <input
                type="number" min="0" value={minVolume}
                onChange={(e) => setMinVolume(Number(e.target.value))}
                className="w-full border border-terminal-divider bg-black px-2 py-1 text-2xs text-bb-white"
              />
            </div>

            <button
              onClick={() => { setCaps([]); setSector('ALL'); setPe([0, 100]); setChg52([-100, 200]); setMinDiv(0); setMinVolume(0); }}
              className="w-full border border-bb-orange/50 py-1 text-2xs font-bold text-bb-orange hover:bg-bb-orange/10"
            >
              RESET FILTERS
            </button>
          </div>
        </Panel>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Panel title="SCREENER RESULTS" right={<span className="flex items-center gap-2 text-2xs text-bb-dark">{filtered.length} MATCHES <StaleBadge stale={stale} /></span>} noPad className="min-h-0 flex-1">
          <div className="overflow-auto thin-scroll">
            <table className="bb-table">
              <thead>
                <tr>
                  <th>SYMBOL</th><th>NAME</th><th>SECTOR</th><th>PRICE</th><th>CHG%</th>
                  <th>P/E</th><th>MKT CAP</th><th>52W%</th><th>DIV%</th><th>BETA</th><th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.symbol} className="bb-row-hover cursor-pointer" onClick={() => navigate('equity', { symbol: r.symbol })}>
                    <td className="font-bold text-bb-blue">{r.symbol}</td>
                    <td className="max-w-[140px] truncate text-bb-gray">{r.name}</td>
                    <td className="text-2xs text-bb-dark">{r.sector}</td>
                    <td className="text-right tabular-nums text-bb-white">{fmtPrice(r.price)}</td>
                    <td className={`text-right tabular-nums ${colorForDelta(r.changePct)}`}>{fmtPct(r.changePct)}</td>
                    <td className="text-right tabular-nums text-bb-gray">{fmtNumber(r.pe, 1)}</td>
                    <td className="text-right tabular-nums text-bb-gray">{r.marketCap ? `$${fmtLarge(r.marketCap)}` : '—'}</td>
                    <td className={`text-right tabular-nums ${colorForDelta(r.week52ChangePct)}`}>{fmtPct(r.week52ChangePct)}</td>
                    <td className="text-right tabular-nums text-bb-gray">{r.dividendYield ? fmtNumber(r.dividendYield, 2) : '—'}</td>
                    <td className="text-right tabular-nums text-bb-gray">{fmtNumber(r.beta, 2)}</td>
                    <td className="w-4" onClick={(e) => { e.stopPropagation(); wl.add(r.symbol); }}>
                      <Star size={12} className={wl.symbols.includes(r.symbol) ? 'text-bb-green' : 'text-bb-dark hover:text-bb-orange'} />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={11} className="py-6 text-center text-bb-dark">{rows.length === 0 ? 'LOADING UNIVERSE…' : 'NO MATCHES — ADJUST FILTERS'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
