<div align="center">

# 📈 Bloomberg Terminal — Free Web Replica

### `bloomberg_free`

A pixel-accurate, fully functional **Bloomberg Terminal** clone built as a modern web app — real market data, real-time price polling, multi-panel resizable layout, function-key navigation, charting, forex, commodities, crypto, news, and macro-economics.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-f7df1e?logo=javascript&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss&logoColor=white)
![Zustand](https://img.shields.io/badge/State-Zustand-443e38)
![License](https://img.shields.io/badge/license-MIT-FF6600)
![Build](https://img.shields.io/badge/build-passing-00FF41)

**Author & Maintainer — [@iconicvenom](https://github.com/iconicvenom)**

![Bloomberg Terminal — Home screen](assets/screenshot-01.png)

</div>

---

## 📸 Screenshots

| Home | Equity | Forex |
| --- | --- | --- |
| ![Home](assets/screenshot-01.png) | ![Equity](assets/screenshot-02.png) | ![Forex](assets/screenshot-03.png) |

| Commodities | Crypto | News |
| --- | --- | --- |
| ![Commodities](assets/screenshot-04.png) | ![Crypto](assets/screenshot-05.png) | ![News](assets/screenshot-06.png) |

| Economics | Chart | Watchlist |
| --- | --- | --- |
| ![Economics](assets/screenshot-07.png) | ![Chart](assets/screenshot-08.png) | ![Watchlist](assets/screenshot-09.png) |

| Watchlist | Screener |
| --- | --- |
| ![Watchlist](assets/screenshot-09.png) | ![Screener](assets/screenshot-10.png) |

---

## ✨ Features

- **12 full screens** mapped to F1–F12 (HOME, EQUITY, FOREX, CMDTY, CRYPTO, NEWS, ECON, CHART, WATCH, PORT, SCRN, CAL)
- **Bloomberg command bar** — type `AAPL <EQUITY> <GO>`, `BTC <CRYPTO> <GO>`, `TOP N <GO>` etc. with live autocomplete and ↑/↓ command history
- **Boot sequence** with typewriter animation
- **Real-time prices** via a 5s polling feed (keeps API keys server-side) with green/red flash-on-update
- **TradingView Lightweight Charts** — candlestick / Heikin Ashi / line / area / bar, with SMA / Bollinger / volume overlays and symbol compare
- **Recharts** for RSI/MACD, the yield curve, FRED economic series, and portfolio allocation
- **Resizable panels** (`react-resizable-panels`) with layout persisted to `localStorage`
- **Watchlist + Portfolio** persisted via Zustand, with CSV export and live P&L
- **Stock screener** with market-cap, sector, P/E and 52W-change filters (dual-handle sliders)
- **Graceful degradation** — every screen falls back to cached data with a `[DELAYED]` badge; the UI never crashes on an API failure
- CRT scanline overlay, JetBrains Mono / Inter typography, authentic Bloomberg palette

---

## 🛠 Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | **Next.js 14** (App Router) |
| Language | **JavaScript** (ES2022+, no TypeScript) |
| Styling | **Tailwind CSS** |
| Primary charts | **TradingView Lightweight Charts** |
| Secondary charts | **Recharts** |
| Animation | **Framer Motion** |
| Icons | **Lucide React** |
| State | **Zustand** (+ persist middleware) |
| Layout | **react-resizable-panels** |
| Fonts | JetBrains Mono (data) · Inter (prose) |

---

## 🏗 System Architecture

The browser **never** sees an API key. Every external request is proxied through a Next.js server route, cached with a TTL, and pushed into Zustand stores that the screens subscribe to.

```
┌───────────────────────────────────────────────────────────────────────────┐
│                                 BROWSER (client)                            │
│                                                                             │
│   ┌─────────────┐   ┌──────────────┐   ┌───────────────┐   ┌────────────┐   │
│   │  TopBar /   │   │ FunctionKey  │   │   12 Screens  │   │ StatusBar  │   │
│   │ CommandInput│   │     Bar      │   │ (lazy-loaded) │   │            │   │
│   └──────┬──────┘   └──────┬───────┘   └───────┬───────┘   └────────────┘   │
│          │  parseCommand()  │  F1–F12          │ widgets (charts/tables)    │
│          ▼                  ▼                  ▼                            │
│   ┌──────────────────────────────────────────────────────────────────┐    │
│   │                    ZUSTAND STORES (+ persist)                      │    │
│   │   uiStore · marketStore · watchlistStore · portfolioStore          │    │
│   └───────────────┬───────────────────────────────┬──────────────────┘    │
│                   │ hooks: useLivePrice /          │                       │
│                   │ useApi / useHistoricalData /    │  liveFeed (5s poll)   │
│                   │ useNews / useEconomicSeries     │                       │
│   ┌───────────────▼─────────────────────────────────────────────────┐     │
│   │            cache.js  —  localStorage + in-memory TTL cache        │     │
│   └───────────────┬─────────────────────────────────────────────────┘     │
└───────────────────│─────────────────────────────────────────────────────┘
                    │  fetch('/api/...')   (no keys ever leave the server)
┌───────────────────▼─────────────────────────────────────────────────────┐
│                       NEXT.js SERVER  —  /app/api/* route handlers         │
│                                                                            │
│  /quote  /equity  /history  /batch  /movers  /indices  /commodities        │
│  /forex  /crypto  /crypto/[id]  /news  /fred/[series]  /economics          │
│  /calendar  /screener  /search                                             │
│                                                                            │
│        serverFetch.js  —  timeout + in-process TTL cache + stale-on-error  │
└───────────────────│────────────────────────────────────────────────────┘
                    │  server-side API clients (lib/*)
   ┌────────────────┼─────────────────┬──────────────┬──────────────┐
   ▼                ▼                 ▼              ▼              ▼
┌────────┐   ┌──────────────┐   ┌──────────┐   ┌─────────┐   ┌──────────┐
│Finnhub │   │Yahoo Finance │   │CoinGecko │   │ NewsAPI │   │   FRED   │
│quotes, │   │ OHLCV (1°),  │   │ crypto   │   │  news   │   │  macro   │
│profile,│   │ quote fallbk │   │ markets  │   │         │   │  series  │
│news,cal│   └──────────────┘   └──────────┘   └─────────┘   └──────────┘
└────────┘   ┌──────────────┐   ┌──────────────────────────┐
             │Alpha Vantage │   │ open.er-api.com (forex)  │
             │ OHLCV (2°)   │   │ keyless cross-rates      │
             └──────────────┘   └──────────────────────────┘
```

### Request lifecycle

1. A screen mounts and calls a hook (`useApi`, `useHistoricalData`, …).
2. The hook checks `cache.js` — a fresh hit returns instantly; a stale hit is returned with `stale: true` while a refresh runs.
3. On miss it fetches `/api/*` — a **server route** that injects the secret key, calls the upstream provider via `serverFetch` (with timeout + stale-on-error), and returns normalized JSON.
4. Results land in a **Zustand store**; subscribed components re-render. The `liveFeed` poller batches all subscribed symbols every 5s and flips the connection indicator (LIVE / DELAYED).

### Resilience

- **Multi-source fallback** — Yahoo Finance is the primary OHLCV source (keyless, all timeframes incl. intraday); Alpha Vantage is the fallback. `getQuote` falls back from Finnhub → Yahoo so foreign index proxies still populate.
- **Stale-while-error** — any upstream failure serves the last cached payload with a `[DELAYED]` badge instead of crashing.
- **Client rate-limit friendly** — TTL caching + request batching keep usage inside free-tier limits.

---

## 📁 Project Structure

```
/app
  layout.js                 root shell, fonts, scanline overlay
  page.js                   client-only Terminal mount
  /api/*                    15 server routes — all API keys live here only
/components
  /shell                    BootSequence, TopBar, FunctionKeyBar, StatusBar,
                            CommandInput, WorldClocks, PanelGrid, Terminal
  /screens                  12 screens (Home, Equity, Forex, … Calendar)
  /widgets                  CandlestickChart, MiniSparkline, PriceQuote, OrderBook,
                            NewsFeed, NewsModal, MarketMover, HeatMap, ForexMatrix,
                            EconChart, TechnicalIndicators, IndicesTable, ChartToolbar
  /ui                       Panel, Skeleton, Glass, CircularPreloader, FxSlider, Carousel3D
/lib                        config, formatters, indicators, cache, serverFetch,
                            commandParser, finnhub, yahoo, alphaVantage,
                            coinGecko, newsApi, fredApi, liveFeed
/store                      uiStore, marketStore, watchlistStore, portfolioStore
/hooks                      useLivePrice, useHistoricalData, useNews,
                            useEconomicSeries, useApi
```

---

## 🔌 Data Sources

All keys live **server-side only** inside `/app/api/*` — never shipped to the browser.

| Source | Used for | Env var |
| --- | --- | --- |
| **Finnhub** | quotes, profiles, metrics, earnings, news, search, calendars | `FINNHUB_KEY` |
| **Yahoo Finance** *(keyless)* | historical OHLCV (primary), quote fallback | — |
| **Alpha Vantage** | OHLCV fallback, sector performance | `ALPHA_VANTAGE_KEY` |
| **CoinGecko** | crypto markets, global stats, sparklines | `COINGECKO_KEY` *(optional)* |
| **NewsAPI** | financial & company news | `NEWS_API_KEY` |
| **FRED** | GDP, CPI, unemployment, Fed funds, yields, M2 | `FRED_KEY` |
| **open.er-api.com** *(keyless)* | forex cross rates | — |

> Finnhub forex/candle endpoints and Alpha Vantage daily limits (25 req/day) are tight on the free tier — hence Yahoo Finance as the primary chart source and `open.er-api.com` for FX. Everything is TTL-cached.

---

## 🚀 Getting Started

```bash
# 1. install
npm install

# 2. add your API keys
cp .env.example .env.local
#    fill in FINNHUB_KEY, ALPHA_VANTAGE_KEY, NEWS_API_KEY, FRED_KEY
#    (COINGECKO_KEY optional)

# 3. run
npm run dev          # → http://localhost:3000

# production
npm run build && npm start
```

### Get free API keys

- Finnhub — https://finnhub.io/register
- Alpha Vantage — https://www.alphavantage.co/support/#api-key
- NewsAPI — https://newsapi.org/register
- FRED — https://fred.stlouisfed.org/docs/api/api_key.html
- CoinGecko *(optional)* — https://www.coingecko.com/en/api

---

## ⌨️ Command Reference

| Command | Action |
| --- | --- |
| `AAPL <EQUITY> <GO>` | Apple on the Equity screen |
| `TSLA <GP> <GO>` | Tesla on the Chart screen |
| `EUR <CURNCY> <GO>` | EUR/USD on Forex |
| `BTC <CRYPTO> <GO>` | Bitcoin on Crypto |
| `GC1 <CMDTY> <GO>` | Gold on Commodities |
| `TOP N <GO>` | News screen |
| `WPX` · `PORT` · `ECON` · `SCRN` · `CAL` | Watchlist · Portfolio · Economics · Screener · Calendar |

Function keys **F1–F12** jump between screens directly.

---

## ☁️ Deploy to Vercel

`vercel.json` is included. Push to a Git repo → import into Vercel → add the env vars from `.env.example` in project settings → deploy. Keys stay server-side because every external call routes through `/app/api/*`.

---

## 👤 Author & Contributors

| Role | Name |
| --- | --- |
| **Author / Maintainer** | [**iconicvenom**](https://github.com/iconicvenom) |
| **Contributor** | [**iconicvenom**](https://github.com/iconicvenom) |

Contributions, issues, and feature requests are welcome — open a PR or an issue.

---

## 📝 Notes & License

- Desktop-first (Bloomberg is a desktop product). Designed for ≥1280px; data tables scroll horizontally on narrower viewports.
- Order-book depth is simulated deterministically (free APIs don't expose L2 depth).
- The Framer UI components (Glass, Circular Preloader, fx-Slider, Carousel-3D) are Framer-runtime modules that can't run outside Framer; they're re-implemented locally in `/components/ui` against the Bloomberg palette.
- **`[REPLICA]`** — educational clone, not affiliated with Bloomberg L.P. All trademarks belong to their owners.

Released under the **MIT License**.

<div align="center">

Built with ⚡ by **[iconicvenom](https://github.com/iconicvenom)**

</div>
