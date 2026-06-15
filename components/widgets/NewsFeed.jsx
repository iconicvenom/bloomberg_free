'use client';

import { motion } from 'framer-motion';
import { timeAgo, isBreaking } from '@/lib/formatters';

function categoryFor(article) {
  const t = `${article.headline || ''} ${article.summary || ''}`.toLowerCase();
  if (/earnings|profit|revenue|eps|quarter/.test(t)) return { label: 'EARNINGS', color: 'text-bb-green border-bb-green/40' };
  if (/fed|rate|central bank|ecb|inflation|cpi/.test(t)) return { label: 'FED', color: 'text-bb-amber border-bb-amber/40' };
  if (/merger|acquisition|takeover|deal|buyout/.test(t)) return { label: 'M&A', color: 'text-bb-blue border-bb-blue/40' };
  if (/oil|gold|crude|commodit|gas/.test(t)) return { label: 'CMDTY', color: 'text-bb-orange border-bb-orange/40' };
  if (/crypto|bitcoin|ethereum|token/.test(t)) return { label: 'CRYPTO', color: 'text-bb-orange border-bb-orange/40' };
  if (/gdp|economy|unemploy|jobs|growth/.test(t)) return { label: 'ECONOMY', color: 'text-bb-blue border-bb-blue/40' };
  return { label: 'TECH', color: 'text-bb-gray border-bb-gray/40' };
}

export default function NewsFeed({ articles = [], onSelect, compact = false }) {
  return (
    <div className="divide-y divide-terminal-divider">
      {articles.map((a, i) => {
        const cat = categoryFor(a);
        const breaking = isBreaking(a.publishedAt);
        return (
          <motion.button
            key={a.id || i}
            initial={i < 6 ? { opacity: 0, x: -6 } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: Math.min(i * 0.015, 0.2) }}
            onClick={() => onSelect && onSelect(a)}
            className="bb-row-hover flex w-full flex-col items-start gap-0.5 px-2 py-1.5 text-left"
          >
            <div className="flex w-full items-center gap-2">
              <span className={`shrink-0 rounded-sm border px-1 text-[9px] font-bold ${cat.color}`}>
                {cat.label}
              </span>
              {breaking && (
                <span className="shrink-0 animate-pulse rounded-sm bg-bb-red px-1 text-[9px] font-bold text-black">
                  BREAKING
                </span>
              )}
              <span className="ml-auto shrink-0 text-[9px] text-bb-dark">{timeAgo(a.publishedAt)}</span>
            </div>
            <span className={`font-sans ${compact ? 'text-2xs' : 'text-xs'} font-medium leading-snug text-bb-white`}>
              {a.headline}
            </span>
            <span className="text-[9px] uppercase text-bb-dark">{a.source}</span>
          </motion.button>
        );
      })}
      {articles.length === 0 && (
        <div className="px-2 py-4 text-center text-2xs text-bb-dark">NO HEADLINES AVAILABLE</div>
      )}
    </div>
  );
}
