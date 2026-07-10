// Top-level application configuration.
export const CONFIG = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Bloomberg Terminal',

  defaultWatchlist: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'],
  defaultCryptos: ['bitcoin', 'ethereum', 'solana', 'cardano', 'ripple'],
  defaultForexPairs: ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'USDCNY'],

  indices: [
    { symbol: '^GSPC', proxy: 'SPY', name: 'S&P 500' },
    { symbol: '^IXIC', proxy: 'QQQ', name: 'NASDAQ' },
    { symbol: '^DJI', proxy: 'DIA', name: 'DOW JONES' },
    { symbol: '^FTSE', proxy: 'ISF.L', name: 'FTSE 100' },
    { symbol: '^GDAXI', proxy: 'DAX', name: 'DAX' },
    { symbol: '^N225', proxy: 'EWJ', name: 'NIKKEI 225' },
    { symbol: '^HSI', proxy: 'EWH', name: 'HANG SENG' },
    { symbol: '^AXJO', proxy: 'EWA', name: 'ASX 200' },
  ],

  commodities: {
    energy: [
      { symbol: 'CL=F', name: 'Crude Oil WTI', unit: 'USD/bbl', contract: 'CLN26' },
      { symbol: 'BZ=F', name: 'Brent Crude', unit: 'USD/bbl', contract: 'BZN26' },
      { symbol: 'NG=F', name: 'Natural Gas', unit: 'USD/MMBtu', contract: 'NGN26' },
      { symbol: 'RB=F', name: 'Gasoline RBOB', unit: 'USD/gal', contract: 'RBN26' },
    ],
    metals: [
      { symbol: 'GC=F', name: 'Gold', unit: 'USD/oz', contract: 'GCM26' },
      { symbol: 'SI=F', name: 'Silver', unit: 'USD/oz', contract: 'SIN26' },
      { symbol: 'PL=F', name: 'Platinum', unit: 'USD/oz', contract: 'PLN26' },
      { symbol: 'HG=F', name: 'Copper', unit: 'USD/lb', contract: 'HGN26' },
      { symbol: 'PA=F', name: 'Palladium', unit: 'USD/oz', contract: 'PAM26' },
    ],
    agriculture: [
      { symbol: 'ZC=F', name: 'Corn', unit: 'USc/bu', contract: 'ZCN26' },
      { symbol: 'ZW=F', name: 'Wheat', unit: 'USc/bu', contract: 'ZWN26' },
      { symbol: 'ZS=F', name: 'Soybeans', unit: 'USc/bu', contract: 'ZSN26' },
      { symbol: 'KC=F', name: 'Coffee', unit: 'USc/lb', contract: 'KCN26' },
      { symbol: 'SB=F', name: 'Sugar', unit: 'USc/lb', contract: 'SBN26' },
      { symbol: 'CT=F', name: 'Cotton', unit: 'USc/lb', contract: 'CTN26' },
    ],
    softs: [
      { symbol: 'CC=F', name: 'Cocoa', unit: 'USD/MT', contract: 'CCN26' },
      { symbol: 'OJ=F', name: 'Orange Juice', unit: 'USc/lb', contract: 'OJF26' },
      { symbol: 'LBS=F', name: 'Lumber', unit: 'USD/1000bf', contract: 'LBSN26' },
    ],
  },

  forexCurrencies: ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'CNY', 'HKD', 'SGD'],

  centralBanks: [
    { bank: 'Federal Reserve (Fed)', code: 'FED', rate: 4.50, lastChange: '2025-12-18', next: '2026-06-17' },
    { bank: 'European Central Bank (ECB)', code: 'ECB', rate: 2.40, lastChange: '2026-03-06', next: '2026-06-05' },
    { bank: 'Bank of England (BOE)', code: 'BOE', rate: 4.25, lastChange: '2026-05-08', next: '2026-06-19' },
    { bank: 'Bank of Japan (BOJ)', code: 'BOJ', rate: 0.50, lastChange: '2026-01-24', next: '2026-06-13' },
    { bank: 'Swiss National Bank (SNB)', code: 'SNB', rate: 0.25, lastChange: '2026-03-20', next: '2026-06-19' },
    { bank: 'Reserve Bank of Australia (RBA)', code: 'RBA', rate: 3.85, lastChange: '2026-05-20', next: '2026-07-08' },
    { bank: "People's Bank of China (PBOC)", code: 'PBOC', rate: 3.00, lastChange: '2026-05-20', next: '2026-06-20' },
  ],

  fredSeries: [
    { id: 'GDPC1', label: 'US Real GDP', unit: 'Bil. $', freq: 'Quarterly' },
    { id: 'CPIAUCSL', label: 'CPI (All Items)', unit: 'Index', freq: 'Monthly' },
    { id: 'CPILFESL', label: 'Core CPI', unit: 'Index', freq: 'Monthly' },
    { id: 'UNRATE', label: 'Unemployment Rate', unit: '%', freq: 'Monthly' },
    { id: 'FEDFUNDS', label: 'Fed Funds Rate', unit: '%', freq: 'Monthly' },
    { id: 'DGS10', label: '10Y Treasury Yield', unit: '%', freq: 'Daily' },
    { id: 'DGS2', label: '2Y Treasury Yield', unit: '%', freq: 'Daily' },
    { id: 'T10Y2Y', label: '10Y-2Y Spread', unit: '%', freq: 'Daily' },
    { id: 'M2SL', label: 'M2 Money Supply', unit: 'Bil. $', freq: 'Monthly' },
  ],

  yieldCurve: [
    { id: 'DGS1MO', label: '1M' },
    { id: 'DGS3MO', label: '3M' },
    { id: 'DGS6MO', label: '6M' },
    { id: 'DGS1', label: '1Y' },
    { id: 'DGS2', label: '2Y' },
    { id: 'DGS5', label: '5Y' },
    { id: 'DGS10', label: '10Y' },
    { id: 'DGS30', label: '30Y' },
  ],

  refreshIntervals: {
    quotes: 5000,
    news: 30000,
    forex: 10000,
    indices: 10000,
    crypto: 15000,
  },

  cache: {
    historical: 3600000, // 1 hour
    news: 120000, // 2 mins
    profile: 86400000, // 24 hours
    quote: 5000,
    crypto: 30000,
    fred: 3600000,
    forex: 60000,
  },
};

export const SCREENS = [
  { id: 'home', key: 'F1', label: 'HOME', cmd: 'HOME' },
  { id: 'equity', key: 'F2', label: 'EQUITY', cmd: 'EQUITY' },
  { id: 'forex', key: 'F3', label: 'FOREX', cmd: 'FOREX' },
  { id: 'commodities', key: 'F4', label: 'CMDTY', cmd: 'CMDTY' },
  { id: 'crypto', key: 'F5', label: 'CRYPTO', cmd: 'CRYPTO' },
  { id: 'news', key: 'F6', label: 'NEWS', cmd: 'NEWS' },
  { id: 'economics', key: 'F7', label: 'ECON', cmd: 'ECON' },
  { id: 'chart', key: 'F8', label: 'CHART', cmd: 'CHART' },
  { id: 'watchlist', key: 'F9', label: 'WATCH', cmd: 'WPX' },
  { id: 'portfolio', key: 'F10', label: 'PORT', cmd: 'PORT' },
  { id: 'screener', key: 'F11', label: 'SCRN', cmd: 'SCRN' },
  { id: 'calendar', key: 'F12', label: 'CAL', cmd: 'CAL' },
  // Command-only screens (no free F-key slot) — reachable via CommandInput.
  { id: 'accounts', label: 'ACCT', cmd: 'ACCT' },
  { id: 'alerts', label: 'ALERT', cmd: 'ALERT' },
];
