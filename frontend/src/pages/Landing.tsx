import { motion } from 'framer-motion';

interface LandingProps {
  onStart: () => void;
}

const COLORS = ['#22c55e', '#4ade80', '#86efac', '#bbf7d0'];

export default function Landing({ onStart }: LandingProps) {
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary-500/30"
            style={{
              left: `${10 + i * 8}%`,
              top: `${20 + (i % 5) * 15}%`,
            }}
            animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.2, 1] }}
            transition={{ duration: 2 + i * 0.2, repeat: Infinity }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 text-center max-w-2xl"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-3">
          Dynamic CPU Scheduling
        </h1>
        <p className="text-xl text-slate-400 mb-2 font-mono">Simulator</p>
        <p className="text-slate-500 text-sm sm:text-base mt-4 mb-10">
          Smart algorithm switching • FCFS, SJF, Round Robin, Priority • Gantt charts & metrics
        </p>

        <motion.button
          className="px-8 py-4 rounded-xl bg-primary-500 text-dark-950 font-semibold text-lg font-display shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:bg-primary-400 transition-shadow"
          onClick={onStart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Start Simulation
        </motion.button>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-0 right-0 flex justify-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {COLORS.map((c, i) => (
          <motion.span
            key={c}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: c }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
