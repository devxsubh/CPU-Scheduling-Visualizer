import type { ProcessInput, GanttEntry, SimulationResult } from '../types';
import { computeMetrics } from '../metrics';

/** Default stride when not set (large number / weight 1). */
const DEFAULT_STRIDE = 1000;

/**
 * Stride scheduling: deterministic proportional-share. Each process has a
 * stride (inverse of share). Run the process with smallest "pass" value;
 * after running for quantum, add its stride to pass.
 */
export function runStride(
  processes: ProcessInput[],
  timeQuantum: number
): SimulationResult {
  const ganttChart: GanttEntry[] = [];
  const remaining = processes.map((p) => ({
    ...p,
    remainingBurst: p.burstTime,
    stride: p.stride ?? DEFAULT_STRIDE,
    pass: 0,
  }));
  let currentTime = 0;
  let lastPid: number | null = null;

  function getReady() {
    return remaining.filter((p) => p.arrivalTime <= currentTime && p.remainingBurst > 0);
  }

  while (true) {
    const ready = getReady();
    if (ready.length === 0) {
      const left = remaining.filter((p) => p.remainingBurst > 0);
      if (left.length === 0) break;
      currentTime = Math.min(...left.map((p) => p.arrivalTime));
      continue;
    }

    const p = ready.reduce((a, b) => (a.pass <= b.pass ? a : b));
    if (lastPid !== null && lastPid !== p.pid) {
      ganttChart.push({ pid: -1, start: currentTime, end: currentTime, isContextSwitch: true });
    }
    lastPid = p.pid;

    const start = currentTime;
    const duration = Math.min(timeQuantum, p.remainingBurst);
    p.remainingBurst -= duration;
    p.pass += p.stride;
    currentTime += duration;
    ganttChart.push({ pid: p.pid, start, end: currentTime });
    if (p.remainingBurst <= 0) lastPid = null;
  }

  const { processes: processResults, metrics, contextSwitches } = computeMetrics(ganttChart, processes);
  return { ganttChart, processes: processResults, metrics, contextSwitches };
}
