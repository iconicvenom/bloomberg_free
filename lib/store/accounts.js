// Accounts domain — thin wrapper over lib/csvStore.js.
import { readAll, mutate, newId } from '@/lib/csvStore';

const FILE = 'accounts.csv';
const COLUMNS = ['id', 'label', 'createdAt'];

export async function listAccounts() {
  return readAll(FILE, COLUMNS);
}

export async function createAccount(label) {
  const account = { id: newId(), label: String(label).trim(), createdAt: new Date().toISOString() };
  await mutate(FILE, COLUMNS, (rows) => [...rows, account]);
  return account;
}

export async function renameAccount(id, label) {
  let updated = null;
  await mutate(FILE, COLUMNS, (rows) => rows.map((r) => {
    if (r.id !== id) return r;
    updated = { ...r, label: String(label).trim() };
    return updated;
  }));
  return updated;
}

export async function deleteAccount(id) {
  await mutate(FILE, COLUMNS, (rows) => rows.filter((r) => r.id !== id));
}
