import type { ProcessInput, GanttEntry, SimulationResult } from '../types';
import { computeMetrics } from '../metrics';

/**
 * Non-preemptive Highest Response Ratio Next (HRRN).
 * Response Ratio = (Waiting Time + Burst Time) / Burst Time.
 * At each scheduling point, select the ready process with highest response ratio; run to completion.
 */
export function runHRRN(processes: ProcessInput[]): SimulationResult {
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
    const withRR = ready.map((p) => {
      const waiting = currentTime - p.arrivalTime;
      const rr = (waiting + p.remainingBurst) / p.remainingBurst;
      return { p, rr };
    });
    const chosen = withRR.reduce((a, b) => (a.rr >= b.rr ? a : b)).p;
    const start = currentTime;
    currentTime += chosen.remainingBurst;
    chosen.remainingBurst = 0;
    ganttChart.push({ pid: chosen.pid, start, end: currentTime });
  }

  const { processes: processResults, metrics, contextSwitches } = computeMetrics(ganttChart, processes);
  return { ganttChart, processes: processResults, metrics, contextSwitches };
}
