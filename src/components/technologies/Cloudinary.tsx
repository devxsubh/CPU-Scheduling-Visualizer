import React from 'react';

export default function Cloudinary({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
      className={className}
    >
      {/* Cloud outline - smooth rounded cloud shape */}
      <path
        d="M64 18c-20.986 0-38 17.014-38 38 0 2.88.324 5.688.93 8.36C15.93 68.36 8 77.36 8 88c0 12.15 9.85 22 22 22h52c12.15 0 22-9.85 22-22 0-10.64-7.93-19.64-18.93-23.64.606-2.672.93-5.48.93-8.36 0-20.986-17.014-38-38-38z"
        fill="#3448C5"
      />
      {/* Left arrow (tallest, dark orange) - upward pointing */}
      <path
        d="M40 86l4-4 4 4v-20h-8v20z"
        fill="#FF6B35"
      />
      <rect x="38" y="66" width="12" height="2" fill="#FF6B35" />
      
      {/* Middle arrow (medium, golden orange) - upward pointing */}
      <path
        d="M56 82l4-4 4 4v-12h-8v12z"
        fill="#FFA726"
      />
      <rect x="54" y="70" width="12" height="2" fill="#FFA726" />
      
      {/* Right arrow (shortest, light yellow) - upward pointing */}
      <path
        d="M72 78l4-4 4 4v-6h-8v6z"
        fill="#FFD54F"
      />
      <rect x="70" y="72" width="12" height="2" fill="#FFD54F" />
    </svg>
  );
}

