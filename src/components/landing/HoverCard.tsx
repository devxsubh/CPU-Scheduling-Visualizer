import { motion } from 'framer-motion';

interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  dark?: boolean;
}

export function HoverCard({ children, className = '', delay = 0, dark = false }: HoverCardProps) {
  const borderClass = dark ? 'border-white/10' : 'border-black/10';
  const bgClass = dark ? 'bg-white/[0.03]' : 'bg-black/[0.02]';
  return (
    <motion.div
      className={`rounded-2xl border ${borderClass} ${bgClass} p-6 sm:p-8 ${className}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 16,
        delay,
      }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2 },
      }}
    >
      {children}
    </motion.div>
  );
}
