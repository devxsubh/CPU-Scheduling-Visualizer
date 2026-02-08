import type { SimulateResponse } from '@/types';

export function downloadCSV(result: SimulateResponse): void {
  const headers = ['PID', 'Arrival', 'Burst', 'Completion', 'Waiting', 'Turnaround'];
  const rows = result.processes.map((p) =>
    [p.pid, p.arrivalTime, p.burstTime, p.completionTime, p.waitingTime, p.turnaroundTime].join(',')
  );
  const metrics = [
    'Metric,Value',
    `Avg Waiting Time,${result.metrics.avgWaitingTime}`,
    `Avg Turnaround Time,${result.metrics.avgTurnaroundTime}`,
    `Avg Response Time,${result.metrics.avgResponseTime}`,
    `Context Switches,${result.metrics.contextSwitches}`,
    `Throughput,${result.metrics.throughput}`,
  ].join('\n');
  const csv = [headers.join(','), ...rows, '', metrics].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cpu-schedule-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadGanttPNG(element: HTMLElement, filename?: string): Promise<void> {
  const { toPng } = await import('html-to-image');
  const dataUrl = await toPng(element, {
    backgroundColor: '#0a0a0a',
    pixelRatio: 2,
    cacheBust: true,
  });
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename ?? `gantt-chart-${Date.now()}.png`;
  a.click();
}
