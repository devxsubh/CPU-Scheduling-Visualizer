import { Router, Request, Response } from 'express';
import { evaluateAndSwitch } from './evaluator/switcher';
import type { SimulateRequest, SimulateResponse, AlgorithmType } from './types';

const router = Router();

function normalizeAlgorithm(algo: string): AlgorithmType {
  const map: Record<string, AlgorithmType> = {
    fcfs: 'fcfs',
    sjf: 'sjf',
    round_robin: 'round_robin',
    rr: 'round_robin',
    priority: 'priority',
  };
  return map[algo?.toLowerCase()] ?? 'fcfs';
}

router.post('/simulate', (req: Request, res: Response) => {
  try {
    const body = req.body as SimulateRequest;
    const algorithm = normalizeAlgorithm(body.algorithm ?? 'fcfs');
    const processes = Array.isArray(body.processes) ? body.processes : [];
    const timeQuantum = typeof body.timeQuantum === 'number' ? body.timeQuantum : 2;

    if (processes.length === 0) {
      res.status(400).json({ error: 'At least one process is required.' });
      return;
    }

    const withPids = processes.map((p: any, i: number) => ({
      pid: typeof p.pid === 'number' ? p.pid : i + 1,
      arrivalTime: Number(p.arrivalTime) || 0,
      burstTime: Number(p.burstTime) || 1,
      priority: p.priority != null ? Number(p.priority) : undefined,
    }));

    const { useAlgorithm, reason, usedResult } = evaluateAndSwitch(
      algorithm,
      withPids,
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

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Simulation failed.', details: String(err) });
  }
});

export default router;
