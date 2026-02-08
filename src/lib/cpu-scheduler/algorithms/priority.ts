import type { ProcessInput, GanttEntry, SimulationResult } from '../types';
import { computeMetrics } from '../metrics';

export function runPriority(processes: ProcessInput[]): SimulationResult {
  const ganttChart: GanttEntry[] = [];
  const remaining = processes.map((p) => ({
    ...p,
    remainingBurst: p.burstTime,
    priority: p.priority ?? 0,
  }));
  let currentTime = 0;

  while (remaining.some((p) => p.remainingBurst > 0)) {
    const ready = remaining.filter((p) => p.arrivalTime <= currentTime && p.remainingBurst > 0);
    if (ready.length === 0) {
      const next = remaining.filter((p) => p.remainingBurst > 0).sort((a, b) => a.arrivalTime - b.arrivalTime)[0];
      if (!next) break;
      currentTime = next.arrivalTime;
      continue;
    }
    const highest = ready.sort((a, b) => a.priority! - b.priority!)[0];
    const start = currentTime;
    const duration = highest.remainingBurst;
    highest.remainingBurst = 0;
    currentTime += duration;
    ganttChart.push({ pid: highest.pid, start, end: currentTime });
  }

  const { processes: processResults, metrics, contextSwitches } = computeMetrics(ganttChart, processes);
  return { ganttChart, processes: processResults, metrics, contextSwitches };
}
