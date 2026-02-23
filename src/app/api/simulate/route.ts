import { NextRequest, NextResponse } from 'next/server';
import { evaluateAndSwitch, runAlgorithm } from '@/lib/cpu-scheduler/evaluator/switcher';
import { injectContextSwitchCost } from '@/lib/cpu-scheduler/context-switch-cost';
import { computeMetrics } from '@/lib/cpu-scheduler/metrics';
import type { AlgorithmType, SimulateResponse, ProcessInput } from '@/lib/cpu-scheduler/types';

function normalizeAlgorithm(algo: string): AlgorithmType {
  const map: Record<string, AlgorithmType> = {
    fcfs: 'fcfs',
    sjf: 'sjf',
    sjf_nonpreemptive: 'sjf_nonpreemptive',
    ljf: 'ljf',
    lrtf: 'lrtf',
    round_robin: 'round_robin',
    rr: 'round_robin',
    priority: 'priority',
    priority_preemptive: 'priority_preemptive',
    hrrn: 'hrrn',
    lottery: 'lottery',
    stride: 'stride',
    fcfs_io: 'fcfs_io',
    mlq: 'mlq',
    mlfq: 'mlfq',
  };
  return map[algo?.toLowerCase()] ?? 'fcfs';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const algorithm = normalizeAlgorithm(body.algorithm ?? 'fcfs');
    const rawProcesses = Array.isArray(body.processes) ? body.processes : [];
    const timeQuantum = typeof body.timeQuantum === 'number' ? body.timeQuantum : 2;

    if (rawProcesses.length === 0) {
      return NextResponse.json(
        { error: 'At least one process is required.' },
        { status: 400 }
      );
    }

    const processes: ProcessInput[] = rawProcesses.map((p: Record<string, unknown>, i: number) => ({
      pid: typeof p.pid === 'number' ? p.pid : i + 1,
      arrivalTime: Number(p.arrivalTime) || 0,
      burstTime: Number(p.burstTime) || 1,
      priority: p.priority != null ? Number(p.priority) : undefined,
      tickets: p.tickets != null ? Number(p.tickets) : undefined,
      stride: p.stride != null ? Number(p.stride) : undefined,
      bursts: Array.isArray(p.bursts) ? (p.bursts as number[]).map(Number) : undefined,
    }));

    const disableAutoSwitch = body.disableAutoSwitch === true;
    const contextSwitchCost = Math.max(0, Number(body.contextSwitchCost) || 0);

    if (algorithm === 'custom') {
      return NextResponse.json(
        { error: 'Custom algorithm must be run in the browser. Use the simulator with algorithm "Custom".' },
        { status: 400 }
      );
    }

    let usedResult;
    let useAlgorithm: AlgorithmType;
    let reason: string | null;

    if (disableAutoSwitch) {
      usedResult = runAlgorithm(algorithm, processes, timeQuantum);
      useAlgorithm = algorithm;
      reason = null;
    } else {
      const decision = evaluateAndSwitch(algorithm, processes, timeQuantum);
      usedResult = decision.usedResult;
      useAlgorithm = decision.useAlgorithm;
      reason = decision.reason;
    }

    let ganttChart = usedResult.ganttChart;
    let metrics = usedResult.metrics;
    let processResults = usedResult.processes;
    let contextSwitches = usedResult.contextSwitches;

    if (contextSwitchCost > 0) {
      ganttChart = injectContextSwitchCost(ganttChart, contextSwitchCost);
      const computed = computeMetrics(ganttChart, processes);
      processResults = computed.processes;
      metrics = computed.metrics;
      contextSwitches = computed.contextSwitches;
    } else {
      ganttChart = ganttChart.filter((e) => !e.isContextSwitch);
    }

    const response: SimulateResponse = {
      chosenAlgorithm: algorithm,
      usedAlgorithm: useAlgorithm,
      reasonSwitched: reason,
      ganttChart,
      metrics,
      processes: processResults,
      contextSwitches,
    };

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: 'Simulation failed.', details: message },
      { status: 500 }
    );
  }
}
