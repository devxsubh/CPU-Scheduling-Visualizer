'use client';

import { motion } from 'framer-motion';

export type ProcessState = 'new' | 'ready' | 'running' | 'waiting' | 'terminated';

export interface ProcessStateCounts {
  new: number;
  ready: number;
  running: number;
  waiting: number;
  terminated: number;
}

interface ProcessStateDiagramProps {
  counts: ProcessStateCounts;
  /** Which state to highlight (e.g. the one with activity this step) */
  highlight?: ProcessState | null;
  className?: string;
}

const STATE_ORDER: ProcessState[] = ['new', 'ready', 'running', 'waiting', 'terminated'];
const STATE_LABELS: Record<ProcessState, string> = {
  new: 'New',
  ready: 'Ready',
  running: 'Running',
  waiting: 'Waiting',
  terminated: 'Terminated',
};

export default function ProcessStateDiagram({ counts, highlight, className = '' }: ProcessStateDiagramProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider mr-1">Process states</span>
      <div className="flex flex-wrap items-center gap-1.5" role="img" aria-label="Process state diagram">
        {STATE_ORDER.map((state, i) => {
          const count = counts[state];
          const isHighlight = highlight === state && count > 0;
          return (
            <span key={state} className="flex items-center gap-1">
              {i > 0 && <span className="text-white/30 text-xs">→</span>}
              <motion.span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md font-mono text-xs ${
                  isHighlight
                    ? 'bg-white/20 text-white border border-white/40'
                    : 'bg-white/5 text-white/70 border border-white/10'
                }`}
                animate={isHighlight ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 0.4 }}
              >
                {STATE_LABELS[state]}
                <span className="text-white/50 tabular-nums">({count})</span>
              </motion.span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
