import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import LocomotiveScroll from '@/components/LocomotiveScroll';
import type { ProcessInput, AlgorithmType, SimulateResponse } from '@/types';

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

const inputClass =
  'w-full max-w-[5.5rem] bg-white border border-neutral-200 rounded-xl px-3 py-2.5 text-neutral-900 font-mono text-sm placeholder-neutral-400 focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 outline-none transition-all duration-200';

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

  const headerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const processesRef = useRef<HTMLDivElement>(null);
  const algorithmRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(headerRef.current, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5 })
      .fromTo(titleRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
      .fromTo(lineRef.current, { scaleX: 0 }, { scaleX: 1, duration: 0.4, transformOrigin: 'left' }, '-=0.25')
      .fromTo(processesRef.current, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2')
      .fromTo(algorithmRef.current, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.35')
      .fromTo(ctaRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3');
  }, []);

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
      className="min-h-screen bg-neutral-50 text-neutral-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <LocomotiveScroll className="min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-10 py-12 sm:py-20">
          {/* Header */}
          <div ref={headerRef} className="flex items-center justify-between mb-14 sm:mb-20 opacity-0">
            <button
              type="button"
              onClick={onBack}
              className="font-mono text-[11px] sm:text-xs tracking-[0.2em] text-neutral-500 hover:text-neutral-900 transition-colors uppercase"
            >
              ← Back
            </button>
          </div>

          {/* Title */}
          <div className="mb-12">
            <p className="font-mono text-[11px] tracking-[0.25em] text-neutral-400 uppercase mb-4">
              Step 01
            </p>
            <h1
              ref={titleRef}
              className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-neutral-900 tracking-[-0.03em] leading-[1.1] opacity-0"
            >
              Process & Algorithm
            </h1>
            <span
              ref={lineRef}
              className="block h-0.5 w-16 bg-neutral-900 rounded-full mt-5 origin-left"
              style={{ transform: 'scaleX(0)' }}
            />
          </div>

          {/* Processes */}
          <section ref={processesRef} className="mb-12 opacity-0">
            <div className="flex items-end justify-between gap-4 mb-5">
              <span className="font-mono text-[11px] tracking-[0.2em] text-neutral-500 uppercase">
                Processes
              </span>
              <motion.button
                type="button"
                onClick={addProcess}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-neutral-900 text-neutral-900 font-display font-semibold text-sm tracking-tight hover:bg-neutral-900 hover:text-white transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-lg leading-none">+</span>
                Add process
              </motion.button>
            </div>
            <div className="rounded-2xl bg-white border border-neutral-200/80 shadow-sm shadow-neutral-200/50 overflow-hidden">
              <div
                className={`grid gap-x-4 gap-y-0 px-5 sm:px-6 py-4 border-b border-neutral-100 font-mono text-[11px] tracking-wider text-neutral-500 uppercase ${
                  algorithm === 'priority'
                    ? 'grid-cols-[auto_1fr_1fr_1fr_auto]'
                    : 'grid-cols-[auto_1fr_1fr_auto]'
                }`}
              >
                <div className="py-2">PID</div>
                <div>Arrival</div>
                <div>Burst</div>
                {algorithm === 'priority' && <div>Priority</div>}
                <div className="w-16" />
              </div>
              <AnimatePresence mode="popLayout">
                {processes.map((p) => (
                  <motion.div
                    key={p.pid}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className={`grid gap-x-4 gap-y-3 px-5 sm:px-6 py-4 items-center border-b border-neutral-100 last:border-0 hover:bg-neutral-50/80 transition-colors ${
                      algorithm === 'priority'
                        ? 'grid-cols-[auto_1fr_1fr_1fr_auto]'
                        : 'grid-cols-[auto_1fr_1fr_auto]'
                    }`}
                  >
                    <span className="font-mono text-sm font-medium text-neutral-700 tabular-nums">
                      P{p.pid}
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={p.arrivalTime}
                      onChange={(e) => updateProcess(p.pid, 'arrivalTime', Number(e.target.value) || 0)}
                      className={inputClass}
                    />
                    <input
                      type="number"
                      min={1}
                      value={p.burstTime}
                      onChange={(e) => updateProcess(p.pid, 'burstTime', Math.max(1, Number(e.target.value) || 1))}
                      className={inputClass}
                    />
                    {algorithm === 'priority' && (
                      <input
                        type="number"
                        min={0}
                        value={p.priority ?? 0}
                        onChange={(e) => updateProcess(p.pid, 'priority', Number(e.target.value) || 0)}
                        className={inputClass}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeProcess(p.pid)}
                      disabled={processes.length <= 1}
                      className="font-mono text-[11px] text-neutral-400 hover:text-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors py-2"
                    >
                      Remove
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

          {/* Algorithm */}
          <section ref={algorithmRef} className="mb-14 opacity-0">
            <span className="font-mono text-[11px] tracking-[0.2em] text-neutral-500 uppercase block mb-4">
              Algorithm
            </span>
            <div className="rounded-2xl bg-white border border-neutral-200/80 shadow-sm shadow-neutral-200/50 p-5 sm:p-6">
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value as AlgorithmType)}
                className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3.5 text-neutral-900 font-mono text-sm focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 outline-none transition-all appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23737373'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1.25rem',
                  paddingRight: '2.5rem',
                }}
              >
                {ALGORITHMS.map((a) => (
                  <option key={a.value} value={a.value} className="bg-white text-neutral-900">
                    {a.label}
                  </option>
                ))}
              </select>
              <AnimatePresence mode="wait">
                {algorithm === 'round_robin' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-4 pt-4 border-t border-neutral-100"
                  >
                    <label className="block font-mono text-[11px] text-neutral-500 tracking-wider uppercase mb-2">
                      Time quantum (ms)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={timeQuantum}
                      onChange={(e) => setTimeQuantum(Math.max(1, Number(e.target.value) || 1))}
                      className={`${inputClass} max-w-[6rem]`}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-sm text-neutral-600 mb-4"
            >
              {error}
            </motion.p>
          )}

          <div
            ref={ctaRef}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-center opacity-0"
          >
            <motion.button
              type="button"
              onClick={runSimulation}
              disabled={loading}
              className="flex-1 sm:flex-none sm:min-w-[220px] py-4 px-8 rounded-full bg-neutral-900 text-white font-display font-semibold text-base tracking-tight hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              {loading ? 'Simulating…' : 'Simulate'}
            </motion.button>
            <p className="font-mono text-[11px] text-neutral-400 text-center sm:text-left">
              Runs in your browser · no data sent
            </p>
          </div>
        </div>
      </LocomotiveScroll>
    </motion.div>
  );
}
