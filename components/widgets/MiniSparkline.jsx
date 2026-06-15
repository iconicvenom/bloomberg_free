'use client';

// Tiny inline SVG sparkline for table cells.
export default function MiniSparkline({ data = [], width = 80, height = 24, color }) {
  if (!data || data.length < 2) {
    return <div style={{ width, height }} className="bg-terminal-divider/30" />;
  }
  const values = data.map((d) => (typeof d === 'number' ? d : d.value ?? d.close ?? 0));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);
  const points = values
    .map((v, i) => `${(i * step).toFixed(1)},${(height - ((v - min) / range) * height).toFixed(1)}`)
    .join(' ');
  const up = values[values.length - 1] >= values[0];
  const stroke = color || (up ? '#00FF41' : '#FF3131');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="1" />
    </svg>
  );
}
