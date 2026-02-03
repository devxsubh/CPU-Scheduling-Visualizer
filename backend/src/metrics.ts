import type { GanttEntry, ProcessInput, ProcessResult, Metrics } from './types';

export function computeMetrics(
  ganttChart: GanttEntry[],
  processes: ProcessInput[]
): { processes: ProcessResult[]; metrics: Metrics; contextSwitches: number } {
  const n = processes.length;
  const completionTimes = new Map<number, number>();

  for (const entry of ganttChart) {
    if (!entry.isContextSwitch) {
      completionTimes.set(entry.pid, Math.max(completionTimes.get(entry.pid) ?? 0, entry.end));
    }
  }

  const processResults: ProcessResult[] = processes.map((p) => {
    const ct = completionTimes.get(p.pid) ?? 0;
    const turnaroundTime = ct - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;
    return {
      pid: p.pid,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      priority: p.priority,
      waitingTime: Math.max(0, waitingTime),
      turnaroundTime,
      completionTime: ct,
    };
  });

  const contextSwitches = ganttChart.filter((e) => e.isContextSwitch).length;
  const totalWait = processResults.reduce((s, p) => s + p.waitingTime, 0);
  const totalTurnaround = processResults.reduce((s, p) => s + p.turnaroundTime, 0);
  const maxTime = Math.max(...processResults.map((p) => p.completionTime), 0);

  const metrics: Metrics = {
    avgWaitingTime: n > 0 ? Math.round((totalWait / n) * 100) / 100 : 0,
    avgTurnaroundTime: n > 0 ? Math.round((totalTurnaround / n) * 100) / 100 : 0,
    contextSwitches,
    throughput: maxTime > 0 ? Math.round((n / maxTime) * 100) / 100 : 0,
  };

  return { processes: processResults, metrics, contextSwitches };
}
