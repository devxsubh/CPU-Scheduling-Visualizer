export type AlgorithmType = 'fcfs' | 'sjf' | 'round_robin' | 'priority';

export interface ProcessInput {
  pid: number;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
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
