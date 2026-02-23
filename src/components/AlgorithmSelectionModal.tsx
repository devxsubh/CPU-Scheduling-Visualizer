'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AlgorithmType } from '@/types';
import {
  ALGORITHM_INFO,
  PREEMPTIVE_ALGORITHMS,
  NON_PREEMPTIVE_ALGORITHMS,
  PROPORTIONAL_ALGORITHMS,
  IO_ALGORITHMS,
} from '@/lib/algorithm-info';

interface AlgorithmSelectionModalProps {
  open: boolean;
  onClose: () => void;
  selectedAlgorithm: AlgorithmType | '';
  onSelect: (algo: AlgorithmType) => void;
}

function AlgCard({
  value,
  selected,
  onSelect,
}: {
  value: AlgorithmType;
  selected: boolean;
  onSelect: () => void;
}) {
  const info = ALGORITHM_INFO[value];
  if (!info) return null;
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-xl border p-4 transition-all duration-200 ${
        selected
          ? 'border-white/40 bg-white/10'
          : 'border-white/10 bg-neutral-900/80 hover:border-white/20 hover:bg-white/5'
      }`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-mono text-sm ${
            selected ? 'bg-white text-black' : 'bg-white/10 text-white/80'
          }`}
        >
          {info.shortName}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm">{info.name}</p>
          <p className="text-white/60 text-xs mt-1">{info.description}</p>
          <p className="text-white/40 text-xs mt-1.5 font-mono">{info.formula}</p>
        </div>
        {selected && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-5 h-5 text-white flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </motion.svg>
        )}
      </div>
    </motion.button>
  );
}

export default function AlgorithmSelectionModal({
  open,
  onClose,
  selectedAlgorithm,
  onSelect,
}: AlgorithmSelectionModalProps) {
  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [open, onClose]);

  if (!open) return null;

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
          className="bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">Choose scheduling algorithm</h2>
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

          <div className="overflow-y-auto flex-1 px-6 py-4 space-y-6">
            <section>
              <h3 className="text-xs font-mono text-emerald-400/90 uppercase tracking-wider mb-3">
                Preemptive
              </h3>
              <p className="text-white/50 text-xs mb-3">
                The current process can be interrupted when a higher-priority or shorter job arrives or when the time quantum expires.
              </p>
              <div className="space-y-2">
                {PREEMPTIVE_ALGORITHMS.map((algo) => (
                  <AlgCard
                    key={algo}
                    value={algo}
                    selected={selectedAlgorithm === algo}
                    onSelect={() => {
                      onSelect(algo);
                      onClose();
                    }}
                  />
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-xs font-mono text-amber-400/90 uppercase tracking-wider mb-3">
                Non-preemptive
              </h3>
              <p className="text-white/50 text-xs mb-3">
                The selected process runs to completion; no interruption until it finishes or blocks.
              </p>
              <div className="space-y-2">
                {NON_PREEMPTIVE_ALGORITHMS.map((algo) => (
                  <AlgCard
                    key={algo}
                    value={algo}
                    selected={selectedAlgorithm === algo}
                    onSelect={() => {
                      onSelect(algo);
                      onClose();
                    }}
                  />
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-xs font-mono text-cyan-400/90 uppercase tracking-wider mb-3">
                Proportional-share
              </h3>
              <p className="text-white/50 text-xs mb-3">
                CPU time is allocated in proportion to tickets (lottery) or stride; uses a time quantum.
              </p>
              <div className="space-y-2">
                {PROPORTIONAL_ALGORITHMS.map((algo) => (
                  <AlgCard
                    key={algo}
                    value={algo}
                    selected={selectedAlgorithm === algo}
                    onSelect={() => {
                      onSelect(algo);
                      onClose();
                    }}
                  />
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-xs font-mono text-violet-400/90 uppercase tracking-wider mb-3">
                With I/O bursts
              </h3>
              <p className="text-white/50 text-xs mb-3">
                Processes with multiple CPU / I/O burst pairs; blocked during I/O.
              </p>
              <div className="space-y-2">
                {IO_ALGORITHMS.map((algo) => (
                  <AlgCard
                    key={algo}
                    value={algo}
                    selected={selectedAlgorithm === algo}
                    onSelect={() => {
                      onSelect(algo);
                      onClose();
                    }}
                  />
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-xs font-mono text-white/60 uppercase tracking-wider mb-3">
                Other
              </h3>
              <div className="space-y-2">
                <AlgCard
                  value="custom"
                  selected={selectedAlgorithm === 'custom'}
                  onSelect={() => {
                    onSelect('custom');
                    onClose();
                  }}
                />
              </div>
            </section>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
