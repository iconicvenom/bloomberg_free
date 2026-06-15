'use client';

import { fmtPrice } from '@/lib/formatters';

// Cross-rate grid. rates = { USD: 1, EUR: 0.92, ... } expressed per 1 USD.
export default function ForexMatrix({ currencies = [], rates = {}, onSelect }) {
  // cross(base, quote) = units of quote per 1 base = rate[quote] / rate[base]
  const cross = (base, quote) => {
    const rb = rates[base];
    const rq = rates[quote];
    if (!rb || !rq) return null;
    return rq / rb;
  };

  return (
    <table className="bb-table">
      <thead>
        <tr>
          <th />
          {currencies.map((c) => (
            <th key={c} className="text-right">{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {currencies.map((base) => (
          <tr key={base}>
            <td className="font-bold text-bb-orange">{base}</td>
            {currencies.map((quote) => {
              if (base === quote) {
                return <td key={quote} className="text-right text-bb-dark">—</td>;
              }
              const rate = cross(base, quote);
              return (
                <td
                  key={quote}
                  onClick={() => onSelect && onSelect(`${base}${quote}`)}
                  className="cursor-pointer text-right tabular-nums text-bb-white hover:bg-bb-orange/10"
                >
                  {rate != null ? fmtPrice(rate, rate > 50 ? 2 : 4) : '—'}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
