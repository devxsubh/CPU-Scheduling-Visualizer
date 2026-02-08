'use client';

import { motion } from 'framer-motion';

interface CheckboxProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}

export default function Checkbox({
  id,
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}: CheckboxProps) {
  const uid = id ?? `cb-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <label
      htmlFor={uid}
      className={`flex items-center gap-3 cursor-pointer select-none group ${disabled ? 'cursor-not-allowed opacity-60' : ''} ${className}`}
    >
      <input
        id={uid}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only peer"
      />
      <span
        role="checkbox"
        aria-checked={checked}
        className={`
          peer-focus-visible:ring-2 peer-focus-visible:ring-white/30 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-black peer-focus-visible:rounded-md
          relative flex flex-shrink-0 items-center justify-center w-5 h-5 rounded-md
          border-2 transition-all duration-200 ease-out
          ${checked
            ? 'border-white bg-white text-black'
            : 'border-white/30 bg-neutral-800/80 text-transparent group-hover:border-white/50 group-hover:bg-white/5'}
          ${disabled ? '' : ''}
        `}
      >
        {checked && (
          <motion.svg
            viewBox="0 0 12 12"
            className="w-3 h-3 absolute"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2 6l3 3 5-6"
            />
          </motion.svg>
        )}
      </span>
      <span className="font-mono text-sm text-white/90 group-hover:text-white transition-colors">
        {label}
      </span>
    </label>
  );
}
