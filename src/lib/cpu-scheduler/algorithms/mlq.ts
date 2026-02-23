import type { ProcessInput, GanttEntry, SimulationResult } from '../types';
import { computeMetrics } from '../metrics';

/**
 * Multilevel Queue (MLQ): processes are permanently in a queue by priority (queue level).
 * Lower priority number = higher priority queue (queue 0 is highest).
 * Each queue is scheduled with Round Robin. The scheduler always picks from the
 * highest-priority non-empty queue.
 */
export function runMLQ(processes: ProcessInput[], timeQuantum: number): SimulationResult {
  const ganttChart: GanttEntry[] = [];
  const remaining = processes.map((p) => ({
    ...p,
    remainingBurst: p.burstTime,
    queueLevel: p.priority ?? 0,
  }));

  // Queues: index = queue level (0 = highest priority). Each queue is FIFO for RR.
  const queueLevels = [...new Set(remaining.map((p) => p.queueLevel))].sort((a, b) => a - b);
  const queues = new Map<number, typeof remaining>([]);
  queueLevels.forEach((level) => queues.set(level, []));

  let currentTime = 0;
  let lastPid: number | null = null;

  function enqueueReady() {
    for (const p of remaining) {
      if (p.arrivalTime <= currentTime && p.remainingBurst > 0) {
        const q = queues.get(p.queueLevel)!;
        if (!q.includes(p)) q.push(p);
      }
    }
  }

  function getNextProcess(): (typeof remaining)[0] | null {
    enqueueReady();
    for (const level of queueLevels) {
      const q = queues.get(level)!;
      while (q.length > 0) {
        const p = q[0];
        if (p.arrivalTime <= currentTime && p.remainingBurst > 0) {
          q.shift();
          return p;
        }
        q.shift(); // not ready yet, skip (shouldn't happen if enqueueReady runs at each step)
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
    p.remainingBurst -= duration;
    currentTime += duration;
    ganttChart.push({ pid: p.pid, start, end: currentTime });

    if (p.remainingBurst > 0) {
      queues.get(p.queueLevel)!.push(p);
    } else {
      lastPid = null;
    }
  }

  const { processes: processResults, metrics, contextSwitches } = computeMetrics(ganttChart, processes);
  return { ganttChart, processes: processResults, metrics, contextSwitches };
}
