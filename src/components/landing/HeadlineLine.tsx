import { motion } from 'framer-motion';

interface HeadlineLineProps {
  light?: boolean;
  className?: string;
  delay?: number;
}

export function HeadlineLine({ light, className = '', delay = 0 }: HeadlineLineProps) {
  const bg = light ? 'bg-black/30' : 'bg-white/30';
  return (
    <motion.span
      className={`block h-0.5 w-12 sm:w-16 mt-4 sm:mt-5 rounded-full ${bg} ${className}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: delay + 0.15 }}
      style={{ transformOrigin: 'left' }}
    />
  );
}
