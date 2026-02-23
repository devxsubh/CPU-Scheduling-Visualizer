'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProcessInput } from '@/types';
import { generateRandomProcesses } from '@/lib/scenario-utils';

interface RandomGeneratorModalProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (processes: ProcessInput[]) => void;
}

const DEFAULT = {
  count: 5,
  arrivalMin: 0,
  arrivalMax: 8,
  burstMin: 1,
  burstMax: 10,
  includePriority: true,
  priorityMin: 1,
  priorityMax: 5,
};

export default function RandomGeneratorModal({
  open,
  onClose,
  onGenerate,
}: RandomGeneratorModalProps) {
  const [count, setCount] = useState(DEFAULT.count);
  const [arrivalMin, setArrivalMin] = useState(DEFAULT.arrivalMin);
  const [arrivalMax, setArrivalMax] = useState(DEFAULT.arrivalMax);
  const [burstMin, setBurstMin] = useState(DEFAULT.burstMin);
  const [burstMax, setBurstMax] = useState(DEFAULT.burstMax);
  const [includePriority, setIncludePriority] = useState(DEFAULT.includePriority);
  const [priorityMin, setPriorityMin] = useState(DEFAULT.priorityMin);
  const [priorityMax, setPriorityMax] = useState(DEFAULT.priorityMax);

  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [open, onClose]);

  const handleGenerate = () => {
    const processes = generateRandomProcesses({
      count,
      arrivalMin,
      arrivalMax,
      burstMin,
      burstMax,
      includePriority,
      priorityMin,
      priorityMax,
    });
    onGenerate(processes);
    onClose();
  };

  if (!open) return null;

  const inputClass =
    'w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:ring-2 focus:ring-white/20 focus:border-neutral-500 outline-none';

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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-labelledby="random-gen-title"
          aria-modal="true"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <h2 id="random-gen-title" className="font-semibold text-white">
              Generate random processes
            </h2>
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

          <div className="px-5 py-4 space-y-4">
            <div>
              <label className="block font-mono text-[10px] text-white/50 uppercase tracking-wider mb-1">Number of processes (N)</label>
              <input
                type="number"
                min={1}
                max={50}
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[10px] text-white/50 uppercase tracking-wider mb-1">Arrival min</label>
                <input
                  type="number"
                  min={0}
                  value={arrivalMin}
                  onChange={(e) => setArrivalMin(Math.max(0, Number(e.target.value) || 0))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-white/50 uppercase tracking-wider mb-1">Arrival max</label>
                <input
                  type="number"
                  min={0}
                  value={arrivalMax}
                  onChange={(e) => setArrivalMax(Math.max(0, Number(e.target.value) || 0))}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[10px] text-white/50 uppercase tracking-wider mb-1">Burst min</label>
                <input
                  type="number"
                  min={1}
                  value={burstMin}
                  onChange={(e) => setBurstMin(Math.max(1, Number(e.target.value) || 1))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-white/50 uppercase tracking-wider mb-1">Burst max</label>
                <input
                  type="number"
                  min={1}
                  value={burstMax}
                  onChange={(e) => setBurstMax(Math.max(1, Number(e.target.value) || 1))}
                  className={inputClass}
                />
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includePriority}
                onChange={(e) => setIncludePriority(e.target.checked)}
                className="rounded border-white/30 bg-neutral-800 text-white focus:ring-white/20"
              />
              <span className="text-sm text-white/90">Include priority</span>
            </label>
            {includePriority && (
              <div className="grid grid-cols-2 gap-3 pl-6">
                <div>
                  <label className="block font-mono text-[10px] text-white/50 uppercase tracking-wider mb-1">Priority min</label>
                  <input
                    type="number"
                    min={0}
                    value={priorityMin}
                    onChange={(e) => setPriorityMin(Number(e.target.value) || 0)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] text-white/50 uppercase tracking-wider mb-1">Priority max</label>
                  <input
                    type="number"
                    min={0}
                    value={priorityMax}
                    onChange={(e) => setPriorityMax(Number(e.target.value) || 0)}
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="px-5 py-4 border-t border-white/10 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-white/20 text-white/80 font-mono text-sm hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              className="px-4 py-2 rounded-lg bg-white text-black font-display font-semibold text-sm hover:opacity-90"
            >
              Generate {count} processes
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
