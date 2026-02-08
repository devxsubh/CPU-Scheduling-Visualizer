import { motion } from 'framer-motion';

interface GradientOrbProps {
  className?: string;
  size?: number;
  /** 'white' for black sections, 'black' for white sections */
  variant?: 'white' | 'black';
}

export function GradientOrb({ className = '', size = 400, variant = 'white' }: GradientOrbProps) {
  const from = variant === 'white' ? 'from-white/[0.06]' : 'from-black/[0.06]';
  const to = variant === 'white' ? 'to-transparent' : 'to-transparent';
  return (
    <motion.div
      className={`absolute rounded-full bg-gradient-to-br ${from} ${to} blur-3xl pointer-events-none ${className}`}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2 }}
      aria-hidden
    />
  );
}
