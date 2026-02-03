# Dynamic CPU Scheduling Simulator with Smart Algorithm Switching

A full-stack simulator that runs **FCFS**, **SJF**, **Round Robin**, and **Priority** scheduling, and can automatically switch to a better algorithm when it detects inefficiencies (e.g. too many context switches in RR, or high waiting time in FCFS).

## Features

- **Input**: Process table (PID, arrival time, burst time, priority) and algorithm selection; time quantum for Round Robin.
- **Algorithms**: FCFS, SJF, Round Robin, Priority.
- **Smart switching**: If Round Robin causes too many context switches, the system switches to SJF and explains why. If FCFS leads to high average waiting time, it may switch to SJF.
- **Output**: Gantt chart, average waiting time, average turnaround time, context switches, and per-process bar chart.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts.
- **Backend**: Node.js, Express, TypeScript.

## Setup

### Backend

```bash
cd backend
npm install
npm run dev
```

Runs at `http://localhost:3001`. API: `POST /api/simulate`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:5173` and proxies `/api` to the backend.

### Run both

1. Start the backend (`cd backend && npm run dev`).
2. In another terminal, start the frontend (`cd frontend && npm run dev`).
3. Open `http://localhost:5173`.

## API

**POST /api/simulate**

Request body:

```json
{
  "algorithm": "round_robin",
  "timeQuantum": 2,
  "processes": [
    { "pid": 1, "arrivalTime": 0, "burstTime": 5, "priority": 1 },
    { "pid": 2, "arrivalTime": 2, "burstTime": 3, "priority": 2 }
  ]
}
```

Response:

```json
{
  "chosenAlgorithm": "round_robin",
  "usedAlgorithm": "sjf",
  "reasonSwitched": "Round Robin caused too many context switches (8). System switched to SJF...",
  "ganttChart": [{ "pid": 1, "start": 0, "end": 3 }, ...],
  "metrics": {
    "avgWaitingTime": 4.2,
    "avgTurnaroundTime": 8.6,
    "contextSwitches": 5
  },
  "processes": [...],
  "contextSwitches": 5
}
```

## Project structure

```
cpu-scheduler-project/
├── backend/
│   ├── src/
│   │   ├── algorithms/   # fcfs, sjf, rr, priority
│   │   ├── evaluator/    # switcher logic
│   │   ├── metrics.ts
│   │   ├── routes.ts
│   │   ├── server.ts
│   │   └── types.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # GanttChart
│   │   ├── pages/        # Landing, InputPage, Results
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
└── README.md
```
