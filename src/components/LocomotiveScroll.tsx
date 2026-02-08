import { useEffect, useRef } from 'react';

interface LocomotiveScrollProps {
  children: React.ReactNode;
  className?: string;
}

export default function LocomotiveScroll({ children, className = '' }: LocomotiveScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let instance: { destroy?: () => void } | null = null;
    const init = async () => {
      try {
        const mod = await import('locomotive-scroll');
        const Loco = (mod as { default?: new (opts: { el: HTMLElement; smooth?: boolean }) => { destroy?: () => void } }).default;
        if (Loco && scrollRef.current) {
          instance = new Loco({
            el: scrollRef.current,
            smooth: true,
          });
        }
      } catch {
        // no smooth scroll if package fails
      }
    };
    init();
    return () => {
      if (instance?.destroy) instance.destroy();
    };
  }, []);

  return (
    <div ref={scrollRef} data-scroll-container className={className}>
      {children}
    </div>
  );
}
