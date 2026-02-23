import type { AlgorithmType, SimulateResponse, GanttEntry, ProcessResult } from '@/types';

/**
 * Compute remaining burst time for a process at time t from the Gantt chart.
 */
function getRemainingBurstAtTime(
  pid: number,
  t: number,
  ganttChart: GanttEntry[],
  processes: ProcessResult[]
): number {
  const proc = processes.find((p) => p.pid === pid);
  if (!proc) return 0;
  const executedByT = ganttChart
    .filter((e) => e.pid === pid && e.end <= t)
    .reduce((sum, e) => sum + (e.end - e.start), 0);
  return Math.max(0, proc.burstTime - executedByT);
}

/**
 * One-line reason why this process was chosen at the current step.
 */
export function getWhyThisProcessReason(
  algorithm: AlgorithmType,
  currentEntry: GanttEntry,
  result: SimulateResponse,
  readyQueueExcludingRunning: number[]
): string {
  const pid = currentEntry.pid;
  if (pid <= 0) return 'Context switch.';
  const t = currentEntry.start;
  const { ganttChart, processes } = result;

  switch (algorithm) {
    case 'fcfs':
      return `P${pid}: first in ready queue (FCFS).`;
    case 'sjf': {
      const remaining = getRemainingBurstAtTime(pid, t, ganttChart, processes);
      return `P${pid}: shortest remaining burst (${remaining}) among ready.`;
    }
    case 'sjf_nonpreemptive': {
      const proc = processes.find((p) => p.pid === pid);
      return proc ? `P${pid}: shortest burst (${proc.burstTime}) among ready; run to completion.` : `P${pid}: SJF (non-preemptive).`;
    }
    case 'ljf': {
      const proc = processes.find((p) => p.pid === pid);
      return proc ? `P${pid}: longest burst (${proc.burstTime}) among ready; run to completion.` : `P${pid}: LJF.`;
    }
    case 'lrtf': {
      const remaining = getRemainingBurstAtTime(pid, t, ganttChart, processes);
      return `P${pid}: longest remaining burst (${remaining}) among ready.`;
    }
    case 'hrrn': {
      const proc = processes.find((p) => p.pid === pid);
      const waiting = t - (proc?.arrivalTime ?? 0);
      const burst = proc?.burstTime ?? 0;
      const rr = burst > 0 ? ((waiting + burst) / burst).toFixed(2) : '—';
      return `P${pid}: highest response ratio (${rr}) among ready.`;
    }
    case 'round_robin':
      return readyQueueExcludingRunning.length > 0
        ? `P${pid}: next in round-robin queue; time quantum expired for previous process.`
        : `P${pid}: only ready process (round robin).`;
    case 'priority':
    case 'priority_preemptive': {
      const proc = processes.find((p) => p.pid === pid);
      const prio = proc?.priority ?? 0;
      return `P${pid}: highest priority (${prio}) among ready.`;
    }
    case 'lottery':
      return `P${pid}: won the lottery (random ticket among ready).`;
    case 'stride':
      return `P${pid}: smallest pass value among ready (stride scheduling).`;
    case 'fcfs_io':
      return `P${pid}: first ready (FCFS); was not blocked in I/O.`;
    case 'mlq':
      return `P${pid}: selected from highest-priority non-empty queue (MLQ).`;
    case 'mlfq':
      return `P${pid}: selected from current queue; may be demoted after this slice (MLFQ).`;
    case 'custom':
      return `P${pid}: selected by custom strategy.`;
    default:
      return `P${pid}: selected by scheduler.`;
  }
}

/**
 * Full sentence narration for the current step (screen readers & learning).
 * e.g. "At time 3, process P2 is selected because it has the shortest remaining burst among ready."
 */
export function getStepNarration(
  algorithm: AlgorithmType,
  currentEntry: GanttEntry | null,
  result: SimulateResponse | null,
  readyQueueExcludingRunning: number[]
): string {
  if (!currentEntry || !result || currentEntry.pid <= 0) {
    return '';
  }
  const reason = getWhyThisProcessReason(
    algorithm,
    currentEntry,
    result,
    readyQueueExcludingRunning
  );
  const t = currentEntry.start;
  const pid = currentEntry.pid;
  if (reason.startsWith('Context switch')) {
    return `At time ${t}, context switch.`;
  }
  const cleanReason = reason.replace(/^P\d+:\s*/i, '').replace(/\.$/, '');
  return `At time ${t}, process P${pid} is selected because ${cleanReason}`;
}
