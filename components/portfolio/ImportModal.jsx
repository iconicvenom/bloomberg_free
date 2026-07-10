'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useAccountStore } from '@/store/accountStore';
import { usePortfolioStore } from '@/store/portfolioStore';
import { parseFile } from '@/lib/importParsers';
import { autoMapColumns, applyMapping, REQUIRED_FIELDS } from '@/lib/columnMapping';
import ColumnMappingTable from './ColumnMappingTable';

// Multi-step import flow: pick account -> pick file -> auto-map (or manual
// map if confidence is low) -> preview -> confirm.
export default function ImportModal({ onClose }) {
  const { accounts } = useAccountStore();
  const { importRows } = usePortfolioStore();

  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [parsed, setParsed] = useState(null); // { headers, rows }
  const [mapping, setMapping] = useState(null);
  const [confident, setConfident] = useState(false);
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      const result = await parseFile(file);
      if (result.rows.length === 0) {
        setError('No rows found in file.');
        return;
      }
      const { mapping: auto, confident: isConfident } = autoMapColumns(result.headers);
      setParsed(result);
      setMapping(auto);
      setConfident(isConfident);
    } catch (err) {
      setError(err.message || 'Failed to parse file.');
    }
  };

  const mappingComplete = mapping && REQUIRED_FIELDS.every((f) => mapping[f]);
  const previewRows = parsed && mapping ? applyMapping(parsed.rows, mapping).slice(0, 10) : [];
  const totalRows = parsed && mapping ? applyMapping(parsed.rows, mapping).length : 0;

  const confirmImport = async () => {
    if (!accountId || !parsed || !mappingComplete) return;
    setImporting(true);
    const rows = applyMapping(parsed.rows, mapping).map((r) => ({
      symbol: r.symbol,
      qty: Number(r.qty),
      avgCost: Number(r.avgCost),
      date: r.date || undefined,
    }));
    await importRows(accountId, rows);
    setImporting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-[560px] max-h-[80vh] overflow-auto thin-scroll border border-bb-orange/40 bg-terminal-bg p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-bold text-bb-orange">IMPORT HOLDINGS</span>
          <X size={14} className="cursor-pointer text-bb-dark hover:text-bb-red" onClick={onClose} />
        </div>

        <div className="mb-3">
          <div className="bb-label mb-1">ACCOUNT</div>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full bg-terminal-header p-1 text-xs text-bb-white"
          >
            {accounts.length === 0 && <option value="">NO ACCOUNTS — CREATE ONE FIRST</option>}
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
        </div>

        <div className="mb-3">
          <div className="bb-label mb-1">FILE (.csv or .xlsx)</div>
          <input type="file" accept=".csv,.xlsx,.xls" onChange={onFile} className="text-2xs text-bb-gray" />
        </div>

        {error && <div className="mb-3 text-2xs text-bb-red">{error}</div>}

        {parsed && !confident && mapping && (
          <div className="mb-3">
            <ColumnMappingTable headers={parsed.headers} mapping={mapping} onChange={setMapping} />
          </div>
        )}

        {parsed && mapping && mappingComplete && (
          <div className="mb-3">
            <div className="bb-label mb-1">PREVIEW ({totalRows} ROW{totalRows === 1 ? '' : 'S'})</div>
            <table className="bb-table">
              <thead><tr><th>SYMBOL</th><th>QTY</th><th>AVG COST</th><th>DATE</th></tr></thead>
              <tbody>
                {previewRows.map((r, i) => (
                  <tr key={i}>
                    <td className="font-bold text-bb-blue">{String(r.symbol).toUpperCase()}</td>
                    <td className="text-right tabular-nums text-bb-gray">{r.qty}</td>
                    <td className="text-right tabular-nums text-bb-gray">{r.avgCost}</td>
                    <td className="text-2xs text-bb-dark">{r.date || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 text-2xs font-bold text-bb-gray hover:text-bb-white">CANCEL</button>
          <button
            onClick={confirmImport}
            disabled={!accountId || !mappingComplete || importing}
            className="bg-bb-orange px-3 py-1 text-2xs font-bold text-black disabled:opacity-40"
          >
            {importing ? 'IMPORTING…' : 'IMPORT'}
          </button>
        </div>
      </div>
    </div>
  );
}
