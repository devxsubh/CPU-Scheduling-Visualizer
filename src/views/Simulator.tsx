'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart } from '@mui/x-charts/BarChart';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import GanttChart from '@/components/GanttChart';
import Checkbox from '@/components/Checkbox';
import type { ProcessInput, AlgorithmType, SimulateResponse } from '@/types';
import { PRESETS } from '@/lib/simulator-presets';
import { downloadCSV, downloadGanttPNG } from '@/lib/export-utils';
import { parseSimulatorSearchParams, buildSimulatorSearchParams } from '@/lib/url-state';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const ALGORITHMS: { value: AlgorithmType; label: string; shortLabel: string; description: string }[] = [
  { value: 'fcfs', label: 'First Come First Serve', shortLabel: 'FCFS', description: 'Processes executed in arrival order' },
  { value: 'sjf', label: 'Shortest Job First', shortLabel: 'SJF', description: 'Shortest burst time executed first' },
  { value: 'round_robin', label: 'Round Robin', shortLabel: 'RR', description: 'Time-sliced execution with quantum' },
  { value: 'priority', label: 'Priority Scheduling', shortLabel: 'PRI', description: 'Higher priority processes first' },
];

const ALG_LABELS: Record<AlgorithmType, string> = {
  fcfs: 'FCFS',
  sjf: 'SJF',
  round_robin: 'Round Robin',
  priority: 'Priority',
};

const inputClass =
  'w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white font-mono text-sm placeholder-neutral-500 focus:ring-2 focus:ring-white/20 focus:border-neutral-500 outline-none transition-all duration-200';

const DEFAULT_PROCESSES: ProcessInput[] = [
  { pid: 1, arrivalTime: 0, burstTime: 4, priority: 1 },
  { pid: 2, arrivalTime: 1, burstTime: 3, priority: 2 },
  { pid: 3, arrivalTime: 2, burstTime: 1, priority: 1 },
];

export default function Simulator() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [processes, setProcesses] = useState<ProcessInput[]>(DEFAULT_PROCESSES);
  const [algorithm, setAlgorithm] = useState<AlgorithmType | ''>('');
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [result, setResult] = useState<SimulateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [algorithmB, setAlgorithmB] = useState<AlgorithmType | ''>('');
  const [resultB, setResultB] = useState<SimulateResponse | null>(null);
  const [stepIndex, setStepIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const ganttRef = useRef<HTMLDivElement>(null);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasAppliedUrlRef = useRef(false);

  // Apply URL state on mount (client-only)
  useEffect(() => {
    if (hasAppliedUrlRef.current) return;
    const state = parseSimulatorSearchParams(searchParams);
    if (state) {
      hasAppliedUrlRef.current = true;
      setProcesses(state.processes);
      setAlgorithm(state.algorithm!);
      setTimeQuantum(state.timeQuantum);
    }
  }, [searchParams]);

  // Sync state to URL when algorithm, timeQuantum, or processes change
  useEffect(() => {
    const query = buildSimulatorSearchParams(algorithm, timeQuantum, processes);
    const current = searchParams.toString();
    if (query === current) return;
    // Don't clear URL on first load when we have URL params but state not yet applied
    if (current && !query) return;
    const next = query ? `${pathname}?${query}` : pathname;
    router.replace(next, { scroll: false });
  }, [algorithm, timeQuantum, processes, pathname, router, searchParams]);

  const copyShareLink = useCallback(() => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedAlgorithm = ALGORITHMS.find((a) => a.value === algorithm);

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

  // Real-time simulation with debouncing
  const runSimulation = useCallback(async () => {
    if (!algorithm) return; // Don't run if no algorithm selected
    
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
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Simulation failed');
    } finally {
      setLoading(false);
    }
  }, [algorithm, timeQuantum, processes]);

  // Auto-run simulation on input changes (only when algorithm is selected)
  useEffect(() => {
    if (!algorithm) {
      setResult(null);
      return;
    }
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      runSimulation();
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [runSimulation, algorithm]);

  // Run second simulation when in compare mode
  const runSimulationB = useCallback(async () => {
    if (!algorithmB || !compareMode) return;
    setError(null);
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          algorithm: algorithmB,
          timeQuantum: algorithmB === 'round_robin' ? timeQuantum : undefined,
          processes,
        }),
      });
      if (!res.ok) throw new Error('Simulation B failed');
      const data: SimulateResponse = await res.json();
      setResultB(data);
    } catch {
      setResultB(null);
    }
  }, [algorithmB, compareMode, timeQuantum, processes]);

  useEffect(() => {
    if (!compareMode || !algorithmB) {
      setResultB(null);
      return;
    }
    const t = setTimeout(runSimulationB, 300);
    return () => clearTimeout(t);
  }, [compareMode, algorithmB, runSimulationB]);

  // Reset step index when result changes
  useEffect(() => {
    if (result) setStepIndex(-1);
  }, [result?.ganttChart?.length]);

  useEffect(() => {
    if (!playing || !result?.ganttChart?.length) return;
    const total = result.ganttChart.length;
    playIntervalRef.current = setInterval(() => {
      setStepIndex((i) => {
        if (i >= total - 1) {
          if (playIntervalRef.current) clearInterval(playIntervalRef.current);
          setPlaying(false);
          return total - 1;
        }
        return i + 1;
      });
    }, 800);
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [playing, result?.ganttChart?.length]);

  const maxTime = useMemo(() => {
    if (!result || result.ganttChart.length === 0) return 1;
    return Math.max(...result.ganttChart.map((e) => e.end), 1);
  }, [result]);

  const stepSlice = useMemo(() => {
    if (!result?.ganttChart?.length || stepIndex < 0) return [];
    return result.ganttChart.slice(0, stepIndex + 1);
  }, [result?.ganttChart, stepIndex]);

  const stepDisplayGantt = stepIndex >= 0 && stepSlice.length > 0 ? stepSlice : result?.ganttChart ?? [];
  const stepDisplayMaxTime = useMemo(() => {
    if (stepDisplayGantt.length === 0) return 1;
    return Math.max(...stepDisplayGantt.map((e) => e.end), 1);
  }, [stepDisplayGantt]);

  const currentStepEntry = useMemo(() => {
    if (!result?.ganttChart?.length || stepIndex < 0 || stepIndex >= result.ganttChart.length) return null;
    return result.ganttChart[stepIndex];
  }, [result?.ganttChart, stepIndex]);

  const readyQueueAtStep = useMemo(() => {
    if (!currentStepEntry || !result?.processes) return [];
    const t = currentStepEntry.start;
    return result.processes
      .filter((p) => p.arrivalTime <= t && p.completionTime > t)
      .map((p) => p.pid)
      .sort((a, b) => a - b);
  }, [currentStepEntry, result?.processes]);

  const chartData = useMemo(() => {
    if (!result) return [];
    return result.processes.map((p) => ({
      name: `P${p.pid}`,
      waiting: p.waitingTime,
      turnaround: p.turnaroundTime,
    }));
  }, [result]);

  const { cpuUtilizationPercent, totalBusyTime } = useMemo(() => {
    if (!result?.ganttChart?.length || maxTime <= 0) return { cpuUtilizationPercent: 0, totalBusyTime: 0 };
    const busy = result.ganttChart.reduce((sum, e) => sum + (e.end - e.start), 0);
    return {
      totalBusyTime: busy,
      cpuUtilizationPercent: Math.round((busy / maxTime) * 100),
    };
  }, [result?.ganttChart, maxTime]);

  const switched = result && result.chosenAlgorithm !== result.usedAlgorithm;

  return (
    <motion.div
      className="min-h-screen bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-8 py-4 bg-black/80 backdrop-blur-md border-b border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <img src="/favicon.svg" alt="CPU Scheduler" className="w-8 h-8" />
          <span className="font-display font-semibold text-white text-lg hidden sm:block">CPU Scheduler</span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={copyShareLink}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/20 text-white/80 font-mono text-xs hover:bg-white/10 hover:text-white transition-all"
            title="Copy shareable link"
          >
            {shareCopied ? (
              <>
                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share link
              </>
            )}
          </button>
          {loading && (
            <span className="text-white/50 text-sm font-mono">Simulating...</span>
          )}
          <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : result ? 'bg-green-400' : 'bg-white/30'}`} />
        </div>
      </header>

      <div className="pt-20 flex flex-col lg:flex-row min-h-screen">
        {/* Left Panel - Inputs */}
        <div className="lg:w-[420px] xl:w-[480px] flex-shrink-0 border-r border-white/10 p-6 lg:p-8 lg:h-[calc(100vh-80px)] lg:overflow-y-auto">
          <div className="mb-8">
            <p className="font-mono text-[11px] tracking-[0.25em] text-white/40 uppercase mb-2">
              Configuration
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Process & Algorithm
            </h1>
          </div>

          {/* Algorithm Selection */}
          <section className="mb-8">
            <span className="font-mono text-[11px] tracking-[0.2em] text-white/50 uppercase block mb-3">
              Algorithm
            </span>
            <div ref={dropdownRef} className="relative">
              {/* Dropdown Trigger */}
              <motion.button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full bg-neutral-900 border rounded-xl px-4 py-3.5 text-left transition-all duration-200 ${
                  isDropdownOpen 
                    ? 'border-white/30 ring-2 ring-white/10' 
                    : 'border-white/10 hover:border-white/20'
                }`}
                whileTap={{ scale: 0.995 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedAlgorithm ? (
                      <>
                        <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-mono text-xs text-white/80">
                          {selectedAlgorithm.shortLabel}
                        </span>
                        <div>
                          <p className="text-white font-medium text-sm">{selectedAlgorithm.label}</p>
                          <p className="text-white/40 text-xs">{selectedAlgorithm.description}</p>
                        </div>
                      </>
                    ) : (
                      <span className="text-white/50 text-sm">Choose an algorithm...</span>
                    )}
                  </div>
                  <motion.svg 
                    className="w-5 h-5 text-white/40" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </div>
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute z-50 w-full mt-2 bg-neutral-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50"
                  >
                    {ALGORITHMS.map((a, index) => (
                      <motion.button
                        key={a.value}
                        type="button"
                        onClick={() => {
                          setAlgorithm(a.value);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left transition-all duration-150 flex items-center gap-3 ${
                          algorithm === a.value 
                            ? 'bg-white/10' 
                            : 'hover:bg-white/5'
                        } ${index !== ALGORITHMS.length - 1 ? 'border-b border-white/5' : ''}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        whileHover={{ x: 4 }}
                      >
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs transition-colors ${
                          algorithm === a.value 
                            ? 'bg-white text-black' 
                            : 'bg-white/10 text-white/60'
                        }`}>
                          {a.shortLabel}
                        </span>
                        <div className="flex-1">
                          <p className={`font-medium text-sm ${algorithm === a.value ? 'text-white' : 'text-white/80'}`}>
                            {a.label}
                          </p>
                          <p className="text-white/40 text-xs">{a.description}</p>
                        </div>
                        {algorithm === a.value && (
                          <motion.svg
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-5 h-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </motion.svg>
                        )}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Time Quantum for Round Robin */}
            <AnimatePresence mode="wait">
              {algorithm === 'round_robin' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-4"
                >
                  <label className="block font-mono text-[11px] text-white/50 tracking-wider uppercase mb-2">
                    Time Quantum (ms)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={timeQuantum}
                    onChange={(e) => setTimeQuantum(Math.max(1, Number(e.target.value) || 1))}
                    className={`${inputClass} max-w-[100px]`}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Compare mode & Algorithm B - boxed so it stands out */}
            <div className="mt-4 p-4 rounded-xl bg-white/[0.04] border border-white/10 flex flex-wrap items-center gap-4">
              <Checkbox
                checked={compareMode}
                onChange={(checked) => {
                  setCompareMode(checked);
                  if (!checked) setAlgorithmB('');
                }}
                label="Compare two algorithms"
              />
              {compareMode && (
                <div className="relative">
                  <select
                    value={algorithmB}
                    onChange={(e) => setAlgorithmB((e.target.value || '') as AlgorithmType | '')}
                    className="w-full min-w-[180px] pl-4 pr-10 py-2.5 rounded-lg bg-neutral-800/90 border border-white/15 text-white font-mono text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select second algorithm...</option>
                    {ALGORITHMS.filter((a) => a.value !== algorithm).map((a) => (
                      <option key={a.value} value={a.value}>{a.shortLabel} – {a.label}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/50" aria-hidden>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Presets */}
          <section className="mb-6">
            <span className="font-mono text-[11px] tracking-[0.2em] text-white/50 uppercase block mb-2">
              Quick load
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <motion.button
                  key={preset.name}
                  type="button"
                  onClick={() => setProcesses(preset.getProcesses())}
                  className="px-3 py-2 rounded-lg border border-white/15 bg-white/5 text-white/80 font-mono text-xs hover:bg-white/10 hover:border-white/25 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title={preset.description}
                >
                  {preset.name}
                </motion.button>
              ))}
            </div>
          </section>

          {/* Processes */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[11px] tracking-[0.2em] text-white/50 uppercase">
                Processes
              </span>
              <motion.button
                type="button"
                onClick={addProcess}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 text-white/80 font-mono text-xs hover:bg-white/5 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-base leading-none">+</span>
                Add
              </motion.button>
            </div>
            <div className="rounded-xl bg-neutral-900/50 border border-white/10 overflow-hidden">
              <div
                className={`grid gap-2 px-4 py-3 border-b border-white/10 font-mono text-[10px] tracking-wider text-white/40 uppercase ${
                  algorithm === 'priority' ? 'grid-cols-[40px_1fr_1fr_1fr_40px]' : 'grid-cols-[40px_1fr_1fr_40px]'
                }`}
              >
                <div>PID</div>
                <div>Arrival</div>
                <div>Burst</div>
                {algorithm === 'priority' && <div>Priority</div>}
                <div></div>
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
                    className={`grid gap-2 px-4 py-3 items-center border-b border-white/5 last:border-0 ${
                      algorithm === 'priority' ? 'grid-cols-[40px_1fr_1fr_1fr_40px]' : 'grid-cols-[40px_1fr_1fr_40px]'
                    }`}
                  >
                    <span className="font-mono text-sm text-white/70">P{p.pid}</span>
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
                      className="text-white/30 hover:text-white/70 disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-lg"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-red-500/10 border border-red-500/20"
            >
              <p className="font-mono text-sm text-red-400">{error}</p>
            </motion.div>
          )}
        </div>

        {/* Right Panel - Results */}
        <div className="flex-1 p-6 lg:p-8 lg:h-[calc(100vh-80px)] lg:overflow-y-auto">
          <div className="mb-8">
            <p className="font-mono text-[11px] tracking-[0.25em] text-white/40 uppercase mb-2">
              Real-time Results
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Simulation Output
            </h2>
          </div>

          {compareMode && result && resultB ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Compare header */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider">Comparing</span>
                <span className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 font-display font-semibold text-white">
                  {ALG_LABELS[result.usedAlgorithm]}
                </span>
                <span className="text-white/40 font-mono">vs</span>
                <span className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 font-display font-semibold text-white">
                  {ALG_LABELS[resultB.usedAlgorithm]}
                </span>
              </div>

              {/* Metrics comparison table */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-4 px-4 font-mono text-[10px] text-white/40 uppercase tracking-wider w-1/3">Metric</th>
                      <th className="text-center py-4 px-4 font-mono text-[10px] text-white/40 uppercase tracking-wider">{ALG_LABELS[result.usedAlgorithm]}</th>
                      <th className="text-center py-4 px-4 font-mono text-[10px] text-white/40 uppercase tracking-wider">{ALG_LABELS[resultB.usedAlgorithm]}</th>
                      <th className="text-center py-4 px-4 font-mono text-[10px] text-white/40 uppercase tracking-wider w-24">Better</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      { key: 'avgWaitingTime' as const, label: 'Avg waiting time', lowerIsBetter: true },
                      { key: 'avgTurnaroundTime' as const, label: 'Avg turnaround time', lowerIsBetter: true },
                      { key: 'avgResponseTime' as const, label: 'Avg response time', lowerIsBetter: true },
                      { key: 'contextSwitches' as const, label: 'Context switches', lowerIsBetter: true },
                      { key: 'throughput' as const, label: 'Throughput', lowerIsBetter: false },
                    ].map(({ key, label, lowerIsBetter }) => {
                      const a = result.metrics[key];
                      const b = resultB.metrics[key];
                      const aVal = typeof a === 'number' ? a.toFixed(2) : String(a);
                      const bVal = typeof b === 'number' ? b.toFixed(2) : String(b);
                      const aWins = typeof a === 'number' && typeof b === 'number' && (lowerIsBetter ? a < b : a > b);
                      const bWins = typeof a === 'number' && typeof b === 'number' && (lowerIsBetter ? b < a : b > a);
                      return (
                        <tr key={key} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4 font-mono text-sm text-white/70">{label}</td>
                          <td className={`py-3 px-4 text-center font-mono text-sm ${aWins ? 'text-green-400 font-semibold' : 'text-white/90'}`}>{aVal}</td>
                          <td className={`py-3 px-4 text-center font-mono text-sm ${bWins ? 'text-green-400 font-semibold' : 'text-white/90'}`}>{bVal}</td>
                          <td className="py-3 px-4 text-center">
                            {aWins && <span className="text-green-400 text-xs font-mono">{ALG_LABELS[result.usedAlgorithm]}</span>}
                            {bWins && <span className="text-green-400 text-xs font-mono">{ALG_LABELS[resultB.usedAlgorithm]}</span>}
                            {!aWins && !bWins && <span className="text-white/40 text-xs">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Gantt charts stacked */}
              <div className="space-y-6">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Gantt chart</span>
                    <span className="px-2.5 py-1 rounded-md bg-white/10 font-display font-semibold text-white text-sm">
                      {ALG_LABELS[result.usedAlgorithm]}
                    </span>
                  </div>
                  <GanttChart data={result.ganttChart} maxTime={maxTime} height={160} />
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Gantt chart</span>
                    <span className="px-2.5 py-1 rounded-md bg-white/10 font-display font-semibold text-white text-sm">
                      {ALG_LABELS[resultB.usedAlgorithm]}
                    </span>
                  </div>
                  <GanttChart data={resultB.ganttChart} maxTime={Math.max(...resultB.ganttChart.map((e) => e.end), 1)} height={160} />
                </div>
              </div>
            </motion.div>
          ) : result ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step controls & Export */}
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 flex flex-wrap items-center gap-4 mb-6">
                {/* <span className="font-mono text-[10px] text-white/50 uppercase tracking-wider mr-2">Step through</span> */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => { setPlaying(false); setStepIndex((i) => Math.max(-1, i - 1)); }}
                    className="p-2 rounded-lg border border-white/20 text-white/80 hover:bg-white/10 font-mono text-xs"
                    title="Previous step"
                  >←</button>
                  <button
                    type="button"
                    onClick={() => setPlaying((p) => !p)}
                    disabled={!result.ganttChart.length}
                    className="p-2 rounded-lg border border-white/20 text-white/80 hover:bg-white/10 font-mono text-xs disabled:opacity-50"
                    title={playing ? 'Pause' : 'Play'}
                  >{playing ? '⏸' : '▶'}</button>
                  <button
                    type="button"
                    onClick={() => {
                      setPlaying(false);
                      setStepIndex((i) =>
                        i >= (result.ganttChart?.length ?? 0) - 1 ? i : i + 1
                      );
                    }}
                    disabled={stepIndex >= (result.ganttChart?.length ?? 0) - 1}
                    className="p-2 rounded-lg border border-white/20 text-white/80 hover:bg-white/10 font-mono text-xs disabled:opacity-50"
                    title="Next step"
                  >→</button>
                  <button
                    type="button"
                    onClick={() => { setPlaying(false); setStepIndex(-1); }}
                    className="p-2 rounded-lg border border-white/20 text-white/80 hover:bg-white/10 font-mono text-xs"
                    title="Show all"
                  >↺</button>
                </div>
                <span className="font-mono text-white/50 text-xs">
                  Step {stepIndex < 0 ? 'all' : `${stepIndex + 1} / ${result.ganttChart?.length ?? 0}`}
                </span>
                {currentStepEntry && (
                  <span className="text-white/60 text-xs">
                    Current: P{currentStepEntry.pid} (t={currentStepEntry.start}–{currentStepEntry.end})
                    {readyQueueAtStep.length > 0 && ` · Ready: P${readyQueueAtStep.join(', P')}`}
                  </span>
                )}
                <div className="ml-auto flex gap-2">
                  <button
                    type="button"
                    onClick={() => result && downloadCSV(result)}
                    className="px-3 py-1.5 rounded-lg border border-white/20 text-white/80 font-mono text-xs hover:bg-white/10"
                  >Export CSV</button>
                  <button
                    type="button"
                    onClick={() => ganttRef.current && downloadGanttPNG(ganttRef.current)}
                    className="px-3 py-1.5 rounded-lg border border-white/20 text-white/80 font-mono text-xs hover:bg-white/10"
                  >Export PNG</button>
                </div>
              </div>

              {/* Algorithm Switch Notice */}
              {switched && (
                <motion.div
                  className="mb-6 p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="font-display font-semibold text-yellow-400 text-sm mb-1">Algorithm auto-switched</p>
                  <p className="text-white/70 text-sm">{result.reasonSwitched}</p>
                  <p className="font-mono text-xs text-white/40 mt-2">
                    {ALG_LABELS[result.chosenAlgorithm]} → {ALG_LABELS[result.usedAlgorithm]}
                  </p>
                </motion.div>
              )}

              {/* Throughput & CPU utilization summary */}
              <div className="mb-6 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center gap-6">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[10px] text-white/50 uppercase tracking-wider">Throughput</span>
                  <span className="font-display font-semibold text-white">
                    {result.metrics.throughput.toFixed(2)}
                    <span className="font-mono text-white/50 text-sm font-normal ml-1">processes/unit time</span>
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[10px] text-white/50 uppercase tracking-wider">CPU utilization</span>
                  <span className="font-display font-semibold text-white">
                    {cpuUtilizationPercent}%
                    <span className="font-mono text-white/50 text-sm font-normal ml-1">
                      ({totalBusyTime.toFixed(0)} / {maxTime.toFixed(0)} time units)
                    </span>
                  </span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-8">
                {[
                  { label: 'Avg Waiting', value: result.metrics.avgWaitingTime.toFixed(2), unit: 'ms' },
                  { label: 'Avg Turnaround', value: result.metrics.avgTurnaroundTime.toFixed(2), unit: 'ms' },
                  { label: 'Avg Response', value: result.metrics.avgResponseTime.toFixed(2), unit: 'ms' },
                  { label: 'Throughput', value: result.metrics.throughput.toFixed(2), unit: 'p/ms' },
                  { label: 'Context Switches', value: String(result.metrics.contextSwitches), unit: '' },
                ].map((m, i) => (
                  <motion.div
                    key={m.label}
                    className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <p className="font-mono text-[10px] text-white/40 tracking-wider uppercase mb-1">{m.label}</p>
                    <p className="text-xl font-display font-semibold text-white tracking-tight">
                      {m.value}
                      {m.unit && <span className="text-white/50 text-sm ml-1">{m.unit}</span>}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Gantt Chart */}
              <motion.section
                ref={ganttRef}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 mb-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between gap-4 mb-4">
                <span className="font-mono text-[10px] text-white/40 tracking-widest uppercase">
                  Gantt Chart
                </span>
                <span className="flex items-center gap-2 font-mono text-[10px] text-white/40">
                  <span className="w-3 h-3 rounded-sm bg-amber-400/80" aria-hidden />
                  Context-switch boundaries
                </span>
              </div>
              <GanttChart data={stepDisplayGantt} maxTime={stepDisplayMaxTime} height={180} />
              </motion.section>

              {/* Bar Chart */}
              <motion.section
                className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <span className="font-mono text-[10px] text-white/40 tracking-widest uppercase block mb-4">
                  Per-Process Metrics
                </span>
                <div className="h-56">
                  <ThemeProvider theme={darkTheme}>
                    <BarChart
                      xAxis={[{
                        scaleType: 'band',
                        data: chartData.map((d) => d.name),
                        tickLabelStyle: { fill: 'rgba(255,255,255,0.5)', fontSize: 11 },
                      }]}
                      yAxis={[{
                        tickLabelStyle: { fill: 'rgba(255,255,255,0.5)', fontSize: 11 },
                      }]}
                      series={[
                        { data: chartData.map((d) => d.waiting), label: 'Waiting (ms)', color: 'rgba(255,255,255,0.9)' },
                        { data: chartData.map((d) => d.turnaround), label: 'Turnaround (ms)', color: 'rgba(255,255,255,0.5)' },
                      ]}
                      height={220}
                      margin={{ top: 20, right: 20, bottom: 30, left: 40 }}
                      slotProps={{
                        legend: {
                          labelStyle: { fill: 'rgba(255,255,255,0.7)', fontSize: 10 },
                          position: { vertical: 'top', horizontal: 'end' },
                          padding: 0,
                        },
                      } as any}
                      sx={{
                        '.MuiChartsAxis-line': { stroke: 'rgba(255,255,255,0.2)' },
                        '.MuiChartsAxis-tick': { stroke: 'rgba(255,255,255,0.2)' },
                      }}
                    />
                  </ThemeProvider>
                </div>
              </motion.section>

              {/* Process Table */}
              <motion.section
                className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="px-4 py-3 border-b border-white/10">
                  <span className="font-mono text-[10px] text-white/40 tracking-widest uppercase">
                    Process Details
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-4 py-3 text-left font-mono text-[10px] text-white/40 uppercase tracking-wider">PID</th>
                        <th className="px-4 py-3 text-left font-mono text-[10px] text-white/40 uppercase tracking-wider">Arrival</th>
                        <th className="px-4 py-3 text-left font-mono text-[10px] text-white/40 uppercase tracking-wider">Burst</th>
                        <th className="px-4 py-3 text-left font-mono text-[10px] text-white/40 uppercase tracking-wider">Completion</th>
                        <th className="px-4 py-3 text-left font-mono text-[10px] text-white/40 uppercase tracking-wider">Waiting</th>
                        <th className="px-4 py-3 text-left font-mono text-[10px] text-white/40 uppercase tracking-wider">Turnaround</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.processes.map((p) => (
                        <tr key={p.pid} className="border-b border-white/5 last:border-0">
                          <td className="px-4 py-3 font-mono text-sm text-white/80">P{p.pid}</td>
                          <td className="px-4 py-3 font-mono text-sm text-white/60">{p.arrivalTime}</td>
                          <td className="px-4 py-3 font-mono text-sm text-white/60">{p.burstTime}</td>
                          <td className="px-4 py-3 font-mono text-sm text-white/60">{p.completionTime}</td>
                          <td className="px-4 py-3 font-mono text-sm text-white/60">{p.waitingTime}</td>
                          <td className="px-4 py-3 font-mono text-sm text-white/60">{p.turnaroundTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.section>
            </motion.div>
          ) : (
            <motion.div 
              className="flex flex-col items-center justify-center h-[400px] text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-16 h-16 mb-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-semibold text-white/70 mb-2">
                {loading ? 'Running simulation...' : 'Select an Algorithm'}
              </h3>
              <p className="text-white/40 font-sans text-sm max-w-xs">
                {loading 
                  ? 'Please wait while we compute the results...'
                  : 'Choose a scheduling algorithm from the dropdown to see the simulation results in real-time.'
                }
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
