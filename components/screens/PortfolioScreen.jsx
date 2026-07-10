'use client';

import { useEffect, useMemo, useState } from 'react';
import { Trash2, Download, Plus, Upload, Bell, Settings } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { usePortfolioStore } from '@/store/portfolioStore';
import { useAccountStore } from '@/store/accountStore';
import { useUIStore } from '@/store/uiStore';
import { useLivePrice } from '@/hooks/useLivePrice';
import Panel from '@/components/ui/Panel';
import ImportModal from '@/components/portfolio/ImportModal';
import AlertCreateForm from '@/components/alerts/AlertCreateForm';
import { promptDialog, alertDialog } from '@/lib/dialog';
import { fmtPrice, fmtLarge, fmtPct, colorForDelta } from '@/lib/formatters';

const PIE_COLORS = ['#FF6600', '#4FC3F7', '#00FF41', '#FFAA00', '#FF3131', '#B0B0B0', '#9C27B0', '#00BCD4'];

export default function PortfolioScreen() {
  const { holdings, selectedAccountId, fetchHoldings, removeHolding, addHolding, setSelectedAccount } = usePortfolioStore();
  const { accounts, fetchAll: fetchAccounts } = useAccountStore();
  const navigate = useUIStore((s) => s.navigate);
  const [importOpen, setImportOpen] = useState(false);
  const [alertSymbol, setAlertSymbol] = useState(null);

  useEffect(() => {
    fetchHoldings();
    fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const combined = selectedAccountId === 'all';
  const scopedHoldings = combined ? holdings : holdings.filter((h) => h.accountId === selectedAccountId);

  const symbols = useMemo(() => [...new Set(scopedHoldings.map((h) => h.symbol))], [scopedHoldings]);
  const live = useLivePrice(symbols);

  const accountLabel = (accountId) => accounts.find((a) => a.id === accountId)?.label || '—';

  const rows = scopedHoldings.map((h) => {
    const price = live[h.symbol]?.price ?? h.avgCost;
    const mktValue = price * h.qty;
    const invested = h.avgCost * h.qty;
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

  const addManual = async () => {
    if (accounts.length === 0) {
      await alertDialog('Create an account first — click ACCOUNTS above.');
      return;
    }
    const targetAccountId = combined ? accounts[0].id : selectedAccountId;
    const symbol = await promptDialog('Symbol:');
    if (!symbol) return;
    const qty = await promptDialog('Quantity:', '10');
    if (!qty) return;
    const avgCost = await promptDialog('Purchase price:', '100');
    if (!avgCost) return;
    addHolding({ accountId: targetAccountId, symbol, qty, avgCost });
  };

  const exportCsv = () => {
    const header = 'Account,Symbol,Quantity,AvgCost,CurrentPrice,MktValue,PnL,PnLPct,Date\n';
    const body = rows.map((r) =>
      `${accountLabel(r.accountId)},${r.symbol},${r.qty},${r.avgCost},${r.price.toFixed(2)},${r.mktValue.toFixed(2)},${r.pnl.toFixed(2)},${r.pnlPct.toFixed(2)},${r.date}`,
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
          <div className="flex items-center gap-2">
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="bg-terminal-header text-2xs font-bold text-bb-white"
            >
              <option value="all">COMBINED</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.label.toUpperCase()}</option>
              ))}
            </select>
            <button onClick={addManual} className="flex items-center gap-1 text-2xs font-bold text-bb-orange hover:text-bb-amber">
              <Plus size={11} /> ADD
            </button>
            <button onClick={() => setImportOpen(true)} className="flex items-center gap-1 text-2xs font-bold text-bb-amber hover:text-bb-white">
              <Upload size={11} /> IMPORT
            </button>
            <button onClick={exportCsv} className="flex items-center gap-1 text-2xs font-bold text-bb-blue hover:text-bb-white">
              <Download size={11} /> CSV
            </button>
            <button onClick={() => navigate('accounts')} className="flex items-center gap-1 text-2xs font-bold text-bb-gray hover:text-bb-white">
              <Settings size={11} /> ACCOUNTS
            </button>
          </div>
        )} noPad className="min-h-0 flex-1">
          <div className="overflow-auto thin-scroll">
            <table className="bb-table">
              <thead>
                <tr>
                  {combined && <th>ACCOUNT</th>}
                  <th>SYMBOL</th><th>QTY</th><th>AVG COST</th><th>CURRENT</th>
                  <th>MKT VALUE</th><th>P&L</th><th>P&L%</th><th>DATE</th><th /><th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="bb-row-hover cursor-pointer" onClick={() => navigate('equity', { symbol: r.symbol })}>
                    {combined && <td className="text-2xs text-bb-gray">{accountLabel(r.accountId)}</td>}
                    <td className="font-bold text-bb-blue">{r.symbol}</td>
                    <td className="text-right tabular-nums text-bb-gray">{r.qty}</td>
                    <td className="text-right tabular-nums text-bb-gray">{fmtPrice(r.avgCost)}</td>
                    <td className="text-right tabular-nums text-bb-white">{fmtPrice(r.price)}</td>
                    <td className="text-right tabular-nums text-bb-white">{fmtPrice(r.mktValue)}</td>
                    <td className={`text-right tabular-nums ${colorForDelta(r.pnl)}`}>{fmtPrice(r.pnl)}</td>
                    <td className={`text-right tabular-nums ${colorForDelta(r.pnlPct)}`}>{fmtPct(r.pnlPct)}</td>
                    <td className="text-right text-2xs text-bb-dark">{r.date}</td>
                    <td className="w-4" onClick={(e) => { e.stopPropagation(); setAlertSymbol(r.symbol); }}>
                      <Bell size={12} className="text-bb-dark hover:text-bb-amber" />
                    </td>
                    <td className="w-4" onClick={(e) => { e.stopPropagation(); removeHolding(r.id); }}>
                      <Trash2 size={12} className="text-bb-dark hover:text-bb-red" />
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={combined ? 11 : 10} className="py-6 text-center text-bb-dark">NO HOLDINGS — ADD ONE, IMPORT A FILE, OR USE THE EQUITY SCREEN</td></tr>
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

      {importOpen && <ImportModal onClose={() => setImportOpen(false)} />}
      {alertSymbol && <AlertCreateForm symbol={alertSymbol} onClose={() => setAlertSymbol(null)} />}
    </div>
  );
}
