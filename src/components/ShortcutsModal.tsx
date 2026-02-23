'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShortcutRow {
  keys: string[];
  description: string;
}

const SHORTCUTS: ShortcutRow[] = [
  { keys: ['Space'], description: 'Play / Pause step animation' },
  { keys: ['←'], description: 'Previous step' },
  { keys: ['→'], description: 'Next step' },
  { keys: ['R'], description: 'Reset to show all steps' },
];

interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-labelledby="shortcuts-title"
          aria-modal="true"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <h2 id="shortcuts-title" className="font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1v-1M4 12H3v-1m18 0h-1v-1M3 12c0-5 4-9 9-9s9 4 9 9-4 9-9 9m0-9v1m0 16v-1" />
              </svg>
              Keyboard shortcuts
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
          <div className="px-5 py-4 space-y-3">
            {SHORTCUTS.map(({ keys, description }) => (
              <div
                key={description}
                className="flex items-center justify-between gap-4 py-1"
              >
                <span className="text-white/80 text-sm">{description}</span>
                <span className="flex items-center gap-1.5 flex-shrink-0">
                  {keys.map((k) => (
                    <kbd
                      key={k}
                      className="px-2.5 py-1 rounded-md bg-white/10 border border-white/20 font-mono text-xs text-white"
                    >
                      {k}
                    </kbd>
                  ))}
                </span>
              </div>
            ))}
            <p className="text-white/40 text-xs pt-2 border-t border-white/10 mt-3">
              Shortcuts apply when focus is not inside an input field.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
