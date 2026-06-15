'use client';

import { motion } from 'framer-motion';

// Local adaptation of the Framer "Circular Preloader" — Bloomberg orange ring.
export default function CircularPreloader({ size = 48, label = 'LOADING' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 50 50"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, ease: 'linear', duration: 1 }}
      >
        <circle cx="25" cy="25" r="20" fill="none" stroke="#1c1c1c" strokeWidth="4" />
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="#FF6600"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="90 150"
        />
      </motion.svg>
      {label && <span className="text-2xs tracking-widest text-bb-dark">{label}</span>}
    </div>
  );
}
