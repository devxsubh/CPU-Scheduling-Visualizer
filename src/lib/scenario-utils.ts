import type { ProcessInput, AlgorithmType } from '@/types';

export interface SavedScenario {
  id: string;
  name: string;
  processes: ProcessInput[];
  algorithm: AlgorithmType | '';
  timeQuantum: number;
  contextSwitchDuration: number;
  createdAt: number;
}

const STORAGE_KEY = 'cpu-scheduler-saved-scenarios';

export function getSavedScenarios(): SavedScenario[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as SavedScenario[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveScenario(scenario: Omit<SavedScenario, 'id' | 'createdAt'>): SavedScenario {
  const list = getSavedScenarios();
  const newOne: SavedScenario = {
    ...scenario,
    id: `scenario-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: Date.now(),
  };
  list.unshift(newOne);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return newOne;
}

export function deleteScenario(id: string): void {
  const list = getSavedScenarios().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function loadScenario(id: string): SavedScenario | null {
  return getSavedScenarios().find((s) => s.id === id) ?? null;
}

/** Full scenario payload (same structure for save and export). */
export type ScenarioPayload = Omit<SavedScenario, 'id' | 'createdAt'>;

/** Export scenario as JSON (same format as saved scenarios; for download or share). Accepts payload or full SavedScenario. */
export function exportScenarioJSON(
  scenario: ScenarioPayload | SavedScenario
): string {
  const payload = {
    name: scenario.name,
    processes: scenario.processes,
    algorithm: scenario.algorithm || undefined,
    timeQuantum: scenario.timeQuantum,
    contextSwitchDuration: scenario.contextSwitchDuration,
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(payload, null, 2);
}

/** Build scenario payload from current simulator state (for both Save and Export). */
export function buildScenarioPayload(
  name: string,
  processes: ProcessInput[],
  algorithm: AlgorithmType | '',
  timeQuantum: number,
  contextSwitchDuration: number
): ScenarioPayload {
  return {
    name: name.trim() || `Scenario ${new Date().toLocaleString()}`,
    processes,
    algorithm,
    timeQuantum,
    contextSwitchDuration,
  };
}

/** Parse CSV text: expect header row with pid, arrival, burst, priority (optional). */
export function parseCSV(text: string): ProcessInput[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const header = lines[0].toLowerCase().split(',').map((s) => s.trim());
  const pidIdx = header.findIndex((h) => h === 'pid' || h === 'id');
  const arrivalIdx = header.findIndex((h) => h === 'arrival' || h === 'arrivaltime' || h === 'at');
  const burstIdx = header.findIndex((h) => h === 'burst' || h === 'bursttime' || h === 'bt');
  const priorityIdx = header.findIndex((h) => h === 'priority' || h === 'prio');
  if (arrivalIdx < 0 || burstIdx < 0) return [];
  const processes: ProcessInput[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(',').map((s) => s.trim());
    const pid = pidIdx >= 0 ? parseInt(cells[pidIdx], 10) : i;
    const arrivalTime = parseInt(cells[arrivalIdx], 10) || 0;
    const burstTime = Math.max(1, parseInt(cells[burstIdx], 10) || 1);
    const priority = priorityIdx >= 0 ? parseInt(cells[priorityIdx], 10) : undefined;
    if (Number.isNaN(arrivalTime) && Number.isNaN(burstTime)) continue;
    processes.push({
      pid: Number.isNaN(pid) ? i : pid,
      arrivalTime: Number.isNaN(arrivalTime) ? 0 : arrivalTime,
      burstTime: Number.isNaN(burstTime) ? 1 : burstTime,
      priority: priorityIdx >= 0 && !Number.isNaN(priority) ? priority : undefined,
    });
  }
  return processes;
}

interface ScenarioJSONObject {
  processes?: unknown[];
  algorithm?: unknown;
  timeQuantum?: number;
  contextSwitchDuration?: number;
  name?: string;
}

/** Parse JSON: array of process objects or { processes: [...] }. Optionally { algorithm, timeQuantum, contextSwitchDuration }. */
export function parseScenarioJSON(text: string): {
  processes: ProcessInput[];
  algorithm?: AlgorithmType | '';
  timeQuantum?: number;
  contextSwitchDuration?: number;
  name?: string;
} {
  const data = JSON.parse(text) as unknown;
  let processes: ProcessInput[] = [];
  let algorithm: AlgorithmType | '' | undefined;
  let timeQuantum: number | undefined;
  let contextSwitchDuration: number | undefined;
  let name: string | undefined;

  if (Array.isArray(data)) {
    processes = (data as Record<string, unknown>[]).map((p, i) => ({
      pid: typeof p.pid === 'number' ? p.pid : i + 1,
      arrivalTime: Number(p.arrivalTime ?? p.arrival ?? 0) || 0,
      burstTime: Math.max(1, Number(p.burstTime ?? p.burst ?? 1) || 1),
      priority: p.priority != null ? Number(p.priority) : undefined,
    }));
  } else if (data && typeof data === 'object' && Array.isArray((data as ScenarioJSONObject).processes)) {
    const obj = data as ScenarioJSONObject;
    processes = (obj.processes as Record<string, unknown>[]).map((p, i) => ({
      pid: typeof p.pid === 'number' ? p.pid : i + 1,
      arrivalTime: Number(p.arrivalTime ?? p.arrival ?? 0) || 0,
      burstTime: Math.max(1, Number(p.burstTime ?? p.burst ?? 1) || 1),
      priority: p.priority != null ? Number(p.priority) : undefined,
    }));
    if (obj.algorithm != null) algorithm = String(obj.algorithm) as AlgorithmType | '';
    if (typeof obj.timeQuantum === 'number') timeQuantum = obj.timeQuantum;
    if (typeof obj.contextSwitchDuration === 'number') contextSwitchDuration = obj.contextSwitchDuration;
    if (typeof obj.name === 'string') name = obj.name;
  }

  return { processes, algorithm, timeQuantum, contextSwitchDuration, name };
}

/** Generate N random processes with given ranges. */
export function generateRandomProcesses(options: {
  count: number;
  arrivalMin: number;
  arrivalMax: number;
  burstMin: number;
  burstMax: number;
  includePriority: boolean;
  priorityMin: number;
  priorityMax: number;
}): ProcessInput[] {
  const {
    count,
    arrivalMin,
    arrivalMax,
    burstMin,
    burstMax,
    includePriority,
    priorityMin,
    priorityMax,
  } = options;
  const n = Math.max(1, Math.min(50, count));
  const arrRange = Math.max(0, arrivalMax - arrivalMin);
  const burstRange = Math.max(1, burstMax - burstMin);
  const prioRange = Math.max(1, priorityMax - priorityMin);

  return Array.from({ length: n }, (_, i) => ({
    pid: i + 1,
    arrivalTime: arrivalMin + (arrRange ? Math.floor(Math.random() * (arrRange + 1)) : 0),
    burstTime: Math.max(1, burstMin + (burstRange ? Math.floor(Math.random() * (burstRange + 1)) : 0)),
    priority: includePriority ? priorityMin + (prioRange ? Math.floor(Math.random() * (prioRange + 1)) : 0) : undefined,
  }));
}
