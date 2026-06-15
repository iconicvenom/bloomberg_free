'use client';

import { useState, useMemo } from 'react';
import { useApi } from '@/hooks/useApi';
import { CONFIG } from '@/lib/config';
import Panel from '@/components/ui/Panel';
import { StaleBadge } from '@/components/ui/Skeleton';
import MiniSparkline from '@/components/widgets/MiniSparkline';
import Glass from '@/components/ui/Glass';
import Carousel3D from '@/components/ui/Carousel3D';
import { fmtPrice, fmtPct, fmtLarge, colorForDelta } from '@/lib/formatters';

const TABS = ['ALL', 'LAYER1', 'DEFI', 'STABLECOINS'];
const FILTERS = {
  LAYER1: ['bitcoin', 'ethereum', 'solana', 'cardano', 'avalanche-2', 'polkadot', 'binancecoin', 'tron'],
  DEFI: ['uniswap', 'aave', 'chainlink', 'maker', 'lido-dao'],
  STABLECOINS: ['tether', 'usd-coin', 'dai', 'first-digital-usd'],
};

function fearGreed(global) {
  // Derive a simple sentiment index from market cap change.
  const chg = global?.market_cap_change_percentage_24h_usd ?? 0;
  const val = Math.max(0, Math.min(100, Math.round(50 + chg * 6)));
  const label = val > 75 ? 'EXTREME GREED' : val > 55 ? 'GREED' : val > 45 ? 'NEUTRAL' : val > 25 ? 'FEAR' : 'EXTREME FEAR';
  const color = val > 55 ? 'text-bb-green' : val < 45 ? 'text-bb-red' : 'text-bb-amber';
  return { val, label, color };
}

export default function CryptoScreen() {
  const { data, stale } = useApi('/api/crypto?perPage=50', { ttl: CONFIG.cache.crypto, key: 'crypto:50', poll: CONFIG.refreshIntervals.crypto });
  const [tab, setTab] = useState('ALL');
  const coins = data?.coins || [];
  const global = data?.global;

  const filtered = useMemo(() => {
    if (tab === 'ALL') return coins;
    const ids = FILTERS[tab] || [];
    return coins.filter((c) => ids.includes(c.id));
  }, [coins, tab]);

  const fg = fearGreed(global);
  const totalMcap = global?.total_market_cap?.usd;
  const btcDom = global?.market_cap_percentage?.btc;
  const mcapChg = global?.market_cap_change_percentage_24h_usd;

  const featured = coins.slice(0, 8);

  return (
    <div className="flex h-full flex-col gap-0.5 p-0.5">
      <div className="flex gap-0.5">
        <Panel title="GLOBAL CRYPTO MARKET" className="flex-1">
          <div className="flex items-end gap-6">
            <div>
              <div className="bb-label">TOTAL MARKET CAP</div>
              <div className="text-2xl font-bold tabular-nums text-bb-white">${totalMcap ? fmtLarge(totalMcap) : '—'}</div>
              <div className={`text-2xs tabular-nums ${colorForDelta(mcapChg)}`}>{fmtPct(mcapChg)} (24H)</div>
            </div>
            <div>
              <div className="bb-label">BTC DOMINANCE</div>
              <div className="text-xl font-bold tabular-nums text-bb-amber">{btcDom ? `${fmtPrice(btcDom)}%` : '—'}</div>
            </div>
            <div>
              <div className="bb-label">ACTIVE COINS</div>
              <div className="text-xl font-bold tabular-nums text-bb-white">{global?.active_cryptocurrencies?.toLocaleString() || '—'}</div>
            </div>
          </div>
        </Panel>
        <Panel title="FEAR & GREED INDEX" className="w-56 flex-shrink-0">
          <div className="flex flex-col items-center">
            <div className={`text-4xl font-bold tabular-nums ${fg.color}`}>{fg.val}</div>
            <div className={`text-2xs font-bold ${fg.color}`}>{fg.label}</div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gradient-to-r from-bb-red via-bb-amber to-bb-green">
              <div className="h-full w-1 bg-white" style={{ marginLeft: `${fg.val}%` }} />
            </div>
          </div>
        </Panel>
      </div>

      {featured.length > 0 && (
        <Panel title="FEATURED ASSETS" noPad className="h-32 flex-shrink-0">
          <Carousel3D
            items={featured}
            renderItem={(c, active) => (
              <Glass glow={active} className="p-3">
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.image} alt="" className="h-6 w-6" />
                  <div>
                    <div className="text-xs font-bold text-bb-white">{c.symbol?.toUpperCase()}</div>
                    <div className="text-2xs text-bb-dark">{c.name}</div>
                  </div>
                </div>
                <div className="mt-2 text-lg font-bold tabular-nums text-bb-white">${fmtPrice(c.current_price)}</div>
                <div className={`text-2xs tabular-nums ${colorForDelta(c.price_change_percentage_24h)}`}>
                  {fmtPct(c.price_change_percentage_24h)}
                </div>
              </Glass>
            )}
          />
        </Panel>
      )}

      <Panel title="CRYPTOCURRENCY MARKETS" right={<StaleBadge stale={stale} />} noPad className="min-h-0 flex-1">
        <div className="flex border-b border-terminal-divider">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 text-2xs font-bold ${tab === t ? 'bg-bb-orange/15 text-bb-orange' : 'text-bb-dark hover:text-bb-gray'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="overflow-auto thin-scroll">
          <table className="bb-table">
            <thead>
              <tr>
                <th>#</th><th>NAME</th><th>PRICE</th><th>24H%</th><th>7D%</th><th>MKT CAP</th><th>VOLUME</th><th>7D</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="bb-row-hover">
                  <td className="text-bb-dark">{c.market_cap_rank}</td>
                  <td className="font-bold text-bb-blue">
                    {c.name} <span className="text-bb-dark">{c.symbol?.toUpperCase()}</span>
                  </td>
                  <td className="text-right tabular-nums text-bb-white">${fmtPrice(c.current_price)}</td>
                  <td className={`text-right tabular-nums ${colorForDelta(c.price_change_percentage_24h)}`}>{fmtPct(c.price_change_percentage_24h)}</td>
                  <td className={`text-right tabular-nums ${colorForDelta(c.price_change_percentage_7d_in_currency)}`}>{fmtPct(c.price_change_percentage_7d_in_currency)}</td>
                  <td className="text-right tabular-nums text-bb-gray">${fmtLarge(c.market_cap)}</td>
                  <td className="text-right tabular-nums text-bb-gray">${fmtLarge(c.total_volume)}</td>
                  <td className="text-right">
                    {c.sparkline_in_7d?.price && (
                      <div className="inline-block">
                        <MiniSparkline data={c.sparkline_in_7d.price} width={70} height={20} />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="py-4 text-center text-bb-dark">LOADING CRYPTO MARKETS…</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
