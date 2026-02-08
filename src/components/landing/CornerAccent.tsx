import { motion } from 'framer-motion';

interface CornerAccentProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
  light?: boolean;
}

const positions = {
  'top-left': 'top-0 left-0',
  'top-right': 'top-0 right-0',
  'bottom-left': 'bottom-0 left-0',
  'bottom-right': 'bottom-0 right-0',
};

export function CornerAccent({ position = 'top-left', className = '', light }: CornerAccentProps) {
  const color = light ? 'stroke-black/15' : 'stroke-white/15';
  const size = 80;
  const isRight = position.includes('right');
  const isBottom = position.includes('bottom');
  const path = isRight
    ? isBottom
      ? `M ${size} 0 L ${size} ${size} L 0 ${size}`
      : `M 0 ${size} L ${size} ${size} L ${size} 0`
    : isBottom
      ? `M 0 0 L ${size} 0 L 0 ${size}`
      : `M 0 0 L 0 ${size} L ${size} 0`;

  return (
    <motion.svg
      className={`absolute w-20 h-20 sm:w-24 sm:h-24 ${positions[position]} ${className}`}
      viewBox={`0 0 ${size} ${size}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      aria-hidden
    >
      <motion.path
        d={path}
        fill="none"
        strokeWidth="1"
        className={color}
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      />
    </motion.svg>
  );
}
