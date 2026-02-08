import type { ProcessInput, AlgorithmType } from '@/types';

const ALG_VALUES: AlgorithmType[] = ['fcfs', 'sjf', 'round_robin', 'priority'];

export interface SimulatorUrlState {
  algorithm: AlgorithmType | null;
  timeQuantum: number;
  processes: ProcessInput[];
}

export function parseSimulatorSearchParams(searchParams: URLSearchParams): SimulatorUrlState | null {
  const algo = searchParams.get('algorithm');
  if (!algo || !ALG_VALUES.includes(algo as AlgorithmType)) return null;
  const pList = searchParams.getAll('p');
  if (pList.length === 0) return null;
  const processes: ProcessInput[] = [];
  for (let i = 0; i < pList.length; i++) {
    const parts = pList[i].split(',').map((s) => parseInt(s.trim(), 10));
    if (parts.length < 4) continue; // pid, arrival, burst, priority
    const [pid, arrivalTime, burstTime, priority] = parts;
    if (Number.isNaN(pid) || Number.isNaN(arrivalTime) || Number.isNaN(burstTime)) continue;
    processes.push({
      pid: Number.isNaN(pid) ? i + 1 : pid,
      arrivalTime: Number.isNaN(arrivalTime) ? 0 : arrivalTime,
      burstTime: Number.isNaN(burstTime) ? 1 : Math.max(1, burstTime),
      priority: Number.isNaN(priority) ? 1 : priority,
    });
  }
  if (processes.length === 0) return null;
  const q = searchParams.get('q');
  const timeQuantum = q != null ? Math.max(1, parseInt(q, 10) || 2) : 2;
  return {
    algorithm: algo as AlgorithmType,
    timeQuantum,
    processes,
  };
}

export function buildSimulatorSearchParams(
  algorithm: AlgorithmType | '',
  timeQuantum: number,
  processes: ProcessInput[]
): string {
  if (!algorithm || processes.length === 0) return '';
  const params = new URLSearchParams();
  params.set('algorithm', algorithm);
  if (algorithm === 'round_robin') params.set('q', String(timeQuantum));
  processes.forEach((p) => {
    params.append('p', [p.pid, p.arrivalTime, p.burstTime, p.priority ?? 1].join(','));
  });
  return params.toString();
}
