'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AlgorithmType } from '@/types';
import { ALGORITHM_INFO } from '@/lib/algorithm-info';

interface AlgorithmExplanationModalProps {
  open: boolean;
  onClose: () => void;
  algorithm: AlgorithmType | '';
}

export default function AlgorithmExplanationModal({
  open,
  onClose,
  algorithm,
}: AlgorithmExplanationModalProps) {
  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [open, onClose]);

  if (!open || !algorithm) return null;
  const info = ALGORITHM_INFO[algorithm];
  if (!info) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <span className="font-mono text-[11px] tracking-[0.2em] text-white/50 uppercase">
              Algorithm explanation
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-6 py-4 space-y-3 text-sm">
            <p className="text-white font-medium">{info.description}</p>
            <p className="font-mono text-xs text-white/60">
              <span className="text-white/50">Rule: </span>
              {info.rule}
            </p>
            <p className="font-mono text-xs text-white/60">
              <span className="text-white/50">Formula: </span>
              {info.formula}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {info.pros.map((pro) => (
                <span
                  key={pro}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 text-green-400/90 text-xs"
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {pro}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {info.cons.map((con) => (
                <span
                  key={con}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400/90 text-xs"
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {con}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
