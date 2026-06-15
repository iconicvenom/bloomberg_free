'use client';

import { motion } from 'framer-motion';

// Glassmorphism surface — local adaptation of the Framer "Glass" component,
// retuned to the Bloomberg terminal palette (dark, orange-tinted edge light).
export default function Glass({ children, className = '', glow = false, ...rest }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`relative overflow-hidden rounded-sm border border-white/10 ${className}`}
      style={{
        background:
          'linear-gradient(135deg, rgba(255,102,0,0.06) 0%, rgba(20,20,20,0.85) 40%, rgba(10,10,10,0.92) 100%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: glow
          ? '0 0 20px rgba(255,102,0,0.18), inset 0 1px 0 rgba(255,255,255,0.06)'
          : 'inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
      {...rest}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-bb-orange/40 to-transparent" />
      {children}
    </motion.div>
  );
}
