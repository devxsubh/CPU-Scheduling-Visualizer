import type { ProcessInput, GanttEntry, SimulationResult } from '../types';
import { computeMetrics } from '../metrics';

/**
 * Preemptive Longest Remaining Time First: at each moment run the ready process with largest remaining burst; preempt when a longer job arrives.
 */
export function runLRTF(processes: ProcessInput[]): SimulationResult {
  const ganttChart: GanttEntry[] = [];
  const remaining = processes.map((p) => ({ ...p, remainingBurst: p.burstTime }));
  let currentTime = 0;

  while (true) {
    const ready = remaining.filter((p) => p.arrivalTime <= currentTime && p.remainingBurst > 0);
    if (ready.length === 0) {
      const left = remaining.filter((p) => p.remainingBurst > 0);
      if (left.length === 0) break;
      const nextArrival = Math.min(...left.map((p) => p.arrivalTime));
      currentTime = nextArrival;
      continue;
    }
    const longest = ready.reduce((a, b) => (a.remainingBurst >= b.remainingBurst ? a : b));
    const runUntil = longest.remainingBurst;
    const nextArrivalTimes = remaining
      .filter((p) => p.remainingBurst > 0 && p.arrivalTime > currentTime)
      .map((p) => p.arrivalTime);
    const nextArrival = nextArrivalTimes.length > 0 ? Math.min(...nextArrivalTimes) : Infinity;
    const duration = Math.min(runUntil, nextArrival - currentTime);

    if (duration <= 0) {
      currentTime = nextArrival;
      continue;
    }

    const start = currentTime;
    longest.remainingBurst -= duration;
    currentTime += duration;
    ganttChart.push({ pid: longest.pid, start, end: currentTime });
  }

  const { processes: processResults, metrics, contextSwitches } = computeMetrics(ganttChart, processes);
  return { ganttChart, processes: processResults, metrics, contextSwitches };
}
