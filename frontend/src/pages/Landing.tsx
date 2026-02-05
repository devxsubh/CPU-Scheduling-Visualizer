import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  AnimatedWords,
  GlowButton,
  FloatingShapes,
  GridBackground,
  ScrollIndicator,
  ScrollProgress,
  CPUVisual,
  GanttStripAnimated,
  HoverCard,
  SectionDivider,
  SectionLabel,
  HeadlineLine,
  GradientOrb,
  QuoteBlock,
  CornerAccent,
  PatternDots,
} from '../components/landing';

interface LandingProps {
  onStart: () => void;
}

const viewport = { once: true, amount: 0.12 };
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport,
  transition: { type: 'spring', stiffness: 80, damping: 20, delay },
});
const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 90, damping: 18 },
  },
};

export default function Landing({ onStart }: LandingProps) {
  const problemRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 80]);

  const scrollToProblem = () => {
    problemRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.div className="bg-black text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* ——— Header ——— */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-12 md:px-20 py-4 bg-black/80 backdrop-blur-md border-b border-white/10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="CPU Scheduler" className="w-8 h-8" />
          <span className="font-display font-semibold text-white text-lg hidden sm:block">CPU Scheduler</span>
        </div>
        <button
          onClick={onStart}
          className="px-5 py-2 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors duration-200"
        >
          Get Started
        </button>
      </motion.header>

      <ScrollProgress />
      {/* ——— 1. Hero ——— */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 sm:px-12 md:px-20 pt-32 pb-32 relative">
        <GridBackground />
        <PatternDots />
        <FloatingShapes />
        <GradientOrb className="-top-32 -right-32" size={500} />
        <GradientOrb className="bottom-0 left-0 -translate-x-1/3 translate-y-1/3" size={380} />
        <CornerAccent position="top-left" />
        <CornerAccent position="bottom-right" />
        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative z-10">
          <div className="mb-6 flex justify-center">
            <SectionLabel number="01">Operating Systems</SectionLabel>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.05] tracking-[-0.03em] max-w-4xl mx-auto">
            <AnimatedWords text="Smart CPU Scheduling Simulator" delay={0.2} />
          </h1>
          <div className="flex justify-center">
            <HeadlineLine delay={0.4} />
          </div>
          <motion.p
            className="mt-6 sm:mt-8 text-lg sm:text-xl text-white/50 max-w-xl mx-auto font-sans"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            Where Operating System theory meets interactive simulation.
          </motion.p>
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <GlowButton onClick={scrollToProblem}>Start Exploring</GlowButton>
          </motion.div>
        </motion.div>
        <ScrollIndicator />
      </section>

      <SectionDivider flip />

      {/* ——— 2. Problem Relevance ——— */}
      <section
        ref={problemRef}
        className="min-h-screen flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-28 py-24 sm:py-32 bg-white text-black relative overflow-hidden"
      >
        <GridBackground light />
        <PatternDots light />
        <GradientOrb variant="black" className="top-0 right-0 -translate-y-1/2 translate-x-1/4" size={320} />
        <SectionLabel number="02" light className="mb-6" />
        <motion.h2
          className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-[1.1] tracking-[-0.03em] max-w-3xl relative z-10"
          {...fadeUp(0)}
        >
          Why does CPU scheduling matter?
        </motion.h2>
        <HeadlineLine light delay={0.1} className="relative z-10" />
        <motion.p
          className="mt-8 text-lg sm:text-xl text-black/60 max-w-2xl font-sans leading-relaxed relative z-10"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ type: 'spring', stiffness: 80, damping: 20, delay: 0.12 }}
        >
          Modern operating systems must make real-time decisions on which process runs when. Our simulator demonstrates the impact of those decisions — live.
        </motion.p>
        <motion.div
          className="mt-14 sm:mt-20 relative z-10"
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={viewport}
          transition={{ type: 'spring', stiffness: 90, damping: 18, delay: 0.2 }}
        >
          <CPUVisual />
        </motion.div>
      </section>

      <SectionDivider />

      {/* ——— 3. Clarity of Objectives ——— */}
      <section className="min-h-screen flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-24 px-6 sm:px-12 md:px-20 lg:px-28 py-24 sm:py-32 bg-black text-white relative">
        <CornerAccent position="top-right" />
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={viewport}
          transition={{ type: 'spring', stiffness: 70, damping: 18 }}
        >
          <SectionLabel number="03" className="mb-6" />
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-[1.12] tracking-[-0.03em]">
            Choose an algorithm. Simulate. Observe performance. Let the system help you optimize.
          </h2>
        </motion.div>
        <motion.div
          className="flex-1 grid grid-cols-2 gap-4 sm:gap-6"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={viewport}
          transition={{ type: 'spring', stiffness: 70, damping: 18, delay: 0.08 }}
        >
          {['FCFS', 'SJF', 'Round Robin', 'Priority'].map((label, i) => (
            <HoverCard key={label} delay={0.1 + i * 0.06} dark>
              <div className="flex flex-col items-center justify-center text-center">
                <motion.span
                  className="font-mono text-2xl sm:text-3xl text-white/25 mb-3"
                  whileHover={{ scale: 1.1 }}
                >
                  {String.fromCharCode(0x2460 + i)}
                </motion.span>
                <span className="font-display font-semibold text-white text-lg">{label}</span>
              </div>
            </HoverCard>
          ))}
        </motion.div>
      </section>

      <SectionDivider flip />

      {/* ——— 4. Feasibility & Scope ——— */}
      <section className="min-h-screen flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-28 py-24 sm:py-32 bg-white text-black relative overflow-hidden">
        <GridBackground light />
        <PatternDots light />
        <SectionLabel number="04" light className="mb-6 relative z-10" />
        <motion.h2
          className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-[1.1] tracking-[-0.03em] max-w-3xl relative z-10"
          {...fadeUp(0)}
        >
          Fast. Lightweight. Browser-Based.
        </motion.h2>
        <HeadlineLine light delay={0.08} className="relative z-10" />
        <motion.p
          className="mt-8 text-lg sm:text-xl text-black/60 max-w-2xl font-sans leading-relaxed relative z-10"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ type: 'spring', stiffness: 80, damping: 20, delay: 0.1 }}
        >
          No installations, no overhead — this tool runs fully in your browser. Powered by modern web tech and deep OS logic.
        </motion.p>
        <motion.div
          className="mt-14 sm:mt-20 w-full max-w-4xl relative z-10"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.22 }}
        >
          <GanttStripAnimated />
        </motion.div>
        <div className="mt-12 relative z-10">
          <QuoteBlock light label="Example">
            “Round Robin caused too many context switches. System switched to SJF to reduce turnaround time.”
          </QuoteBlock>
        </div>
      </section>

      <SectionDivider />

      {/* ——— 5. Implementation Progress ——— */}
      <section className="min-h-screen flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-28 py-24 sm:py-32 bg-black text-white relative">
        <SectionLabel number="05" className="mb-6" />
        <motion.h2
          className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-[-0.03em] max-w-3xl"
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
        >
          Built from the kernel up.
        </motion.h2>
        <HeadlineLine delay={0.1} />
        <motion.ul
          className="mt-12 sm:mt-16 space-y-5 max-w-xl"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={{
            visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
            hidden: {},
          }}
        >
          {[
            'Scheduling algorithms (FCFS, SJF, RR, Priority)',
            'Preemptive SJF (SRTF) with correct preemption',
            'Smart algorithm switcher & evaluator',
            'REST API + React frontend with Gantt charts',
            'Metrics: wait time, turnaround, context switches',
          ].map((step, i) => (
            <motion.li
              key={step}
              className="flex items-center gap-4 font-sans text-white/85 text-lg"
              variants={{
                hidden: { opacity: 0, x: -24 },
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: { type: 'spring', stiffness: 100, damping: 18 },
                },
              }}
            >
              <motion.span
                className="flex-shrink-0 w-9 h-9 rounded-full border border-white/25 flex items-center justify-center font-mono text-sm text-white/70"
                whileHover={{ scale: 1.08, borderColor: 'rgba(255,255,255,0.5)' }}
                transition={{ duration: 0.2 }}
              >
                {i + 1}
              </motion.span>
              {step}
            </motion.li>
          ))}
        </motion.ul>
      </section>

      <SectionDivider flip />

      {/* ——— 6. OS Concepts ——— */}
      <section className="min-h-screen flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-28 py-24 sm:py-32 bg-white text-black relative">
        <SectionLabel number="06" light className="mb-6" />
        <motion.h2
          className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-black leading-[1.1] tracking-[-0.03em] max-w-2xl"
          {...fadeUp(0)}
        >
          OS concepts used
        </motion.h2>
        <HeadlineLine light delay={0.08} />
        <motion.div
          className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={{
            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.12 } },
            hidden: {},
          }}
        >
          {[
            { icon: '🧠', title: 'CPU Scheduling', desc: 'Algorithm selection and process ordering' },
            { icon: '🔁', title: 'Context Switching', desc: 'Overhead and when to avoid excess switches' },
            { icon: '📊', title: 'Performance Metrics', desc: 'Wait time, turnaround time, throughput' },
            { icon: '⚙️', title: 'Process Simulation', desc: 'Arrival, burst, priority modeling' },
          ].map((card) => (
            <motion.div key={card.title} variants={cardVariants}>
              <HoverCard delay={0}>
                <motion.span
                  className="text-3xl sm:text-4xl mb-4 block"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={viewport}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                >
                  {card.icon}
                </motion.span>
                <h3 className="font-display font-semibold text-black text-xl">{card.title}</h3>
                <p className="mt-2 text-black/60 font-sans text-sm sm:text-base">{card.desc}</p>
              </HoverCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <SectionDivider />

      {/* ——— 7. CTA ——— */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 sm:px-12 py-24 sm:py-32 bg-black text-white relative">
        <GridBackground />
        <FloatingShapes />
        <GradientOrb className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" size={600} />
        <CornerAccent position="top-left" />
        <CornerAccent position="bottom-right" />
        <SectionLabel number="07" className="mb-6 justify-center">Get started</SectionLabel>
        <motion.h2
          className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-[-0.03em] max-w-2xl relative z-10"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ type: 'spring', stiffness: 70, damping: 18 }}
        >
          Ready to simulate your own OS?
        </motion.h2>
        <HeadlineLine delay={0.12} className="mx-auto mt-4" />
        <motion.div
          className="mt-12 relative z-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.12 }}
        >
          <GlowButton onClick={onStart}>Launch Simulator</GlowButton>
        </motion.div>
      </section>

      <SectionDivider />

      {/* ——— 8. Footer ——— */}
      <motion.footer
        className="py-10 px-6 sm:px-12 bg-black"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
      >
        <p className="font-mono text-xs sm:text-sm text-white/40 text-center">
          Built with ❤️ for Operating Systems
        </p>
      </motion.footer>
    </motion.div>
  );
}
