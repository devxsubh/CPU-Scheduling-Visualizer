import type { ProcessInput, GanttEntry, SimulationResult } from '../types';
import { computeMetrics } from '../metrics';

export function runSJF(processes: ProcessInput[]): SimulationResult {
  const ganttChart: GanttEntry[] = [];
  const remaining = processes.map((p) => ({ ...p, remainingBurst: p.burstTime }));
  let currentTime = 0;

  while (remaining.some((p) => p.remainingBurst > 0)) {
    const ready = remaining.filter((p) => p.arrivalTime <= currentTime && p.remainingBurst > 0);
    if (ready.length === 0) {
      const next = remaining.filter((p) => p.remainingBurst > 0).sort((a, b) => a.arrivalTime - b.arrivalTime)[0];
      if (!next) break;
      currentTime = next.arrivalTime;
      continue;
    }
    const shortest = ready.sort((a, b) => a.remainingBurst - b.remainingBurst)[0];
    const start = currentTime;
    const duration = shortest.remainingBurst;
    shortest.remainingBurst = 0;
    currentTime += duration;
    ganttChart.push({ pid: shortest.pid, start, end: currentTime });
  }

  const { processes: processResults, metrics, contextSwitches } = computeMetrics(ganttChart, processes);
  return { ganttChart, processes: processResults, metrics, contextSwitches };
}
