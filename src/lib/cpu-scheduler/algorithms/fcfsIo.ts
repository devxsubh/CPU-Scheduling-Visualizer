import type { ProcessInput, GanttEntry, SimulationResult } from '../types';
import { computeMetrics } from '../metrics';

/** Get (CPU, I/O) segment pairs. No bursts => single (burstTime, 0). */
function getSegments(p: ProcessInput): Array<[number, number]> {
  if (!p.bursts || p.bursts.length === 0) {
    return [[p.burstTime, 0]];
  }
  const segs: Array<[number, number]> = [];
  for (let i = 0; i < p.bursts.length; i += 2) {
    const cpu = p.bursts[i] ?? 0;
    const io = p.bursts[i + 1] ?? 0;
    segs.push([cpu, io]);
  }
  return segs;
}

/** Total CPU time for metrics (waiting = turnaround - totalCpu). */
function getTotalCpu(p: ProcessInput): number {
  if (!p.bursts || p.bursts.length === 0) return p.burstTime;
  return p.bursts.filter((_, i) => i % 2 === 0).reduce((s, x) => s + x, 0);
}

/**
 * FCFS with I/O bursts: processes have optional bursts [cpu1, io1, cpu2, io2, ...].
 * While in I/O the process is blocked and does not use CPU.
 */
export function runFCFSWithIO(processes: ProcessInput[]): SimulationResult {
  const ganttChart: GanttEntry[] = [];
  const segments = processes.map((p) => getSegments(p));
  type ProcState = {
    p: ProcessInput;
    segIndex: number;
    remainingCpu: number;
    blockedUntil: number;
    readyTime: number;
  };
  const state: ProcState[] = processes.map((p, i) => ({
    p,
    segIndex: 0,
    remainingCpu: segments[i][0][0],
    blockedUntil: 0,
    readyTime: p.arrivalTime,
  }));

  let currentTime = 0;

  while (true) {
    const ready = state.filter(
      (s) =>
        s.p.arrivalTime <= currentTime &&
        s.remainingCpu > 0 &&
        s.blockedUntil <= currentTime
    );
    if (ready.length === 0) {
      const pending = state.filter((s) => s.remainingCpu > 0 || s.blockedUntil > currentTime);
      if (pending.length === 0) break;
      const nextUnblock = Math.min(...pending.map((s) => (s.blockedUntil > currentTime ? s.blockedUntil : Infinity)));
      const nextArrival = Math.min(...pending.filter((s) => s.p.arrivalTime > currentTime).map((s) => s.p.arrivalTime), Infinity);
      currentTime = Math.min(nextUnblock, nextArrival);
      continue;
    }

    const first = ready.reduce((a, b) => (a.readyTime <= b.readyTime ? a : b));
    const start = currentTime;
    const duration = first.remainingCpu;
    first.remainingCpu = 0;
    currentTime += duration;
    ganttChart.push({ pid: first.p.pid, start, end: currentTime });

    const seg = segments[processes.indexOf(first.p)][first.segIndex];
    const ioDuration = seg[1];
    first.segIndex += 1;
    const segs = segments[processes.indexOf(first.p)];
    if (first.segIndex < segs.length) {
      first.remainingCpu = segs[first.segIndex][0];
      first.blockedUntil = ioDuration > 0 ? currentTime + ioDuration : currentTime;
      first.readyTime = first.blockedUntil;
    }
  }

  const processesForMetrics = processes.map((p) => ({
    ...p,
    burstTime: getTotalCpu(p),
  }));
  const { processes: processResults, metrics, contextSwitches } = computeMetrics(ganttChart, processesForMetrics);
  return { ganttChart, processes: processResults, metrics, contextSwitches };
}
