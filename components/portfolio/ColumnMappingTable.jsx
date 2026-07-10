'use client';

import { TARGET_FIELDS } from '@/lib/columnMapping';

const FIELD_LABELS = { symbol: 'SYMBOL', qty: 'QUANTITY', avgCost: 'AVG COST', date: 'DATE' };

// One row per detected source column, with a <select> to assign it to a
// target field (or "ignore"). Shown when the header-alias heuristic doesn't
// confidently resolve all required fields.
export default function ColumnMappingTable({ headers, mapping, onChange }) {
  const setFieldForHeader = (header, field) => {
    const next = { ...mapping };
    // Clear any other header currently assigned to this field.
    for (const f of TARGET_FIELDS) {
      if (next[f] === header) next[f] = null;
    }
    if (field !== 'ignore') next[field] = header;
    onChange(next);
  };

  const fieldForHeader = (header) => TARGET_FIELDS.find((f) => mapping[f] === header) || 'ignore';

  return (
    <div className="space-y-1">
      <div className="text-2xs text-bb-amber">HEADERS COULD NOT BE CONFIDENTLY MATCHED — MAP THEM MANUALLY:</div>
      <table className="bb-table">
        <thead>
          <tr><th>SOURCE COLUMN</th><th>MAPS TO</th></tr>
        </thead>
        <tbody>
          {headers.map((header) => (
            <tr key={header}>
              <td className="text-bb-gray">{header}</td>
              <td>
                <select
                  value={fieldForHeader(header)}
                  onChange={(e) => setFieldForHeader(header, e.target.value)}
                  className="bg-terminal-header text-2xs text-bb-white"
                >
                  <option value="ignore">— ignore —</option>
                  {TARGET_FIELDS.map((f) => (
                    <option key={f} value={f}>{FIELD_LABELS[f]}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
