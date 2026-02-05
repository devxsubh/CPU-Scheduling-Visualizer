import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart } from '@mui/x-charts/BarChart';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import GanttChart from '../components/GanttChart';
import type { ProcessInput, AlgorithmType, SimulateResponse } from '../types';

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

export default function Simulator() {
  const [processes, setProcesses] = useState<ProcessInput[]>([
    { pid: 1, arrivalTime: 0, burstTime: 4, priority: 1 },
    { pid: 2, arrivalTime: 1, burstTime: 3, priority: 2 },
    { pid: 3, arrivalTime: 2, burstTime: 1, priority: 1 },
  ]);
  const [algorithm, setAlgorithm] = useState<AlgorithmType | ''>('');
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [result, setResult] = useState<SimulateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const maxTime = useMemo(() => {
    if (!result || result.ganttChart.length === 0) return 1;
    return Math.max(...result.ganttChart.map((e) => e.end), 1);
  }, [result]);

  const chartData = useMemo(() => {
    if (!result) return [];
    return result.processes.map((p) => ({
      name: `P${p.pid}`,
      waiting: p.waitingTime,
      turnaround: p.turnaroundTime,
    }));
  }, [result]);

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
        <Link to="/" className="flex items-center gap-3">
          <img src="/favicon.svg" alt="CPU Scheduler" className="w-8 h-8" />
          <span className="font-display font-semibold text-white text-lg hidden sm:block">CPU Scheduler</span>
        </Link>
        <div className="flex items-center gap-3">
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

          {result ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
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

              {/* Metrics */}
              <div className="grid gap-4 grid-cols-3 mb-8">
                {[
                  { label: 'Avg Waiting', value: result.metrics.avgWaitingTime.toFixed(2), unit: 'ms' },
                  { label: 'Avg Turnaround', value: result.metrics.avgTurnaroundTime.toFixed(2), unit: 'ms' },
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
                className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 mb-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <span className="font-mono text-[10px] text-white/40 tracking-widest uppercase block mb-4">
                  Gantt Chart
                </span>
                <GanttChart data={result.ganttChart} maxTime={maxTime} height={180} />
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
                          position: { vertical: 'top', horizontal: 'right' },
                          padding: 0,
                        },
                      }}
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
