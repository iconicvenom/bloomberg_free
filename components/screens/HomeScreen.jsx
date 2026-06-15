'use client';

import { useMemo, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { useLivePrice } from '@/hooks/useLivePrice';
import { CONFIG } from '@/lib/config';
import Panel from '@/components/ui/Panel';
import { StaleBadge } from '@/components/ui/Skeleton';
import { HGroup, VGroup, GridPanel, HResizeHandle, VResizeHandle } from '@/components/shell/PanelGrid';
import IndicesTable from '@/components/widgets/IndicesTable';
import MarketMover from '@/components/widgets/MarketMover';
import NewsFeed from '@/components/widgets/NewsFeed';
import HeatMap from '@/components/widgets/HeatMap';
import NewsModal from '@/components/widgets/NewsModal';
import { fmtPrice, fmtPct, colorForDelta } from '@/lib/formatters';

const FX_PAIRS = [
  ['EUR/USD', 'EUR', 'USD'], ['GBP/USD', 'GBP', 'USD'], ['USD/JPY', 'USD', 'JPY'],
  ['USD/CHF', 'USD', 'CHF'], ['AUD/USD', 'AUD', 'USD'], ['USD/CAD', 'USD', 'CAD'], ['USD/CNY', 'USD', 'CNY'],
];

const SECTORS = [
  { name: 'Technology', weight: 30 }, { name: 'Health Care', weight: 13 },
  { name: 'Financials', weight: 13 }, { name: 'Cons. Disc.', weight: 10 },
  { name: 'Communication', weight: 9 }, { name: 'Industrials', weight: 8 },
  { name: 'Cons. Staples', weight: 6 }, { name: 'Energy', weight: 4 },
  { name: 'Utilities', weight: 3 }, { name: 'Real Estate', weight: 2 }, { name: 'Materials', weight: 2 },
];

function FxSnapshot({ rates }) {
  return (
    <div className="grid grid-cols-2 gap-1.5 p-1">
      {FX_PAIRS.map(([label, base, quote]) => {
        const rate = rates && rates[base] && rates[quote] ? rates[quote] / rates[base] : null;
        const change = rate ? (Math.sin(rate * 7) * 0.4) : 0; // synthetic intraday delta
        return (
          <div key={label} className="border border-terminal-divider bg-black px-2 py-1">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-bold text-bb-orange">{label}</span>
              <span className={`text-2xs tabular-nums ${colorForDelta(change)}`}>{fmtPct(change)}</span>
            </div>
            <div className="text-sm tabular-nums text-bb-white">{rate ? fmtPrice(rate, rate > 50 ? 2 : 4) : '—'}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function HomeScreen() {
  const [article, setArticle] = useState(null);
  const indices = useApi('/api/indices', { ttl: CONFIG.cache.quote, key: 'indices', poll: CONFIG.refreshIntervals.indices });
  const movers = useApi('/api/movers', { ttl: 10000, key: 'movers', poll: 15000 });
  const news = useApi('/api/news?category=all', { ttl: CONFIG.cache.news, key: 'news:home', poll: CONFIG.refreshIntervals.news });
  const forex = useApi('/api/forex?base=USD', { ttl: CONFIG.cache.forex, key: 'forex:USD', poll: CONFIG.refreshIntervals.forex });

  // Keep index proxies live-updating
  useLivePrice(CONFIG.indices.map((i) => i.proxy));

  const heatCells = useMemo(() => {
    // Deterministic synthetic sector performance seeded from movers if present.
    const avg = movers.data?.gainers?.[0]?.changePct || 1;
    return SECTORS.map((s, i) => ({
      ...s,
      perf: ((Math.sin((i + 1) * 2.3 + avg) * 2.2)),
    }));
  }, [movers.data]);

  return (
    <div className="flex h-full flex-col gap-0.5 p-0.5">
      <VGroup id="home" className="min-h-0 flex-1">
        <GridPanel defaultSize={62} minSize={30}>
          <HGroup id="home-top" className="h-full gap-0.5">
            <GridPanel defaultSize={28} minSize={15}>
              <Panel title="GLOBAL INDICES" noPad right={<StaleBadge stale={indices.stale} />}>
                <IndicesTable indices={indices.data?.indices || []} />
              </Panel>
            </GridPanel>
            <HResizeHandle />
            <GridPanel defaultSize={26} minSize={15}>
              <Panel title="MARKET MOVERS" noPad right={<StaleBadge stale={movers.stale} />}>
                <MarketMover data={movers.data} />
              </Panel>
            </GridPanel>
            <HResizeHandle />
            <GridPanel defaultSize={26} minSize={15}>
              <Panel title="LIVE NEWS" noPad right={<StaleBadge stale={news.stale} />}>
                <NewsFeed articles={(news.data?.articles || []).slice(0, 30)} onSelect={setArticle} compact />
              </Panel>
            </GridPanel>
            <HResizeHandle />
            <GridPanel defaultSize={20} minSize={12}>
              <Panel title="FX SNAPSHOT" noPad right={<StaleBadge stale={forex.stale} />}>
                <FxSnapshot rates={forex.data?.quote} />
              </Panel>
            </GridPanel>
          </HGroup>
        </GridPanel>
        <VResizeHandle />
        <GridPanel defaultSize={38} minSize={20}>
          <Panel title="S&P 500 SECTOR HEATMAP" noPad>
            <div className="h-full p-1">
              <HeatMap cells={heatCells} />
            </div>
          </Panel>
        </GridPanel>
      </VGroup>

      {article && <NewsModal article={article} onClose={() => setArticle(null)} />}
    </div>
  );
}
