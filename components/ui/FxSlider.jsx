'use client';

// Local adaptation of the Framer "fx-Slider" — a dual-handle range slider
// styled for the Bloomberg palette. Used by the Screener filters.
export default function FxSlider({ label, min, max, value, onChange, step = 1, suffix = '' }) {
  const [lo, hi] = value;
  const pct = (v) => ((v - min) / (max - min)) * 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="bb-label">{label}</span>
        <span className="text-2xs tabular-nums text-bb-amber">
          {lo}{suffix} — {hi}{suffix}
        </span>
      </div>
      <div className="relative h-6">
        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-terminal-divider" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-bb-orange"
          style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={lo}
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi), hi])}
          className="pointer-events-none absolute top-0 h-6 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-bb-orange [&::-webkit-slider-thumb]:shadow-bb-glow"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={hi}
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo)])}
          className="pointer-events-none absolute top-0 h-6 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-bb-orange [&::-webkit-slider-thumb]:shadow-bb-glow"
        />
      </div>
    </div>
  );
}
