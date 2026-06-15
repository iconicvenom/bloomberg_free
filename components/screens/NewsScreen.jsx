'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useNews } from '@/hooks/useNews';
import Panel from '@/components/ui/Panel';
import { StaleBadge } from '@/components/ui/Skeleton';
import NewsFeed from '@/components/widgets/NewsFeed';
import { fmtDateTime, timeAgo } from '@/lib/formatters';

const CATEGORIES = [
  { id: 'all', label: 'ALL' },
  { id: 'equities', label: 'EQUITIES' },
  { id: 'economy', label: 'ECONOMY' },
  { id: 'central banks', label: 'CENTRAL BANKS' },
  { id: 'crypto', label: 'CRYPTO' },
  { id: 'commodities', label: 'COMMODITIES' },
  { id: 'm&a', label: 'M&A' },
  { id: 'earnings', label: 'EARNINGS' },
  { id: 'ipo', label: 'IPO' },
];

export default function NewsScreen() {
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const { articles, stale, loading } = useNews({ category, q: search });

  return (
    <div className="flex h-full gap-0.5 p-0.5">
      {/* Sidebar */}
      <div className="flex w-44 flex-shrink-0 flex-col">
        <Panel title="CATEGORIES" noPad>
          <div className="flex flex-col">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => { setCategory(c.id); setSearch(''); setQuery(''); }}
                className={`border-b border-terminal-divider px-3 py-1.5 text-left text-2xs font-bold ${
                  category === c.id && !search ? 'bg-bb-orange/15 text-bb-orange' : 'text-bb-gray hover:bg-white/5'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </Panel>
      </div>

      {/* List */}
      <div className="flex min-w-0 flex-1 flex-col bb-panel">
        <div className="bb-panel-header">
          <span>TOP NEWS {search ? `· "${search}"` : `· ${category.toUpperCase()}`}</span>
          <StaleBadge stale={stale} />
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); setSearch(query); }}
          className="flex items-center gap-2 border-b border-terminal-divider bg-terminal-header px-2 py-1"
        >
          <Search size={12} className="text-bb-orange" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SEARCH NEWS BY KEYWORD OR TICKER…"
            className="flex-1 bg-transparent text-2xs uppercase text-bb-white placeholder:text-bb-dark"
          />
          <button type="submit" className="bg-bb-orange px-2 py-0.5 text-2xs font-bold text-black">GO</button>
        </form>
        <div className="min-h-0 flex-1 overflow-auto thin-scroll">
          {loading && articles.length === 0 ? (
            <div className="p-4 text-center text-2xs text-bb-dark">LOADING NEWS…</div>
          ) : (
            <NewsFeed articles={articles} onSelect={setSelected} />
          )}
        </div>
      </div>

      {/* Preview pane */}
      <div className="flex w-80 flex-shrink-0 flex-col">
        <Panel title="ARTICLE PREVIEW">
          {selected ? (
            <div className="space-y-2">
              {selected.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selected.image} alt="" className="max-h-40 w-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
              )}
              <div className="flex items-center gap-2 text-2xs text-bb-dark">
                <span className="font-bold uppercase text-bb-orange">{selected.source}</span>
                <span>{timeAgo(selected.publishedAt)}</span>
              </div>
              <h3 className="font-sans text-base font-semibold leading-snug text-bb-white">{selected.headline}</h3>
              <div className="text-2xs text-bb-dark">{fmtDateTime(selected.publishedAt)}</div>
              <p className="font-sans text-xs leading-relaxed text-bb-gray">{selected.summary || selected.content || 'No summary available.'}</p>
              {selected.url && (
                <a href={selected.url} target="_blank" rel="noreferrer" className="inline-block border border-bb-orange/50 px-3 py-1 text-2xs font-bold text-bb-orange hover:bg-bb-orange/10">
                  OPEN FULL ARTICLE →
                </a>
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-2xs text-bb-dark">SELECT A HEADLINE TO PREVIEW</div>
          )}
        </Panel>
      </div>
    </div>
  );
}
