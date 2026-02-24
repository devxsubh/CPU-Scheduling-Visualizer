'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart } from '@mui/x-charts/BarChart';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import GanttChart from '@/components/GanttChart';
import Checkbox from '@/components/Checkbox';
import MetricExplanationModal from '@/components/MetricExplanationModal';
import AlgorithmSelectionModal from '@/components/AlgorithmSelectionModal';
import AlgorithmExplanationModal from '@/components/AlgorithmExplanationModal';
import ShortcutsModal from '@/components/ShortcutsModal';
import ProcessStateDiagram from '@/components/ProcessStateDiagram';
import type { ProcessStateCounts } from '@/components/ProcessStateDiagram';
import type { ProcessInput, AlgorithmType, SimulateResponse, Metrics } from '@/types';
import { ALGORITHM_INFO } from '@/lib/algorithm-info';
import type { AlgorithmInfo } from '@/lib/algorithm-info';
import { getWhyThisProcessReason, getStepNarration } from '@/lib/step-reason';
import { PRESETS } from '@/lib/simulator-presets';
import { downloadCSV, downloadGanttPNG, downloadJSON } from '@/lib/export-utils';
import { parseSimulatorSearchParams, buildSimulatorSearchParams } from '@/lib/url-state';
import { runCustomAlgorithm } from '@/lib/custom-algorithm-runner';
import {
  getSavedScenarios,
  saveScenario,
  loadScenario,
  exportScenarioJSON,
  buildScenarioPayload,
  parseCSV,
  parseScenarioJSON,
} from '@/lib/scenario-utils';
import RandomGeneratorModal from '@/components/RandomGeneratorModal';
import SavedScenariosModal from '@/components/SavedScenariosModal';
import SimulatorGuide, { type GuideStep } from '@/components/SimulatorGuide';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

/** All algorithms for compare dropdowns (from ALGORITHM_INFO). */
const ALL_ALGORITHM_OPTIONS: AlgorithmInfo[] = Object.values(ALGORITHM_INFO);

const ALG_LABELS: Record<AlgorithmType, string> = {
  fcfs: 'FCFS',
  sjf: 'SRTF',
  sjf_nonpreemptive: 'SJF (Non-preemptive)',
  ljf: 'LJF',
  lrtf: 'LRTF',
  round_robin: 'Round Robin',
  priority: 'Priority',
  priority_preemptive: 'Priority (Preemptive)',
  hrrn: 'HRRN',
  lottery: 'Lottery',
  stride: 'Stride',
  fcfs_io: 'FCFS + I/O',
  mlq: 'Multilevel Queue',
  mlfq: 'Multilevel Feedback Queue',
  custom: 'Custom',
};

const GUIDE_STEPS: GuideStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to the CPU Scheduler Simulator',
    body: 'This tool helps you visualize how different CPU scheduling algorithms work. You\'ll configure processes and an algorithm on the left, then see the Gantt chart and metrics on the right. Let\'s walk through each part.',
  },
  {
    id: 'algorithm',
    title: 'Choose a scheduling algorithm',
    body: 'Select an algorithm (e.g. FCFS, Round Robin, SRTF). Some algorithms use time quantum or priority. The simulation runs automatically once you\'ve chosen one. Use the (i) button for a short explanation.',
  },
  {
    id: 'quickload',
    title: 'Quick load & presets',
    body: 'Load example presets, generate random processes, or import from a CSV/JSON file. Use Export in the header to save or load scenarios in the browser or as a file.',
  },
  {
    id: 'processes',
    title: 'Process table',
    body: 'Add or edit processes: PID, arrival time, burst time, and (for some algorithms) priority or tickets. Each row is one process. Remove a process with the × button.',
  },
  {
    id: 'results',
    title: 'Simulation output',
    body: 'After you pick an algorithm, results appear here: throughput, CPU utilization, metrics (waiting time, turnaround, etc.), and the Gantt chart showing which process runs when.',
  },
  {
    id: 'gantt',
    title: 'Gantt chart & step-through',
    body: 'The Gantt chart shows the timeline of execution. Use the step controls (←, ▶, →) to move through the schedule step by step. Click metric cards to see how they\'re calculated.',
  },
  {
    id: 'done',
    title: "You're all set",
    body: 'Use Share link to copy a URL with your current config. Open Shortcuts for keyboard tips. Have fun exploring different algorithms and process sets!',
  },
];

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
  const [algorithmModalOpen, setAlgorithmModalOpen] = useState(false);
  const [algorithmExplanationModalOpen, setAlgorithmExplanationModalOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [showStepNarration, setShowStepNarration] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const accessibilityRef = useRef<HTMLDivElement>(null);
  const [compareCount, setCompareCount] = useState<2 | 3 | 4>(2);
  const [algorithmB, setAlgorithmB] = useState<AlgorithmType | ''>('');
  const [algorithmC, setAlgorithmC] = useState<AlgorithmType | ''>('');
  const [algorithmD, setAlgorithmD] = useState<AlgorithmType | ''>('');
  const [resultB, setResultB] = useState<SimulateResponse | null>(null);
  const [resultC, setResultC] = useState<SimulateResponse | null>(null);
  const [resultD, setResultD] = useState<SimulateResponse | null>(null);
  const [stepIndex, setStepIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.5 | 1 | 2>(1);
  const [contextSwitchCost, setContextSwitchCost] = useState(0);
  const [customAlgorithmCode, setCustomAlgorithmCode] = useState(
    '// Return a function: (state) => pid\n// state.ready = [{ pid, remainingBurst, arrivalTime, burstTime }], state.time\n(state) => state.ready[0]?.pid ?? 0'
  );
  const [shareCopied, setShareCopied] = useState(false);
  const [algorithmBDropdownOpen, setAlgorithmBDropdownOpen] = useState(false);
  const [metricExplanationKey, setMetricExplanationKey] = useState<keyof Metrics | null>(null);
  const [randomGeneratorOpen, setRandomGeneratorOpen] = useState(false);
  const [savedScenariosModalOpen, setSavedScenariosModalOpen] = useState(false);
  const [savedScenarios, setSavedScenarios] = useState<ReturnType<typeof getSavedScenarios>>([]);
  const [scenarioNameToSave, setScenarioNameToSave] = useState('');
  const [loadScenarioId, setLoadScenarioId] = useState('');
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideStepIndex, setGuideStepIndex] = useState(0);
  const importFileRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const algorithmBDropdownRef = useRef<HTMLDivElement>(null);
  const ganttRef = useRef<HTMLDivElement>(null);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasAppliedUrlRef = useRef(false);
  const tourAlgorithmRef = useRef<HTMLDivElement>(null);
  const tourQuickLoadRef = useRef<HTMLDivElement>(null);
  const tourProcessesRef = useRef<HTMLDivElement>(null);
  const tourResultsRef = useRef<HTMLDivElement>(null);
  const tourGanttRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSavedScenarios(getSavedScenarios());
  }, []);

  // Load accessibility preferences from localStorage (client-only)
  useEffect(() => {
    try {
      const rm = localStorage.getItem('cpu-scheduler-reduced-motion');
      const hc = localStorage.getItem('cpu-scheduler-high-contrast');
      const narr = localStorage.getItem('cpu-scheduler-show-step-narration');
      if (rm === 'true') setReducedMotion(true);
      if (hc === 'true') setHighContrast(true);
      if (narr === 'true') setShowStepNarration(true);
    } catch (_) {}
  }, []);

  // Persist accessibility preferences and apply body classes
  useEffect(() => {
    try {
      localStorage.setItem('cpu-scheduler-reduced-motion', String(reducedMotion));
      localStorage.setItem('cpu-scheduler-high-contrast', String(highContrast));
      localStorage.setItem('cpu-scheduler-show-step-narration', String(showStepNarration));
    } catch (_) {}
    if (typeof document === 'undefined') return;
    document.body.classList.toggle('reduce-motion', reducedMotion);
    document.body.classList.toggle('high-contrast', highContrast);
    return () => {
      document.body.classList.remove('reduce-motion', 'high-contrast');
    };
  }, [reducedMotion, highContrast, showStepNarration]);

  // Keyboard shortcuts (ignore when focus is in input/textarea/select)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target?.tagName?.toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea' || tag === 'select' || target?.getAttribute('contenteditable') === 'true';
      if (isInput) return;

      if (e.key === ' ') {
        e.preventDefault();
        if (!result?.ganttChart?.length) return;
        setPlaying((p) => !p);
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setPlaying(false);
        setStepIndex((i) => Math.max(-1, i - 1));
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (!result?.ganttChart?.length) return;
        setPlaying(false);
        setStepIndex((i) =>
          i >= (result.ganttChart?.length ?? 0) - 1 ? i : i + 1
        );
        return;
      }
      if (e.key === 'r' || e.key === 'R') {
        if (target?.closest('button') || target?.closest('[role="dialog"]')) return;
        e.preventDefault();
        setPlaying(false);
        setStepIndex(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [result?.ganttChart?.length]);

  // Close accessibility panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accessibilityRef.current && !accessibilityRef.current.contains(event.target as Node)) {
        setAccessibilityOpen(false);
      }
    };
    if (accessibilityOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [accessibilityOpen]);

  // Apply URL state on mount (client-only)
  useEffect(() => {
    if (hasAppliedUrlRef.current || !searchParams) return;
    const state = parseSimulatorSearchParams(searchParams as URLSearchParams);
    if (state) {
      hasAppliedUrlRef.current = true;
      setProcesses(state.processes);
      setAlgorithm(state.algorithm!);
      setTimeQuantum(state.timeQuantum);
    }
  }, [searchParams]);

  // Sync state to URL when algorithm, timeQuantum, or processes change
  useEffect(() => {
    if (!searchParams) return;
    const query = buildSimulatorSearchParams(algorithm, timeQuantum, processes);
    const current = searchParams.toString();
    if (query === current) return;
    // Don't clear URL on first load when we have URL params but state not yet applied
    if (current && !query) return;
    const base = pathname ?? '/';
    const next = query ? `${base}?${query}` : base;
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (algorithmBDropdownRef.current && !algorithmBDropdownRef.current.contains(target)) {
        setAlgorithmBDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedAlgorithm = algorithm ? ALGORITHM_INFO[algorithm] : null;

  const addProcess = useCallback(() => {
    const nextPid = Math.max(0, ...processes.map((p) => p.pid)) + 1;
    setProcesses((prev) => [...prev, { pid: nextPid, arrivalTime: 0, burstTime: 1, priority: 1 }]);
  }, [processes]);

  const removeProcess = useCallback((pid: number) => {
    if (processes.length <= 1) return;
    setProcesses((prev) => prev.filter((p) => p.pid !== pid));
  }, [processes.length]);

  const updateProcess = useCallback((pid: number, field: keyof ProcessInput, value: number | number[]) => {
    setProcesses((prev) =>
      prev.map((p) => (p.pid === pid ? { ...p, [field]: value } : p))
    );
  }, []);

  const handleImportFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      try {
        const ext = file.name.toLowerCase();
        if (ext.endsWith('.json')) {
          const parsed = parseScenarioJSON(text);
          if (parsed.processes.length > 0) setProcesses(parsed.processes);
          if (parsed.algorithm != null) setAlgorithm(parsed.algorithm);
          if (parsed.timeQuantum != null) setTimeQuantum(parsed.timeQuantum);
          if (parsed.contextSwitchDuration != null) setContextSwitchCost(parsed.contextSwitchDuration);
          if (parsed.name != null) setScenarioNameToSave(parsed.name);
        } else {
          const processes = parseCSV(text);
          if (processes.length > 0) setProcesses(processes);
        }
      } catch (err) {
        setError('Failed to parse file. Use CSV (pid, arrival, burst, priority) or JSON.');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  }, []);

  const getCurrentScenarioPayload = useCallback(
    () =>
      buildScenarioPayload(
        scenarioNameToSave,
        processes,
        algorithm,
        timeQuantum,
        contextSwitchCost
      ),
    [scenarioNameToSave, processes, algorithm, timeQuantum, contextSwitchCost]
  );

  const handleSaveScenario = useCallback(() => {
    const payload = getCurrentScenarioPayload();
    saveScenario(payload);
    setSavedScenarios(getSavedScenarios());
    setScenarioNameToSave('');
  }, [getCurrentScenarioPayload]);

  const openSavedScenariosModal = useCallback(() => {
    setSavedScenarios(getSavedScenarios());
    setSavedScenariosModalOpen(true);
  }, []);

  const handleLoadScenario = useCallback((id: string) => {
    const s = loadScenario(id);
    if (!s) return;
    setProcesses(s.processes);
    setAlgorithm(s.algorithm);
    setTimeQuantum(s.timeQuantum);
    setContextSwitchCost(s.contextSwitchDuration);
    setScenarioNameToSave(s.name);
    setLoadScenarioId(id);
  }, []);

  const handleExportScenario = useCallback(
    (savedId?: string) => {
      const payload = savedId
        ? loadScenario(savedId)
        : getCurrentScenarioPayload();
      if (!payload) return;
      const json = exportScenarioJSON(payload);
      const name = (payload.name || 'scenario').replace(/\s+/g, '-');
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [getCurrentScenarioPayload]
  );

  // Real-time simulation with debouncing
  const runSimulation = useCallback(async () => {
    if (!algorithm) return;

    setError(null);
    setLoading(true);
    try {
      if (algorithm === 'custom') {
        const data = runCustomAlgorithm(processes, customAlgorithmCode, timeQuantum, contextSwitchCost);
        setResult(data);
        setLoading(false);
        return;
      }

      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          algorithm,
          timeQuantum:
            algorithm === 'round_robin' || algorithm === 'lottery' || algorithm === 'stride' || algorithm === 'mlq' || algorithm === 'mlfq'
              ? timeQuantum
              : undefined,
          processes,
          disableAutoSwitch: compareMode,
          contextSwitchCost: contextSwitchCost > 0 ? contextSwitchCost : undefined,
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
  }, [algorithm, timeQuantum, processes, compareMode, contextSwitchCost, customAlgorithmCode]);

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
          timeQuantum:
            (algorithmB === 'round_robin' || algorithmB === 'lottery' || algorithmB === 'stride' || algorithmB === 'mlq' || algorithmB === 'mlfq')
              ? timeQuantum
              : undefined,
          processes,
          disableAutoSwitch: true,
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

  const runSimulationC = useCallback(async () => {
    if (!algorithmC || !compareMode) return;
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          algorithm: algorithmC,
          timeQuantum: (algorithmC === 'round_robin' || algorithmC === 'lottery' || algorithmC === 'stride' || algorithmC === 'mlq' || algorithmC === 'mlfq') ? timeQuantum : undefined,
          processes,
          disableAutoSwitch: true,
        }),
      });
      if (!res.ok) throw new Error('Simulation C failed');
      const data: SimulateResponse = await res.json();
      setResultC(data);
    } catch {
      setResultC(null);
    }
  }, [algorithmC, compareMode, timeQuantum, processes]);

  const runSimulationD = useCallback(async () => {
    if (!algorithmD || !compareMode) return;
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          algorithm: algorithmD,
          timeQuantum: (algorithmD === 'round_robin' || algorithmD === 'lottery' || algorithmD === 'stride' || algorithmD === 'mlq' || algorithmD === 'mlfq') ? timeQuantum : undefined,
          processes,
          disableAutoSwitch: true,
        }),
      });
      if (!res.ok) throw new Error('Simulation D failed');
      const data: SimulateResponse = await res.json();
      setResultD(data);
    } catch {
      setResultD(null);
    }
  }, [algorithmD, compareMode, timeQuantum, processes]);

  useEffect(() => {
    if (!compareMode || compareCount < 3 || !algorithmC) {
      setResultC(null);
      return;
    }
    const t = setTimeout(runSimulationC, 300);
    return () => clearTimeout(t);
  }, [compareMode, compareCount, algorithmC, runSimulationC]);

  useEffect(() => {
    if (!compareMode || compareCount < 4 || !algorithmD) {
      setResultD(null);
      return;
    }
    const t = setTimeout(runSimulationD, 300);
    return () => clearTimeout(t);
  }, [compareMode, compareCount, algorithmD, runSimulationD]);

  // Reset step index when result changes
  useEffect(() => {
    if (result) setStepIndex(-1);
  }, [result?.ganttChart?.length]);

  const playIntervalMs = 800 / playbackSpeed;
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
    }, playIntervalMs);
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [playing, result?.ganttChart?.length, playIntervalMs]);

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

  const stepExplanation = useMemo(() => {
    if (stepIndex < 0 || !result?.ganttChart?.length) return null;
    const entry = result.ganttChart[stepIndex];
    if (!entry || entry.pid <= 0) return null;
    const duration = entry.end - entry.start;
    const readyExcludingRunning = readyQueueAtStep.filter((pid) => pid !== entry.pid);
    const readyStr = readyExcludingRunning.length > 0
      ? ` Ready queue: P${readyExcludingRunning.join(', P')}.`
      : '';
    return `P${entry.pid} runs for ${duration} time unit(s) (t=${entry.start}→${entry.end}).${readyStr}`;
  }, [stepIndex, result?.ganttChart, readyQueueAtStep]);

  const isPreemptionAtStep = useMemo(() => {
    if (stepIndex <= 0 || !result?.ganttChart?.length) return false;
    const prev = result.ganttChart[stepIndex - 1];
    const curr = result.ganttChart[stepIndex];
    return prev && curr && prev.pid > 0 && curr.pid > 0 && prev.pid !== curr.pid;
  }, [stepIndex, result?.ganttChart]);

  const pushedBackPidAtStep = useMemo(() => {
    if (stepIndex < 0 || !result?.ganttChart?.length) return null;
    const entry = result.ganttChart[stepIndex];
    if (!entry || entry.pid <= 0) return null;
    const appearsAgain = result.ganttChart
      .slice(stepIndex + 1)
      .some((e) => e.pid === entry.pid);
    return appearsAgain ? entry.pid : null;
  }, [stepIndex, result?.ganttChart]);

  const readyQueueExcludingRunning = useMemo(() => {
    if (!currentStepEntry || currentStepEntry.pid <= 0) return readyQueueAtStep;
    return readyQueueAtStep.filter((pid) => pid !== currentStepEntry!.pid);
  }, [currentStepEntry, readyQueueAtStep]);

  const processStateCountsAtStep = useMemo((): ProcessStateCounts => {
    if (!result?.processes?.length) return { new: 0, ready: 0, running: 0, waiting: 0, terminated: 0 };
    const t = currentStepEntry ? currentStepEntry.start : maxTime;
    const runningPid = currentStepEntry && currentStepEntry.pid > 0 ? currentStepEntry.pid : null;
    let newCount = 0, readyCount = 0, runningCount = 0, terminatedCount = 0;
    for (const p of result.processes) {
      if (p.arrivalTime > t) newCount++;
      else if (p.completionTime <= t) terminatedCount++;
      else if (runningPid === p.pid) runningCount++;
      else readyCount++;
    }
    return { new: newCount, ready: readyCount, running: runningCount, waiting: 0, terminated: terminatedCount };
  }, [result?.processes, currentStepEntry, maxTime]);

  const whyThisProcessReason = useMemo(() => {
    if (!algorithm || !currentStepEntry || currentStepEntry.pid <= 0 || !result) return null;
    return getWhyThisProcessReason(algorithm, currentStepEntry, result, readyQueueExcludingRunning);
  }, [algorithm, currentStepEntry, result, readyQueueExcludingRunning]);

  const stepNarration = useMemo(() => {
    if (!algorithm || !result) return '';
    return getStepNarration(algorithm, currentStepEntry, result, readyQueueExcludingRunning);
  }, [algorithm, currentStepEntry, result, readyQueueExcludingRunning]);

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
          <button
            type="button"
            onClick={openSavedScenariosModal}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/20 text-white/80 font-mono text-xs hover:bg-white/10 hover:text-white transition-all"
            title="Saved scenarios & export"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
          <div ref={accessibilityRef} className="relative">
            <button
              type="button"
              onClick={() => setAccessibilityOpen((o) => !o)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/20 text-white/80 font-mono text-xs hover:bg-white/10 hover:text-white transition-all"
              title="Accessibility options"
              aria-expanded={accessibilityOpen}
              aria-haspopup="true"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span className="hidden sm:inline">Accessibility</span>
            </button>
            {accessibilityOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-neutral-900 border border-white/10 shadow-xl shadow-black/50 overflow-hidden z-50 p-4 space-y-3"
                role="menu"
              >
                <p className="font-mono text-[10px] text-white/50 uppercase tracking-wider">Display</p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reducedMotion}
                    onChange={(e) => setReducedMotion(e.target.checked)}
                    className="rounded border-white/30 bg-neutral-800 text-white focus:ring-white/20"
                  />
                  <span className="text-sm text-white/90">Reduce motion</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={(e) => setHighContrast(e.target.checked)}
                    className="rounded border-white/30 bg-neutral-800 text-white focus:ring-white/20"
                  />
                  <span className="text-sm text-white/90">High contrast</span>
                </label>
                <p className="font-mono text-[10px] text-white/50 uppercase tracking-wider pt-2 border-t border-white/10">Narration</p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showStepNarration}
                    onChange={(e) => setShowStepNarration(e.target.checked)}
                    className="rounded border-white/30 bg-neutral-800 text-white focus:ring-white/20"
                  />
                  <span className="text-sm text-white/90">Show step narration</span>
                </label>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShortcutsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/20 text-white/80 font-mono text-xs hover:bg-white/10 hover:text-white transition-all"
            title="Keyboard shortcuts"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1v-1M4 12H3v-1m18 0h-1v-1M3 12c0-5 4-9 9-9s9 4 9 9-4 9-9 9m0-9v1m0 16v-1" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => { setGuideOpen(true); setGuideStepIndex(0); }}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-white/20 text-white/80 font-mono text-sm hover:bg-white/10 hover:text-white transition-all"
            title="Simulator guide (first-time tour)"
            aria-label="Open simulator guide"
          >
            ?
          </button>
          {loading && (
            <span className="text-white/50 text-sm font-mono">Simulating...</span>
          )}
          <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : result ? 'bg-green-400' : 'bg-white/30'}`} />
        </div>
      </header>

      <ShortcutsModal open={shortcutsModalOpen} onClose={() => setShortcutsModalOpen(false)} />

      <SimulatorGuide
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        steps={GUIDE_STEPS}
        stepIndex={guideStepIndex}
        onStepChange={setGuideStepIndex}
        targetRef={
          guideStepIndex === 1 ? tourAlgorithmRef
            : guideStepIndex === 2 ? tourQuickLoadRef
            : guideStepIndex === 3 ? tourProcessesRef
            : guideStepIndex === 4 ? tourResultsRef
            : guideStepIndex === 5 ? tourGanttRef
            : null
        }
      />

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
          <section ref={tourAlgorithmRef} className="mb-8">
            <span className="font-mono text-[11px] tracking-[0.2em] text-white/50 uppercase block mb-3">
              Algorithm
            </span>
            <div className="flex items-stretch gap-2">
              <motion.button
                type="button"
                onClick={() => setAlgorithmModalOpen(true)}
                className="flex-1 bg-neutral-900 border border-white/10 rounded-xl px-4 py-3.5 text-left transition-all duration-200 hover:border-white/20"
                whileTap={{ scale: 0.995 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedAlgorithm ? (
                      <>
                        <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-mono text-xs text-white/80">
                          {selectedAlgorithm.shortName}
                        </span>
                        <div>
                          <p className="text-white font-medium text-sm">{selectedAlgorithm.name}</p>
                          <p className="text-white/40 text-xs">{selectedAlgorithm.description}</p>
                        </div>
                      </>
                    ) : (
                      <span className="text-white/50 text-sm">Choose an algorithm...</span>
                    )}
                  </div>
                  <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </motion.button>
              <button
                type="button"
                onClick={() => setAlgorithmExplanationModalOpen(true)}
                disabled={!algorithm}
                title="Algorithm explanation"
                className="flex-shrink-0 w-10 h-auto rounded-xl border border-white/10 bg-neutral-900 text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition-colors disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center"
                aria-label="Algorithm explanation"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
            <AlgorithmExplanationModal
              open={algorithmExplanationModalOpen}
              onClose={() => setAlgorithmExplanationModalOpen(false)}
              algorithm={algorithm}
            />
            <AlgorithmSelectionModal
              open={algorithmModalOpen}
              onClose={() => setAlgorithmModalOpen(false)}
              selectedAlgorithm={algorithm}
              onSelect={setAlgorithm}
            />

            {/* Time Quantum for RR / Lottery / Stride / MLQ / MLFQ */}
            <AnimatePresence mode="wait">
              {(algorithm === 'round_robin' || algorithm === 'lottery' || algorithm === 'stride' || algorithm === 'mlq' || algorithm === 'mlfq') && (
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

            {/* Context switch duration (optional) */}
            <div className="mt-4">
              <label className="block font-mono text-[11px] text-white/50 tracking-wider uppercase mb-2">
                Context switch duration (0 = off)
              </label>
              <input
                type="number"
                min={0}
                max={5}
                value={contextSwitchCost}
                onChange={(e) => setContextSwitchCost(Math.max(0, Math.min(5, Number(e.target.value) || 0)))}
                className={`${inputClass} max-w-[80px]`}
              />
            </div>

            {/* Custom algorithm code */}
            <AnimatePresence mode="wait">
              {algorithm === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-4"
                >
                  <label className="block font-mono text-[11px] text-white/50 tracking-wider uppercase mb-2">
                    Strategy (JS: state =&gt; pid)
                  </label>
                  <textarea
                    value={customAlgorithmCode}
                    onChange={(e) => setCustomAlgorithmCode(e.target.value)}
                    rows={6}
                    className={`${inputClass} font-mono text-xs`}
                    placeholder="(state) => state.ready[0]?.pid ?? 0"
                    spellCheck={false}
                  />
                  <p className="text-white/40 text-xs mt-1">
                    state.ready = [&#123; pid, remainingBurst, arrivalTime, burstTime &#125;], state.time. Return pid to run (0 to skip).
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Compare mode & Algorithm B */}
            <div className="mt-4 p-4 rounded-xl bg-neutral-900/50 border border-white/10 flex flex-wrap items-center gap-4">
              <Checkbox
                checked={compareMode}
                onChange={(checked) => {
                  setCompareMode(checked);
                  if (!checked) {
                    setAlgorithmB('');
                    setAlgorithmC('');
                    setAlgorithmD('');
                    setCompareCount(2);
                  }
                }}
                label="Compare algorithms"
              />
              {compareMode && (
                <div className="flex flex-col gap-3 w-full">
                <div ref={algorithmBDropdownRef} className="relative flex-1 min-w-[200px]">
                  <motion.button
                    type="button"
                    onClick={() => setAlgorithmBDropdownOpen((o) => !o)}
                    className={`w-full bg-neutral-900 border rounded-xl px-4 py-3 text-left transition-all duration-200 flex items-center justify-between ${
                      algorithmBDropdownOpen ? 'border-white/30 ring-2 ring-white/10' : 'border-white/10 hover:border-white/20'
                    }`}
                    whileTap={{ scale: 0.995 }}
                  >
                    {algorithmB ? (
                      <>
                        <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-mono text-xs text-white/80">
                          {ALL_ALGORITHM_OPTIONS.find((a) => a.value === algorithmB)?.shortName ?? '?'}
                        </span>
                        <span className="text-white font-medium text-sm truncate">
                          {ALL_ALGORITHM_OPTIONS.find((a) => a.value === algorithmB)?.name ?? algorithmB}
                        </span>
                      </>
                    ) : (
                      <span className="text-white/50 text-sm">Select second algorithm...</span>
                    )}
                    <motion.svg
                      className="w-5 h-5 text-white/40 flex-shrink-0 ml-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      animate={{ rotate: algorithmBDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </motion.button>
                  <AnimatePresence>
                    {algorithmBDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute z-50 w-full mt-2 bg-neutral-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50"
                      >
                        {ALL_ALGORITHM_OPTIONS.filter((a) => a.value !== algorithm).map((a) => (
                          <motion.button
                            key={a.value}
                            type="button"
                            onClick={() => {
                              setAlgorithmB(a.value);
                              setAlgorithmBDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-left transition-all duration-150 flex items-center gap-3 ${
                              algorithmB === a.value ? 'bg-white/10' : 'hover:bg-white/5'
                            } border-b border-white/5 last:border-b-0`}
                          >
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs ${
                              algorithmB === a.value ? 'bg-white text-black' : 'bg-white/10 text-white/60'
                            }`}>
                              {a.shortName}
                            </span>
                            <span className={`font-medium text-sm ${algorithmB === a.value ? 'text-white' : 'text-white/80'}`}>
                              {a.name}
                            </span>
                            {algorithmB === a.value && (
                              <svg className="w-5 h-5 text-white ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {compareCount >= 3 && (
                  <div className="relative flex-1 min-w-[200px]">
                    <label className="block font-mono text-[10px] text-white/40 uppercase tracking-wider mb-1">Algorithm 3</label>
                    <select
                      value={algorithmC}
                      onChange={(e) => setAlgorithmC((e.target.value || '') as AlgorithmType | '')}
                      className="w-full pl-4 pr-10 py-3 rounded-xl bg-neutral-900 border border-white/10 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-white/20 appearance-none cursor-pointer"
                    >
                      <option value="">Select...</option>
                      {ALL_ALGORITHM_OPTIONS.filter((a) => a.value !== algorithm && a.value !== algorithmB).map((a) => (
                        <option key={a.value} value={a.value}>{a.shortName} – {a.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                {compareCount >= 4 && (
                  <div className="relative flex-1 min-w-[200px]">
                    <label className="block font-mono text-[10px] text-white/40 uppercase tracking-wider mb-1">Algorithm 4</label>
                    <select
                      value={algorithmD}
                      onChange={(e) => setAlgorithmD((e.target.value || '') as AlgorithmType | '')}
                      className="w-full pl-4 pr-10 py-3 rounded-xl bg-neutral-900 border border-white/10 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-white/20 appearance-none cursor-pointer"
                    >
                      <option value="">Select...</option>
                      {ALL_ALGORITHM_OPTIONS.filter((a) => a.value !== algorithm && a.value !== algorithmB && a.value !== algorithmC).map((a) => (
                        <option key={a.value} value={a.value}>{a.shortName} – {a.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {compareCount < 4 && (
                    <button
                      type="button"
                      onClick={() => setCompareCount((c) => Math.min(4, c + 1) as 2 | 3 | 4)}
                      className="px-3 py-1.5 rounded-lg border border-white/20 text-white/70 font-mono text-xs hover:bg-white/10"
                    >
                      + Add algorithm
                    </button>
                  )}
                  {compareCount > 2 && (
                    <button
                      type="button"
                      onClick={() => {
                        setCompareCount((c) => (c - 1) as 2 | 3 | 4);
                        if (compareCount === 4) { setAlgorithmD(''); setResultD(null); }
                        else if (compareCount === 3) { setAlgorithmC(''); setResultC(null); }
                      }}
                      className="px-3 py-1.5 rounded-lg border border-white/20 text-white/70 font-mono text-xs hover:bg-white/10"
                    >
                      Remove
                    </button>
                  )}
                </div>
                </div>
              )}
            </div>
          </section>

          {/* Presets & scenarios */}
          <section ref={tourQuickLoadRef} className="mb-6">
            <span className="font-mono text-[11px] tracking-[0.2em] text-white/50 uppercase block mb-2">
              Quick load
            </span>
            <div className="flex flex-wrap gap-2 mb-4">
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
              <motion.button
                type="button"
                onClick={() => setRandomGeneratorOpen(true)}
                className="px-3 py-2 rounded-lg border border-white/15 bg-white/5 text-white/80 font-mono text-xs hover:bg-white/10 hover:border-white/25 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                title="Generate N processes with configurable ranges"
              >
                Generate random…
              </motion.button>
              <input
                ref={importFileRef}
                type="file"
                accept=".csv,.json,text/csv,application/json"
                className="hidden"
                onChange={handleImportFile}
              />
              <motion.button
                type="button"
                onClick={() => importFileRef.current?.click()}
                className="px-3 py-2 rounded-lg border border-white/15 bg-white/5 text-white/80 font-mono text-xs hover:bg-white/10 hover:border-white/25 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                title="Import CSV or JSON (pid, arrival, burst, priority)"
              >
                Import file
              </motion.button>
            </div>

          </section>

          <SavedScenariosModal
            open={savedScenariosModalOpen}
            onClose={() => setSavedScenariosModalOpen(false)}
            scenarioNameToSave={scenarioNameToSave}
            onScenarioNameChange={setScenarioNameToSave}
            onSave={handleSaveScenario}
            onExportCurrent={() => handleExportScenario()}
            savedScenarios={savedScenarios}
            loadScenarioId={loadScenarioId}
            onLoadScenarioIdChange={setLoadScenarioId}
            onLoadScenario={handleLoadScenario}
            onExportSelected={() => loadScenarioId && handleExportScenario(loadScenarioId)}
            hasResult={!!result}
            onExportResultsCSV={() => result && downloadCSV(result)}
            onExportResultsJSON={() => result && downloadJSON(result)}
            onExportResultsPNG={() => ganttRef.current && downloadGanttPNG(ganttRef.current)}
          />

          <RandomGeneratorModal
            open={randomGeneratorOpen}
            onClose={() => setRandomGeneratorOpen(false)}
            onGenerate={(procs) => {
              setProcesses(procs);
              setRandomGeneratorOpen(false);
            }}
          />

          {/* Processes */}
          <section ref={tourProcessesRef} className="mb-6">
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
                  (algorithm === 'priority' || algorithm === 'priority_preemptive' || algorithm === 'mlq') || algorithm === 'lottery' || algorithm === 'stride' || algorithm === 'fcfs_io'
                    ? 'grid-cols-[40px_1fr_1fr_1fr_40px]'
                    : 'grid-cols-[40px_1fr_1fr_40px]'
                }`}
              >
                <div>PID</div>
                <div>Arrival</div>
                <div>Burst</div>
                {(algorithm === 'priority' || algorithm === 'priority_preemptive' || algorithm === 'mlq') && <div>Priority / Queue</div>}
                {(algorithm === 'lottery' || algorithm === 'stride') && <div>{algorithm === 'lottery' ? 'Tickets' : 'Stride'}</div>}
                {algorithm === 'fcfs_io' && <div>Bursts (c,i…)</div>}
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
                      (algorithm === 'priority' || algorithm === 'priority_preemptive' || algorithm === 'mlq') || algorithm === 'lottery' || algorithm === 'stride' || algorithm === 'fcfs_io'
                        ? 'grid-cols-[40px_1fr_1fr_1fr_40px]'
                        : 'grid-cols-[40px_1fr_1fr_40px]'
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
                    {(algorithm === 'priority' || algorithm === 'priority_preemptive' || algorithm === 'mlq') && (
                      <input
                        type="number"
                        min={0}
                        value={p.priority ?? 0}
                        onChange={(e) => updateProcess(p.pid, 'priority', Number(e.target.value) || 0)}
                        className={inputClass}
                        title={algorithm === 'mlq' ? 'Queue level (0 = highest)' : 'Priority'}
                      />
                    )}
                    {(algorithm === 'lottery' || algorithm === 'stride') && (
                      <input
                        type="number"
                        min={1}
                        value={algorithm === 'lottery' ? (p.tickets ?? 1) : (p.stride ?? 1000)}
                        onChange={(e) =>
                          updateProcess(
                            p.pid,
                            algorithm === 'lottery' ? 'tickets' : 'stride',
                            Math.max(1, Number(e.target.value) || 1)
                          )
                        }
                        className={inputClass}
                        title={algorithm === 'lottery' ? 'Number of lottery tickets' : 'Stride (inverse of share)'}
                      />
                    )}
                    {algorithm === 'fcfs_io' && (
                      <input
                        type="text"
                        value={(p.bursts ?? [p.burstTime]).join(',')}
                        onChange={(e) => {
                          const parsed = e.target.value
                            .split(',')
                            .map((s) => parseInt(s.trim(), 10))
                            .filter((n) => !Number.isNaN(n) && n >= 0);
                          updateProcess(p.pid, 'bursts', parsed.length > 0 ? parsed : [p.burstTime]);
                        }}
                        className={inputClass}
                        placeholder="3,2,1,1"
                        title="CPU, I/O, CPU, I/O... (comma-separated)"
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
        <div ref={tourResultsRef} className="flex-1 p-6 lg:p-8 lg:h-[calc(100vh-80px)] lg:overflow-y-auto">
          <div className="mb-8">
            <p className="font-mono text-[11px] tracking-[0.25em] text-white/40 uppercase mb-2">
              Real-time Results
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Simulation Output
            </h2>
          </div>

          {compareMode && result && (compareCount === 2 ? resultB : compareCount === 3 ? resultB && resultC : resultB && resultC && resultD) ? (
            (() => {
              const compareResults = [result, resultB!, compareCount >= 3 ? resultC! : null, compareCount >= 4 ? resultD! : null].filter(Boolean) as SimulateResponse[];
              const metricsKeys = [
                { key: 'avgWaitingTime' as const, label: 'Avg waiting time', lowerIsBetter: true },
                { key: 'avgTurnaroundTime' as const, label: 'Avg turnaround time', lowerIsBetter: true },
                { key: 'avgResponseTime' as const, label: 'Avg response time', lowerIsBetter: true },
                { key: 'contextSwitches' as const, label: 'Context switches', lowerIsBetter: true },
                { key: 'throughput' as const, label: 'Throughput', lowerIsBetter: false },
              ];
              return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Compare header */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider">Comparing</span>
                {compareResults.map((r, i) => (
                  <span key={i}>
                    {i > 0 && <span className="text-white/40 font-mono text-sm mx-1">vs</span>}
                    <span className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 font-display font-semibold text-white text-sm">
                      {ALG_LABELS[r.usedAlgorithm]}
                    </span>
                  </span>
                ))}
              </div>

              {/* Metrics comparison table */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-x-auto">
                <table className="w-full min-w-[400px]">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-4 px-4 font-mono text-[10px] text-white/40 uppercase tracking-wider w-1/4">Metric</th>
                      {compareResults.map((r, i) => (
                        <th key={i} className="text-center py-4 px-3 font-mono text-[10px] text-white/40 uppercase tracking-wider whitespace-nowrap">
                          {ALG_LABELS[r.usedAlgorithm]}
                        </th>
                      ))}
                      <th className="text-center py-4 px-4 font-mono text-[10px] text-white/40 uppercase tracking-wider w-20">Best</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {metricsKeys.map(({ key, label, lowerIsBetter }) => {
                      const values = compareResults.map((r) => r.metrics[key]);
                      const numValues = values.filter((v): v is number => typeof v === 'number');
                      const bestVal = numValues.length === 0 ? null : lowerIsBetter ? Math.min(...numValues) : Math.max(...numValues);
                      return (
                        <tr key={key} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4 font-mono text-sm text-white/70">{label}</td>
                          {compareResults.map((r, i) => {
                            const v = r.metrics[key];
                            const valStr = typeof v === 'number' ? v.toFixed(2) : String(v);
                            const isBest = typeof v === 'number' && v === bestVal;
                            return (
                              <td key={i} className={`py-3 px-3 text-center font-mono text-sm ${isBest ? 'text-green-400 font-semibold' : 'text-white/90'}`}>
                                {valStr}
                              </td>
                            );
                          })}
                          <td className="py-3 px-4 text-center">
                            {(() => {
                              const winners = compareResults.filter((r) => typeof r.metrics[key] === 'number' && r.metrics[key] === bestVal);
                              if (winners.length === 0) return <span className="text-white/40 text-xs">—</span>;
                              return <span className="text-green-400 text-xs font-mono">{winners.map((r) => ALG_LABELS[r.usedAlgorithm]).join(', ')}</span>;
                            })()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Gantt charts stacked */}
              <div className="space-y-6">
                {compareResults.map((r, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Gantt chart</span>
                      <span className="px-2.5 py-1 rounded-md bg-white/10 font-display font-semibold text-white text-sm">
                        {ALG_LABELS[r.usedAlgorithm]}
                      </span>
                    </div>
                    <GanttChart data={r.ganttChart} maxTime={Math.max(...r.ganttChart.map((e) => e.end), 1)} height={160} />
                  </div>
                ))}
              </div>
            </motion.div>
              );
            })()
          ) : result ? (
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

              {/* Metrics — click for explanation */}
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-8">
                {(
                  [
                    { key: 'avgWaitingTime' as const, label: 'Avg Waiting', value: result.metrics.avgWaitingTime.toFixed(2), unit: 'ms' },
                    { key: 'avgTurnaroundTime' as const, label: 'Avg Turnaround', value: result.metrics.avgTurnaroundTime.toFixed(2), unit: 'ms' },
                    { key: 'avgResponseTime' as const, label: 'Avg Response', value: result.metrics.avgResponseTime.toFixed(2), unit: 'ms' },
                    { key: 'throughput' as const, label: 'Throughput', value: result.metrics.throughput.toFixed(2), unit: 'p/ms' },
                    { key: 'contextSwitches' as const, label: 'Context Switches', value: String(result.metrics.contextSwitches), unit: '' },
                  ] as const
                ).map((m, i) => (
                  <motion.button
                    key={m.key}
                    type="button"
                    onClick={() => setMetricExplanationKey(m.key)}
                    className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left hover:bg-white/[0.06] hover:border-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    title="Click to learn how this is calculated"
                  >
                    <p className="font-mono text-[10px] text-white/40 tracking-wider uppercase mb-1 flex items-center justify-between">
                      <span>{m.label}</span>
                      <span className="text-white/30 hover:text-white/60 transition-colors" title="Click for formula & breakdown">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                    </p>
                    <p className="text-xl font-display font-semibold text-white tracking-tight">
                      {m.value}
                      {m.unit && <span className="text-white/50 text-sm ml-1">{m.unit}</span>}
                    </p>
                  </motion.button>
                ))}
              </div>

              <MetricExplanationModal
                open={metricExplanationKey !== null}
                onClose={() => setMetricExplanationKey(null)}
                metricKey={metricExplanationKey}
                result={result}
              />

              {/* Step narration: aria-live for screen readers; visible when "Show step narration" is on */}
              <div
                aria-live="polite"
                aria-atomic="true"
                className={showStepNarration ? 'mb-3 px-4 py-2 rounded-lg bg-white/[0.06] border border-white/10 text-sm text-white/80 font-sans' : 'sr-only'}
                role="status"
              >
                {stepNarration || (stepIndex < 0 && result?.ganttChart?.length ? 'Showing all steps.' : '')}
              </div>

              {/* Step controls – next to Gantt Chart */}
              <div ref={tourGanttRef} className="space-y-4">
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => { setPlaying(false); setStepIndex((i) => Math.max(-1, i - 1)); }}
                    className="p-2 rounded-lg border border-white/20 text-white/80 hover:bg-white/10 font-mono text-xs"
                    title="Previous step (←)"
                    aria-label="Previous step"
                  >←</button>
                  <button
                    type="button"
                    onClick={() => setPlaying((p) => !p)}
                    disabled={!result.ganttChart.length}
                    className="p-2 rounded-lg border border-white/20 text-white/80 hover:bg-white/10 font-mono text-xs disabled:opacity-50"
                    title={playing ? 'Pause (Space)' : 'Play (Space)'}
                    aria-label={playing ? 'Pause' : 'Play'}
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
                    title="Next step (→)"
                    aria-label="Next step"
                  >→</button>
                  <button
                    type="button"
                    onClick={() => { setPlaying(false); setStepIndex(-1); }}
                    className="p-2 rounded-lg border border-white/20 text-white/80 hover:bg-white/10 font-mono text-xs"
                    title="Reset to show all steps (R)"
                    aria-label="Reset steps"
                  >↺</button>
                </div>
                {result?.ganttChart?.length ? (
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider mr-1">Speed</span>
                    {([0.5, 1, 2] as const).map((speed) => (
                      <button
                        key={speed}
                        type="button"
                        onClick={() => setPlaybackSpeed(speed)}
                        className={`px-2.5 py-1 rounded-lg font-mono text-xs border transition-all ${
                          playbackSpeed === speed ? 'bg-white/20 border-white/40 text-white' : 'border-white/20 text-white/70 hover:bg-white/10'
                        }`}
                        title={`${speed}x playback`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                ) : null}
                <span className="font-mono text-white/50 text-xs">
                  Step {stepIndex < 0 ? 'all' : `${stepIndex + 1} / ${result.ganttChart?.length ?? 0}`}
                </span>
                {currentStepEntry && (
                  <span className="text-white/60 text-xs">
                    Current: P{currentStepEntry.pid} (t={currentStepEntry.start}–{currentStepEntry.end})
                  </span>
                )}
                {/* Compact ready queue pills */}
                {currentStepEntry && readyQueueExcludingRunning.length > 0 && (
                  <span className="flex items-center gap-1.5 text-xs">
                    <span className="text-white/40 font-mono">Ready:</span>
                    <span className="flex items-center gap-1">
                      {readyQueueExcludingRunning.map((pid) => (
                        <span
                          key={pid}
                          className="inline-flex items-center justify-center min-w-[28px] px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-mono text-white/80"
                        >
                          P{pid}
                        </span>
                      ))}
                    </span>
                  </span>
                )}
              </div>

              {/* Combined: Process states + Why + CPU + Ready queue */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-white/10 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Step view</span>
                    {currentStepEntry && (
                      <span className="font-mono text-xs text-white/60">
                        P{currentStepEntry.pid} runs for {currentStepEntry.end - currentStepEntry.start} unit(s) (t={currentStepEntry.start}→{currentStepEntry.end})
                      </span>
                    )}
                    {stepIndex < 0 && <span className="font-mono text-xs text-white/40">Show all</span>}
                  </div>
                  <div className="p-4 sm:p-5 space-y-5">
                    {/* Row 1: Process states + Why this process? */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <ProcessStateDiagram
                        counts={processStateCountsAtStep}
                        highlight={currentStepEntry?.pid ? 'running' : null}
                        className="flex-shrink-0"
                      />
                      {whyThisProcessReason && (
                        <p className="font-sans text-sm text-white/90 border-l-2 border-white/30 pl-4 py-0.5" role="status">
                          <span className="text-white/50 font-mono text-xs uppercase tracking-wider">Why this process? </span>
                          <span className="italic">{whyThisProcessReason}</span>
                        </p>
                      )}
                    </div>

                    {/* Row 2: CPU + Preemption + Ready queue (single flow) */}
                    <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-white/10">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider">CPU</span>
                        {currentStepEntry?.pid && currentStepEntry.pid > 0 ? (
                          <motion.div
                            key={`running-${currentStepEntry.pid}`}
                            className="flex items-center justify-center min-w-[56px] h-12 rounded-xl font-mono font-bold text-base text-black bg-white border-2 border-white/90 shadow-lg shadow-white/20"
                            initial={false}
                            animate={{ scale: [1, 1.03, 1], boxShadow: ['0 4px 20px rgba(0,0,0,0.3)', '0 0 0 3px rgba(255,255,255,0.4)', '0 4px 20px rgba(0,0,0,0.3)'] }}
                            transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse' }}
                          >
                            P{currentStepEntry.pid}
                          </motion.div>
                        ) : (
                          <div className="min-w-[56px] h-12 rounded-xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center font-mono text-xs text-white/40">
                            Idle
                          </div>
                        )}
                        {isPreemptionAtStep && (
                          <span className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 border border-amber-400/40 font-mono text-[10px] text-amber-300 uppercase tracking-wider">
                            Preemption
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider flex-shrink-0">Ready queue</span>
                        <div className="flex flex-wrap items-center gap-2 min-h-[48px]">
                          {readyQueueExcludingRunning.length === 0 ? (
                            <span className="font-mono text-xs text-white/30">(empty)</span>
                          ) : (
                            readyQueueExcludingRunning.map((pid) => (
                              <motion.span
                                key={pid}
                                layout
                                className="inline-flex items-center justify-center min-w-[44px] h-10 rounded-lg font-mono text-sm font-medium text-white/90 bg-white/10 border border-white/20"
                              >
                                P{pid}
                              </motion.span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Pushed back (when relevant) */}
                    {pushedBackPidAtStep !== null && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="font-mono text-[10px] text-white/50 uppercase tracking-wider">Pushed back</span>
                        <span className="inline-flex items-center justify-center min-w-[44px] h-9 rounded-lg font-mono text-sm font-semibold text-white/90 bg-white/15 border-2 border-white/30">
                          P{pushedBackPidAtStep}
                        </span>
                        <span className="text-white/40 text-sm">→</span>
                        <span className="font-mono text-xs text-white/50">back to ready queue</span>
                      </div>
                    )}

                    {/* Fallback step explanation when no "why" (e.g. show all) */}
                    {stepIndex < 0 && stepExplanation && (
                      <p className="font-sans text-xs text-white/60 pt-1 border-t border-white/5" role="status">
                        {stepExplanation}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

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
              </div>

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
