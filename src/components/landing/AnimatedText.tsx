import { motion } from 'framer-motion';

const wordVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: ({ i, delay }: { i: number; delay: number }) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06 + delay },
  }),
};

interface AnimatedTextProps {
  text: string;
  className?: string;
  by?: 'word' | 'char' | 'line';
  delay?: number;
}

export function AnimatedWords({ text, className = '', delay = 0 }: AnimatedTextProps) {
  const words = text.split(' ');
  return (
    <span className={`inline-flex flex-wrap justify-center ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className="inline-block mr-[0.25em]"
          variants={wordVariants}
          initial="hidden"
          animate="visible"
          custom={{ i, delay }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

export function AnimatedLine({ text, className = '', delay = 0 }: AnimatedTextProps) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      {text}
    </motion.span>
  );
}
