import type { AlgorithmType, SimulationResult, ProcessInput } from '../types';
import { runFCFS } from '../algorithms/fcfs';
import { runSJF } from '../algorithms/sjf';
import { runSJFNonPreemptive } from '../algorithms/sjfNonPreemptive';
import { runLJF } from '../algorithms/ljf';
import { runLRTF } from '../algorithms/lrtf';
import { runRoundRobin } from '../algorithms/rr';
import { runPriority } from '../algorithms/priority';
import { runPriorityPreemptive } from '../algorithms/priorityPreemptive';
import { runHRRN } from '../algorithms/hrrn';
import { runLottery } from '../algorithms/lottery';
import { runStride } from '../algorithms/stride';
import { runFCFSWithIO } from '../algorithms/fcfsIo';
import { runMLQ } from '../algorithms/mlq';
import { runMLFQ } from '../algorithms/mlfq';

const MAX_CONTEXT_SWITCHES_PER_PROCESS = 2.5;
const MAX_AVG_WAITING_TIME_RATIO = 2.0;

export function runAlgorithm(
  algo: AlgorithmType,
  processes: ProcessInput[],
  timeQuantum?: number
): SimulationResult {
  switch (algo) {
    case 'fcfs':
      return runFCFS(processes);
    case 'sjf':
      return runSJF(processes);
    case 'sjf_nonpreemptive':
      return runSJFNonPreemptive(processes);
    case 'ljf':
      return runLJF(processes);
    case 'lrtf':
      return runLRTF(processes);
    case 'round_robin':
      return runRoundRobin(processes, timeQuantum ?? 2);
    case 'priority':
      return runPriority(processes);
    case 'priority_preemptive':
      return runPriorityPreemptive(processes);
    case 'hrrn':
      return runHRRN(processes);
    case 'lottery':
      return runLottery(processes, timeQuantum ?? 2);
    case 'stride':
      return runStride(processes, timeQuantum ?? 2);
    case 'fcfs_io':
      return runFCFSWithIO(processes);
    case 'mlq':
      return runMLQ(processes, timeQuantum ?? 2);
    case 'mlfq':
      return runMLFQ(processes, timeQuantum ?? 2);
    default:
      return runFCFS(processes);
  }
}

export interface SwitchDecision {
  useAlgorithm: AlgorithmType;
  reason: string | null;
  chosenResult: SimulationResult;
  usedResult: SimulationResult;
}

export function evaluateAndSwitch(
  chosenAlgorithm: AlgorithmType,
  processes: ProcessInput[],
  timeQuantum?: number
): SwitchDecision {
  const chosenResult = runAlgorithm(chosenAlgorithm, processes, timeQuantum);
  const n = processes.length;
  const thresholdContextSwitches = Math.ceil(n * MAX_CONTEXT_SWITCHES_PER_PROCESS);

  let useAlgorithm: AlgorithmType = chosenAlgorithm;
  let usedResult: SimulationResult = chosenResult;
  let reason: string | null = null;

  if (chosenAlgorithm === 'round_robin' && chosenResult.contextSwitches > thresholdContextSwitches) {
    usedResult = runSJF(processes);
    useAlgorithm = 'sjf';
    const reduction = chosenResult.metrics.avgTurnaroundTime > 0
      ? Math.round((1 - usedResult.metrics.avgTurnaroundTime / chosenResult.metrics.avgTurnaroundTime) * 100)
      : 0;
    reason = `Round Robin caused too many context switches (${chosenResult.contextSwitches}). System switched to SJF to reduce turnaround time${reduction > 0 ? ` by ${reduction}%` : ''}.`;
  } else if (chosenAlgorithm === 'fcfs') {
    const sjfResult = runSJF(processes);
    const ratio = chosenResult.metrics.avgWaitingTime / Math.max(sjfResult.metrics.avgWaitingTime, 0.01);
    if (ratio >= MAX_AVG_WAITING_TIME_RATIO && sjfResult.metrics.avgWaitingTime < chosenResult.metrics.avgWaitingTime) {
      useAlgorithm = 'sjf';
      usedResult = sjfResult;
      reason = `FCFS led to high average waiting time (${chosenResult.metrics.avgWaitingTime.toFixed(2)}). System switched to SJF for better turnaround (avg waiting: ${sjfResult.metrics.avgWaitingTime.toFixed(2)}).`;
    }
  }

  return { useAlgorithm, reason, chosenResult, usedResult };
}
