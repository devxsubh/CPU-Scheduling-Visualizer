import type { ProcessInput, GanttEntry, SimulationResult } from '../types';
import { computeMetrics } from '../metrics';

/**
 * Non-preemptive Shortest Job First: select the ready process with smallest burst time; run to completion.
 */
export function runSJFNonPreemptive(processes: ProcessInput[]): SimulationResult {
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
    const shortest = ready.reduce((a, b) => (a.remainingBurst <= b.remainingBurst ? a : b));
    const start = currentTime;
    currentTime += shortest.remainingBurst;
    shortest.remainingBurst = 0;
    ganttChart.push({ pid: shortest.pid, start, end: currentTime });
  }

  const { processes: processResults, metrics, contextSwitches } = computeMetrics(ganttChart, processes);
  return { ganttChart, processes: processResults, metrics, contextSwitches };
}
