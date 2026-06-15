'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import { liveFeed } from '@/lib/liveFeed';
import BootSequence from './BootSequence';
import TopBar from './TopBar';
import FunctionKeyBar from './FunctionKeyBar';
import StatusBar from './StatusBar';
import CircularPreloader from '@/components/ui/CircularPreloader';

const loading = () => (
  <div className="flex h-full items-center justify-center">
    <CircularPreloader label="LOADING MODULE" />
  </div>
);

const SCREEN_COMPONENTS = {
  home: dynamic(() => import('@/components/screens/HomeScreen'), { loading }),
  equity: dynamic(() => import('@/components/screens/EquityScreen'), { loading }),
  forex: dynamic(() => import('@/components/screens/ForexScreen'), { loading }),
  commodities: dynamic(() => import('@/components/screens/CommoditiesScreen'), { loading }),
  crypto: dynamic(() => import('@/components/screens/CryptoScreen'), { loading }),
  news: dynamic(() => import('@/components/screens/NewsScreen'), { loading }),
  economics: dynamic(() => import('@/components/screens/EconomicsScreen'), { loading }),
  chart: dynamic(() => import('@/components/screens/ChartScreen'), { loading }),
  watchlist: dynamic(() => import('@/components/screens/WatchlistScreen'), { loading }),
  portfolio: dynamic(() => import('@/components/screens/PortfolioScreen'), { loading }),
  screener: dynamic(() => import('@/components/screens/ScreenerScreen'), { loading }),
  calendar: dynamic(() => import('@/components/screens/CalendarScreen'), { loading }),
};

export default function Terminal() {
  const booted = useUIStore((s) => s.booted);
  const setBooted = useUIStore((s) => s.setBooted);
  const activeScreen = useUIStore((s) => s.activeScreen);

  useEffect(() => {
    if (liveFeed) liveFeed.start();
    return () => { if (liveFeed) liveFeed.stop(); };
  }, []);

  const Screen = SCREEN_COMPONENTS[activeScreen] || SCREEN_COMPONENTS.home;

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-terminal-bg">
      <AnimatePresence>
        {!booted && <BootSequence onComplete={() => setBooted(true)} />}
      </AnimatePresence>

      <TopBar />
      <FunctionKeyBar />

      <main className="relative min-h-0 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScreen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0"
          >
            <Screen />
          </motion.div>
        </AnimatePresence>
      </main>

      <StatusBar />
    </div>
  );
}
