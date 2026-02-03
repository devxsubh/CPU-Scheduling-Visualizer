import type { ProcessInput, GanttEntry, SimulationResult } from '../types';
import { computeMetrics } from '../metrics';

export function runRoundRobin(processes: ProcessInput[], timeQuantum: number): SimulationResult {
  const ganttChart: GanttEntry[] = [];
  const remaining = processes.map((p) => ({ ...p, remainingBurst: p.burstTime }));
  const queue: typeof remaining = [];
  let currentTime = 0;
  let lastPid: number | null = null;

  function enqueueReady() {
    for (const p of remaining) {
      if (p.arrivalTime <= currentTime && p.remainingBurst > 0 && !queue.includes(p)) {
        queue.push(p);
      }
    }
  }

  enqueueReady();
  if (queue.length === 0) {
    const next = remaining.filter((p) => p.remainingBurst > 0).sort((a, b) => a.arrivalTime - b.arrivalTime)[0];
    if (next) {
      currentTime = next.arrivalTime;
      queue.push(next);
    }
  }

  while (queue.length > 0) {
    const p = queue.shift()!;
    if (p.remainingBurst <= 0) continue;

    if (lastPid !== null && lastPid !== p.pid) {
      ganttChart.push({ pid: -1, start: currentTime, end: currentTime, isContextSwitch: true });
    }
    lastPid = p.pid;

    const start = currentTime;
    const duration = Math.min(timeQuantum, p.remainingBurst);
    p.remainingBurst -= duration;
    currentTime += duration;
    ganttChart.push({ pid: p.pid, start, end: currentTime });

    for (const other of remaining) {
      if (other !== p && other.arrivalTime <= currentTime && other.remainingBurst > 0 && !queue.includes(other)) {
        queue.push(other);
      }
    }
    if (p.remainingBurst > 0) queue.push(p);
    else lastPid = null;
  }

  const { processes: processResults, metrics, contextSwitches } = computeMetrics(ganttChart, processes);
  return { ganttChart, processes: processResults, metrics, contextSwitches };
}
