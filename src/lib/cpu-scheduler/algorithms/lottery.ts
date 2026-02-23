import type { ProcessInput, GanttEntry, SimulationResult } from '../types';
import { computeMetrics } from '../metrics';

/**
 * Lottery scheduling: each process has tickets; each quantum a random ticket
 * wins and that process runs. Proportional-share scheduling.
 */
export function runLottery(
  processes: ProcessInput[],
  timeQuantum: number
): SimulationResult {
  const ganttChart: GanttEntry[] = [];
  const remaining = processes.map((p) => ({
    ...p,
    remainingBurst: p.burstTime,
    tickets: Math.max(1, p.tickets ?? 1),
  }));
  let currentTime = 0;
  let lastPid: number | null = null;

  function getReady() {
    return remaining.filter((p) => p.arrivalTime <= currentTime && p.remainingBurst > 0);
  }

  function pickWinner(ready: typeof remaining): (typeof remaining)[0] | null {
    if (ready.length === 0) return null;
    const totalTickets = ready.reduce((s, p) => s + p.tickets, 0);
    let r = Math.random() * totalTickets;
    for (const p of ready) {
      r -= p.tickets;
      if (r <= 0) return p;
    }
    return ready[ready.length - 1];
  }

  while (true) {
    const ready = getReady();
    if (ready.length === 0) {
      const left = remaining.filter((p) => p.remainingBurst > 0);
      if (left.length === 0) break;
      currentTime = Math.min(...left.map((p) => p.arrivalTime));
      continue;
    }

    const p = pickWinner(ready)!;
    if (lastPid !== null && lastPid !== p.pid) {
      ganttChart.push({ pid: -1, start: currentTime, end: currentTime, isContextSwitch: true });
    }
    lastPid = p.pid;

    const start = currentTime;
    const duration = Math.min(timeQuantum, p.remainingBurst);
    p.remainingBurst -= duration;
    currentTime += duration;
    ganttChart.push({ pid: p.pid, start, end: currentTime });
    if (p.remainingBurst <= 0) lastPid = null;
  }

  const { processes: processResults, metrics, contextSwitches } = computeMetrics(ganttChart, processes);
  return { ganttChart, processes: processResults, metrics, contextSwitches };
}
