import { Router, Request, Response } from 'express';
import { evaluateAndSwitch } from './evaluator/switcher';
import { logger } from './logger';
import type { SimulateRequest, SimulateResponse, AlgorithmType } from './types';

const router = Router();
const log = logger.child({ route: 'simulate' });

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
      log.warn('Simulate rejected: no processes', { algorithm });
      res.status(400).json({ error: 'At least one process is required.' });
      return;
    }

    const withPids = processes.map((p: any, i: number) => ({
      pid: typeof p.pid === 'number' ? p.pid : i + 1,
      arrivalTime: Number(p.arrivalTime) || 0,
      burstTime: Number(p.burstTime) || 1,
      priority: p.priority != null ? Number(p.priority) : undefined,
    }));

    log.debug('Running simulation', { algorithm, processCount: withPids.length, timeQuantum });

    const { useAlgorithm, reason, usedResult } = evaluateAndSwitch(
      algorithm,
      withPids,
      timeQuantum
    );

    if (reason) {
      log.info('Algorithm switched', {
        chosen: algorithm,
        used: useAlgorithm,
        reason,
        contextSwitches: usedResult.contextSwitches,
      });
    }

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

    log.debug('Simulation completed', {
      usedAlgorithm: useAlgorithm,
      avgWaitingTime: usedResult.metrics.avgWaitingTime,
      avgTurnaroundTime: usedResult.metrics.avgTurnaroundTime,
    });
    res.json(response);
  } catch (err) {
    log.error('Simulation failed', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    res.status(500).json({ error: 'Simulation failed.', details: String(err) });
  }
});

export default router;
