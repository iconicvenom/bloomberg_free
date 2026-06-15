'use client';

import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid, ReferenceLine,
} from 'recharts';

const AXIS = { fontSize: 9, fill: '#555555', fontFamily: 'JetBrains Mono' };

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="border border-bb-orange/40 bg-black px-2 py-1 text-2xs">
      <div className="text-bb-dark">{label}</div>
      <div className="font-bold text-bb-white">{payload[0].value?.toLocaleString()}</div>
    </div>
  );
}

// data: [{ date, value }]
export default function EconChart({ data = [], color = '#FF6600', type = 'area', zeroLine = false }) {
  if (!data.length) {
    return <div className="flex h-full items-center justify-center text-2xs text-bb-dark">NO DATA</div>;
  }
  const Comp = type === 'line' ? LineChart : AreaChart;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <Comp data={data} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#161616" vertical={false} />
        <XAxis dataKey="date" tick={AXIS} tickLine={false} axisLine={{ stroke: '#222' }} minTickGap={40} />
        <YAxis tick={AXIS} tickLine={false} axisLine={{ stroke: '#222' }} width={44} domain={['auto', 'auto']} />
        <Tooltip content={<ChartTooltip />} />
        {zeroLine && <ReferenceLine y={0} stroke="#FF3131" strokeDasharray="3 3" />}
        {type === 'line' ? (
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} dot={false} />
        ) : (
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} fill={`url(#grad-${color})`} dot={false} />
        )}
      </Comp>
    </ResponsiveContainer>
  );
}
