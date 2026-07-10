// One-time client-side migration of legacy localStorage data (old
// single-account portfolio, old single watchlist) into the new CSV-backed
// accounts/wishlists. Guarded by useUIStore.migratedLegacyData so it only
// ever runs once. Old localStorage keys are cleared only after confirmed
// success, so a failed migration (server unreachable) retries on next load.
import { useUIStore } from '@/store/uiStore';

const OLD_PORTFOLIO_KEY = 'bbt-portfolio';
const OLD_WATCHLIST_KEY = 'bbt-watchlist';

function readLegacyBlob(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state || null;
  } catch {
    return null;
  }
}

export async function migrateLegacyDataIfNeeded() {
  if (typeof window === 'undefined') return;
  if (useUIStore.getState().migratedLegacyData) return;

  const oldPortfolio = readLegacyBlob(OLD_PORTFOLIO_KEY);
  const oldWatchlist = readLegacyBlob(OLD_WATCHLIST_KEY);
  const oldHoldings = Array.isArray(oldPortfolio?.holdings) ? oldPortfolio.holdings : [];
  const oldSymbols = Array.isArray(oldWatchlist?.symbols) ? oldWatchlist.symbols : [];

  if (oldHoldings.length === 0 && oldSymbols.length === 0) {
    useUIStore.getState().setMigrated(true);
    return;
  }

  try {
    if (oldHoldings.length > 0) {
      const accountRes = await fetch('/api/accounts', { method: 'POST', body: JSON.stringify({ label: 'Account 1' }) });
      const account = await accountRes.json();
      await fetch('/api/holdings/import', {
        method: 'POST',
        body: JSON.stringify({
          accountId: account.id,
          rows: oldHoldings.map((h) => ({ symbol: h.symbol, qty: h.quantity, avgCost: h.cost, date: h.date })),
        }),
      });
    }

    if (oldSymbols.length > 0) {
      const wishlistRes = await fetch('/api/wishlists', { method: 'POST', body: JSON.stringify({ name: 'Default' }) });
      const wishlist = await wishlistRes.json();
      await fetch(`/api/wishlists/${wishlist.id}/items`, {
        method: 'POST',
        body: JSON.stringify({ symbols: oldSymbols }),
      });
    }

    useUIStore.getState().setMigrated(true);
    localStorage.removeItem(OLD_PORTFOLIO_KEY);
    localStorage.removeItem(OLD_WATCHLIST_KEY);
  } catch (err) {
    // Leave old data + flag=false intact; will retry on next load.
    console.error('[migrateLegacyData] failed, will retry on next load', err);
  }
}
