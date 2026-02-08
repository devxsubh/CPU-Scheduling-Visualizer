interface PatternDotsProps {
  className?: string;
  light?: boolean;
}

export function PatternDots({ className = '', light }: PatternDotsProps) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none opacity-60 ${className}`}
      aria-hidden
      style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, ${light ? 'black' : 'white'}, transparent 1px)`,
        backgroundSize: '24px 24px',
      }}
    />
  );
}
