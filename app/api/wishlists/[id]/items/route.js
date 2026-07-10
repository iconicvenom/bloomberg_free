import { listItems, addItem, addItems } from '@/lib/store/wishlistItems';
import { jsonResponse } from '@/lib/serverFetch';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const items = await listItems(params.id);
  return jsonResponse(items);
}

export async function POST(req, { params }) {
  const body = await req.json();
  if (Array.isArray(body.symbols)) {
    const items = await addItems(params.id, body.symbols);
    return jsonResponse(items);
  }
  if (!body.symbol) return jsonResponse({ error: 'symbol required' }, { status: 400 });
  const item = await addItem(params.id, body.symbol);
  return jsonResponse(item);
}
