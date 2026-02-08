import { motion } from 'framer-motion';

interface QuoteBlockProps {
  label?: string;
  children: React.ReactNode;
  className?: string;
  light?: boolean;
}

export function QuoteBlock({ label = 'Example', children, className = '', light }: QuoteBlockProps) {
  const borderClass = light ? 'border-black/15' : 'border-white/15';
  const labelClass = light ? 'text-black/50' : 'text-white/50';
  const barClass = light ? 'bg-black/40' : 'bg-white/40';
  return (
    <motion.div
      className={`rounded-2xl border ${borderClass} p-6 sm:p-8 pl-8 sm:pl-10 relative overflow-hidden ${light ? 'bg-black/5' : 'bg-white/5'} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: 'spring', stiffness: 80, damping: 18 }}
    >
      <span className={`absolute left-0 top-0 bottom-0 w-1 rounded-r ${barClass}`} aria-hidden />
      <p className={`font-mono text-xs tracking-wider uppercase ${labelClass}`}>{label}</p>
      <p className={`mt-2 font-sans text-sm sm:text-base ${light ? 'text-black/85' : 'text-white/90'}`}>
        {children}
      </p>
    </motion.div>
  );
}
