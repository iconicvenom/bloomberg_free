'use client';

import { useMemo } from 'react';
import { Trash2, Download, Plus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { usePortfolioStore } from '@/store/portfolioStore';
import { useUIStore } from '@/store/uiStore';
import { useLivePrice } from '@/hooks/useLivePrice';
import Panel from '@/components/ui/Panel';
import { fmtPrice, fmtLarge, fmtPct, colorForDelta } from '@/lib/formatters';

const PIE_COLORS = ['#FF6600', '#4FC3F7', '#00FF41', '#FFAA00', '#FF3131', '#B0B0B0', '#9C27B0', '#00BCD4'];

export default function PortfolioScreen() {
  const { holdings, removeHolding, addHolding } = usePortfolioStore();
  const navigate = useUIStore((s) => s.navigate);
  const symbols = useMemo(() => [...new Set(holdings.map((h) => h.symbol))], [holdings]);
  const live = useLivePrice(symbols);

  const rows = holdings.map((h) => {
    const price = live[h.symbol]?.price ?? h.cost;
    const mktValue = price * h.quantity;
    const invested = h.cost * h.quantity;
    const pnl = mktValue - invested;
    const pnlPct = invested ? (pnl / invested) * 100 : 0;
    return { ...h, price, mktValue, invested, pnl, pnlPct };
  });

  const totals = rows.reduce(
    (acc, r) => ({
      invested: acc.invested + r.invested,
      value: acc.value + r.mktValue,
      pnl: acc.pnl + r.pnl,
    }),
    { invested: 0, value: 0, pnl: 0 },
  );
  const totalPnlPct = totals.invested ? (totals.pnl / totals.invested) * 100 : 0;

  const pieData = rows.map((r) => ({ name: `${r.symbol}`, value: r.mktValue }));

  const addManual = () => {
    const symbol = window.prompt('Symbol:');
    if (!symbol) return;
    const quantity = window.prompt('Quantity:', '10');
    if (!quantity) return;
    const cost = window.prompt('Purchase price:', '100');
    if (!cost) return;
    addHolding({ symbol, quantity, cost });
  };

  const exportCsv = () => {
    const header = 'Symbol,Quantity,AvgCost,CurrentPrice,MktValue,PnL,PnLPct,Date\n';
    const body = rows.map((r) =>
      `${r.symbol},${r.quantity},${r.cost},${r.price.toFixed(2)},${r.mktValue.toFixed(2)},${r.pnl.toFixed(2)},${r.pnlPct.toFixed(2)},${r.date}`,
    ).join('\n');
    const blob = new Blob([header + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full gap-0.5 p-0.5">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Panel title="PORTFOLIO · PORT" right={(
          <div className="flex gap-2">
            <button onClick={addManual} className="flex items-center gap-1 text-2xs font-bold text-bb-orange hover:text-bb-amber">
              <Plus size={11} /> ADD
            </button>
            <button onClick={exportCsv} className="flex items-center gap-1 text-2xs font-bold text-bb-blue hover:text-bb-white">
              <Download size={11} /> CSV
            </button>
          </div>
        )} noPad className="min-h-0 flex-1">
          <div className="overflow-auto thin-scroll">
            <table className="bb-table">
              <thead>
                <tr>
                  <th>SYMBOL</th><th>QTY</th><th>AVG COST</th><th>CURRENT</th>
                  <th>MKT VALUE</th><th>P&L</th><th>P&L%</th><th>DATE</th><th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="bb-row-hover cursor-pointer" onClick={() => navigate('equity', { symbol: r.symbol })}>
                    <td className="font-bold text-bb-blue">{r.symbol}</td>
                    <td className="text-right tabular-nums text-bb-gray">{r.quantity}</td>
                    <td className="text-right tabular-nums text-bb-gray">{fmtPrice(r.cost)}</td>
                    <td className="text-right tabular-nums text-bb-white">{fmtPrice(r.price)}</td>
                    <td className="text-right tabular-nums text-bb-white">{fmtPrice(r.mktValue)}</td>
                    <td className={`text-right tabular-nums ${colorForDelta(r.pnl)}`}>{fmtPrice(r.pnl)}</td>
                    <td className={`text-right tabular-nums ${colorForDelta(r.pnlPct)}`}>{fmtPct(r.pnlPct)}</td>
                    <td className="text-right text-2xs text-bb-dark">{r.date}</td>
                    <td className="w-4" onClick={(e) => { e.stopPropagation(); removeHolding(r.id); }}>
                      <Trash2 size={12} className="text-bb-dark hover:text-bb-red" />
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={9} className="py-6 text-center text-bb-dark">NO HOLDINGS — ADD ONE OR USE THE EQUITY SCREEN</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="grid flex-shrink-0 grid-cols-4 gap-0.5">
          {[
            { label: 'TOTAL INVESTED', value: `$${fmtLarge(totals.invested)}`, color: 'text-bb-white' },
            { label: 'CURRENT VALUE', value: `$${fmtLarge(totals.value)}`, color: 'text-bb-white' },
            { label: 'TOTAL P&L', value: `$${fmtPrice(totals.pnl)}`, color: colorForDelta(totals.pnl) },
            { label: 'TOTAL P&L%', value: fmtPct(totalPnlPct), color: colorForDelta(totals.pnl) },
          ].map((s) => (
            <div key={s.label} className="bb-panel p-2">
              <div className="bb-label">{s.label}</div>
              <div className={`text-lg font-bold tabular-nums ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex w-72 flex-shrink-0 flex-col">
        <Panel title="ALLOCATION">
          {pieData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="#000" />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#000', border: '1px solid #FF660066', fontSize: 10 }} formatter={(v) => `$${fmtLarge(v)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-56 items-center justify-center text-2xs text-bb-dark">NO ALLOCATION DATA</div>
          )}
          <div className="mt-2 space-y-0.5">
            {pieData.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between text-2xs">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-bb-gray">{p.name}</span>
                </span>
                <span className="tabular-nums text-bb-dark">{totals.value ? fmtPct((p.value / totals.value) * 100, false) : '—'}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
