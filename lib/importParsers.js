// Parses .csv and .xlsx portfolio export files into a normalized
// { headers: string[], rows: object[] } shape, regardless of source format.
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export async function parseFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext === 'csv') return parseCsv(file);
  if (ext === 'xlsx' || ext === 'xls') return parseXlsx(file);
  throw new Error(`Unsupported file type: .${ext}`);
}

function parseCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const headers = result.meta.fields || [];
        resolve({ headers, rows: result.data });
      },
      error: reject,
    });
  });
}

async function parseXlsx(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (raw.length === 0) return { headers: [], rows: [] };
  const headers = raw[0].map((h) => String(h).trim());
  const rows = raw.slice(1)
    .filter((r) => r.some((v) => v !== '' && v != null))
    .map((r) => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = r[i]; });
      return obj;
    });
  return { headers, rows };
}
