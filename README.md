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
| **Real-time Simulation** | See results update instantly as you modify inputs |
| **Multiple Algorithms** | FCFS, SJF (Preemptive), Round Robin, Priority Scheduling |
| **Interactive Gantt Chart** | Animated visualization of process execution timeline |
| **Performance Metrics** | Average waiting time, turnaround time, throughput, context switches |
| **Smart Algorithm Switcher** | Automatic optimization that suggests better algorithms when needed |
| **Modern UI/UX** | Dark-themed interface with smooth animations (Framer Motion) |
| **Responsive Design** | Works seamlessly on desktop and tablet devices |

### Smart Algorithm Switching

The simulator includes an intelligent evaluator that can automatically switch algorithms when:

- **Round Robin** causes excessive context switches → Switches to SJF
- **FCFS** leads to convoy effect (high waiting times) → Switches to SJF

---

## Supported Algorithms

### 1. First Come First Serve (FCFS)

```
Non-preemptive | Simple | May cause convoy effect
```

Processes are executed in the order they arrive in the ready queue.

**Characteristics:** Non-preemptive, easy to implement, may lead to convoy effect. Best for batch systems.

---

### 2. Shortest Job First (SJF) - Preemptive (SRTF)

```
Preemptive | Optimal waiting time | Requires burst time prediction
```

Also known as Shortest Remaining Time First (SRTF). The process with the smallest remaining burst time is executed; preemption occurs when a shorter job arrives.

**Characteristics:** Preemptive, minimizes average waiting time (provably optimal), may cause starvation of long processes.

---

### 3. Round Robin (RR)

```
Preemptive | Time-sliced | Fair | High context switches
```

Each process gets a fixed time quantum. After the quantum expires, the process is preempted and added to the end of the ready queue.

**Characteristics:** Preemptive with configurable quantum, fair allocation, higher context switch overhead.

---

### 4. Priority Scheduling

```
Non-preemptive | Priority-based | May cause starvation
```

The CPU is allocated to the process with the highest priority (lower number = higher priority in this implementation).

**Characteristics:** Non-preemptive in this implementation, flexible prioritization, used in real-time systems.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router, API routes, and serverless deployment |
| **React 18** | UI library with hooks |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS** | Utility-first CSS |
| **Framer Motion** | Animations and transitions |
| **MUI X Charts** | Bar charts and data visualization |

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
2. **Simulator** – Add/remove processes (PID, arrival time, burst time, priority when using Priority algorithm).
3. **Select algorithm** – Choose FCFS, SJF, Round Robin, or Priority (and set time quantum for RR).
4. **View results** – Gantt chart, metrics, and per-process table update in real time.

### Process Configuration

| Field | Description | Example |
|-------|-------------|---------|
| **PID** | Process identifier | P1, P2, P3 |
| **Arrival Time** | When process enters ready queue | 0, 2, 4 |
| **Burst Time** | CPU time required | 4, 2, 6 |
| **Priority** | Priority level (lower = higher priority) | 1, 2, 3 |

### Understanding Results

- **Gantt Chart** – Timeline of which process runs at each time unit.
- **Metrics** – Average waiting time, turnaround time, response time, throughput, context switches.
- **Per-Process Table** – Completion time, waiting time, and turnaround time for each process.

---

## API Documentation

The app exposes one API route used by the simulator.

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
| `algorithm` | string | Yes | One of: `fcfs`, `sjf`, `round_robin`, `priority` |
| `timeQuantum` | number | No | Time slice for Round Robin (default: 2) |
| `processes` | array | Yes | Array of process objects (pid, arrivalTime, burstTime, priority optional) |

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
│   │   │       └── route.ts      # POST /api/simulate
│   │   ├── globals.css
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Landing page (/)
│   │   └── simulator/
│   │       └── page.tsx          # Simulator page (/simulator)
│   ├── components/
│   │   ├── GanttChart.tsx
│   │   ├── LocomotiveScroll.tsx
│   │   └── landing/              # Landing page components
│   │   └── technologies/        # Tech stack icons
│   ├── lib/
│   │   └── cpu-scheduler/       # Simulation engine
│   │       ├── algorithms/
│   │       │   ├── fcfs.ts
│   │       │   ├── sjf.ts
│   │       │   ├── rr.ts
│   │       │   └── priority.ts
│   │       ├── evaluator/
│   │       │   └── switcher.ts   # Smart algorithm switcher
│   │       ├── metrics.ts
│   │       └── types.ts
│   ├── views/
│   │   ├── Landing.tsx
│   │   ├── Simulator.tsx
│   │   ├── InputPage.tsx
│   │   └── Results.tsx
│   ├── index.css
│   └── types.ts
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
