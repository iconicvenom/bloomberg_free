// Parse Bloomberg-style commands like "AAPL <EQUITY> <GO>" into navigation intents.
import { SCREENS } from './config';

const FUNCTION_SCREENS = {
  HOME: 'home',
  EQUITY: 'equity',
  EQ: 'equity',
  DES: 'equity',
  GP: 'chart',
  CURNCY: 'forex',
  FX: 'forex',
  FOREX: 'forex',
  CMDTY: 'commodities',
  COMDTY: 'commodities',
  CRYPTO: 'crypto',
  CRNCY: 'crypto',
  NEWS: 'news',
  TOP: 'news',
  N: 'news',
  ECON: 'economics',
  ECOW: 'economics',
  CHART: 'chart',
  WPX: 'watchlist',
  WATCH: 'watchlist',
  PORT: 'portfolio',
  SCRN: 'screener',
  EQS: 'screener',
  CAL: 'calendar',
};

const CRYPTO_MAP = {
  BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', ADA: 'cardano', XRP: 'ripple',
  DOGE: 'dogecoin', DOT: 'polkadot', BNB: 'binancecoin', AVAX: 'avalanche-2', MATIC: 'matic-network',
};

export function parseCommand(raw) {
  const cleaned = raw.trim().toUpperCase().replace(/<|>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleaned) return null;
  const tokens = cleaned.split(' ').filter((t) => t && t !== 'GO');

  if (tokens.length === 0) return null;

  // Pure screen command, e.g. "PORT", "ECON", "TOP N"
  const joined = tokens.join(' ');
  if (joined === 'TOP N') return { screen: 'news' };

  // Single keyword that is a screen
  if (tokens.length === 1 && FUNCTION_SCREENS[tokens[0]]) {
    const screen = FUNCTION_SCREENS[tokens[0]];
    if (screen === 'equity' || screen === 'chart') {
      // bare EQUITY with no symbol -> just open screen with current symbol
      return { screen };
    }
    return { screen };
  }

  const symbol = tokens[0];
  const asset = tokens.find((t, i) => i > 0 && FUNCTION_SCREENS[t]);

  if (asset) {
    const screen = FUNCTION_SCREENS[asset];
    if (screen === 'forex') {
      return { screen: 'forex', payload: { forexPair: normalizePair(symbol) } };
    }
    if (screen === 'crypto') {
      return { screen: 'crypto', payload: { crypto: CRYPTO_MAP[symbol] || symbol.toLowerCase() } };
    }
    if (screen === 'commodities') {
      return { screen: 'commodities', payload: { commodity: symbol } };
    }
    if (screen === 'equity' || screen === 'chart') {
      return { screen, payload: { symbol } };
    }
    return { screen };
  }

  // Heuristics for bare ticker
  if (CRYPTO_MAP[symbol]) return { screen: 'crypto', payload: { crypto: CRYPTO_MAP[symbol] } };
  if (/^[A-Z]{6}$/.test(symbol)) return { screen: 'forex', payload: { forexPair: symbol } };
  // default: treat as equity
  return { screen: 'equity', payload: { symbol } };
}

function normalizePair(sym) {
  if (sym.length === 3) return `${sym}USD`;
  return sym;
}

export const SCREEN_LIST = SCREENS;
