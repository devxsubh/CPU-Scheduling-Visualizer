import { motion } from 'framer-motion';

interface GlowButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
}

export function GlowButton({ children, onClick, className = '', variant = 'primary', disabled }: GlowButtonProps) {
  const isPrimary = variant === 'primary';
  const baseClass = isPrimary
    ? 'bg-white text-black px-8 py-4 sm:px-10 sm:py-4 text-base sm:text-lg'
    : 'border border-white/30 text-white px-6 py-3 text-sm';
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative rounded-full font-display font-semibold tracking-tight overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed ${baseClass} ${className}`}
      whileHover={!disabled ? { scale: 1.03 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      {isPrimary && (
        <motion.span
          className="absolute -inset-1 rounded-full bg-white/25 blur-xl opacity-0 -z-10"
          whileHover={{ opacity: 0.8 }}
          transition={{ duration: 0.3 }}
        />
      )}
      <span className="relative z-10 block">{children}</span>
    </motion.button>
  );
}
