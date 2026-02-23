// CPU scheduling types (aligned with backend)
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
  /** Lottery: number of tickets (default 1). */
  tickets?: number;
  /** Stride: stride value (inverse of share); default derived from weight 1. */
  stride?: number;
  /** I/O bursts: [cpu1, io1, cpu2, io2, ...]. If present, overrides single burstTime for multi-phase. */
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
  /** Total timeline length including context-switch cost (if any). */
  totalTime?: number;
  /** CPU utilization (0–1) when context-switch cost is used. */
  cpuUtilization?: number;
}

export interface SimulationResult {
  ganttChart: GanttEntry[];
  processes: ProcessResult[];
  metrics: Metrics;
  contextSwitches: number;
}

export interface SimulateRequest {
  algorithm: AlgorithmType;
  timeQuantum?: number;
  processes: ProcessInput[];
  /** Context-switch cost in time units (0 = none). */
  contextSwitchCost?: number;
  /** For custom algorithm: JS code that returns a strategy function. */
  customAlgorithmCode?: string;
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
