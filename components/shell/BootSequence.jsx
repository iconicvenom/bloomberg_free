'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const LINES = [
  { text: 'BLOOMBERG PROFESSIONAL SERVICE', delay: 0, header: true },
  { text: 'INITIALIZING DATA FEEDS', dots: true, delay: 350 },
  { text: 'CONNECTING TO MARKET DATA', dots: true, delay: 650 },
  { text: 'LOADING EQUITY DATABASE', dots: true, delay: 950 },
  { text: 'ESTABLISHING REAL-TIME FEED', dots: true, delay: 1250 },
  { text: 'SYNCING FOREX & COMMODITIES', dots: true, delay: 1550 },
  { text: 'LOADING ECONOMIC INDICATORS', dots: true, delay: 1850 },
];

export default function BootSequence({ onComplete }) {
  const [visible, setVisible] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timers = LINES.map((line, i) =>
      setTimeout(() => setVisible((v) => Math.max(v, i + 1)), line.delay),
    );
    const finishTimer = setTimeout(() => setDone(true), 2300);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finishTimer);
    };
  }, []);

  useEffect(() => {
    if (!done) return undefined;
    const handler = () => onComplete();
    window.addEventListener('keydown', handler);
    window.addEventListener('click', handler);
    const auto = setTimeout(() => onComplete(), 1600);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('click', handler);
      clearTimeout(auto);
    };
  }, [done, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="w-full max-w-2xl px-8 font-mono text-sm">
        {LINES.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: visible > i ? 1 : 0 }}
            transition={{ duration: 0.15 }}
            className={`mb-1 ${line.header ? 'mb-4 text-base font-bold text-bb-orange' : 'text-bb-green'}`}
          >
            {line.header ? (
              line.text
            ) : (
              <span>
                {line.text}
                <span className="text-bb-dark">{'.'.repeat(Math.max(0, 34 - line.text.length))}</span>
                {visible > i && <span className="text-bb-green">OK</span>}
              </span>
            )}
          </motion.div>
        ))}

        {done && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            <div className="text-2xs text-bb-dark">
              COPYRIGHT 2026 — BLOOMBERG FINANCE L.P. [REPLICA]
            </div>
            <div className="mt-3 text-bb-amber">
              PRESS ANY KEY TO CONTINUE
              <span className="term-cursor ml-2" />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
