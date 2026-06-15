// Client-side technical indicator computations from OHLCV arrays.
// Each input candle: { time, open, high, low, close, volume }

export function sma(values, period) {
  const out = [];
  let sum = 0;
  for (let i = 0; i < values.length; i += 1) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    out.push(i >= period - 1 ? sum / period : null);
  }
  return out;
}

export function ema(values, period) {
  const out = [];
  const k = 2 / (period + 1);
  let prev;
  for (let i = 0; i < values.length; i += 1) {
    if (i === 0) {
      prev = values[i];
      out.push(values[i]);
    } else {
      prev = values[i] * k + prev * (1 - k);
      out.push(prev);
    }
  }
  return out;
}

export function rsi(values, period = 14) {
  const out = new Array(values.length).fill(null);
  if (values.length <= period) return out;
  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= period; i += 1) {
    const diff = values[i] - values[i - 1];
    if (diff >= 0) gain += diff;
    else loss -= diff;
  }
  let avgGain = gain / period;
  let avgLoss = loss / period;
  out[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  for (let i = period + 1; i < values.length; i += 1) {
    const diff = values[i] - values[i - 1];
    const g = diff > 0 ? diff : 0;
    const l = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + g) / period;
    avgLoss = (avgLoss * (period - 1) + l) / period;
    out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return out;
}

export function macd(values, fast = 12, slow = 26, signal = 9) {
  const emaFast = ema(values, fast);
  const emaSlow = ema(values, slow);
  const macdLine = values.map((_, i) => emaFast[i] - emaSlow[i]);
  const signalLine = ema(macdLine, signal);
  const histogram = macdLine.map((v, i) => v - signalLine[i]);
  return { macdLine, signalLine, histogram };
}

export function bollinger(values, period = 20, mult = 2) {
  const mid = sma(values, period);
  const upper = [];
  const lower = [];
  for (let i = 0; i < values.length; i += 1) {
    if (i < period - 1) {
      upper.push(null);
      lower.push(null);
      continue;
    }
    const slice = values.slice(i - period + 1, i + 1);
    const mean = mid[i];
    const variance = slice.reduce((acc, v) => acc + (v - mean) ** 2, 0) / period;
    const sd = Math.sqrt(variance);
    upper.push(mean + mult * sd);
    lower.push(mean - mult * sd);
  }
  return { mid, upper, lower };
}

export function stochastic(candles, period = 14, smooth = 3) {
  const kRaw = candles.map((c, i) => {
    if (i < period - 1) return null;
    const slice = candles.slice(i - period + 1, i + 1);
    const high = Math.max(...slice.map((s) => s.high));
    const low = Math.min(...slice.map((s) => s.low));
    if (high === low) return 50;
    return ((c.close - low) / (high - low)) * 100;
  });
  const valid = kRaw.map((v) => (v === null ? 0 : v));
  const k = sma(valid, smooth).map((v, i) => (kRaw[i] === null ? null : v));
  const d = sma(k.map((v) => v ?? 0), smooth).map((v, i) => (k[i] === null ? null : v));
  return { k, d };
}

export function atr(candles, period = 14) {
  const tr = candles.map((c, i) => {
    if (i === 0) return c.high - c.low;
    const prevClose = candles[i - 1].close;
    return Math.max(c.high - c.low, Math.abs(c.high - prevClose), Math.abs(c.low - prevClose));
  });
  return ema(tr, period);
}

export function heikinAshi(candles) {
  const out = [];
  for (let i = 0; i < candles.length; i += 1) {
    const c = candles[i];
    const close = (c.open + c.high + c.low + c.close) / 4;
    const open = i === 0 ? (c.open + c.close) / 2 : (out[i - 1].open + out[i - 1].close) / 2;
    const high = Math.max(c.high, open, close);
    const low = Math.min(c.low, open, close);
    out.push({ time: c.time, open, high, low, close });
  }
  return out;
}

// Latest single values, used for the technicals summary grid.
export function latestIndicators(candles) {
  const closes = candles.map((c) => c.close);
  const rsiArr = rsi(closes, 14);
  const { macdLine, signalLine, histogram } = macd(closes);
  const { k, d } = stochastic(candles);
  const atrArr = atr(candles);
  const last = closes.length - 1;
  return {
    rsi: rsiArr[last],
    macd: macdLine[last],
    macdSignal: signalLine[last],
    macdHist: histogram[last],
    stochK: k[last],
    stochD: d[last],
    atr: atrArr[last],
    sma20: sma(closes, 20)[last],
    sma50: sma(closes, 50)[last],
    sma200: sma(closes, 200)[last],
    ema20: ema(closes, 20)[last],
  };
}
