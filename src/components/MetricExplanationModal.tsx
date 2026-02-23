'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Metrics, SimulateResponse, GanttEntry } from '@/types';

type MetricKey = keyof Metrics;

const METRIC_CONFIG: Record<
  MetricKey,
  { title: string; formula: string; breakdown: string; unit?: string }
> = {
  avgWaitingTime: {
    title: 'Average Waiting Time',
    formula: 'WT = Turnaround Time − Burst Time  →  Avg = Σ(WT) / n',
    breakdown: 'Waiting time is how long a process waits in the ready queue before it gets the CPU. Turnaround = Completion − Arrival; then WT = Turnaround − Burst.',
    unit: 'time units',
  },
  avgTurnaroundTime: {
    title: 'Average Turnaround Time',
    formula: 'TAT = Completion Time − Arrival Time  →  Avg = Σ(TAT) / n',
    breakdown: 'Turnaround time is the total time from when a process arrives until it finishes. It includes both waiting and execution time.',
    unit: 'time units',
  },
  avgResponseTime: {
    title: 'Average Response Time',
    formula: 'Response = First run start − Arrival Time  →  Avg = Σ(Response) / n',
    breakdown: 'Response time is how long until a process runs for the first time. It measures responsiveness (e.g. for interactive systems).',
    unit: 'time units',
  },
  throughput: {
    title: 'Throughput',
    formula: 'Throughput = n / T  where T = max(Completion Time)',
    breakdown: 'Number of processes completed per unit of time. Higher throughput means more work done in the same period.',
    unit: 'processes / time unit',
  },
  contextSwitches: {
    title: 'Context Switches',
    formula: 'Count of times the CPU switches from one process to another',
    breakdown: 'Each time the scheduler preempts or switches to a different process, a context switch occurs. It has overhead (saving/restoring state).',
    unit: '',
  },
};

function getFirstResponseTimes(ganttChart: GanttEntry[]): Map<number, number> {
  const first = new Map<number, number>();
  for (const e of ganttChart) {
    if (e.pid > 0 && !e.isContextSwitch && !first.has(e.pid)) {
      first.set(e.pid, e.start);
    }
  }
  return first;
}

interface MetricExplanationModalProps {
  open: boolean;
  onClose: () => void;
  metricKey: MetricKey | null;
  result: SimulateResponse | null;
}

export default function MetricExplanationModal({
  open,
  onClose,
  metricKey,
  result,
}: MetricExplanationModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!metricKey || !result) return null;

  const config = METRIC_CONFIG[metricKey];
  const value = result.metrics[metricKey];
  const n = result.processes.length;
  const firstResponseTimes = getFirstResponseTimes(result.ganttChart);
  const maxCT = Math.max(...result.processes.map((p) => p.completionTime), 0);

  const renderExample = () => {
    if (metricKey === 'avgWaitingTime') {
      const sum = result.processes.reduce((s, p) => s + p.waitingTime, 0);
      return (
        <div className="space-y-2">
          <p className="font-mono text-[10px] text-white/50 uppercase tracking-wider">Per process</p>
          <div className="rounded-lg border border-white/10 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-3 py-2 font-mono text-[10px] text-white/50 uppercase">PID</th>
                  <th className="px-3 py-2 font-mono text-[10px] text-white/50 uppercase">Arrival</th>
                  <th className="px-3 py-2 font-mono text-[10px] text-white/50 uppercase">Burst</th>
                  <th className="px-3 py-2 font-mono text-[10px] text-white/50 uppercase">Completion</th>
                  <th className="px-3 py-2 font-mono text-[10px] text-white/50 uppercase">Turnaround</th>
                  <th className="px-3 py-2 font-mono text-[10px] text-white/50 uppercase">Waiting</th>
                </tr>
              </thead>
              <tbody>
                {result.processes.map((p) => (
                  <tr key={p.pid} className="border-b border-white/5 last:border-0">
                    <td className="px-3 py-2 font-mono text-sm text-white/90">P{p.pid}</td>
                    <td className="px-3 py-2 font-mono text-sm text-white/70">{p.arrivalTime}</td>
                    <td className="px-3 py-2 font-mono text-sm text-white/70">{p.burstTime}</td>
                    <td className="px-3 py-2 font-mono text-sm text-white/70">{p.completionTime}</td>
                    <td className="px-3 py-2 font-mono text-sm text-white/70">{p.turnaroundTime}</td>
                    <td className="px-3 py-2 font-mono text-sm text-white font-medium">{p.waitingTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="font-mono text-xs text-white/60">
            Σ(WT) = {result.processes.map((p) => p.waitingTime).join(' + ')} = {sum}  →  Avg = {sum} / {n} = <strong className="text-white">{typeof value === 'number' ? value.toFixed(2) : value}</strong>
          </p>
        </div>
      );
    }

    if (metricKey === 'avgTurnaroundTime') {
      const sum = result.processes.reduce((s, p) => s + p.turnaroundTime, 0);
      return (
        <div className="space-y-2">
          <p className="font-mono text-[10px] text-white/50 uppercase tracking-wider">Per process</p>
          <div className="rounded-lg border border-white/10 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-3 py-2 font-mono text-[10px] text-white/50 uppercase">PID</th>
                  <th className="px-3 py-2 font-mono text-[10px] text-white/50 uppercase">Arrival</th>
                  <th className="px-3 py-2 font-mono text-[10px] text-white/50 uppercase">Completion</th>
                  <th className="px-3 py-2 font-mono text-[10px] text-white/50 uppercase">TAT = CT − Arrival</th>
                </tr>
              </thead>
              <tbody>
                {result.processes.map((p) => (
                  <tr key={p.pid} className="border-b border-white/5 last:border-0">
                    <td className="px-3 py-2 font-mono text-sm text-white/90">P{p.pid}</td>
                    <td className="px-3 py-2 font-mono text-sm text-white/70">{p.arrivalTime}</td>
                    <td className="px-3 py-2 font-mono text-sm text-white/70">{p.completionTime}</td>
                    <td className="px-3 py-2 font-mono text-sm text-white font-medium">{p.turnaroundTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="font-mono text-xs text-white/60">
            Σ(TAT) = {result.processes.map((p) => p.turnaroundTime).join(' + ')} = {sum}  →  Avg = {sum} / {n} = <strong className="text-white">{typeof value === 'number' ? value.toFixed(2) : value}</strong>
          </p>
        </div>
      );
    }

    if (metricKey === 'avgResponseTime') {
      const rows = result.processes.map((p) => {
        const first = firstResponseTimes.get(p.pid) ?? 0;
        const response = first - p.arrivalTime;
        return { pid: p.pid, arrival: p.arrivalTime, firstRun: first, response };
      });
      const sum = rows.reduce((s, r) => s + r.response, 0);
      return (
        <div className="space-y-2">
          <p className="font-mono text-[10px] text-white/50 uppercase tracking-wider">Per process (first time on CPU)</p>
          <div className="rounded-lg border border-white/10 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-3 py-2 font-mono text-[10px] text-white/50 uppercase">PID</th>
                  <th className="px-3 py-2 font-mono text-[10px] text-white/50 uppercase">Arrival</th>
                  <th className="px-3 py-2 font-mono text-[10px] text-white/50 uppercase">First run start</th>
                  <th className="px-3 py-2 font-mono text-[10px] text-white/50 uppercase">Response</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.pid} className="border-b border-white/5 last:border-0">
                    <td className="px-3 py-2 font-mono text-sm text-white/90">P{r.pid}</td>
                    <td className="px-3 py-2 font-mono text-sm text-white/70">{r.arrival}</td>
                    <td className="px-3 py-2 font-mono text-sm text-white/70">{r.firstRun}</td>
                    <td className="px-3 py-2 font-mono text-sm text-white font-medium">{r.response}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="font-mono text-xs text-white/60">
            Σ(Response) = {rows.map((r) => r.response).join(' + ')} = {sum}  →  Avg = {sum} / {n} = <strong className="text-white">{typeof value === 'number' ? value.toFixed(2) : value}</strong>
          </p>
        </div>
      );
    }

    if (metricKey === 'throughput') {
      return (
        <div className="space-y-2">
          <p className="font-mono text-[10px] text-white/50 uppercase tracking-wider">Calculation</p>
          <p className="font-mono text-sm text-white/70">
            n = {n} processes, max(Completion Time) = {maxCT.toFixed(0)} time units.
          </p>
          <p className="font-mono text-xs text-white/60">
            Throughput = n / T = {n} / {maxCT.toFixed(0)} = <strong className="text-white">{typeof value === 'number' ? value.toFixed(2) : value}</strong> processes per time unit.
          </p>
        </div>
      );
    }

    if (metricKey === 'contextSwitches') {
      return (
        <div className="space-y-2">
          <p className="font-mono text-[10px] text-white/50 uppercase tracking-wider">In this run</p>
          <p className="font-mono text-sm text-white/70">
            The scheduler switched between processes <strong className="text-white">{value}</strong> time{value !== 1 ? 's' : ''}. Each switch has overhead (saving registers, switching address space, etc.).
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            role="presentation"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
          />
          <motion.dialog
            open={open}
            onClose={onClose}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 z-[101] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl outline-none"
          >
            <div className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="font-display text-lg font-semibold text-white tracking-tight">
                  {config.title}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <p className="font-mono text-[10px] text-white/50 uppercase tracking-wider mb-1">Formula</p>
                  <p className="font-mono text-sm text-white/90">{config.formula}</p>
                </div>

                <div>
                  <p className="font-mono text-[10px] text-white/50 uppercase tracking-wider mb-1">What it means</p>
                  <p className="font-sans text-sm text-white/80 leading-relaxed">{config.breakdown}</p>
                </div>

                <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                  {renderExample()}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/10 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-white text-black font-display font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  Got it
                </button>
              </div>
            </div>
          </motion.dialog>
        </>
      )}
    </AnimatePresence>
  );
}
