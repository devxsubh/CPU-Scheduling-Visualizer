'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProcessInput, AlgorithmType } from '@/types';
import type { SavedScenario } from '@/lib/scenario-utils';

const inputClass =
  'w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white font-mono text-sm placeholder-neutral-500 focus:ring-2 focus:ring-white/20 focus:border-neutral-500 outline-none';

interface SavedScenariosModalProps {
  open: boolean;
  onClose: () => void;
  scenarioNameToSave: string;
  onScenarioNameChange: (value: string) => void;
  onSave: () => void;
  onExportCurrent: () => void;
  savedScenarios: SavedScenario[];
  loadScenarioId: string;
  onLoadScenarioIdChange: (id: string) => void;
  onLoadScenario: (id: string) => void;
  onExportSelected: () => void;
  /** When true, show "Export results" (CSV, JSON, PNG) for current simulation */
  hasResult?: boolean;
  onExportResultsCSV?: () => void;
  onExportResultsJSON?: () => void;
  onExportResultsPNG?: () => void;
}

export default function SavedScenariosModal({
  open,
  onClose,
  scenarioNameToSave,
  onScenarioNameChange,
  onSave,
  onExportCurrent,
  savedScenarios,
  loadScenarioId,
  onLoadScenarioIdChange,
  onLoadScenario,
  onExportSelected,
  hasResult,
  onExportResultsCSV,
  onExportResultsJSON,
  onExportResultsPNG,
}: SavedScenariosModalProps) {
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
          className="bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-labelledby="saved-scenarios-title"
          aria-modal="true"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <h2 id="saved-scenarios-title" className="font-semibold text-white">
              Saved scenarios & Export
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
            <p className="text-white/50 text-xs">
              Same scenario (name + processes + algorithm + quantum + context switch) for Save and Export.
            </p>

            <div>
              <label className="block font-mono text-[10px] text-white/50 uppercase tracking-wider mb-1">Scenario name</label>
              <input
                type="text"
                value={scenarioNameToSave}
                onChange={(e) => onScenarioNameChange(e.target.value)}
                placeholder="Scenario name"
                className={inputClass}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onSave}
                className="px-4 py-2 rounded-lg border border-white/20 text-white/80 font-mono text-sm hover:bg-white/10"
                title="Save current config to browser (localStorage)"
              >
                Save to browser
              </button>
              <button
                type="button"
                onClick={onExportCurrent}
                className="px-4 py-2 rounded-lg bg-white text-black font-display font-semibold text-sm hover:opacity-90"
                title="Download current config as JSON"
              >
                Export to file
              </button>
            </div>

            <div className="pt-3 border-t border-white/10">
              <label className="block font-mono text-[10px] text-white/50 uppercase tracking-wider mb-2">Load saved scenario</label>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={loadScenarioId}
                  onChange={(e) => {
                    const id = e.target.value;
                    onLoadScenarioIdChange(id);
                    if (id) onLoadScenario(id);
                  }}
                  className="flex-1 min-w-0 rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-white font-mono text-sm focus:ring-2 focus:ring-white/20 focus:border-neutral-500 outline-none"
                >
                  <option value="">Select…</option>
                  {savedScenarios.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={onExportSelected}
                  disabled={!loadScenarioId}
                  className="px-4 py-2 rounded-lg border border-white/20 text-white/80 font-mono text-sm hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Export selected scenario to file"
                >
                  Export selected
                </button>
              </div>
            </div>

            {hasResult && (onExportResultsCSV != null || onExportResultsJSON != null || onExportResultsPNG != null) && (
              <div className="pt-3 border-t border-white/10">
                <p className="font-mono text-[10px] text-white/50 uppercase tracking-wider mb-2">Export results</p>
                <div className="flex flex-wrap gap-2">
                  {onExportResultsCSV && (
                    <button
                      type="button"
                      onClick={() => { onExportResultsCSV(); onClose(); }}
                      className="px-4 py-2 rounded-lg border border-white/20 text-white/80 font-mono text-sm hover:bg-white/10"
                      title="Download results as CSV"
                    >
                      CSV
                    </button>
                  )}
                  {onExportResultsJSON && (
                    <button
                      type="button"
                      onClick={() => { onExportResultsJSON(); onClose(); }}
                      className="px-4 py-2 rounded-lg border border-white/20 text-white/80 font-mono text-sm hover:bg-white/10"
                      title="Download results as JSON"
                    >
                      JSON
                    </button>
                  )}
                  {onExportResultsPNG && (
                    <button
                      type="button"
                      onClick={() => { onExportResultsPNG(); onClose(); }}
                      className="px-4 py-2 rounded-lg border border-white/20 text-white/80 font-mono text-sm hover:bg-white/10"
                      title="Download Gantt chart as PNG"
                    >
                      PNG
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
