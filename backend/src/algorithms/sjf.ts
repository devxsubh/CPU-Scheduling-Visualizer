import type { ProcessInput, GanttEntry, SimulationResult } from '../types';
import { computeMetrics } from '../metrics';

/**
 * Preemptive SJF (Shortest Remaining Time First - SRTF).
 * At each time we run the process with the smallest remaining burst among those that have arrived.
 * When a new process arrives, we re-evaluate and preempt if it has a shorter remaining time.
 */
export function runSJF(processes: ProcessInput[]): SimulationResult {
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

    const shortest = ready.reduce((a, b) =>
      a.remainingBurst <= b.remainingBurst ? a : b
    );
    const runUntil = shortest.remainingBurst;
    const nextArrivalTimes = remaining
      .filter((p) => p.remainingBurst > 0 && p.arrivalTime > currentTime)
      .map((p) => p.arrivalTime);
    const nextArrival =
      nextArrivalTimes.length > 0 ? Math.min(...nextArrivalTimes) : Infinity;
    const duration = Math.min(runUntil, nextArrival - currentTime);

    if (duration <= 0) {
      currentTime = nextArrival;
      continue;
    }

    const start = currentTime;
    shortest.remainingBurst -= duration;
    currentTime += duration;
    ganttChart.push({ pid: shortest.pid, start, end: currentTime });
  }

  const { processes: processResults, metrics, contextSwitches } = computeMetrics(
    ganttChart,
    processes
  );
  return { ganttChart, processes: processResults, metrics, contextSwitches };
}
