'use client';

const TIMEFRAMES = ['1D', '5D', '1M', '3M', '6M', '1Y', '5Y'];
const CHART_TYPES = [
  { id: 'candlestick', label: 'CANDLE' },
  { id: 'line', label: 'LINE' },
  { id: 'area', label: 'AREA' },
  { id: 'bar', label: 'BAR' },
];

export default function ChartToolbar({
  range, setRange, chartType, setChartType, overlays, setOverlays,
  timeframes = TIMEFRAMES, chartTypes = CHART_TYPES,
}) {
  const toggle = (key) => setOverlays && setOverlays({ ...overlays, [key]: !overlays[key] });

  const Btn = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-1.5 py-0.5 text-2xs font-bold ${
        active ? 'bg-bb-orange text-black' : 'text-bb-gray hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-terminal-divider bg-terminal-header px-2 py-1">
      <div className="flex items-center gap-0.5">
        {timeframes.map((tf) => (
          <Btn key={tf} active={range === tf} onClick={() => setRange(tf)}>{tf}</Btn>
        ))}
      </div>
      <div className="flex items-center gap-0.5 border-l border-terminal-divider pl-2">
        {chartTypes.map((ct) => (
          <Btn key={ct.id} active={chartType === ct.id} onClick={() => setChartType(ct.id)}>{ct.label}</Btn>
        ))}
      </div>
      {setOverlays && (
        <div className="flex items-center gap-0.5 border-l border-terminal-divider pl-2">
          <Btn active={overlays.sma20} onClick={() => toggle('sma20')}>SMA20</Btn>
          <Btn active={overlays.sma50} onClick={() => toggle('sma50')}>SMA50</Btn>
          <Btn active={overlays.sma200} onClick={() => toggle('sma200')}>SMA200</Btn>
          <Btn active={overlays.bollinger} onClick={() => toggle('bollinger')}>BB</Btn>
          <Btn active={overlays.volume} onClick={() => toggle('volume')}>VOL</Btn>
        </div>
      )}
    </div>
  );
}
