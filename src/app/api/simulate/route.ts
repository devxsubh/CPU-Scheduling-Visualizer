import { NextRequest, NextResponse } from 'next/server';
import { evaluateAndSwitch } from '@/lib/cpu-scheduler/evaluator/switcher';
import type { AlgorithmType, SimulateResponse } from '@/lib/cpu-scheduler/types';

function normalizeAlgorithm(algo: string): AlgorithmType {
  const map: Record<string, AlgorithmType> = {
    fcfs: 'fcfs',
    sjf: 'sjf',
    round_robin: 'round_robin',
    rr: 'round_robin',
    priority: 'priority',
    priority_preemptive: 'priority_preemptive',
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

    const processes = rawProcesses.map((p: Record<string, unknown>, i: number) => ({
      pid: typeof p.pid === 'number' ? p.pid : i + 1,
      arrivalTime: Number(p.arrivalTime) || 0,
      burstTime: Number(p.burstTime) || 1,
      priority: p.priority != null ? Number(p.priority) : undefined,
    }));

    const { useAlgorithm, reason, usedResult } = evaluateAndSwitch(
      algorithm,
      processes,
      timeQuantum
    );

    const ganttChart = usedResult.ganttChart.filter((e) => !e.isContextSwitch);

    const response: SimulateResponse = {
      chosenAlgorithm: algorithm,
      usedAlgorithm: useAlgorithm,
      reasonSwitched: reason,
      ganttChart,
      metrics: usedResult.metrics,
      processes: usedResult.processes,
      contextSwitches: usedResult.contextSwitches,
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
