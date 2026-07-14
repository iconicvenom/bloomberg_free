'use client';

import { useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useAccountStore } from '@/store/accountStore';
import { usePortfolioStore } from '@/store/portfolioStore';
import { useLivePrice } from '@/hooks/useLivePrice';
import Panel from '@/components/ui/Panel';
import { promptDialog, confirmDialog } from '@/lib/dialog';
import { fmtLarge, currencySymbolFor } from '@/lib/formatters';

export default function AccountsScreen() {
  const { accounts, fetchAll, create, rename, remove } = useAccountStore();
  const { holdings, fetchHoldings } = usePortfolioStore();

  useEffect(() => {
    fetchAll();
    fetchHoldings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const symbols = useMemo(() => [...new Set(holdings.map((h) => h.symbol))], [holdings]);
  const live = useLivePrice(symbols);

  // Returns { '₹': total, '$': total } for an account's holdings, using
  // only holdings with a real live price — a holding whose price hasn't
  // loaded yet (or genuinely failed to resolve) contributes nothing rather
  // than falling back to avgCost, which would silently fake its value as
  // unchanged. Grouped by currency since one account can span both NSE/BSE
  // and US holdings.
  const valueForAccount = (accountId) => holdings
    .filter((h) => h.accountId === accountId)
    .reduce((acc, h) => {
      const price = live[h.symbol]?.price;
      if (price == null) return acc;
      const cur = currencySymbolFor(h.symbol);
      acc[cur] = (acc[cur] || 0) + price * h.qty;
      return acc;
    }, {});

  const addAccount = async () => {
    const label = await promptDialog('Account name:', `Account ${accounts.length + 1}`);
    if (!label) return;
    create(label);
  };

  const renameAccount = async (acc) => {
    const label = await promptDialog('New name:', acc.label);
    if (!label || label === acc.label) return;
    rename(acc.id, label);
  };

  const removeAccount = async (acc) => {
    const count = holdings.filter((h) => h.accountId === acc.id).length;
    const msg = count > 0
      ? `Delete "${acc.label}" and its ${count} holding(s)? This cannot be undone.`
      : `Delete "${acc.label}"?`;
    if (!(await confirmDialog(msg))) return;
    remove(acc.id).then(() => fetchHoldings());
  };

  return (
    <div className="flex h-full flex-col gap-0.5 p-0.5">
      <Panel
        title="ACCOUNTS · ACCT"
        right={(
          <button onClick={addAccount} className="flex items-center gap-1 text-2xs font-bold text-bb-orange hover:text-bb-amber">
            <Plus size={11} /> NEW ACCOUNT
          </button>
        )}
        noPad
        className="min-h-0 flex-1"
      >
        <div className="overflow-auto thin-scroll">
          <table className="bb-table">
            <thead>
              <tr>
                <th>LABEL</th><th>HOLDINGS</th><th>VALUE</th><th /><th />
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc) => {
                const count = holdings.filter((h) => h.accountId === acc.id).length;
                const valueByCurrency = valueForAccount(acc.id);
                const currencies = Object.keys(valueByCurrency);
                return (
                  <tr key={acc.id} className="bb-row-hover">
                    <td className="font-bold text-bb-blue">{acc.label}</td>
                    <td className="text-right tabular-nums text-bb-gray">{count}</td>
                    <td className="text-right tabular-nums text-bb-white">
                      {currencies.length === 0
                        ? '—'
                        : currencies.map((cur) => `${cur}${fmtLarge(valueByCurrency[cur])}`).join(' + ')}
                    </td>
                    <td className="w-4" onClick={() => renameAccount(acc)}>
                      <Pencil size={12} className="text-bb-dark hover:text-bb-amber" />
                    </td>
                    <td className="w-4" onClick={() => removeAccount(acc)}>
                      <Trash2 size={12} className="text-bb-dark hover:text-bb-red" />
                    </td>
                  </tr>
                );
              })}
              {accounts.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-bb-dark">NO ACCOUNTS — CREATE ONE TO START TRACKING HOLDINGS</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
