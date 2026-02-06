import { motion } from 'framer-motion';

const viewport = { once: true, amount: 0.2 };
const bars = [
  { w: 18, label: 'P1', time: 0, color: 'bg-white' },
  { w: 14, label: 'P2', time: 4, color: 'bg-white/80' },
  { w: 10, label: 'P3', time: 7, color: 'bg-white/60' },
  { w: 20, label: 'P1', time: 9, color: 'bg-white' },
  { w: 12, label: 'P2', time: 14, color: 'bg-white/80' },
  { w: 16, label: 'P4', time: 17, color: 'bg-white/60' },
];

export function GanttStripAnimated() {
  return (
    <motion.div
      className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-8 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: 0.6 }}
    >
      <div className="flex gap-1 sm:gap-1.5 items-center h-14">
        {bars.map((b, i) => (
          <motion.div
            key={i}
            className={`h-10 rounded-lg ${b.color} flex items-center justify-center min-w-[2.5rem] font-mono text-xs font-bold text-black shadow-sm`}
            initial={{ width: 0, opacity: 0 }}
            whileInView={{ width: `${b.w}%`, opacity: 1 }}
            viewport={viewport}
            transition={{
              type: 'spring',
              stiffness: 80,
              damping: 14,
              delay: 0.15 + i * 0.06,
            }}
          >
            {b.label}
          </motion.div>
        ))}
      </div>
      <motion.div
        className="mt-3 flex font-mono text-[11px] text-white/60"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={viewport}
        transition={{ delay: 0.6 }}
      >
        <div className="flex gap-1 sm:gap-1.5 w-full">
          {bars.map((b, i) => (
            <div key={i} style={{ width: `${b.w}%` }} className="text-center min-w-[2.5rem]">
              {b.time}
            </div>
          ))}
        </div>
      </motion.div>
      <motion.div
        className="mt-1 flex justify-end font-mono text-[10px] text-white/40 tracking-wider uppercase"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={viewport}
        transition={{ delay: 0.7 }}
      >
        <span>Time (ms) →</span>
      </motion.div>
    </motion.div>
  );
}
