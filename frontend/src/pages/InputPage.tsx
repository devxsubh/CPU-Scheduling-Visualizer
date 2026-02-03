import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProcessInput, AlgorithmType } from '../types';
import type { SimulateResponse } from '../types';

const ALGORITHMS: { value: AlgorithmType; label: string }[] = [
  { value: 'fcfs', label: 'FCFS (First Come First Serve)' },
  { value: 'sjf', label: 'SJF (Shortest Job First)' },
  { value: 'round_robin', label: 'Round Robin' },
  { value: 'priority', label: 'Priority Scheduling' },
];

const defaultProcess: ProcessInput = {
  pid: 1,
  arrivalTime: 0,
  burstTime: 4,
  priority: 1,
};

interface InputPageProps {
  onBack: () => void;
  onResult: (r: SimulateResponse) => void;
}

export default function InputPage({ onBack, onResult }: InputPageProps) {
  const [processes, setProcesses] = useState<ProcessInput[]>([
    { ...defaultProcess },
    { pid: 2, arrivalTime: 1, burstTime: 3, priority: 2 },
    { pid: 3, arrivalTime: 2, burstTime: 1, priority: 1 },
  ]);
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('round_robin');
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addProcess = useCallback(() => {
    const nextPid = Math.max(0, ...processes.map((p) => p.pid)) + 1;
    setProcesses((prev) => [...prev, { pid: nextPid, arrivalTime: 0, burstTime: 1, priority: 1 }]);
  }, [processes]);

  const removeProcess = useCallback((pid: number) => {
    if (processes.length <= 1) return;
    setProcesses((prev) => prev.filter((p) => p.pid !== pid));
  }, [processes.length]);

  const updateProcess = useCallback((pid: number, field: keyof ProcessInput, value: number) => {
    setProcesses((prev) =>
      prev.map((p) => (p.pid === pid ? { ...p, [field]: value } : p))
    );
  }, []);

  const runSimulation = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          algorithm,
          timeQuantum: algorithm === 'round_robin' ? timeQuantum : undefined,
          processes,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const data: SimulateResponse = await res.json();
      onResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen py-8 px-4 sm:px-6 max-w-4xl mx-auto"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-8">
        <button
          type="button"
          onClick={onBack}
          className="text-slate-400 hover:text-white transition-colors font-mono text-sm"
        >
          ← Back
        </button>
        <h2 className="font-display text-xl font-semibold text-white">Process & Algorithm</h2>
        <div className="w-14" />
      </div>

      <div className="space-y-6">
        <motion.div
          className="rounded-xl bg-dark-800/80 border border-slate-700/50 p-4 sm:p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono text-sm font-medium text-slate-300">Processes</h3>
            <button
              type="button"
              onClick={addProcess}
              className="px-3 py-1.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-colors"
            >
              + Add process
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="pb-2 pr-4">PID</th>
                  <th className="pb-2 pr-4">Arrival</th>
                  <th className="pb-2 pr-4">Burst</th>
                  {algorithm === 'priority' && <th className="pb-2 pr-4">Priority</th>}
                  <th className="pb-2 w-10" />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {processes.map((p) => (
                    <motion.tr
                      key={p.pid}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-b border-slate-800"
                    >
                      <td className="py-2 pr-4 font-mono text-slate-300">{p.pid}</td>
                      <td className="py-2 pr-4">
                        <input
                          type="number"
                          min={0}
                          value={p.arrivalTime}
                          onChange={(e) => updateProcess(p.pid, 'arrivalTime', Number(e.target.value) || 0)}
                          className="w-20 bg-dark-900 border border-slate-600 rounded px-2 py-1 text-white font-mono focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </td>
                      <td className="py-2 pr-4">
                        <input
                          type="number"
                          min={1}
                          value={p.burstTime}
                          onChange={(e) => updateProcess(p.pid, 'burstTime', Math.max(1, Number(e.target.value) || 1))}
                          className="w-20 bg-dark-900 border border-slate-600 rounded px-2 py-1 text-white font-mono focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </td>
                      {algorithm === 'priority' && (
                        <td className="py-2 pr-4">
                          <input
                            type="number"
                            min={0}
                            value={p.priority ?? 0}
                            onChange={(e) => updateProcess(p.pid, 'priority', Number(e.target.value) || 0)}
                            className="w-20 bg-dark-900 border border-slate-600 rounded px-2 py-1 text-white font-mono focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </td>
                      )}
                      <td className="py-2">
                        <button
                          type="button"
                          onClick={() => removeProcess(p.pid)}
                          disabled={processes.length <= 1}
                          className="text-red-400 hover:text-red-300 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                        >
                          Remove
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          className="rounded-xl bg-dark-800/80 border border-slate-700/50 p-4 sm:p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-mono text-sm font-medium text-slate-300 mb-3">Algorithm</h3>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as AlgorithmType)}
            className="w-full max-w-xs bg-dark-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white font-mono focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {ALGORITHMS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
          {algorithm === 'round_robin' && (
            <motion.div
              className="mt-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-slate-400 text-sm mb-1">Time quantum (ms)</label>
              <input
                type="number"
                min={1}
                value={timeQuantum}
                onChange={(e) => setTimeQuantum(Math.max(1, Number(e.target.value) || 1))}
                className="w-24 bg-dark-900 border border-slate-600 rounded px-3 py-2 text-white font-mono focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </motion.div>
          )}
        </motion.div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-sm font-mono"
          >
            {error}
          </motion.p>
        )}

        <motion.button
          className="w-full py-4 rounded-xl bg-primary-500 text-dark-950 font-semibold text-lg font-display hover:bg-primary-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          onClick={runSimulation}
          disabled={loading}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={!loading ? { scale: 1.01 } : {}}
          whileTap={!loading ? { scale: 0.99 } : {}}
        >
          {loading ? 'Simulating…' : 'Simulate'}
        </motion.button>
      </div>
    </motion.div>
  );
}
