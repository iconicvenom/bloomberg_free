'use client';

import { useEffect, useRef } from 'react';
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';
import { sma, bollinger, heikinAshi } from '@/lib/indicators';

const COLORS = {
  up: '#00FF41',
  down: '#FF3131',
  text: '#B0B0B0',
  grid: '#161616',
  border: '#222222',
};

// chartType: candlestick | line | area | bar | heikin
// overlays: { sma20, sma50, sma200, bollinger, volume }
// compare: { data, color } optional second line
export default function CandlestickChart({
  candles = [],
  chartType = 'candlestick',
  overlays = {},
  compare = null,
  height,
}) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#000000' },
        textColor: COLORS.text,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10,
      },
      grid: {
        vertLines: { color: COLORS.grid },
        horzLines: { color: COLORS.grid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: '#FF6600', width: 1, labelBackgroundColor: '#FF6600' },
        horzLine: { color: '#FF6600', width: 1, labelBackgroundColor: '#FF6600' },
      },
      rightPriceScale: { borderColor: COLORS.border },
      timeScale: { borderColor: COLORS.border, timeVisible: true, secondsVisible: false },
      autoSize: true,
    });
    chartRef.current = chart;
    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || candles.length === 0) return;

    // Clear previous series
    // (recreate by removing all — lightweight-charts has no clear-all, so track)
    const series = [];

    const main = candles;
    let priceSeries;

    if (chartType === 'line') {
      priceSeries = chart.addLineSeries({ color: '#FF6600', lineWidth: 2, priceLineVisible: false });
      priceSeries.setData(main.map((c) => ({ time: c.time, value: c.close })));
    } else if (chartType === 'area') {
      priceSeries = chart.addAreaSeries({
        lineColor: '#FF6600',
        topColor: 'rgba(255,102,0,0.4)',
        bottomColor: 'rgba(255,102,0,0.0)',
        lineWidth: 2,
      });
      priceSeries.setData(main.map((c) => ({ time: c.time, value: c.close })));
    } else if (chartType === 'bar') {
      priceSeries = chart.addBarSeries({ upColor: COLORS.up, downColor: COLORS.down });
      priceSeries.setData(main.map((c) => ({ time: c.time, open: c.open, high: c.high, low: c.low, close: c.close })));
    } else {
      const data = chartType === 'heikin' ? heikinAshi(main) : main;
      priceSeries = chart.addCandlestickSeries({
        upColor: COLORS.up,
        downColor: COLORS.down,
        borderUpColor: COLORS.up,
        borderDownColor: COLORS.down,
        wickUpColor: COLORS.up,
        wickDownColor: COLORS.down,
      });
      priceSeries.setData(data.map((c) => ({ time: c.time, open: c.open, high: c.high, low: c.low, close: c.close })));
    }
    series.push(priceSeries);

    const closes = main.map((c) => c.close);

    const addSMA = (period, color) => {
      const vals = sma(closes, period);
      const s = chart.addLineSeries({ color, lineWidth: 1, priceLineVisible: false, crosshairMarkerVisible: false });
      s.setData(main.map((c, i) => (vals[i] != null ? { time: c.time, value: vals[i] } : null)).filter(Boolean));
      series.push(s);
    };
    if (overlays.sma20) addSMA(20, '#4FC3F7');
    if (overlays.sma50) addSMA(50, '#FFAA00');
    if (overlays.sma200) addSMA(200, '#FF3131');

    if (overlays.bollinger) {
      const { upper, lower, mid } = bollinger(closes, 20, 2);
      [['upper', upper, '#555555'], ['mid', mid, '#888888'], ['lower', lower, '#555555']].forEach(([, arr, color]) => {
        const s = chart.addLineSeries({ color, lineWidth: 1, lineStyle: 2, priceLineVisible: false, crosshairMarkerVisible: false });
        s.setData(main.map((c, i) => (arr[i] != null ? { time: c.time, value: arr[i] } : null)).filter(Boolean));
        series.push(s);
      });
    }

    if (overlays.volume) {
      const vol = chart.addHistogramSeries({
        priceFormat: { type: 'volume' },
        priceScaleId: 'vol',
      });
      vol.priceScale().applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
      vol.setData(main.map((c) => ({
        time: c.time,
        value: c.volume,
        color: c.close >= c.open ? 'rgba(0,255,65,0.4)' : 'rgba(255,49,49,0.4)',
      })));
      series.push(vol);
    }

    if (compare && compare.data && compare.data.length) {
      const s = chart.addLineSeries({ color: compare.color || '#4FC3F7', lineWidth: 2, priceScaleId: 'left', priceLineVisible: false });
      chart.priceScale('left').applyOptions({ visible: true, borderColor: COLORS.border });
      s.setData(compare.data.map((c) => ({ time: c.time, value: c.close ?? c.value })));
      series.push(s);
    }

    chart.timeScale().fitContent();

    return () => {
      series.forEach((s) => {
        try { chart.removeSeries(s); } catch { /* already removed */ }
      });
    };
  }, [candles, chartType, overlays.sma20, overlays.sma50, overlays.sma200, overlays.bollinger, overlays.volume, compare]);

  return <div ref={containerRef} className="h-full w-full" style={height ? { height } : undefined} />;
}
