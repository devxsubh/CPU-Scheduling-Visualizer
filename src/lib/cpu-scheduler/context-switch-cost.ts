import type { GanttEntry } from './types';

/**
 * Injects context-switch cost into the Gantt chart. Entries with isContextSwitch
 * (and zero or minimal duration) become blocks of length `cost`; all subsequent
 * start/end times are shifted right.
 */
export function injectContextSwitchCost(
  ganttChart: GanttEntry[],
  cost: number
): GanttEntry[] {
  if (cost <= 0) return ganttChart;

  const result: GanttEntry[] = [];
  let shift = 0;

  for (const entry of ganttChart) {
    const start = entry.start + shift;
    if (entry.isContextSwitch) {
      const end = start + cost;
      result.push({ pid: 0, start, end, isContextSwitch: true });
      shift += cost;
    } else {
      const duration = entry.end - entry.start;
      result.push({
        pid: entry.pid,
        start,
        end: start + duration,
        isContextSwitch: false,
      });
    }
  }

  return result;
}
