import type { ProcessInput, GanttEntry, SimulationResult } from '../types';
import { computeMetrics } from '../metrics';

const DEFAULT_LEVELS = 3;

/**
 * Multilevel Feedback Queue (MLFQ): processes start in the top queue (0).
 * Each queue runs Round Robin. If a process uses its full quantum it is
 * demoted to the next queue; when it finishes it leaves. Lower queue index
 * = higher priority. Time quantum is the same for all levels (can be extended to per-level).
 */
export function runMLFQ(
  processes: ProcessInput[],
  timeQuantum: number,
  numLevels: number = DEFAULT_LEVELS
): SimulationResult {
  const ganttChart: GanttEntry[] = [];
  const remaining = processes.map((p) => ({
    ...p,
    remainingBurst: p.burstTime,
    currentLevel: 0, // all start in top queue
  }));

  const queues: (typeof remaining)[] = Array.from({ length: numLevels }, () => []);
  let currentTime = 0;
  let lastPid: number | null = null;

  function enqueueReady() {
    for (const p of remaining) {
      if (p.arrivalTime <= currentTime && p.remainingBurst > 0) {
        const q = queues[p.currentLevel];
        if (!q.includes(p)) q.push(p);
      }
    }
  }

  function getNextProcess(): (typeof remaining)[0] | null {
    enqueueReady();
    for (let level = 0; level < numLevels; level++) {
      const q = queues[level];
      if (q.length > 0 && q[0].arrivalTime <= currentTime && q[0].remainingBurst > 0) {
        return q.shift()!;
      }
    }
    return null;
  }

  while (true) {
    let p = getNextProcess();
    if (!p) {
      const left = remaining.filter((x) => x.remainingBurst > 0);
      if (left.length === 0) break;
      const nextArrival = Math.min(...left.map((x) => x.arrivalTime));
      currentTime = nextArrival;
      continue;
    }

    if (lastPid !== null && lastPid !== p.pid) {
      ganttChart.push({ pid: -1, start: currentTime, end: currentTime, isContextSwitch: true });
    }
    lastPid = p.pid;

    const start = currentTime;
    const duration = Math.min(timeQuantum, p.remainingBurst);
    const usedFullQuantum = duration === timeQuantum && p.remainingBurst - duration > 0;
    p.remainingBurst -= duration;
    currentTime += duration;
    ganttChart.push({ pid: p.pid, start, end: currentTime });

    if (p.remainingBurst > 0) {
      if (usedFullQuantum && p.currentLevel < numLevels - 1) {
        p.currentLevel += 1; // demote to next queue
      }
      queues[p.currentLevel].push(p);
    } else {
      lastPid = null;
    }
  }

  const { processes: processResults, metrics, contextSwitches } = computeMetrics(ganttChart, processes);
  return { ganttChart, processes: processResults, metrics, contextSwitches };
}
