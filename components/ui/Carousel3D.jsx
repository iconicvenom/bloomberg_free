'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Local adaptation of the Framer "Carousel-3D" — a coverflow-style rotating
// carousel. Used for featured market cards (e.g. top movers / trending crypto).
export default function Carousel3D({ items = [], renderItem }) {
  const [index, setIndex] = useState(0);
  const n = items.length;
  if (n === 0) return null;

  const go = (dir) => setIndex((i) => (i + dir + n) % n);

  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden">
      <button
        onClick={() => go(-1)}
        className="absolute left-2 z-20 rounded-full border border-terminal-divider bg-black/60 p-1 text-bb-orange hover:bg-bb-orange/20"
      >
        <ChevronLeft size={16} />
      </button>

      <div className="relative h-full w-full" style={{ perspective: '1200px' }}>
        {items.map((item, i) => {
          let offset = i - index;
          if (offset > n / 2) offset -= n;
          if (offset < -n / 2) offset += n;
          const abs = Math.abs(offset);
          if (abs > 2) return null;
          return (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2"
              animate={{
                x: `calc(-50% + ${offset * 60}%)`,
                y: '-50%',
                rotateY: offset * -28,
                scale: 1 - abs * 0.18,
                opacity: 1 - abs * 0.35,
                zIndex: 10 - abs,
              }}
              transition={{ type: 'spring', stiffness: 220, damping: 26 }}
              style={{ width: '46%' }}
            >
              {renderItem(item, i === index)}
            </motion.div>
          );
        })}
      </div>

      <button
        onClick={() => go(1)}
        className="absolute right-2 z-20 rounded-full border border-terminal-divider bg-black/60 p-1 text-bb-orange hover:bg-bb-orange/20"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
