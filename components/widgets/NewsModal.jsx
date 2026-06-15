'use client';

import { motion } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { fmtDateTime } from '@/lib/formatters';

export default function NewsModal({ article, onClose }) {
  if (!article) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl border border-bb-orange/40 bg-terminal-panel bb-glow"
      >
        <div className="bb-panel-header">
          <span>ARTICLE</span>
          <button onClick={onClose} className="text-bb-gray hover:text-bb-orange">
            <X size={14} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-auto thin-scroll p-4">
          {article.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={article.image} alt="" className="mb-3 max-h-48 w-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
          )}
          <div className="mb-2 flex items-center gap-3 text-2xs text-bb-dark">
            <span className="font-bold uppercase text-bb-orange">{article.source}</span>
            <span>{fmtDateTime(article.publishedAt)}</span>
          </div>
          <h2 className="mb-3 font-sans text-lg font-semibold leading-snug text-bb-white">{article.headline}</h2>
          <p className="font-sans text-sm leading-relaxed text-bb-gray">{article.summary || article.content || 'No summary available.'}</p>
          {article.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 border border-bb-orange/50 px-3 py-1.5 text-2xs font-bold text-bb-orange hover:bg-bb-orange/10"
            >
              READ FULL ARTICLE <ExternalLink size={11} />
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
