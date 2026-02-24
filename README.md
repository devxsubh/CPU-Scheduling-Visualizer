# CPU Scheduling Visualizer

A modern, interactive web application for visualizing and understanding CPU scheduling algorithms. Built with **Next.js**, **React**, and **TypeScript**, this simulator helps students and developers explore how operating systems manage process scheduling. Deploy-ready for **Vercel**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-000000.svg)
![React](https://img.shields.io/badge/React-18.2-61DAFB.svg)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Supported Algorithms](#supported-algorithms)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Deployment (Vercel)](#deployment-vercel)
- [How It Works](#how-it-works)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

CPU Scheduling is a fundamental concept in Operating Systems that determines which process runs on the CPU at any given time. This visualizer provides:

- **Real-time simulation** of scheduling algorithms
- **Interactive Gantt charts** showing process execution timeline
- **Performance metrics** including waiting time, turnaround time, and context switches
- **Smart algorithm switching** that automatically optimizes based on workload characteristics

Whether you're a student learning OS concepts or a developer building scheduling systems, this tool makes abstract concepts tangible and understandable.

---

## Features

### Core Features

| Feature | Description |
|---------|-------------|
| **Real-time Simulation** | See results update instantly as you modify inputs (debounced) |
| **15 Scheduling Algorithms** | FCFS, SRTF, SJF (non‑preemptive), LJF, LRTF, Round Robin, Priority (both), HRRN, MLQ, MLFQ, Lottery, Stride, FCFS+I/O, and Custom (JavaScript) |
| **Interactive Gantt Chart** | Animated visualization with context-switch boundaries |
| **Step-by-Step Playback** | Play, pause, prev/next through Gantt steps with ready-queue and narration |
| **Compare Up to 4 Algorithms** | Side-by-side metrics and Gantt charts for multiple algorithms |
| **Performance Metrics** | Avg waiting/turnaround/response time, throughput, context switches, CPU utilization |
| **Smart Algorithm Switcher** | Automatic optimization that switches to a better algorithm when needed |
| **Share Link** | Copy URL with current config (algorithm, quantum, processes) to share or bookmark |
| **Export** | Download results as CSV, JSON, or Gantt chart as PNG |
| **Quick-Load Presets** | One-click presets: Convoy effect, RR heavy, SJF friendly, Priority demo; plus random generator |
| **Saved Scenarios** | Save and load scenario files (processes + algorithm + settings) |
| **Modern UI/UX** | Dark-themed simulator with smooth animations (Framer Motion) |
| **Responsive Design** | Works seamlessly on desktop and tablet devices |

### Smart Algorithm Switching

The simulator includes an intelligent evaluator that can automatically switch algorithms when:

- **Round Robin** causes excessive context switches → Switches to SJF
- **FCFS** leads to convoy effect (high waiting times) → Switches to SJF

---

## Supported Algorithms

All algorithms are documented in the app (landing page and simulator). Summary:

| # | Algorithm | Type | Brief description |
|---|-----------|------|-------------------|
| 1 | **FCFS** | Non-preemptive | First Come First Serve – execute in arrival order. |
| 2 | **SRTF** | Preemptive | Shortest Remaining Time First – min remaining burst; preempt when shorter job arrives. |
| 3 | **SJF** (non‑preemptive) | Non-preemptive | Shortest Job First – min burst among ready; run to completion. |
| 4 | **LJF** | Non-preemptive | Longest Job First – max burst among ready; run to completion. |
| 5 | **LRTF** | Preemptive | Longest Remaining Time First – max remaining burst; preempt on longer arrival. |
| 6 | **Round Robin (RR)** | Preemptive | Fixed time quantum; after quantum, process goes to back of queue. |
| 7 | **Priority** | Non-preemptive | Highest priority (lowest number) runs first; run to completion. |
| 8 | **Priority (Preemptive)** | Preemptive | Same rule; preempt when higher-priority process arrives. |
| 9 | **HRRN** | Non-preemptive | Highest Response Ratio Next – RR = (waiting + burst) / burst; max RR runs. |
| 10 | **MLQ** | Multi-queue | Multilevel Queue – queues by priority; RR within each queue. |
| 11 | **MLFQ** | Multi-queue + feedback | Multilevel Feedback Queue – demote after full quantum; favors short/I/O-bound. |
| 12 | **Lottery** | Proportional-share | Tickets per process; random ticket wins each quantum. |
| 13 | **Stride** | Proportional-share | Deterministic proportional share via stride and pass. |
| 14 | **FCFS + I/O** | With I/O | FCFS with CPU/I/O burst pairs; process blocks during I/O. |
| 15 | **Custom** | User-defined | JavaScript function `(state) => pid`; runs client-side only. |

**Notes:**

- **Priority / MLQ:** Lower priority number = higher priority. For MLQ, the Priority field is the **queue level** (0 = highest).
- **RR, MLQ, MLFQ:** Use the **time quantum** setting.
- **Lottery / Stride:** Use **tickets** or **stride** per process (see simulator UI).
- **FCFS + I/O:** Provide **bursts** array `[cpu1, io1, cpu2, io2, ...]` per process.
- **Custom:** Write a small script in the simulator; no server call.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router, API routes, and serverless deployment |
| **React 18** | UI library with hooks |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS** | Utility-first CSS |
| **Framer Motion** | Animations and transitions |
| **GSAP** | Landing page scroll and sequence animations |
| **MUI X Charts** | Bar charts for per-process waiting/turnaround |
| **html-to-image** | Export Gantt chart as PNG |

The app is a **single Next.js project**: the UI and the simulation API (`POST /api/simulate`) live in one codebase, so you can deploy it as one service (e.g. on Vercel) with no separate backend server.

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/CPU-Scheduling-Visualizer.git
   cd CPU-Scheduling-Visualizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

### Running the Application

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Open your browser** at [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm start
```

---

## Usage

### Basic Workflow

1. **Landing page** – Read about the project, then click **Try Simulator** or **Launch Simulator**.
2. **Simulator** – Add/remove processes (PID, arrival time, burst time, priority for Priority algorithms). Use **Quick load** presets to try predefined workloads.
3. **Select algorithm** – Choose from all 15 algorithms (FCFS, SRTF, SJF, RR, Priority, HRRN, MLQ, MLFQ, Lottery, Stride, FCFS+I/O, Custom, etc.). Set time quantum for RR, MLQ, and MLFQ. For MLQ, use the Priority column as **queue level** (0 = highest). Optionally enable **Compare** to run up to 4 algorithms side by side.
4. **View results** – Gantt chart, metrics (including CPU utilization), per-process bar chart, and process table update in real time. Use **step controls** (← ▶ → ↺) to play through the Gantt step-by-step with ready-queue explanation.
5. **Share or export** – Use **Share link** to copy the current configuration URL, or **Export** to download CSV, JSON, or Gantt PNG.

### Process Configuration

| Field | Description | Example |
|-------|-------------|---------|
| **PID** | Process identifier | 1, 2, 3 |
| **Arrival Time** | When process enters ready queue | 0, 2, 4 |
| **Burst Time** | CPU time required (or use **Bursts** for I/O) | 4, 2, 6 |
| **Priority** | Priority level (lower = higher); used for Priority algorithms and as **queue level** for MLQ | 1, 2, 3 |
| **Bursts** | For FCFS+I/O: alternating CPU and I/O times | [2, 1, 3, 1] |
| **Tickets / Stride** | For Lottery and Stride algorithms | e.g. 10 tickets, stride 100 |

### Understanding Results

- **Gantt Chart** – Timeline of which process runs at each time unit; amber segments indicate context-switch boundaries. Step-through playback shows the ready queue and a short explanation per step.
- **Metrics** – Average waiting time, turnaround time, response time, throughput, context switches, and CPU utilization (percent and busy/total time).
- **Per-Process Bar Chart** – Waiting and turnaround time per process (MUI X Charts).
- **Process Details Table** – Completion time, waiting time, and turnaround time for each process.
- **Compare Mode** – When enabled, run up to 4 algorithms side by side with metrics tables and Gantt charts to compare performance.

---

## API Documentation

The app exposes one API route used by the simulator. **Note:** The **Custom** (user-defined JavaScript) algorithm runs only in the browser and is not available via the API.

### POST /api/simulate

Runs a CPU scheduling simulation with the specified algorithm and processes.

#### Request Body

```json
{
  "algorithm": "round_robin",
  "timeQuantum": 2,
  "processes": [
    { "pid": 1, "arrivalTime": 0, "burstTime": 4, "priority": 1 },
    { "pid": 2, "arrivalTime": 1, "burstTime": 3, "priority": 2 },
    { "pid": 3, "arrivalTime": 2, "burstTime": 1, "priority": 1 }
  ]
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `algorithm` | string | Yes | One of: `fcfs`, `sjf`, `sjf_nonpreemptive`, `ljf`, `lrtf`, `round_robin` (or `rr`), `priority`, `priority_preemptive`, `hrrn`, `mlq`, `mlfq`, `lottery`, `stride`, `fcfs_io` |
| `timeQuantum` | number | No | Time slice for RR, MLQ, MLFQ (default: 2) |
| `processes` | array | Yes | Array of process objects: `pid`, `arrivalTime`, `burstTime`, `priority` (optional). For FCFS+I/O use `bursts` (e.g. `[2,1,3,1]`). For Lottery/Stride use `tickets`/`stride`. |

#### Response

```json
{
  "chosenAlgorithm": "round_robin",
  "usedAlgorithm": "sjf",
  "reasonSwitched": "Round Robin caused too many context switches (8). System switched to SJF to reduce turnaround time by 25%.",
  "ganttChart": [
    { "pid": 1, "start": 0, "end": 2 },
    { "pid": 2, "start": 2, "end": 5 }
  ],
  "metrics": {
    "avgWaitingTime": 2.33,
    "avgTurnaroundTime": 5.0,
    "avgResponseTime": 1.0,
    "contextSwitches": 2,
    "throughput": 0.5
  },
  "processes": [
    {
      "pid": 1,
      "arrivalTime": 0,
      "burstTime": 4,
      "waitingTime": 2,
      "turnaroundTime": 6,
      "completionTime": 6
    }
  ],
  "contextSwitches": 2
}
```

---

## Project Structure

```
CPU-Scheduling-Visualizer/
├── public/
│   └── favicon.svg
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── simulate/
│   │   │       └── route.ts        # POST /api/simulate
│   │   ├── globals.css
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Landing page (/)
│   │   └── simulator/
│   │       └── page.tsx            # Simulator page (/simulator)
│   ├── components/
│   │   ├── GanttChart.tsx
│   │   ├── AlgorithmExplanationModal.tsx
│   │   ├── AlgorithmSelectionModal.tsx
│   │   ├── SavedScenariosModal.tsx
│   │   ├── RandomGeneratorModal.tsx
│   │   ├── MetricExplanationModal.tsx
│   │   ├── ShortcutsModal.tsx
│   │   ├── ProcessStateDiagram.tsx
│   │   ├── ReadyQueueAnimation.tsx
│   │   ├── Checkbox.tsx
│   │   ├── landing/                # Landing page components
│   │   └── technologies/           # Tech stack icons
│   ├── lib/
│   │   ├── cpu-scheduler/          # Simulation engine
│   │   │   ├── algorithms/
│   │   │   │   ├── fcfs.ts
│   │   │   │   ├── sjf.ts
│   │   │   │   ├── sjfNonPreemptive.ts
│   │   │   │   ├── ljf.ts
│   │   │   │   ├── lrtf.ts
│   │   │   │   ├── rr.ts
│   │   │   │   ├── priority.ts
│   │   │   │   ├── priorityPreemptive.ts
│   │   │   │   ├── hrrn.ts
│   │   │   │   ├── mlq.ts
│   │   │   │   ├── mlfq.ts
│   │   │   │   ├── lottery.ts
│   │   │   │   ├── stride.ts
│   │   │   │   └── fcfsIo.ts
│   │   │   ├── evaluator/
│   │   │   │   └── switcher.ts     # Smart algorithm switcher
│   │   │   ├── context-switch-cost.ts
│   │   │   ├── metrics.ts
│   │   │   └── types.ts
│   │   ├── algorithm-info.ts       # Names, descriptions, pros/cons for all algorithms
│   │   ├── custom-algorithm-runner.ts  # Client-side custom (JavaScript) scheduler
│   │   ├── scenario-utils.ts      # Save/load/import scenarios
│   │   ├── step-reason.ts          # Step narration / “why this process”
│   │   ├── url-state.ts            # URL encode/decode (share links)
│   │   ├── simulator-presets.ts   # Quick-load presets
│   │   └── export-utils.ts         # CSV, JSON, PNG export
│   ├── views/
│   │   ├── Landing.tsx
│   │   ├── Simulator.tsx
│   │   ├── InputPage.tsx
│   │   └── Results.tsx
│   ├── types.ts
│   └── index.css
├── next.config.mjs
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## Deployment (Vercel)

1. Push the repo to GitHub (or connect your Git provider in Vercel).
2. In [Vercel](https://vercel.com), **Import** the repository.
3. Leave **Root Directory** as the repo root (or blank).
4. Build command: `npm run build` (default).
5. Deploy. The app and `POST /api/simulate` will run as serverless functions; no separate backend is required.

---

## How It Works

### Metrics

| Metric | Formula |
|--------|---------|
| Completion Time (CT) | Time when process finishes execution |
| Turnaround Time (TAT) | CT - Arrival Time |
| Waiting Time (WT) | TAT - Burst Time |
| Average Waiting Time | Σ(WT) / n |
| Throughput | n / max(CT) |
| CPU Utilization | (Total busy time / Total time) × 100% |

### Smart Switching Logic

The evaluator in `src/lib/cpu-scheduler/evaluator/switcher.ts` uses heuristics:

- **Round Robin** → If context switches exceed `processes.length × 2.5`, switch to SJF.
- **FCFS** → If FCFS average waiting time is at least 2× SJF’s, switch to SJF.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Use TypeScript, follow the existing code style, and add comments for non-obvious logic.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ for Operating Systems Education
</p>
