'use client';

import { useState } from 'react';
import { Search, GitCompare } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useHistoricalData } from '@/hooks/useHistoricalData';
import CandlestickChart from '@/components/widgets/CandlestickChart';
import ChartToolbar from '@/components/widgets/ChartToolbar';
import TechnicalIndicators from '@/components/widgets/TechnicalIndicators';
import { StaleBadge, SkeletonRows } from '@/components/ui/Skeleton';

const CHART_TYPES = [
  { id: 'candlestick', label: 'CANDLE' },
  { id: 'heikin', label: 'HEIKIN' },
  { id: 'line', label: 'LINE' },
  { id: 'area', label: 'AREA' },
  { id: 'bar', label: 'BAR' },
];

export default function ChartScreen() {
  const activeSymbol = useUIStore((s) => s.activeSymbol);
  const setSymbol = useUIStore((s) => s.setSymbol);
  const [symbol, setLocalSymbol] = useState(activeSymbol);
  const [input, setInput] = useState(activeSymbol);
  const [compareInput, setCompareInput] = useState('');
  const [compareSym, setCompareSym] = useState('');
  const [range, setRange] = useState('1Y');
  const [chartType, setChartType] = useState('candlestick');
  const [overlays, setOverlays] = useState({ sma20: true, sma50: true, sma200: false, bollinger: false, volume: true });
  const [showTech, setShowTech] = useState(true);

  const { candles, loading, stale } = useHistoricalData(symbol, range);
  const compare = useHistoricalData(compareSym, range);

  const applySymbol = (e) => {
    e.preventDefault();
    const s = input.trim().toUpperCase();
    if (!s) return;
    setLocalSymbol(s);
    setSymbol(s);
  };

  return (
    <div className="flex h-full flex-col gap-0.5 p-0.5">
      <div className="flex flex-shrink-0 flex-wrap items-center gap-2 bb-panel px-2 py-1.5">
        <form onSubmit={applySymbol} className="flex items-center gap-1 border border-bb-orange/40 px-2 py-1">
          <Search size={12} className="text-bb-orange" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="SYMBOL"
            className="w-28 bg-transparent text-xs uppercase text-bb-white placeholder:text-bb-dark"
          />
          <button type="submit" className="bg-bb-orange px-1.5 text-2xs font-bold text-black">LOAD</button>
        </form>

        <form
          onSubmit={(e) => { e.preventDefault(); setCompareSym(compareInput.trim().toUpperCase()); }}
          className="flex items-center gap-1 border border-bb-blue/40 px-2 py-1"
        >
          <GitCompare size={12} className="text-bb-blue" />
          <input
            value={compareInput}
            onChange={(e) => setCompareInput(e.target.value)}
            placeholder="COMPARE"
            className="w-24 bg-transparent text-xs uppercase text-bb-white placeholder:text-bb-dark"
          />
          <button type="submit" className="bg-bb-blue px-1.5 text-2xs font-bold text-black">ADD</button>
          {compareSym && (
            <button onClick={() => { setCompareSym(''); setCompareInput(''); }} className="text-2xs text-bb-red">×</button>
          )}
        </form>

        <div className="ml-auto flex items-center gap-2 text-2xs">
          <span className="font-bold text-bb-white">{symbol}</span>
          {compareSym && <span className="text-bb-blue">vs {compareSym}</span>}
          <button
            onClick={() => setShowTech((v) => !v)}
            className={`px-2 py-0.5 font-bold ${showTech ? 'bg-bb-orange text-black' : 'text-bb-gray hover:bg-white/10'}`}
          >
            INDICATORS
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-0.5">
        <div className="flex min-w-0 flex-1 flex-col bb-panel">
          <div className="bb-panel-header">
            <span>{symbol} · ADVANCED CHART</span>
            <StaleBadge stale={stale} />
          </div>
          <ChartToolbar
            range={range} setRange={setRange}
            chartType={chartType} setChartType={setChartType}
            overlays={overlays} setOverlays={setOverlays}
            chartTypes={CHART_TYPES}
          />
          <div className="relative min-h-0 flex-1">
            {loading && candles.length === 0 ? (
              <div className="p-2"><SkeletonRows rows={10} cols={1} /></div>
            ) : (
              <CandlestickChart
                candles={candles}
                chartType={chartType}
                overlays={overlays}
                compare={compareSym && compare.candles.length ? { data: compare.candles, color: '#4FC3F7' } : null}
              />
            )}
          </div>
        </div>

        {showTech && (
          <div className="flex w-80 flex-shrink-0 flex-col bb-panel">
            <div className="bb-panel-header">TECHNICAL INDICATORS</div>
            <div className="min-h-0 flex-1 overflow-auto thin-scroll p-2">
              <TechnicalIndicators candles={candles} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
