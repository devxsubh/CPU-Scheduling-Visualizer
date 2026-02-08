import { motion } from 'framer-motion';

interface SectionLabelProps {
  children?: React.ReactNode;
  number?: string;
  className?: string;
  light?: boolean;
}

export function SectionLabel({ children, number, className = '', light }: SectionLabelProps) {
  const textClass = light ? 'text-black/50' : 'text-white/40';
  const lineClass = light ? 'bg-black/20' : 'bg-white/20';
  return (
    <motion.div
      className={`flex items-center gap-3 ${className}`}
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4 }}
    >
      <span className={`w-8 h-px flex-shrink-0 ${lineClass}`} aria-hidden />
      {number && (
        <span className={`font-mono text-[10px] sm:text-xs tracking-widest ${textClass}`}>
          {number}
        </span>
      )}
      {children && (
        <span className={`font-mono text-[11px] sm:text-xs tracking-[0.2em] uppercase ${textClass}`}>
          {children}
        </span>
      )}
    </motion.div>
  );
}
