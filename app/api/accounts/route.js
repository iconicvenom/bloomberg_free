import { listAccounts, createAccount } from '@/lib/store/accounts';
import { jsonResponse } from '@/lib/serverFetch';

export const dynamic = 'force-dynamic';

export async function GET() {
  const accounts = await listAccounts();
  return jsonResponse(accounts);
}

export async function POST(req) {
  const { label } = await req.json();
  if (!label || !String(label).trim()) return jsonResponse({ error: 'label required' }, { status: 400 });
  const account = await createAccount(label);
  return jsonResponse(account);
}
