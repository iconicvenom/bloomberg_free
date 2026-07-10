// Shared CSV read/write layer for the local file-backed data store under /data.
// Reads the full file into memory, mutates, rewrites — no indexing needed at this scale.
// A per-file promise-chain mutex serializes reads/writes to avoid corruption from
// concurrent requests within this single Node process.
import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

const DATA_DIR = path.join(process.cwd(), 'data');
const locks = new Map(); // filename -> promise chain

function filePath(name) {
  return path.join(DATA_DIR, name);
}

async function ensureFile(name, columns) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(filePath(name));
  } catch {
    await fs.writeFile(filePath(name), stringify([], { header: true, columns }));
  }
}

// Runs `fn` exclusively per-file by chaining onto the last promise for that file.
function withLock(name, fn) {
  const prev = locks.get(name) || Promise.resolve();
  const next = prev.then(fn, fn); // run fn regardless of prior rejection, still serialized
  locks.set(name, next.catch(() => {}));
  return next;
}

export async function readAll(name, columns) {
  await ensureFile(name, columns);
  return withLock(name, async () => {
    const raw = await fs.readFile(filePath(name), 'utf8');
    return parse(raw, { columns: true, skip_empty_lines: true });
  });
}

export async function writeAll(name, columns, rows) {
  return withLock(name, async () => {
    const csv = stringify(rows, { header: true, columns });
    await fs.writeFile(filePath(name), csv);
  });
}

// Read-modify-write helper: `mutator(rows) -> rows`, single lock acquisition
// covering both read and write to prevent races between concurrent callers.
export async function mutate(name, columns, mutator) {
  await ensureFile(name, columns);
  return withLock(name, async () => {
    const raw = await fs.readFile(filePath(name), 'utf8');
    const rows = parse(raw, { columns: true, skip_empty_lines: true });
    const next = await mutator(rows);
    await fs.writeFile(filePath(name), stringify(next, { header: true, columns }));
    return next;
  });
}

export function upsertBy(rows, predicate, patch) {
  const idx = rows.findIndex(predicate);
  if (idx === -1) {
    rows.push(patch);
    return rows;
  }
  rows[idx] = { ...rows[idx], ...patch };
  return rows;
}

export function newId() {
  return crypto.randomUUID();
}
