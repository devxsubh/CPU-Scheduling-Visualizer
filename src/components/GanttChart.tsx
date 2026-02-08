import { motion } from 'framer-motion';

const PROCESS_COLORS = [
  'rgba(255,255,255,0.95)',
  'rgba(255,255,255,0.75)',
  'rgba(255,255,255,0.55)',
  'rgba(255,255,255,0.4)',
  'rgba(255,255,255,0.3)',
  'rgba(255,255,255,0.25)',
  'rgba(255,255,255,0.2)',
  'rgba(255,255,255,0.15)',
];

export interface GanttEntry {
  pid: number;
  start: number;
  end: number;
}

interface GanttChartProps {
  data: GanttEntry[];
  maxTime: number;
  height?: number;
}

export default function GanttChart({ data, maxTime, height = 280 }: GanttChartProps) {
  const scale = maxTime <= 0 ? 0 : 100 / maxTime;
  const pids = [...new Set(data.map((d) => d.pid))].filter((p) => p > 0).sort((a, b) => a - b);
  const rowHeight = Math.max(32, (height - 50) / Math.max(1, pids.length));

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[400px]">
        <div className="flex border-b border-white/10 pb-2 mb-2">
          <div className="w-16 flex-shrink-0 text-white/40 font-mono text-xs">PID</div>
          <div className="flex-1 relative" style={{ height: 24 }}>
            {Array.from({ length: Math.ceil(maxTime) + 1 }).map((_, i) => (
              <span
                key={i}
                className="absolute text-white/35 font-mono text-xs"
                style={{ left: `${i * scale}%` }}
              >
                {i}
              </span>
            ))}
          </div>
        </div>
        {pids.length === 0 ? (
          <div className="text-white/40 text-sm font-mono py-4">No process data</div>
        ) : (
          pids.map((pid, rowIndex) => {
            const bars = data.filter((d) => d.pid === pid);
            const color = PROCESS_COLORS[pid % PROCESS_COLORS.length];
            return (
              <motion.div
                key={pid}
                className="flex items-center mb-1"
                style={{ height: rowHeight }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: rowIndex * 0.05 }}
              >
                <div className="w-16 flex-shrink-0 font-mono text-sm text-white/70">P{pid}</div>
                <div className="flex-1 relative h-full rounded overflow-hidden bg-white/5">
                  {bars.map((bar, i) => (
                    <motion.div
                      key={`${pid}-${i}`}
                      className="absolute top-1 bottom-1 rounded flex items-center justify-center text-xs font-mono font-medium text-black origin-left"
                      style={{
                        left: `${bar.start * scale}%`,
                        width: `${Math.max((bar.end - bar.start) * scale, 2)}%`,
                        backgroundColor: color,
                        minWidth: 24,
                      }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.4, delay: 0.1 + rowIndex * 0.05 + i * 0.03 }}
                    >
                      {bar.end - bar.start}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
