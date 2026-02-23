import type { ProcessInput, SimulateResponse, GanttEntry } from '@/types';
import { computeMetrics } from '@/lib/cpu-scheduler/metrics';
import { injectContextSwitchCost } from '@/lib/cpu-scheduler/context-switch-cost';

export interface CustomState {
  ready: Array<{
    pid: number;
    remainingBurst: number;
    arrivalTime: number;
    burstTime: number;
    priority?: number;
  }>;
  time: number;
}

/**
 * Run a user-defined scheduling strategy in the browser.
 * Code must evaluate to a function (state: CustomState) => number (pid).
 * Runs with time quantum; strategy is called each quantum to pick next process.
 */
export function runCustomAlgorithm(
  processes: ProcessInput[],
  code: string,
  timeQuantum: number,
  contextSwitchCost = 0
): SimulateResponse {
  let picker: (state: CustomState) => number;
  try {
    const fn = new Function('return (' + code.trim() + ')')();
    if (typeof fn !== 'function') throw new Error('Code must evaluate to a function (state) => pid');
    picker = fn;
  } catch (e) {
    throw new Error('Invalid custom strategy: ' + (e instanceof Error ? e.message : String(e)));
  }

  const ganttChart: GanttEntry[] = [];
  const remaining = processes.map((p) => ({ ...p, remainingBurst: p.burstTime }));
  let currentTime = 0;
  let lastPid: number | null = null;

  while (true) {
    const ready = remaining.filter((p) => p.arrivalTime <= currentTime && p.remainingBurst > 0);
    if (ready.length === 0) {
      const left = remaining.filter((p) => p.remainingBurst > 0);
      if (left.length === 0) break;
      currentTime = Math.min(...left.map((p) => p.arrivalTime));
      continue;
    }

    const state: CustomState = {
      ready: ready.map((p) => ({
        pid: p.pid,
        remainingBurst: p.remainingBurst,
        arrivalTime: p.arrivalTime,
        burstTime: p.burstTime,
        priority: p.priority,
      })),
      time: currentTime,
    };

    let pid: number;
    try {
      pid = picker(state);
    } catch {
      pid = ready[0].pid;
    }

    const p = ready.find((r) => r.pid === pid) ?? ready[0];
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

  let finalGantt = ganttChart;
  if (contextSwitchCost > 0) {
    finalGantt = injectContextSwitchCost(ganttChart, contextSwitchCost);
  } else {
    finalGantt = ganttChart.filter((e) => !e.isContextSwitch);
  }

  const { processes: processResults, metrics, contextSwitches } = computeMetrics(finalGantt, processes);

  return {
    chosenAlgorithm: 'custom',
    usedAlgorithm: 'custom',
    reasonSwitched: null,
    ganttChart: finalGantt,
    metrics,
    processes: processResults,
    contextSwitches,
  };
}
