import type { AlgorithmType } from '@/types';

export interface AlgorithmInfo {
  value: AlgorithmType;
  name: string;
  shortName: string;
  description: string;
  formula: string;
  rule: string;
  pros: string[];
  cons: string[];
}

export const ALGORITHM_INFO: Record<AlgorithmType, AlgorithmInfo> = {
  fcfs: {
    value: 'fcfs',
    name: 'First Come First Serve',
    shortName: 'FCFS',
    description: 'Processes are executed in the exact order they arrive in the ready queue.',
    formula: 'Select process with minimum arrival time among ready.',
    rule: 'Non-preemptive: once a process starts, it runs to completion.',
    pros: ['Simple to implement', 'No starvation', 'Fair in terms of arrival order'],
    cons: ['Convoy effect', 'High average waiting time', 'Not optimal for interactive systems'],
  },
  sjf: {
    value: 'sjf',
    name: 'Shortest Remaining Time First (SRTF)',
    shortName: 'SRTF',
    description: 'The process with the smallest remaining burst time is executed; preemption when a shorter job arrives.',
    formula: 'Select process with minimum remaining burst time among ready.',
    rule: 'Preemptive: can preempt when a shorter job arrives.',
    pros: ['Minimum average waiting time (provably optimal)', 'Efficient CPU utilization'],
    cons: ['Requires burst time prediction', 'May cause starvation of long processes'],
  },
  sjf_nonpreemptive: {
    value: 'sjf_nonpreemptive',
    name: 'Shortest Job First (Non-preemptive)',
    shortName: 'SJF',
    description: 'Among ready processes, the one with the smallest burst time runs to completion. No preemption.',
    formula: 'Select ready process with minimum burst time; run to completion.',
    rule: 'Non-preemptive: no preemption on new arrivals.',
    pros: ['Simple', 'Minimizes average waiting when jobs known in advance'],
    cons: ['May cause starvation of long jobs', 'Requires burst time knowledge'],
  },
  ljf: {
    value: 'ljf',
    name: 'Longest Job First',
    shortName: 'LJF',
    description: 'The ready process with the largest burst time runs to completion. No preemption.',
    formula: 'Select ready process with maximum burst time; run to completion.',
    rule: 'Non-preemptive.',
    pros: ['Simple', 'Favors long-running jobs'],
    cons: ['May cause starvation of short jobs', 'Poor for interactive systems'],
  },
  lrtf: {
    value: 'lrtf',
    name: 'Longest Remaining Time First',
    shortName: 'LRTF',
    description: 'The process with the largest remaining burst time runs; preemption when a longer job arrives.',
    formula: 'Select process with maximum remaining burst time among ready.',
    rule: 'Preemptive: re-evaluate at every arrival.',
    pros: ['Favors long jobs in preemptive setting'],
    cons: ['Short jobs may starve', 'High context switches'],
  },
  round_robin: {
    value: 'round_robin',
    name: 'Round Robin',
    shortName: 'RR',
    description: 'Each process gets a fixed time quantum; after quantum expires, it is preempted and added to the end of the ready queue.',
    formula: 'Cyclic: run each ready process for up to quantum time units, then move to back of queue.',
    rule: 'Preemptive with configurable time quantum.',
    pros: ['Fair allocation', 'Good for time-sharing', 'No starvation'],
    cons: ['High context switch overhead', 'Performance depends on quantum size'],
  },
  priority: {
    value: 'priority',
    name: 'Priority (Non-preemptive)',
    shortName: 'PRI',
    description: 'The process with the highest priority (lowest number here) runs first. Once started, runs to completion.',
    formula: 'Select ready process with highest priority (smallest priority number).',
    rule: 'Non-preemptive: no preemption on new arrivals.',
    pros: ['Flexible prioritization', 'Useful for real-time systems'],
    cons: ['May cause starvation', 'Priority inversion possible'],
  },
  priority_preemptive: {
    value: 'priority_preemptive',
    name: 'Priority (Preemptive)',
    shortName: 'PRI+',
    description: 'Highest-priority process runs; preemption occurs when a higher-priority process arrives.',
    formula: 'At each instant, run ready process with highest priority. Preempt when higher-priority arrives.',
    rule: 'Preemptive: scheduler re-evaluates at every arrival.',
    pros: ['Responsive to high-priority jobs', 'Good for real-time'],
    cons: ['Starvation of low-priority processes', 'Priority inversion'],
  },
  mlq: {
    value: 'mlq',
    name: 'Multilevel Queue (MLQ)',
    shortName: 'MLQ',
    description: 'Processes are assigned to queues by priority level; each queue may use a different algorithm (e.g. RR).',
    formula: 'Assign to queue by priority; schedule from highest-priority non-empty queue (e.g. RR within queue).',
    rule: 'Fixed queue assignment; no promotion/demotion.',
    pros: ['Separation of workload types', 'Configurable per queue'],
    cons: ['No feedback between queues', 'Can starve lower queues'],
  },
  hrrn: {
    value: 'hrrn',
    name: 'Highest Response Ratio Next',
    shortName: 'HRRN',
    description: 'Response Ratio = (Waiting + Burst) / Burst. The ready process with highest RR runs to completion.',
    formula: 'RR = (waiting_time + burst_time) / burst_time; select max RR among ready.',
    rule: 'Non-preemptive: balances waiting time and burst length.',
    pros: ['Reduces starvation', 'Considers both waiting and service time'],
    cons: ['Overhead of computing RR', 'Requires burst time'],
  },
  lottery: {
    value: 'lottery',
    name: 'Lottery Scheduling',
    shortName: 'LOT',
    description: 'Each process gets tickets; each quantum a random ticket wins and that process runs. Proportional-share.',
    formula: 'Pick random ticket among ready (probability ∝ tickets); run winner for quantum.',
    rule: 'Preemptive with time quantum; probabilistic fair share.',
    pros: ['Simple', 'Proportional share', 'No starvation in expectation'],
    cons: ['Variable performance', 'Requires ticket assignment'],
  },
  stride: {
    value: 'stride',
    name: 'Stride Scheduling',
    shortName: 'STR',
    description: 'Deterministic proportional-share: each process has a stride (inverse of share); run process with smallest pass, then add stride.',
    formula: 'pass += stride after run; select process with minimum pass among ready.',
    rule: 'Preemptive with time quantum; deterministic fair share.',
    pros: ['Deterministic', 'Accurate proportional share', 'No starvation'],
    cons: ['Requires stride computation', 'Overhead of pass updates'],
  },
  fcfs_io: {
    value: 'fcfs_io',
    name: 'FCFS with I/O bursts',
    shortName: 'FCFS+I/O',
    description: 'Like FCFS but processes can have multiple CPU burst / I/O burst pairs; while in I/O the process is blocked and does not use the CPU.',
    formula: 'Bursts: [cpu1, io1, cpu2, io2, ...]. Ready = arrived and not in I/O; schedule FCFS among ready.',
    rule: 'Non-preemptive; I/O blocks the process until the I/O burst completes.',
    pros: ['Realistic for I/O-bound workloads', 'Teaches blocking behavior'],
    cons: ['Requires burst list per process'],
  },
  mlfq: {
    value: 'mlfq',
    name: 'Multilevel Feedback Queue (MLFQ)',
    shortName: 'MLFQ',
    description: 'Processes start in the top queue; if they use a full time slice they are demoted to a lower queue.',
    formula: 'Start in top queue; after using full quantum, demote to next queue. Schedule from highest non-empty queue (e.g. RR).',
    rule: 'Feedback: demote on full quantum use; optional promotion for starvation avoidance.',
    pros: ['Favors short and I/O-bound jobs', 'Adapts without prior knowledge'],
    cons: ['Complex tuning', 'Possible starvation in lower queues'],
  },
  custom: {
    value: 'custom',
    name: 'Custom (user-defined)',
    shortName: 'CUSTOM',
    description: 'Run your own scheduling strategy in the browser: JavaScript that receives ready processes and current time and returns which process to run.',
    formula: 'function(state) => pid; state has ready processes and time.',
    rule: 'Defined by your code; runs client-side only.',
    pros: ['Experiments and assignments', 'No server needed'],
    cons: ['Requires writing code', 'Client-side only'],
  },
};

/** Preemptive algorithms: can preempt the current process. */
export const PREEMPTIVE_ALGORITHMS: AlgorithmType[] = [
  'priority_preemptive',
  'sjf',
  'lrtf',
  'round_robin',
  'mlq',
  'mlfq',
];

/** Proportional-share (use time quantum). */
export const PROPORTIONAL_ALGORITHMS: AlgorithmType[] = [
  'lottery',
  'stride',
];

/** Non-preemptive algorithms: run selected process to completion. */
export const NON_PREEMPTIVE_ALGORITHMS: AlgorithmType[] = [
  'fcfs',
  'sjf_nonpreemptive',
  'ljf',
  'priority',
  'hrrn',
];

/** With I/O bursts (multi-phase CPU / I/O). */
export const IO_ALGORITHMS: AlgorithmType[] = ['fcfs_io'];
