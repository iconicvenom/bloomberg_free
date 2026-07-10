// Holdings domain — thin wrapper over lib/csvStore.js.
import { readAll, mutate, newId } from '@/lib/csvStore';

const FILE = 'holdings.csv';
const COLUMNS = ['id', 'accountId', 'symbol', 'qty', 'avgCost', 'date'];

function toRow(h) {
  return {
    id: h.id,
    accountId: h.accountId,
    symbol: String(h.symbol).toUpperCase().trim(),
    qty: String(Number(h.qty)),
    avgCost: String(Number(h.avgCost)),
    date: h.date || new Date().toISOString().slice(0, 10),
  };
}

export async function listHoldings(accountId) {
  const rows = await readAll(FILE, COLUMNS);
  const filtered = accountId ? rows.filter((r) => r.accountId === accountId) : rows;
  return filtered.map((r) => ({ ...r, qty: Number(r.qty), avgCost: Number(r.avgCost) }));
}

export async function addHolding({ accountId, symbol, qty, avgCost, date }) {
  const holding = toRow({ id: newId(), accountId, symbol, qty, avgCost, date });
  await mutate(FILE, COLUMNS, (rows) => [...rows, holding]);
  return { ...holding, qty: Number(holding.qty), avgCost: Number(holding.avgCost) };
}

export async function updateHolding(id, { qty, avgCost, date }) {
  let updated = null;
  await mutate(FILE, COLUMNS, (rows) => rows.map((r) => {
    if (r.id !== id) return r;
    updated = {
      ...r,
      qty: qty != null ? String(Number(qty)) : r.qty,
      avgCost: avgCost != null ? String(Number(avgCost)) : r.avgCost,
      date: date || r.date,
    };
    return updated;
  }));
  return updated ? { ...updated, qty: Number(updated.qty), avgCost: Number(updated.avgCost) } : null;
}

export async function removeHolding(id) {
  await mutate(FILE, COLUMNS, (rows) => rows.filter((r) => r.id !== id));
}

export async function removeHoldingsForAccount(accountId) {
  await mutate(FILE, COLUMNS, (rows) => rows.filter((r) => r.accountId !== accountId));
}

// Bulk upsert used by manual import and CSV/XLSX import: for each incoming row,
// update the existing holding for (accountId, symbol) if present, else insert new.
export async function importHoldings(accountId, incomingRows) {
  const result = [];
  await mutate(FILE, COLUMNS, (rows) => {
    const next = [...rows];
    for (const r of incomingRows) {
      const symbol = String(r.symbol).toUpperCase().trim();
      const idx = next.findIndex((h) => h.accountId === accountId && h.symbol === symbol);
      if (idx === -1) {
        const created = toRow({ id: newId(), accountId, symbol, qty: r.qty, avgCost: r.avgCost, date: r.date });
        next.push(created);
        result.push(created);
      } else {
        next[idx] = toRow({ ...next[idx], accountId, symbol, qty: r.qty, avgCost: r.avgCost, date: r.date || next[idx].date });
        result.push(next[idx]);
      }
    }
    return next;
  });
  return result.map((r) => ({ ...r, qty: Number(r.qty), avgCost: Number(r.avgCost) }));
}
