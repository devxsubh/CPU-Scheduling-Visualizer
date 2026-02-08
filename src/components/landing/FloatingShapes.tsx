import { motion } from 'framer-motion';

export function FloatingShapes() {
  const shapes = [
    { size: 120, x: '10%', y: '20%', duration: 8, delay: 0 },
    { size: 80, x: '85%', y: '15%', duration: 10, delay: 1 },
    { size: 60, x: '75%', y: '70%', duration: 7, delay: 0.5 },
    { size: 100, x: '15%', y: '75%', duration: 9, delay: 2 },
    { size: 40, x: '50%', y: '30%', duration: 6, delay: 0.2 },
    { size: 50, x: '90%', y: '50%', duration: 11, delay: 1.5 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-white/[0.06]"
          style={{
            width: s.size,
            height: s.size,
            left: s.x,
            top: s.y,
          }}
          animate={{
            y: [0, -15, 0],
            opacity: [0.04, 0.08, 0.04],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      ))}
    </div>
  );
}

interface GridBackgroundProps {
  /** Use for white/light sections so grid is visible */
  light?: boolean;
}

export function GridBackground({ light }: GridBackgroundProps) {
  const color = light ? 'black' : 'white';
  return (
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage: `
          linear-gradient(to right, ${color} 1px, transparent 1px),
          linear-gradient(to bottom, ${color} 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }}
    />
  );
}
