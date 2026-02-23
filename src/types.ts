export type AlgorithmType =
  | 'fcfs'
  | 'sjf'
  | 'sjf_nonpreemptive'
  | 'ljf'
  | 'lrtf'
  | 'round_robin'
  | 'priority'
  | 'priority_preemptive'
  | 'hrrn'
  | 'lottery'
  | 'stride'
  | 'fcfs_io'
  | 'mlq'
  | 'mlfq'
  | 'custom';

export interface ProcessInput {
  pid: number;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
  tickets?: number;
  stride?: number;
  bursts?: number[];
}

export interface GanttEntry {
  pid: number;
  start: number;
  end: number;
  isContextSwitch?: boolean;
}

export interface ProcessResult {
  pid: number;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
  waitingTime: number;
  turnaroundTime: number;
  completionTime: number;
}

export interface Metrics {
  avgWaitingTime: number;
  avgTurnaroundTime: number;
  avgResponseTime: number;
  contextSwitches: number;
  throughput: number;
}

export interface SimulateResponse {
  chosenAlgorithm: AlgorithmType;
  usedAlgorithm: AlgorithmType;
  reasonSwitched: string | null;
  ganttChart: GanttEntry[];
  metrics: Metrics;
  processes: ProcessResult[];
  contextSwitches: number;
}
