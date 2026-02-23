import type { ProcessInput } from '@/types';

export interface Preset {
  name: string;
  description: string;
  getProcesses: () => ProcessInput[];
}

function pidSeq(start: number, count: number): number[] {
  return Array.from({ length: count }, (_, i) => start + i);
}

export const PRESETS: Preset[] = [
  {
    name: 'Convoy effect',
    description: 'One long job first, then short',
    getProcesses: () => [
      { pid: 1, arrivalTime: 0, burstTime: 8, priority: 1 },
      { pid: 2, arrivalTime: 1, burstTime: 1, priority: 1 },
      { pid: 3, arrivalTime: 2, burstTime: 1, priority: 1 },
      { pid: 4, arrivalTime: 3, burstTime: 1, priority: 1 },
    ],
  },
  {
    name: 'RR heavy',
    description: 'Similar bursts, many context switches',
    getProcesses: () => [
      { pid: 1, arrivalTime: 0, burstTime: 4, priority: 1 },
      { pid: 2, arrivalTime: 0, burstTime: 4, priority: 1 },
      { pid: 3, arrivalTime: 0, burstTime: 4, priority: 1 },
      { pid: 4, arrivalTime: 0, burstTime: 4, priority: 1 },
    ],
  },
  {
    name: 'SJF friendly',
    description: 'Short jobs arrive first',
    getProcesses: () => [
      { pid: 1, arrivalTime: 0, burstTime: 1, priority: 1 },
      { pid: 2, arrivalTime: 1, burstTime: 2, priority: 1 },
      { pid: 3, arrivalTime: 2, burstTime: 4, priority: 1 },
      { pid: 4, arrivalTime: 3, burstTime: 8, priority: 1 },
    ],
  },
  {
    name: 'Priority demo',
    description: 'Different priorities',
    getProcesses: () => [
      { pid: 1, arrivalTime: 0, burstTime: 4, priority: 2 },
      { pid: 2, arrivalTime: 0, burstTime: 2, priority: 1 },
      { pid: 3, arrivalTime: 0, burstTime: 3, priority: 3 },
      { pid: 4, arrivalTime: 1, burstTime: 1, priority: 1 },
    ],
  },
];
