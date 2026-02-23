import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart } from '@mui/x-charts/BarChart';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import GanttChart from '@/components/GanttChart';
import type { SimulateResponse, AlgorithmType } from '@/types';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const ALG_LABELS: Record<AlgorithmType, string> = {
  fcfs: 'FCFS',
  sjf: 'SJF',
  round_robin: 'Round Robin',
  priority: 'Priority',
  priority_preemptive: 'Priority (Preemptive)',
  mlq: 'Multilevel Queue',
  mlfq: 'Multilevel Feedback Queue',
};

interface ResultsProps {
  result: SimulateResponse;
  onTryAgain: () => void;
  onBack: () => void;
}

export default function Results({ result, onTryAgain, onBack }: ResultsProps) {
  const maxTime = useMemo(() => {
    if (result.ganttChart.length === 0) return 1;
    return Math.max(...result.ganttChart.map((e) => e.end), 1);
  }, [result.ganttChart]);

  const chartData = useMemo(
    () =>
      result.processes.map((p) => ({
        name: `P${p.pid}`,
        waiting: p.waitingTime,
        turnaround: p.turnaroundTime,
      })),
    [result.processes]
  );

  const switched = result.chosenAlgorithm !== result.usedAlgorithm;

  return (
    <motion.div
      className="min-h-screen bg-black text-white py-10 px-4 sm:px-6 md:px-12 max-w-5xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex items-center justify-between mb-8">
        <button
          type="button"
          onClick={onBack}
          className="font-mono text-xs sm:text-sm text-white/50 hover:text-white transition-colors tracking-wider"
        >
          ← Home
        </button>
        <h2 className="font-display text-lg sm:text-xl font-semibold text-white tracking-tight">
          Results
        </h2>
        <button
          type="button"
          onClick={onTryAgain}
          className="font-mono text-xs sm:text-sm text-white/50 hover:text-white transition-colors tracking-wider"
        >
          Try again
        </button>
      </div>

      {switched && (
        <motion.div
          className="mb-6 p-4 sm:p-5 rounded-2xl border border-white/20 bg-white/[0.04]"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="font-display font-semibold text-white text-sm mb-1">Algorithm auto-switched</p>
          <p className="text-white/70 text-sm font-sans">{result.reasonSwitched}</p>
          <p className="font-mono text-xs text-white/40 mt-2">
            Chosen: {ALG_LABELS[result.chosenAlgorithm]} → Used: {ALG_LABELS[result.usedAlgorithm]}
          </p>
        </motion.div>
      )}

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {[
          { label: 'Avg waiting time', value: result.metrics.avgWaitingTime.toFixed(2), unit: 'ms' },
          { label: 'Avg turnaround time', value: result.metrics.avgTurnaroundTime.toFixed(2), unit: 'ms' },
          { label: 'Context switches', value: String(result.metrics.contextSwitches), unit: '' },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.04 }}
          >
            <p className="font-mono text-[11px] text-white/40 tracking-wider uppercase">{m.label}</p>
            <p className="text-2xl font-display font-semibold text-white mt-1 tracking-tight">
              {m.value}
              {m.unit && <span className="text-white/50 text-base font-sans ml-1">{m.unit}</span>}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.section
        className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-6 mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <span className="font-mono text-[11px] text-white/40 tracking-widest uppercase block mb-4">
          Gantt chart
        </span>
        <GanttChart data={result.ganttChart} maxTime={maxTime} />
      </motion.section>

      <motion.section
        className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-6 mb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <span className="font-mono text-[11px] text-white/40 tracking-widest uppercase block mb-4">
          Per-process waiting & turnaround
        </span>
        <div className="h-72">
          <ThemeProvider theme={darkTheme}>
            <BarChart
              xAxis={[{
                scaleType: 'band',
                data: chartData.map((d) => d.name),
                tickLabelStyle: {
                  fill: 'rgba(255,255,255,0.5)',
                  fontSize: 11,
                },
              }]}
              yAxis={[{
                tickLabelStyle: {
                  fill: 'rgba(255,255,255,0.5)',
                  fontSize: 11,
                },
              }]}
              series={[
                {
                  data: chartData.map((d) => d.waiting),
                  label: 'Waiting (ms)',
                  color: 'rgba(255,255,255,0.9)',
                },
                {
                  data: chartData.map((d) => d.turnaround),
                  label: 'Turnaround (ms)',
                  color: 'rgba(255,255,255,0.5)',
                },
              ]}
              height={280}
              margin={{ top: 20, right: 20, bottom: 30, left: 40 }}
              slotProps={{
                legend: {
                  labelStyle: {
                    fill: 'rgba(255,255,255,0.7)',
                    fontSize: 11,
                  },
                  position: { vertical: 'top', horizontal: 'end' },
                  padding: 0,
                },
              } as any}
              sx={{
                '.MuiChartsAxis-line': {
                  stroke: 'rgba(255,255,255,0.2)',
                },
                '.MuiChartsAxis-tick': {
                  stroke: 'rgba(255,255,255,0.2)',
                },
              }}
            />
          </ThemeProvider>
        </div>
      </motion.section>

      <motion.div
        className="flex flex-wrap gap-4 justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        <button
          type="button"
          onClick={onTryAgain}
          className="px-6 py-3 rounded-full bg-white text-black font-display font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Compare with another algorithm
        </button>
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-full border border-white/20 text-white/80 font-mono text-sm hover:bg-white/5 transition-colors"
        >
          Back to home
        </button>
      </motion.div>
    </motion.div>
  );
}
