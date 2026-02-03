import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import GanttChart from '../components/GanttChart';
import type { SimulateResponse, AlgorithmType } from '../types';

const ALG_LABELS: Record<AlgorithmType, string> = {
  fcfs: 'FCFS',
  sjf: 'SJF',
  round_robin: 'Round Robin',
  priority: 'Priority',
};

interface ResultsProps {
  result: SimulateResponse;
  onTryAgain: () => void;
  onBack: () => void;
}

export default function Results({ result, onTryAgain, onBack }: ResultsProps) {
  const maxTime = useMemo(() => {
    if (result.ganttChart.length === 0) return 1;
    return Math.max(...result.ganttChart.map((e) => e.end), 1);
  }, [result.ganttChart]);

  const chartData = useMemo(
    () =>
      result.processes.map((p) => ({
        name: `P${p.pid}`,
        waiting: p.waitingTime,
        turnaround: p.turnaroundTime,
      })),
    [result.processes]
  );

  const switched = result.chosenAlgorithm !== result.usedAlgorithm;

  return (
    <motion.div
      className="min-h-screen py-8 px-4 sm:px-6 max-w-5xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex items-center justify-between mb-8">
        <button
          type="button"
          onClick={onBack}
          className="text-slate-400 hover:text-white transition-colors font-mono text-sm"
        >
          ← Home
        </button>
        <h2 className="font-display text-xl font-semibold text-white">Results</h2>
        <button
          type="button"
          onClick={onTryAgain}
          className="text-primary-400 hover:text-primary-300 font-mono text-sm"
        >
          Try again
        </button>
      </div>

      {switched && (
        <motion.div
          className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="font-semibold text-amber-400 mb-1">Algorithm auto-switched</p>
          <p className="text-slate-300 text-sm">{result.reasonSwitched}</p>
          <p className="text-slate-500 text-xs mt-2">
            Chosen: {ALG_LABELS[result.chosenAlgorithm]} → Used: {ALG_LABELS[result.usedAlgorithm]}
          </p>
        </motion.div>
      )}

      <div className="grid gap-6 sm:grid-cols-3 mb-8">
        {[
          { label: 'Avg waiting time', value: result.metrics.avgWaitingTime.toFixed(2), unit: 'ms' },
          { label: 'Avg turnaround time', value: result.metrics.avgTurnaroundTime.toFixed(2), unit: 'ms' },
          { label: 'Context switches', value: String(result.metrics.contextSwitches), unit: '' },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            className="rounded-xl bg-dark-800/80 border border-slate-700/50 p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <p className="text-slate-400 text-sm font-mono">{m.label}</p>
            <p className="text-2xl font-display font-semibold text-white mt-1">
              {m.value}
              {m.unit && <span className="text-slate-500 text-base ml-1">{m.unit}</span>}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.section
        className="rounded-xl bg-dark-800/80 border border-slate-700/50 p-4 sm:p-6 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <h3 className="font-mono text-sm font-medium text-slate-300 mb-4">Gantt chart</h3>
        <GanttChart data={result.ganttChart} maxTime={maxTime} />
      </motion.section>

      <motion.section
        className="rounded-xl bg-dark-800/80 border border-slate-700/50 p-4 sm:p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="font-mono text-sm font-medium text-slate-300 mb-4">Per-process waiting & turnaround</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
                labelStyle={{ color: '#cbd5e1' }}
                formatter={(value: number) => [`${value} ms`, '']}
                labelFormatter={(label) => `Process ${label}`}
              />
              <Bar dataKey="waiting" name="Waiting" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="turnaround" name="Turnaround" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.section>

      <motion.div
        className="mt-8 flex gap-4 justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <button
          type="button"
          onClick={onTryAgain}
          className="px-6 py-3 rounded-xl bg-primary-500 text-dark-950 font-semibold hover:bg-primary-400 transition-colors"
        >
          Compare with another algorithm
        </button>
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors"
        >
          Back to home
        </button>
      </motion.div>
    </motion.div>
  );
}
