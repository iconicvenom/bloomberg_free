// Number, price, percentage, date, and large-number formatters.

const priceFmt = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function fmtPrice(value, decimals = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function fmtNumber(value, decimals = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function fmtPct(value, withSign = true) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  const n = Number(value);
  const sign = withSign && n > 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}%`;
}

export function fmtDelta(value, decimals = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  const n = Number(value);
  const sign = n > 0 ? '+' : '';
  return `${sign}${priceFmt.format(n) === 'NaN' ? n.toFixed(decimals) : n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

export function fmtLarge(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  const n = Number(value);
  const abs = Math.abs(n);
  if (abs >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return n.toLocaleString('en-US');
}

export function fmtVolume(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return fmtLarge(value);
}

export function colorForDelta(value) {
  const n = Number(value);
  if (Number.isNaN(n) || n === 0) return 'text-bb-gray';
  return n > 0 ? 'text-bb-green' : 'text-bb-red';
}

export function fmtTime(date = new Date(), tz) {
  const opts = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
  if (tz) opts.timeZone = tz;
  return new Intl.DateTimeFormat('en-US', opts).format(date);
}

export function fmtDate(input) {
  if (!input) return '—';
  const d = typeof input === 'number' ? new Date(input * (input < 1e12 ? 1000 : 1)) : new Date(input);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: '2-digit' }).format(d);
}

export function fmtDateTime(input) {
  if (!input) return '—';
  const d = typeof input === 'number' ? new Date(input * (input < 1e12 ? 1000 : 1)) : new Date(input);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(d);
}

export function timeAgo(input) {
  if (!input) return '';
  const d = typeof input === 'number' ? new Date(input * (input < 1e12 ? 1000 : 1)) : new Date(input);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function isBreaking(input) {
  if (!input) return false;
  const d = typeof input === 'number' ? new Date(input * (input < 1e12 ? 1000 : 1)) : new Date(input);
  return Date.now() - d.getTime() < 5 * 60 * 1000;
}
