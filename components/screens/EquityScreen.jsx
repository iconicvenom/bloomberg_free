'use client';

import { useState } from 'react';
import { Plus, Star, Check } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useApi } from '@/hooks/useApi';
import { useLivePrice } from '@/hooks/useLivePrice';
import { useHistoricalData } from '@/hooks/useHistoricalData';
import { useWishlistStore } from '@/store/wishlistStore';
import { usePortfolioStore } from '@/store/portfolioStore';
import { useAccountStore } from '@/store/accountStore';
import Panel from '@/components/ui/Panel';
import { StaleBadge, SkeletonRows } from '@/components/ui/Skeleton';
import PriceQuote from '@/components/widgets/PriceQuote';
import CandlestickChart from '@/components/widgets/CandlestickChart';
import ChartToolbar from '@/components/widgets/ChartToolbar';
import OrderBook from '@/components/widgets/OrderBook';
import TechnicalIndicators from '@/components/widgets/TechnicalIndicators';
import NewsFeed from '@/components/widgets/NewsFeed';
import NewsModal from '@/components/widgets/NewsModal';
import { promptDialog, alertDialog } from '@/lib/dialog';
import { fmtPrice, fmtLarge, fmtNumber, fmtDate } from '@/lib/formatters';

const TABS = ['OVERVIEW', 'TECHNICALS', 'FINANCIALS', 'NEWS'];

function Stat({ label, value, color = 'text-bb-white' }) {
  return (
    <div className="flex items-center justify-between border-b border-terminal-divider py-0.5">
      <span className="bb-label">{label}</span>
      <span className={`text-xs tabular-nums ${color}`}>{value}</span>
    </div>
  );
}

function AnalystBar({ recommendations }) {
  const latest = recommendations?.[0];
  if (!latest) return <div className="text-2xs text-bb-dark">NO ANALYST DATA</div>;
  const buy = (latest.strongBuy || 0) + (latest.buy || 0);
  const hold = latest.hold || 0;
  const sell = (latest.sell || 0) + (latest.strongSell || 0);
  const total = buy + hold + sell || 1;
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-sm">
        <div className="bg-bb-green" style={{ width: `${(buy / total) * 100}%` }} />
        <div className="bg-bb-amber" style={{ width: `${(hold / total) * 100}%` }} />
        <div className="bg-bb-red" style={{ width: `${(sell / total) * 100}%` }} />
      </div>
      <div className="mt-1 flex justify-between text-2xs">
        <span className="text-bb-green">BUY {buy}</span>
        <span className="text-bb-amber">HOLD {hold}</span>
        <span className="text-bb-red">SELL {sell}</span>
      </div>
    </div>
  );
}

export default function EquityScreen() {
  const symbol = useUIStore((s) => s.activeSymbol);
  const [range, setRange] = useState('3M');
  const [chartType, setChartType] = useState('candlestick');
  const [overlays, setOverlays] = useState({ sma20: false, sma50: true, sma200: false, bollinger: false, volume: true });
  const [tab, setTab] = useState('OVERVIEW');
  const [article, setArticle] = useState(null);

  const live = useLivePrice(symbol);
  const eq = useApi(`/api/equity/${symbol}`, { ttl: 60000, key: `equity:${symbol}` });
  const { candles, loading: chartLoading, stale: chartStale } = useHistoricalData(symbol, range);
  const news = useApi(`/api/news?q=${symbol}`, { ttl: 120000, key: `news:${symbol}`, poll: 60000 });

  const { activeWishlistId, items, addItem, removeItem } = useWishlistStore();
  const activeSymbols = items[activeWishlistId]?.map((i) => i.symbol) || [];
  const inWatch = activeSymbols.includes(symbol);
  const activeItem = items[activeWishlistId]?.find((i) => i.symbol === symbol);
  const addHolding = usePortfolioStore((s) => s.addHolding);
  const accounts = useAccountStore((s) => s.accounts);

  const quote = live || eq.data?.quote;
  const profile = eq.data?.profile || {};
  const metrics = eq.data?.metrics || {};
  const earnings = eq.data?.earnings || [];

  const addToPortfolio = async () => {
    if (accounts.length === 0) {
      await alertDialog('Create an account first — go to the PORTFOLIO tab and click ACCOUNTS.');
      return;
    }
    const qty = await promptDialog(`Quantity of ${symbol} to add:`, '10');
    if (!qty) return;
    const avgCost = await promptDialog('Purchase price per share:', quote?.price ? String(quote.price) : '100');
    if (!avgCost) return;
    addHolding({ accountId: accounts[0].id, symbol, qty, avgCost, date: new Date().toISOString().slice(0, 10) });
  };

  return (
    <div className="flex h-full gap-0.5 p-0.5">
      {/* LEFT COLUMN */}
      <div className="flex w-72 flex-shrink-0 flex-col">
        <Panel title={`${symbol} EQUITY`} right={<StaleBadge stale={eq.stale} />}>
          <div className="mb-2">
            <div className="text-xs font-bold text-bb-blue">{profile.name || symbol}</div>
            <div className="text-2xs text-bb-dark">{symbol} {profile.exchange ? `· ${profile.exchange}` : ''} EQUITY</div>
          </div>
          <PriceQuote quote={quote} size="lg" />

          <div className="mt-3 space-y-0.5">
            <Stat label="OPEN" value={fmtPrice(quote?.open)} />
            <Stat label="HIGH" value={fmtPrice(quote?.high)} color="text-bb-green" />
            <Stat label="LOW" value={fmtPrice(quote?.low)} color="text-bb-red" />
            <Stat label="PREV CLOSE" value={fmtPrice(quote?.prevClose)} />
            <Stat label="MKT CAP" value={profile.marketCapitalization ? `${fmtLarge(profile.marketCapitalization * 1e6)}` : '—'} />
            <Stat label="52W HIGH" value={fmtPrice(metrics['52WeekHigh'])} />
            <Stat label="52W LOW" value={fmtPrice(metrics['52WeekLow'])} />
          </div>

          <div className="mt-3">
            <div className="bb-label mb-1">KEY STATISTICS</div>
            <div className="grid grid-cols-2 gap-x-3">
              <Stat label="P/E" value={fmtNumber(metrics.peTTM)} />
              <Stat label="EPS" value={fmtNumber(metrics.epsTTM)} />
              <Stat label="DIV YLD" value={metrics.dividendYieldIndicatedAnnual ? `${fmtNumber(metrics.dividendYieldIndicatedAnnual)}%` : '—'} />
              <Stat label="BETA" value={fmtNumber(metrics.beta)} />
            </div>
          </div>

          <div className="mt-3">
            <div className="bb-label mb-1">ANALYST RATINGS</div>
            <AnalystBar recommendations={eq.data?.recommendations} />
          </div>

          {earnings[0] && (
            <div className="mt-3 border border-terminal-divider bg-black p-2">
              <div className="bb-label">NEXT / LAST EARNINGS</div>
              <div className="text-xs text-bb-white">{fmtDate(earnings[0].period)}</div>
              <div className="text-2xs text-bb-gray">EPS act {fmtNumber(earnings[0].actual)} vs est {fmtNumber(earnings[0].estimate)}</div>
            </div>
          )}

          <div className="mt-3 flex gap-1">
            <button
              onClick={() => {
                if (!activeWishlistId) return;
                if (inWatch && activeItem) removeItem(activeWishlistId, activeItem.id);
                else addItem(activeWishlistId, symbol);
              }}
              className={`flex flex-1 items-center justify-center gap-1 border py-1.5 text-2xs font-bold ${
                inWatch ? 'border-bb-green/50 text-bb-green' : 'border-bb-orange/50 text-bb-orange hover:bg-bb-orange/10'
              }`}
            >
              {inWatch ? <Check size={11} /> : <Star size={11} />}
              {inWatch ? 'WATCHING' : 'WATCHLIST'}
            </button>
            <button
              onClick={addToPortfolio}
              className="flex flex-1 items-center justify-center gap-1 border border-bb-blue/50 py-1.5 text-2xs font-bold text-bb-blue hover:bg-bb-blue/10"
            >
              <Plus size={11} /> PORTFOLIO
            </button>
          </div>
        </Panel>
      </div>

      {/* CENTER COLUMN */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex h-1/2 min-h-0 flex-col bb-panel">
          <div className="bb-panel-header">
            <span>{symbol} · PRICE CHART</span>
            <StaleBadge stale={chartStale} />
          </div>
          <ChartToolbar
            range={range} setRange={setRange}
            chartType={chartType} setChartType={setChartType}
            overlays={overlays} setOverlays={setOverlays}
          />
          <div className="relative min-h-0 flex-1">
            {chartLoading && candles.length === 0 ? (
              <div className="p-2"><SkeletonRows rows={8} cols={1} /></div>
            ) : (
              <CandlestickChart candles={candles} chartType={chartType} overlays={overlays} />
            )}
          </div>
        </div>

        <div className="flex h-1/2 min-h-0 flex-col bb-panel">
          <div className="flex border-b border-terminal-divider">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1 text-2xs font-bold ${
                  tab === t ? 'bg-bb-orange/15 text-bb-orange' : 'text-bb-dark hover:text-bb-gray'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-auto thin-scroll p-2">
            {tab === 'OVERVIEW' && (
              <div className="space-y-2 text-2xs">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <Stat label="SECTOR" value={profile.finnhubIndustry || '—'} />
                  <Stat label="COUNTRY" value={profile.country || '—'} />
                  <Stat label="IPO" value={profile.ipo ? fmtDate(profile.ipo) : '—'} />
                  <Stat label="CURRENCY" value={profile.currency || '—'} />
                  <Stat label="SHARES OUT" value={profile.shareOutstanding ? fmtLarge(profile.shareOutstanding * 1e6) : '—'} />
                  <Stat label="EXCHANGE" value={profile.exchange || '—'} />
                </div>
                {profile.weburl && (
                  <a href={profile.weburl} target="_blank" rel="noreferrer" className="block text-bb-blue underline">
                    {profile.weburl}
                  </a>
                )}
                <p className="font-sans leading-relaxed text-bb-gray">
                  {profile.name} is listed on {profile.exchange || 'a major exchange'} in the {profile.finnhubIndustry || 'broad market'} sector.
                  Market capitalization of approximately {profile.marketCapitalization ? fmtLarge(profile.marketCapitalization * 1e6) : 'N/A'}.
                </p>
              </div>
            )}
            {tab === 'TECHNICALS' && <TechnicalIndicators candles={candles} />}
            {tab === 'FINANCIALS' && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <Stat label="REVENUE/SHARE" value={fmtNumber(metrics.revenuePerShareTTM)} />
                <Stat label="GROSS MARGIN" value={metrics.grossMarginTTM ? `${fmtNumber(metrics.grossMarginTTM)}%` : '—'} />
                <Stat label="NET MARGIN" value={metrics.netProfitMarginTTM ? `${fmtNumber(metrics.netProfitMarginTTM)}%` : '—'} />
                <Stat label="ROE" value={metrics.roeTTM ? `${fmtNumber(metrics.roeTTM)}%` : '—'} />
                <Stat label="ROA" value={metrics.roaTTM ? `${fmtNumber(metrics.roaTTM)}%` : '—'} />
                <Stat label="DEBT/EQUITY" value={fmtNumber(metrics['totalDebt/totalEquityQuarterly'])} />
                <Stat label="CURRENT RATIO" value={fmtNumber(metrics.currentRatioQuarterly)} />
                <Stat label="P/B" value={fmtNumber(metrics.pbQuarterly)} />
              </div>
            )}
            {tab === 'NEWS' && (
              <NewsFeed articles={news.data?.articles || []} onSelect={setArticle} compact />
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="flex w-56 flex-shrink-0 flex-col gap-0.5">
        <Panel title="ORDER BOOK" noPad>
          <div className="py-1">
            <OrderBook price={quote?.price} />
          </div>
        </Panel>
        <Panel title="RELATED">
          <div className="space-y-0.5">
            {['SPY', 'QQQ', 'DIA', 'XLK', 'VOO'].map((s) => (
              <button
                key={s}
                onClick={() => useUIStore.getState().navigate('equity', { symbol: s })}
                className="bb-row-hover flex w-full items-center justify-between px-1 py-0.5 text-2xs"
              >
                <span className="font-bold text-bb-blue">{s}</span>
                <span className="text-bb-dark">ETF</span>
              </button>
            ))}
          </div>
        </Panel>
      </div>

      {article && <NewsModal article={article} onClose={() => setArticle(null)} />}
    </div>
  );
}
