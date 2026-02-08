import { motion } from 'framer-motion';

interface SectionDividerProps {
  /** Flip gradient for white section below */
  flip?: boolean;
  className?: string;
}

export function SectionDivider({ flip, className = '' }: SectionDividerProps) {
  return (
    <div className={`w-full h-px overflow-hidden ${className}`} aria-hidden>
      <motion.div
        className={`h-full w-full ${flip ? 'bg-gradient-to-r from-transparent via-black/20 to-transparent' : 'bg-gradient-to-r from-transparent via-white/20 to-transparent'}`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0 }}
        transition={{ duration: 0.6 }}
      />
    </div>
  );
}
