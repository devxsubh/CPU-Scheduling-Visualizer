import type { ProcessInput, GanttEntry, SimulationResult } from '../types';
import { computeMetrics } from '../metrics';

export function runFCFS(processes: ProcessInput[]): SimulationResult {
  const sorted = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  const ganttChart: GanttEntry[] = [];
  let currentTime = 0;

  for (const p of sorted) {
    const start = Math.max(currentTime, p.arrivalTime);
    const end = start + p.burstTime;
    ganttChart.push({ pid: p.pid, start, end });
    currentTime = end;
  }

  const { processes: processResults, metrics, contextSwitches } = computeMetrics(ganttChart, processes);
  return { ganttChart, processes: processResults, metrics, contextSwitches };
}
