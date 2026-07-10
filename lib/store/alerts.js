// Alerts domain — thin wrapper over lib/csvStore.js.
import { readAll, mutate, newId } from '../csvStore.js';

const FILE = 'alerts.csv';
const COLUMNS = ['id', 'symbol', 'type', 'condition', 'value', 'status', 'createdAt', 'triggeredAt'];

function toNumberedRow(r) {
  return { ...r, value: r.value === '' ? null : Number(r.value) };
}

export async function listAlerts() {
  const rows = await readAll(FILE, COLUMNS);
  return rows.map(toNumberedRow);
}

export async function listActiveAlerts() {
  const rows = await readAll(FILE, COLUMNS);
  return rows.filter((r) => r.status === 'active').map(toNumberedRow);
}

export async function createAlert({ symbol, type, condition, value }) {
  const alert = {
    id: newId(),
    symbol: String(symbol).toUpperCase().trim(),
    type,
    condition,
    value: value == null ? '' : String(Number(value)),
    status: 'active',
    createdAt: new Date().toISOString(),
    triggeredAt: '',
  };
  await mutate(FILE, COLUMNS, (rows) => [...rows, alert]);
  return toNumberedRow(alert);
}

export async function setAlertStatus(id, status) {
  let updated = null;
  await mutate(FILE, COLUMNS, (rows) => rows.map((r) => {
    if (r.id !== id) return r;
    updated = { ...r, status };
    return updated;
  }));
  return updated ? toNumberedRow(updated) : null;
}

export async function markTriggered(id) {
  let updated = null;
  await mutate(FILE, COLUMNS, (rows) => rows.map((r) => {
    if (r.id !== id) return r;
    updated = { ...r, status: 'triggered', triggeredAt: new Date().toISOString() };
    return updated;
  }));
  return updated ? toNumberedRow(updated) : null;
}

export async function removeAlert(id) {
  await mutate(FILE, COLUMNS, (rows) => rows.filter((r) => r.id !== id));
}
