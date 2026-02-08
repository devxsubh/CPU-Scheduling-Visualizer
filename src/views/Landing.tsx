'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
} from '@/components/landing';

// Tech stack icons
import ReactIcon from '@/components/technologies/ReactIcon';
import TypeScript from '@/components/technologies/TypeScript';
import Vite from '@/components/technologies/Vite';
import TailwindCss from '@/components/technologies/TailwindCss';
import Motion from '@/components/technologies/Motion';
import MUI from '@/components/technologies/MUI';
import ExpressJs from '@/components/technologies/ExpressJs';
import NodeJs from '@/components/technologies/NodeJs';

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

// Algorithm data for detailed explanations
const ALGORITHMS = [
  {
    id: 'fcfs',
    name: 'First Come First Serve',
    shortName: 'FCFS',
    type: 'Non-Preemptive',
    description: 'The simplest scheduling algorithm. Processes are executed in the exact order they arrive in the ready queue.',
    pros: ['Simple to implement', 'No starvation', 'Fair in terms of arrival order'],
    cons: ['Convoy effect', 'High average waiting time', 'Not optimal for interactive systems'],
    formula: 'Waiting Time = Start Time - Arrival Time',
    useCase: 'Batch processing systems where simplicity is preferred over efficiency.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'sjf',
    name: 'Shortest Job First',
    shortName: 'SJF',
    type: 'Preemptive (SRTF)',
    description: 'Selects the process with the smallest remaining burst time. Our implementation uses preemptive SJF (Shortest Remaining Time First).',
    pros: ['Minimum average waiting time', 'Optimal for batch systems', 'Efficient CPU utilization'],
    cons: ['Requires burst time prediction', 'May cause starvation', 'Overhead of tracking remaining time'],
    formula: 'Always picks min(remaining_burst_time)',
    useCase: 'Systems where burst times are predictable and minimizing wait time is critical.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'rr',
    name: 'Round Robin',
    shortName: 'RR',
    type: 'Preemptive',
    description: 'Each process gets a fixed time slice (quantum). After the quantum expires, the process is moved to the back of the queue.',
    pros: ['Fair CPU allocation', 'Good response time', 'No starvation'],
    cons: ['High context switch overhead', 'Performance depends on quantum', 'Higher turnaround for long processes'],
    formula: 'Context Switches ≈ Total Burst / Quantum',
    useCase: 'Time-sharing systems and interactive applications requiring responsiveness.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'priority',
    name: 'Priority Scheduling',
    shortName: 'Priority',
    type: 'Non-Preemptive',
    description: 'Each process is assigned a priority. The CPU is allocated to the process with the highest priority (lower number = higher priority).',
    pros: ['Flexible prioritization', 'Good for real-time systems', 'Important tasks run first'],
    cons: ['May cause starvation', 'Priority inversion problem', 'Requires priority assignment logic'],
    formula: 'Next Process = min(priority) from ready queue',
    useCase: 'Real-time systems where certain processes must complete before others.',
    color: 'from-orange-500 to-red-500',
  },
];

export default function Landing() {
  const router = useRouter();
  const problemRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.1], [0, 60]);

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
        <Link href="/" className="flex items-center gap-3">
          <img src="/favicon.svg" alt="CPU Scheduler" className="w-8 h-8" />
          <span className="font-display font-semibold text-white text-lg hidden sm:block">CPU Scheduler</span>
        </Link>
        <Link
          href="/simulator"
          className="px-5 py-2 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors duration-200"
        >
          Try Simulator
        </Link>
      </motion.header>

      <ScrollProgress />

      {/* ——— Section 1: Hero ——— */}
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
            <SectionLabel number="01">Operating Systems Project</SectionLabel>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.05] tracking-[-0.03em] max-w-5xl mx-auto">
            <AnimatedWords text="Dynamic CPU Scheduling Simulator" delay={0.2} />
          </h1>
          <div className="flex justify-center">
            <HeadlineLine delay={0.4} />
          </div>
          <motion.p
            className="mt-6 sm:mt-8 text-lg sm:text-xl text-white/50 max-w-2xl mx-auto font-sans"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            An interactive visualization tool that brings Operating System scheduling concepts to life through real-time simulation and analysis.
          </motion.p>
          <motion.div
            className="mt-12 flex flex-wrap gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <GlowButton onClick={scrollToProblem}>Explore Project</GlowButton>
            <GlowButton variant="ghost" onClick={() => router.push('/simulator')}>Launch Simulator</GlowButton>
          </motion.div>
        </motion.div>
        <ScrollIndicator />
      </section>

      <SectionDivider flip />

      {/* ——— Section 2: Problem Statement ——— */}
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
          Problem Statement
        </motion.h2>
        <HeadlineLine light delay={0.1} className="relative z-10" />
        <motion.div
          className="mt-8 space-y-6 max-w-3xl relative z-10"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ type: 'spring', stiffness: 80, damping: 20, delay: 0.12 }}
        >
          <p className="text-lg sm:text-xl text-black/70 font-sans leading-relaxed">
            <span className="font-semibold text-black">The Challenge:</span> Understanding CPU scheduling algorithms is fundamental to Operating Systems education, yet traditional learning methods rely on static diagrams and manual calculations that fail to convey the dynamic nature of process scheduling.
          </p>
          <p className="text-lg sm:text-xl text-black/70 font-sans leading-relaxed">
            <span className="font-semibold text-black">The Gap:</span> Students struggle to visualize how different algorithms behave under varying workloads, compare their performance metrics, and understand the trade-offs between efficiency, fairness, and overhead.
          </p>
          <p className="text-lg sm:text-xl text-black/70 font-sans leading-relaxed">
            <span className="font-semibold text-black">Our Solution:</span> A real-time, interactive simulator that visualizes CPU scheduling algorithms with animated Gantt charts, live performance metrics, and intelligent algorithm recommendations.
          </p>
        </motion.div>
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

      {/* ——— Section 3: Problem Relevance to OS ——— */}
      <section className="min-h-screen flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-28 py-24 sm:py-32 bg-black text-white relative">
        <CornerAccent position="top-right" />
        <SectionLabel number="03" className="mb-6" />
        <motion.h2
          className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-[-0.03em] max-w-3xl"
          {...fadeUp(0)}
        >
          Why CPU Scheduling Matters
        </motion.h2>
        <HeadlineLine delay={0.1} />
        <motion.p
          className="mt-8 text-lg sm:text-xl text-white/60 max-w-2xl font-sans leading-relaxed"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ type: 'spring', stiffness: 80, damping: 20, delay: 0.12 }}
        >
          CPU scheduling is the cornerstone of multiprogramming operating systems. It determines system performance, responsiveness, and resource utilization.
        </motion.p>
        <motion.div
          className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={{
            visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
            hidden: {},
          }}
        >
          {[
            { 
              title: 'Resource Utilization', 
              desc: 'Maximize CPU usage to ensure the processor is never idle when processes are waiting.',
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              )
            },
            { 
              title: 'Throughput', 
              desc: 'Complete as many processes as possible per unit time for efficient batch processing.',
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              )
            },
            { 
              title: 'Turnaround Time', 
              desc: 'Minimize the total time from process submission to completion.',
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            },
            { 
              title: 'Waiting Time', 
              desc: 'Reduce time processes spend in the ready queue waiting for CPU allocation.',
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M3.124 7.5A8.969 8.969 0 015.292 3m13.416 0a8.969 8.969 0 012.168 4.5" />
                </svg>
              )
            },
            { 
              title: 'Response Time', 
              desc: 'Ensure quick first response for interactive systems and user experience.',
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
                </svg>
              )
            },
            { 
              title: 'Fairness', 
              desc: 'Guarantee all processes receive fair share of CPU time without starvation.',
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
                </svg>
              )
            },
          ].map((item) => (
            <motion.div
              key={item.title}
              variants={cardVariants}
              className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="font-display font-semibold text-white text-lg mb-2">{item.title}</h3>
              <p className="text-white/50 font-sans text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <SectionDivider flip />

      {/* ——— Section 4: Objectives ——— */}
      <section className="min-h-screen flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-28 py-24 sm:py-32 bg-white text-black relative overflow-hidden">
        <GridBackground light />
        <PatternDots light />
        <SectionLabel number="04" light className="mb-6 relative z-10" />
        <motion.h2
          className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-[1.1] tracking-[-0.03em] max-w-3xl relative z-10"
          {...fadeUp(0)}
        >
          Project Objectives
        </motion.h2>
        <HeadlineLine light delay={0.08} className="relative z-10" />
        <motion.div
          className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={{
            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.12 } },
            hidden: {},
          }}
        >
          {[
            {
              num: '01',
              title: 'Interactive Visualization',
              desc: 'Create animated Gantt charts that show real-time process execution and context switches.',
            },
            {
              num: '02',
              title: 'Multiple Algorithms',
              desc: 'Implement FCFS, SJF (Preemptive), Round Robin, and Priority Scheduling with accurate behavior.',
            },
            {
              num: '03',
              title: 'Performance Metrics',
              desc: 'Calculate and display waiting time, turnaround time, throughput, and context switches.',
            },
            {
              num: '04',
              title: 'Smart Optimization',
              desc: 'Build an intelligent system that detects suboptimal scheduling and suggests better algorithms.',
            },
            {
              num: '05',
              title: 'Educational Tool',
              desc: 'Provide clear explanations and comparisons to help students understand trade-offs.',
            },
            {
              num: '06',
              title: 'Modern Experience',
              desc: 'Deliver a polished, responsive web application with smooth animations and intuitive UX.',
            },
          ].map((obj) => (
            <motion.div
              key={obj.num}
              variants={cardVariants}
              className="flex gap-5"
            >
              <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center font-mono font-bold text-sm">
                {obj.num}
              </span>
              <div>
                <h3 className="font-display font-semibold text-black text-xl mb-2">{obj.title}</h3>
                <p className="text-black/60 font-sans">{obj.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <SectionDivider />

      {/* ——— Section 5: Feasibility & Scope ——— */}
      <section className="min-h-screen flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-28 py-24 sm:py-32 bg-black text-white relative">
        <CornerAccent position="top-left" />
        <SectionLabel number="05" className="mb-6" />
        <motion.h2
          className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-[-0.03em] max-w-3xl"
          {...fadeUp(0)}
        >
          Feasibility & Scope
        </motion.h2>
        <HeadlineLine delay={0.1} />
        <div className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewport}
            transition={{ type: 'spring', stiffness: 70, damping: 18 }}
          >
            <h3 className="font-display font-semibold text-white text-2xl mb-6">In Scope</h3>
            <ul className="space-y-4">
              {[
                'FCFS, SJF, Round Robin, Priority algorithms',
                'Real-time Gantt chart visualization',
                'Performance metrics calculation',
                'Smart algorithm switching',
                'Responsive web interface',
                'REST API backend',
              ].map((item, i) => (
                <motion.li
                  key={item}
                  className="flex items-center gap-3 text-white/80"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={viewport}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm">✓</span>
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewport}
            transition={{ type: 'spring', stiffness: 70, damping: 18, delay: 0.1 }}
          >
            <h3 className="font-display font-semibold text-white text-2xl mb-6">Technical Feasibility</h3>
            <ul className="space-y-4">
              {[
                'Browser-based: No installations required',
                'Modern tech stack: React, TypeScript, Node.js',
                'Lightweight: Fast load times, smooth animations',
                'Scalable: Can add more algorithms easily',
                'Educational: Suitable for classroom use',
                'Open source: Fully transparent codebase',
              ].map((item, i) => (
                <motion.li
                  key={item}
                  className="flex items-center gap-3 text-white/80"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={viewport}
                  transition={{ delay: 0.15 + i * 0.05 }}
                >
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm">◆</span>
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
        <motion.div
          className="mt-14 sm:mt-20 w-full max-w-4xl"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.22 }}
        >
          <GanttStripAnimated />
        </motion.div>
      </section>

      <SectionDivider flip />

      {/* ——— Section 6: Algorithms Explained ——— */}
      <section className="py-24 sm:py-32 bg-white text-black relative overflow-hidden">
        <GridBackground light />
        <div className="px-6 sm:px-12 md:px-20 lg:px-28">
          <SectionLabel number="06" light className="mb-6 relative z-10" />
          <motion.h2
            className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-[1.1] tracking-[-0.03em] max-w-3xl relative z-10"
            {...fadeUp(0)}
          >
            Scheduling Algorithms
          </motion.h2>
          <HeadlineLine light delay={0.08} className="relative z-10" />
          <motion.p
            className="mt-6 text-lg text-black/60 max-w-2xl font-sans relative z-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ delay: 0.15 }}
          >
            Our simulator implements four fundamental CPU scheduling algorithms, each with distinct characteristics and use cases.
          </motion.p>
        </div>

        <div className="mt-16 space-y-0">
          {ALGORITHMS.map((algo, index) => (
            <motion.div
              key={algo.id}
              className={`py-16 sm:py-24 px-6 sm:px-12 md:px-20 lg:px-28 ${
                index % 2 === 0 ? 'bg-neutral-50' : 'bg-white'
              }`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ type: 'spring', stiffness: 60, damping: 18 }}
            >
              <div className="max-w-6xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
                  {/* Left: Algorithm Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-6">
                      <span className={`px-4 py-2 rounded-full bg-black text-white font-mono font-bold text-sm`}>
                        {algo.shortName}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-black/10 text-black/60 font-mono text-xs">
                        {algo.type}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-black mb-4">
                      {algo.name}
                    </h3>
                    <p className="text-black/70 font-sans text-lg leading-relaxed mb-6">
                      {algo.description}
                    </p>
                    <div className="p-4 rounded-xl bg-black/5 border border-black/10 mb-6">
                      <p className="font-mono text-sm text-black/70">
                        <span className="text-black font-semibold">Formula: </span>
                        {algo.formula}
                      </p>
                    </div>
                    <p className="text-black/60 font-sans text-sm">
                      <span className="font-semibold text-black">Best for: </span>
                      {algo.useCase}
                    </p>
                  </div>

                  {/* Right: Pros & Cons */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-5 rounded-xl bg-green-50 border border-green-200">
                      <h4 className="font-display font-semibold text-green-800 mb-3 flex items-center gap-2">
                        <span className="text-green-500">✓</span> Advantages
                      </h4>
                      <ul className="space-y-2">
                        {algo.pros.map((pro) => (
                          <li key={pro} className="text-green-700 text-sm font-sans">• {pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-5 rounded-xl bg-red-50 border border-red-200">
                      <h4 className="font-display font-semibold text-red-800 mb-3 flex items-center gap-2">
                        <span className="text-red-500">✗</span> Disadvantages
                      </h4>
                      <ul className="space-y-2">
                        {algo.cons.map((con) => (
                          <li key={con} className="text-red-700 text-sm font-sans">• {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <SectionDivider />

      {/* ——— Section 7: Implementation Progress ——— */}
      <section className="min-h-screen flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-28 py-24 sm:py-32 bg-black text-white relative">
        <SectionLabel number="07" className="mb-6" />
        <motion.h2
          className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-[-0.03em] max-w-3xl"
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
        >
          Implementation Progress
        </motion.h2>
        <HeadlineLine delay={0.1} />
        <div className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={{
              visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
              hidden: {},
            }}
          >
            <h3 className="font-display font-semibold text-white text-xl mb-6">Completed Features</h3>
            <ul className="space-y-4">
              {[
                'FCFS Algorithm - Non-preemptive, arrival-order execution',
                'SJF Algorithm - Preemptive (SRTF) with dynamic re-evaluation',
                'Round Robin - Time-sliced execution with configurable quantum',
                'Priority Scheduling - Non-preemptive priority-based selection',
                'Smart Switcher - Automatic algorithm optimization',
                'Metrics Engine - Wait time, turnaround, context switches',
                'Gantt Chart - Animated timeline visualization',
                'Real-time Updates - Live results as inputs change',
                'Modern UI - Dark theme with smooth animations',
                'REST API - Express backend with TypeScript',
              ].map((step) => (
                <motion.li
                  key={step}
                  className="flex items-start gap-4 font-sans text-white/85"
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
                    className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-mono text-xs mt-0.5"
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.2 }}
                  >
                    ✓
                  </motion.span>
                  <span className="text-sm sm:text-base">{step}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewport}
            transition={{ type: 'spring', stiffness: 70, damping: 18, delay: 0.2 }}
          >
            <h3 className="font-display font-semibold text-white text-xl mb-6">Tech Stack</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                <ReactIcon className="w-8 h-8 mb-3" />
                <p className="font-display font-semibold text-white text-sm">React 18</p>
                <p className="text-white/40 text-xs">UI Library</p>
              </div>
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                <TypeScript className="w-8 h-8 mb-3" />
                <p className="font-display font-semibold text-white text-sm">TypeScript</p>
                <p className="text-white/40 text-xs">Type Safety</p>
              </div>
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                <Vite className="w-8 h-8 mb-3" />
                <p className="font-display font-semibold text-white text-sm">Vite</p>
                <p className="text-white/40 text-xs">Build Tool</p>
              </div>
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                <TailwindCss className="w-8 h-8 mb-3" />
                <p className="font-display font-semibold text-white text-sm">Tailwind</p>
                <p className="text-white/40 text-xs">Styling</p>
              </div>
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                <Motion className="w-8 h-8 mb-3 text-white" />
                <p className="font-display font-semibold text-white text-sm">Framer Motion</p>
                <p className="text-white/40 text-xs">Animations</p>
              </div>
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                <MUI className="w-8 h-8 mb-3" />
                <p className="font-display font-semibold text-white text-sm">MUI Charts</p>
                <p className="text-white/40 text-xs">Data Viz</p>
              </div>
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                <ExpressJs className="w-8 h-8 mb-3 text-white" />
                <p className="font-display font-semibold text-white text-sm">Express</p>
                <p className="text-white/40 text-xs">Backend</p>
              </div>
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                <NodeJs className="w-8 h-8 mb-3" />
                <p className="font-display font-semibold text-white text-sm">Node.js</p>
                <p className="text-white/40 text-xs">Runtime</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <SectionDivider flip />

      {/* ——— Section 8: Architecture ——— */}
      <section className="min-h-screen flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-28 py-24 sm:py-32 bg-neutral-50 text-black relative overflow-hidden">
        <SectionLabel number="08" light className="mb-6 relative z-10" />
        <motion.h2
          className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-[1.1] tracking-[-0.03em] max-w-3xl relative z-10"
          {...fadeUp(0)}
        >
          System Architecture
        </motion.h2>
        <HeadlineLine light delay={0.08} className="relative z-10" />
        <motion.div
          className="mt-12 sm:mt-16 relative z-10"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ type: 'spring', stiffness: 60, damping: 18, delay: 0.15 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Frontend */}
            <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-lg text-black mb-2">Frontend</h3>
              <p className="text-neutral-500 text-sm mb-5">React SPA with real-time updates</p>
              <ul className="space-y-2.5 text-sm text-neutral-600">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-neutral-400" />
                  Landing Page (Presentation)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-neutral-400" />
                  Simulator Page (Input + Results)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-neutral-400" />
                  Gantt Chart Component
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-neutral-400" />
                  MUI X Charts Integration
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-neutral-400" />
                  Framer Motion Animations
                </li>
              </ul>
            </div>

            {/* API Layer */}
            <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-lg text-black mb-2">API Layer</h3>
              <p className="text-neutral-500 text-sm mb-5">RESTful endpoints for simulation</p>
              <ul className="space-y-2.5 text-sm text-neutral-600">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-neutral-400" />
                  POST /api/simulate
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-neutral-400" />
                  Request validation
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-neutral-400" />
                  Algorithm routing
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-neutral-400" />
                  Response formatting
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-neutral-400" />
                  Error handling
                </li>
              </ul>
            </div>

            {/* Backend Logic */}
            <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-lg text-black mb-2">Backend Logic</h3>
              <p className="text-neutral-500 text-sm mb-5">Core algorithms & metrics engine</p>
              <ul className="space-y-2.5 text-sm text-neutral-600">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-neutral-400" />
                  FCFS, SJF, RR, Priority
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-neutral-400" />
                  Metrics Calculator
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-neutral-400" />
                  Smart Switcher/Evaluator
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-neutral-400" />
                  Gantt Chart Generator
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-neutral-400" />
                  Process Result Builder
                </li>
              </ul>
            </div>
          </div>

          {/* Data Flow */}
          <motion.div
            className="mt-6 p-6 rounded-2xl bg-neutral-900 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ delay: 0.3 }}
          >
            <h4 className="font-mono text-xs text-white/40 uppercase tracking-wider mb-5">Data Flow Pipeline</h4>
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-mono">
              <span className="px-4 py-2 rounded-lg bg-white/10 text-white/90 border border-white/10">User Input</span>
              <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="px-4 py-2 rounded-lg bg-white/10 text-white/90 border border-white/10">API Request</span>
              <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="px-4 py-2 rounded-lg bg-white/10 text-white/90 border border-white/10">Algorithm</span>
              <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="px-4 py-2 rounded-lg bg-white/10 text-white/90 border border-white/10">Evaluator</span>
              <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="px-4 py-2 rounded-lg bg-white/10 text-white/90 border border-white/10">Results</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <SectionDivider />

      {/* ——— Section 9: Key Formulas ——— */}
      <section className="py-24 sm:py-32 bg-black text-white relative px-6 sm:px-12 md:px-20 lg:px-28">
        <SectionLabel number="09" className="mb-6" />
        <motion.h2
          className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-[1.1] tracking-[-0.03em] max-w-3xl"
          {...fadeUp(0)}
        >
          Key Formulas & Metrics
        </motion.h2>
        <HeadlineLine delay={0.1} />
        <motion.div
          className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={{
            visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
            hidden: {},
          }}
        >
          {[
            { 
              name: 'Completion Time (CT)', 
              formula: 'Time when process finishes',
              example: 'CT = End time in Gantt chart'
            },
            { 
              name: 'Turnaround Time (TAT)', 
              formula: 'CT - Arrival Time',
              example: 'TAT = 10 - 2 = 8 units'
            },
            { 
              name: 'Waiting Time (WT)', 
              formula: 'TAT - Burst Time',
              example: 'WT = 8 - 5 = 3 units'
            },
            { 
              name: 'Average Waiting Time', 
              formula: 'Σ(WT) / n',
              example: '(3 + 5 + 2) / 3 = 3.33'
            },
            { 
              name: 'Throughput', 
              formula: 'n / Total Time',
              example: '5 processes / 20 units = 0.25'
            },
            { 
              name: 'CPU Utilization', 
              formula: '(Busy Time / Total Time) × 100',
              example: '(18 / 20) × 100 = 90%'
            },
          ].map((metric) => (
            <motion.div
              key={metric.name}
              variants={cardVariants}
              className="p-5 rounded-xl border border-white/10 bg-white/[0.02]"
            >
              <h3 className="font-display font-semibold text-white text-lg mb-2">{metric.name}</h3>
              <p className="font-mono text-sm text-white/70 mb-3 p-2 rounded bg-white/5">{metric.formula}</p>
              <p className="text-white/40 text-xs">Example: {metric.example}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <SectionDivider flip />

      {/* ——— Section 10: OS Concepts ——— */}
      <section className="min-h-screen flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-28 py-24 sm:py-32 bg-white text-black relative">
        <SectionLabel number="10" light className="mb-6" />
        <motion.h2
          className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-black leading-[1.1] tracking-[-0.03em] max-w-2xl"
          {...fadeUp(0)}
        >
          OS Concepts Demonstrated
        </motion.h2>
        <HeadlineLine light delay={0.08} />
        <motion.div
          className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={{
            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.12 } },
            hidden: {},
          }}
        >
          {[
            { 
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
                </svg>
              ), 
              title: 'CPU Scheduling', 
              desc: 'Algorithm selection, process ordering, ready queue management' 
            },
            { 
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                </svg>
              ), 
              title: 'Context Switching', 
              desc: 'Process state saving, overhead measurement, switch optimization' 
            },
            { 
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              ), 
              title: 'Performance Metrics', 
              desc: 'Wait time, turnaround time, throughput, CPU utilization' 
            },
            { 
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ), 
              title: 'Process Management', 
              desc: 'Process states, arrival modeling, burst time simulation' 
            },
            { 
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ), 
              title: 'Time Quantum', 
              desc: 'Time-slicing, preemption intervals, quantum selection' 
            },
            { 
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25" />
                </svg>
              ), 
              title: 'Priority Systems', 
              desc: 'Priority assignment, scheduling decisions, starvation prevention' 
            },
            { 
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              ), 
              title: 'Optimization', 
              desc: 'Algorithm comparison, trade-off analysis, workload adaptation' 
            },
            { 
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              ), 
              title: 'Preemption', 
              desc: 'Preemptive vs non-preemptive, SRTF implementation, state management' 
            },
          ].map((card) => (
            <motion.div key={card.title} variants={cardVariants}>
              <HoverCard delay={0}>
                <motion.div
                  className="w-11 h-11 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-4"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={viewport}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                >
                  {card.icon}
                </motion.div>
                <h3 className="font-display font-semibold text-black text-lg">{card.title}</h3>
                <p className="mt-2 text-black/60 font-sans text-sm">{card.desc}</p>
              </HoverCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <SectionDivider />

      {/* ——— Section 11: Smart Switching ——— */}
      <section className="py-24 sm:py-32 bg-black text-white relative px-6 sm:px-12 md:px-20 lg:px-28">
        <SectionLabel number="11" className="mb-6" />
        <motion.h2
          className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-[1.1] tracking-[-0.03em] max-w-3xl"
          {...fadeUp(0)}
        >
          Smart Algorithm Switching
        </motion.h2>
        <HeadlineLine delay={0.1} />
        <motion.p
          className="mt-6 text-lg text-white/60 max-w-2xl font-sans"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ delay: 0.15 }}
        >
          Our intelligent evaluator detects suboptimal scheduling and automatically recommends better algorithms.
        </motion.p>
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewport}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-display font-semibold text-white text-xl mb-4">Round Robin → SJF</h3>
            <p className="text-white/60 mb-4">When context switches exceed threshold:</p>
            <div className="p-4 rounded-lg bg-black/50 font-mono text-sm text-white/80">
              <p className="text-yellow-400">// Detection</p>
              <p>if (contextSwitches {'>'} processes.length × 2.5)</p>
              <p className="ml-4 text-green-400">→ Switch to SJF</p>
            </div>
            <div className="mt-4">
              <QuoteBlock label="Example">
                "Round Robin caused 8 context switches. System switched to SJF to reduce turnaround time by 25%."
              </QuoteBlock>
            </div>
          </motion.div>
          <motion.div
            className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewport}
            transition={{ delay: 0.25 }}
          >
            <h3 className="font-display font-semibold text-white text-xl mb-4">FCFS → SJF</h3>
            <p className="text-white/60 mb-4">When convoy effect causes high waiting time:</p>
            <div className="p-4 rounded-lg bg-black/50 font-mono text-sm text-white/80">
              <p className="text-yellow-400">// Detection</p>
              <p>if (fcfsWaitTime {'>'} sjfWaitTime × 2)</p>
              <p className="ml-4 text-green-400">→ Switch to SJF</p>
            </div>
            <div className="mt-4">
              <QuoteBlock label="Example">
                "FCFS led to high average waiting time (12.5). System switched to SJF (avg waiting: 4.2)."
              </QuoteBlock>
            </div>
          </motion.div>
        </div>
      </section>

      <SectionDivider flip />

      {/* ——— Section 12: CTA ——— */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 sm:px-12 py-24 sm:py-32 bg-white text-black relative overflow-hidden">
        <GridBackground light />
        <PatternDots light />
        <CornerAccent position="top-left" />
        <CornerAccent position="bottom-right" />
        <SectionLabel number="12" light className="mb-6 justify-center">Try It Now</SectionLabel>
        <motion.h2
          className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-[1.1] tracking-[-0.03em] max-w-2xl relative z-10"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ type: 'spring', stiffness: 70, damping: 18 }}
        >
          Experience the Simulator
        </motion.h2>
        <HeadlineLine light delay={0.12} className="mx-auto mt-4" />
        <motion.p
          className="mt-6 text-lg text-black/60 max-w-xl font-sans relative z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ delay: 0.2 }}
        >
          Configure processes, select an algorithm, and watch the scheduling unfold in real-time with animated Gantt charts and live metrics.
        </motion.p>
        <motion.div
          className="mt-12 relative z-10 flex flex-wrap gap-4 justify-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.12 }}
        >
          <button
            onClick={() => router.push('/simulator')}
            className="px-8 py-4 rounded-full bg-black text-white font-display font-semibold text-lg hover:bg-black/80 transition-colors"
          >
            Launch Simulator
          </button>
        </motion.div>
      </section>

      {/* ——— Footer ——— */}
      <motion.footer
        className="py-12 px-6 sm:px-12 bg-black border-t border-white/10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src="/favicon.svg" alt="CPU Scheduler" className="w-8 h-8" />
              <span className="font-display font-semibold text-white">CPU Scheduling Simulator</span>
            </div>
            <p className="font-mono text-xs sm:text-sm text-white/40 text-center">
              Built with ❤️ for Operating Systems Education
            </p>
          </div>
        </div>
      </motion.footer>
    </motion.div>
  );
}
