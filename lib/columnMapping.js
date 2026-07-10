// Column-mapping heuristic for portfolio CSV/XLSX import: matches incoming
// headers against known broker export aliases, and reports confidence so the
// UI can fall back to a manual-mapping step when the match is ambiguous.
const ALIASES = {
  symbol: ['symbol', 'instrument', 'scrip name', 'scrip', 'ticker', 'stock'],
  qty: ['qty', 'quantity', 'shares', 'units', 'holding qty'],
  avgCost: ['avg. cost', 'avg cost', 'average price', 'buy price', 'avg price', 'cost price', 'purchase price'],
  date: ['date', 'buy date', 'purchase date', 'trade date'],
};

export const REQUIRED_FIELDS = ['symbol', 'qty', 'avgCost'];
export const TARGET_FIELDS = ['symbol', 'qty', 'avgCost', 'date'];

function normalize(s) {
  return String(s || '').toLowerCase().trim();
}

function matches(header, alias) {
  const h = normalize(header);
  const a = normalize(alias);
  if (!h || !a) return false;
  return h === a || h.includes(a) || a.includes(h);
}

// Returns { mapping: {targetField: sourceHeader|null}, confident: boolean }
export function autoMapColumns(headers) {
  const mapping = {};
  const usedHeaders = new Set();

  for (const field of TARGET_FIELDS) {
    const aliases = ALIASES[field];
    let found = null;
    // exact match first
    for (const header of headers) {
      if (usedHeaders.has(header)) continue;
      if (aliases.some((alias) => normalize(header) === normalize(alias))) {
        found = header;
        break;
      }
    }
    // substring fallback
    if (!found) {
      for (const header of headers) {
        if (usedHeaders.has(header)) continue;
        if (aliases.some((alias) => matches(header, alias))) {
          found = header;
          break;
        }
      }
    }
    mapping[field] = found;
    if (found) usedHeaders.add(found);
  }

  const resolvedRequired = REQUIRED_FIELDS.filter((f) => mapping[f]).length;
  const confident = resolvedRequired === REQUIRED_FIELDS.length;
  return { mapping, confident };
}

// Applies a target-field -> source-header mapping to parsed rows, producing
// normalized { symbol, qty, avgCost, date } objects ready for the import API.
export function applyMapping(rows, mapping) {
  return rows.map((row) => ({
    symbol: mapping.symbol ? row[mapping.symbol] : '',
    qty: mapping.qty ? row[mapping.qty] : '',
    avgCost: mapping.avgCost ? row[mapping.avgCost] : '',
    date: mapping.date ? row[mapping.date] : '',
  })).filter((r) => r.symbol && String(r.symbol).trim());
}
