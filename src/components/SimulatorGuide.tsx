'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export interface GuideStep {
  id: string;
  title: string;
  body: string;
}

interface SimulatorGuideProps {
  open: boolean;
  onClose: () => void;
  steps: GuideStep[];
  stepIndex: number;
  onStepChange: (index: number) => void;
  /** Ref for the element to highlight this step (null = no spotlight, e.g. welcome) */
  targetRef: React.RefObject<HTMLElement | null> | null;
}

const PADDING = 12;

export default function SimulatorGuide({
  open,
  onClose,
  steps,
  stepIndex,
  onStepChange,
  targetRef,
}: SimulatorGuideProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!open || !targetRef?.current) {
      setTargetRect(null);
      return;
    }
    const el = targetRef.current;
    const update = () => setTargetRect(el.getBoundingClientRect());
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('scroll', update, true);
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', update, true);
    };
  }, [open, stepIndex, targetRef]);

  if (!open || typeof document === 'undefined') return null;

  const step = steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;
  const hasSpotlight = targetRect !== null;

  const overlay = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] pointer-events-none"
        aria-modal="true"
        role="dialog"
        aria-labelledby="guide-title"
        aria-describedby="guide-desc"
      >
        {/* Dimmed overlay with optional hole */}
        <div className="absolute inset-0 pointer-events-auto" onClick={onClose} aria-hidden>
          {hasSpotlight && targetRect ? (
            <>
              {/* Top */}
              <div
                className="absolute left-0 right-0 top-0 bg-black/75"
                style={{ height: Math.max(0, targetRect.top - PADDING) }}
              />
              {/* Bottom */}
              <div
                className="absolute left-0 right-0 bottom-0 bg-black/75"
                style={{
                  top: targetRect.bottom + PADDING,
                  height: Math.max(0, window.innerHeight - (targetRect.bottom + PADDING)),
                }}
              />
              {/* Left */}
              <div
                className="absolute bg-black/75"
                style={{
                  left: 0,
                  top: targetRect.top - PADDING,
                  width: Math.max(0, targetRect.left - PADDING),
                  height: targetRect.height + PADDING * 2,
                }}
              />
              {/* Right */}
              <div
                className="absolute bg-black/75"
                style={{
                  left: targetRect.right + PADDING,
                  top: targetRect.top - PADDING,
                  width: Math.max(0, window.innerWidth - (targetRect.right + PADDING)),
                  height: targetRect.height + PADDING * 2,
                }}
              />
              {/* Spotlight border */}
              <div
                className="absolute rounded-xl border-2 border-white/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.01)] pointer-events-none ring-2 ring-white/30"
                style={{
                  left: targetRect.left - PADDING,
                  top: targetRect.top - PADDING,
                  width: targetRect.width + PADDING * 2,
                  height: targetRect.height + PADDING * 2,
                }}
              />
            </>
          ) : (
            <div className="absolute inset-0 bg-black/60" />
          )}
        </div>

        {/* Tooltip card - centered for consistency */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto w-full max-w-md rounded-2xl border border-white/20 bg-neutral-900 shadow-2xl overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <span className="font-mono text-[10px] text-white/50 uppercase tracking-wider">
                Step {stepIndex + 1} of {steps.length}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close guide"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-5 py-4">
              <h2 id="guide-title" className="font-display text-lg font-semibold text-white mb-2">
                {step.title}
              </h2>
              <p id="guide-desc" className="text-white/80 text-sm leading-relaxed">
                {step.body}
              </p>
            </div>
            <div className="px-5 py-4 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => (isFirst ? onClose() : onStepChange(stepIndex - 1))}
                className="px-4 py-2 rounded-lg border border-white/20 text-white/80 font-mono text-sm hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isFirst ? 'Skip' : 'Back'}
              </button>
              <div className="flex gap-1.5">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onStepChange(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === stepIndex ? 'bg-white' : 'bg-white/30 hover:bg-white/50'
                    }`}
                    aria-label={`Go to step ${i + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => (isLast ? onClose() : onStepChange(stepIndex + 1))}
                className="px-4 py-2 rounded-lg bg-white text-black font-display font-semibold text-sm hover:opacity-90"
              >
                {isLast ? 'Done' : 'Next'}
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(overlay, document.body);
}
