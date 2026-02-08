import { motion } from 'framer-motion';

const viewport = { once: true, amount: 0.2 };

export function CPUVisual() {
  const bars = [4, 7, 3, 9, 2, 6, 5, 8];
  return (
    <motion.div
      className="flex items-end gap-1.5 sm:gap-2 h-28 sm:h-36"
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={{
        visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
        hidden: {},
      }}
    >
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="relative w-5 sm:w-7 bg-black rounded-t overflow-hidden"
          style={{ height: `${h * 10}px` }}
          variants={{
            hidden: { opacity: 0, scaleY: 0, originY: 1 },
            visible: {
              opacity: 1,
              scaleY: 1,
              transition: { type: 'spring', stiffness: 120, damping: 14 },
            },
          }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black to-black/70"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={viewport}
            transition={{ delay: 0.2 + i * 0.06 }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

export function CPUVisualLoop() {
  const bars = [3, 6, 4, 8, 2, 7, 5, 9];
  return (
    <motion.div
      className="flex items-end gap-1 sm:gap-1.5 h-20 sm:h-24"
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={{
        visible: { transition: { staggerChildren: 0.05 } },
        hidden: {},
      }}
    >
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="w-3 sm:w-4 bg-white/90 rounded-t"
          style={{ height: `${h * 6}px` }}
          variants={{
            hidden: { opacity: 0, scaleY: 0 },
            visible: {
              opacity: 1,
              scaleY: 1,
              transition: { type: 'spring', stiffness: 100, damping: 12 },
            },
          }}
          animate={{
            scaleY: [1, 1.1, 1],
            opacity: [0.9, 1, 0.9],
          }}
          transition={{
            duration: 2,
            delay: i * 0.15,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      ))}
    </motion.div>
  );
}
