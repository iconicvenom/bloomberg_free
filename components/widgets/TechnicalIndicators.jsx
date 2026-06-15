'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, ReferenceLine, Tooltip, BarChart, Bar, Cell,
} from 'recharts';
import { rsi, macd, latestIndicators } from '@/lib/indicators';
import { fmtNumber } from '@/lib/formatters';

const AXIS = { fontSize: 9, fill: '#555555', fontFamily: 'JetBrains Mono' };

function Gauge({ label, value, signal, color }) {
  return (
    <div className="border border-terminal-divider bg-black p-2">
      <div className="bb-label">{label}</div>
      <div className={`text-lg font-bold tabular-nums ${color}`}>{value}</div>
      <div className="text-2xs text-bb-dark">{signal}</div>
    </div>
  );
}

export default function TechnicalIndicators({ candles = [] }) {
  const { rsiData, macdData, summary } = useMemo(() => {
    if (candles.length < 30) return { rsiData: [], macdData: [], summary: null };
    const closes = candles.map((c) => c.close);
    const rsiArr = rsi(closes, 14);
    const { macdLine, signalLine, histogram } = macd(closes);
    const rsiData = candles.map((c, i) => ({ t: c.dateStr || i, rsi: rsiArr[i] })).filter((d) => d.rsi != null).slice(-60);
    const macdData = candles.map((c, i) => ({
      t: c.dateStr || i, macd: macdLine[i], signal: signalLine[i], hist: histogram[i],
    })).slice(-60);
    return { rsiData, macdData, summary: latestIndicators(candles) };
  }, [candles]);

  if (!summary) {
    return <div className="flex h-full items-center justify-center text-2xs text-bb-dark">INSUFFICIENT DATA FOR TECHNICALS</div>;
  }

  const rsiVal = summary.rsi;
  const rsiSignal = rsiVal > 70 ? 'OVERBOUGHT' : rsiVal < 30 ? 'OVERSOLD' : 'NEUTRAL';
  const rsiColor = rsiVal > 70 ? 'text-bb-red' : rsiVal < 30 ? 'text-bb-green' : 'text-bb-amber';
  const macdSignal = summary.macd > summary.macdSignal ? 'BULLISH' : 'BEARISH';
  const macdColor = summary.macd > summary.macdSignal ? 'text-bb-green' : 'text-bb-red';
  const stochSignal = summary.stochK > 80 ? 'OVERBOUGHT' : summary.stochK < 20 ? 'OVERSOLD' : 'NEUTRAL';

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Gauge label="RSI (14)" value={fmtNumber(rsiVal, 1)} signal={rsiSignal} color={rsiColor} />
        <Gauge label="MACD" value={fmtNumber(summary.macd, 2)} signal={macdSignal} color={macdColor} />
        <Gauge label="STOCH %K" value={fmtNumber(summary.stochK, 1)} signal={stochSignal} color="text-bb-white" />
        <Gauge label="ATR (14)" value={fmtNumber(summary.atr, 2)} signal="VOLATILITY" color="text-bb-white" />
      </div>

      <div>
        <div className="bb-label mb-1">RSI (14)</div>
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rsiData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="t" tick={AXIS} hide />
              <YAxis domain={[0, 100]} tick={AXIS} width={28} ticks={[30, 50, 70]} />
              <ReferenceLine y={70} stroke="#FF3131" strokeDasharray="3 3" />
              <ReferenceLine y={30} stroke="#00FF41" strokeDasharray="3 3" />
              <Tooltip contentStyle={{ background: '#000', border: '1px solid #FF660066', fontSize: 10 }} />
              <Line type="monotone" dataKey="rsi" stroke="#FFAA00" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <div className="bb-label mb-1">MACD (12,26,9)</div>
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={macdData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="t" tick={AXIS} hide />
              <YAxis tick={AXIS} width={36} />
              <ReferenceLine y={0} stroke="#333" />
              <Tooltip contentStyle={{ background: '#000', border: '1px solid #FF660066', fontSize: 10 }} />
              <Bar dataKey="hist">
                {macdData.map((d, i) => (
                  <Cell key={i} fill={d.hist >= 0 ? 'rgba(0,255,65,0.6)' : 'rgba(255,49,49,0.6)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
