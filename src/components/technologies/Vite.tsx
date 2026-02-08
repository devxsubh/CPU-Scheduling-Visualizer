export default function Vite({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 128 128" className={className}>
      <defs>
        <linearGradient
          id="vite-a"
          x1="6"
          y1="33"
          x2="235"
          y2="344"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(0 .937) scale(.3122)"
        >
          <stop offset="0" stopColor="#41d1ff" />
          <stop offset="1" stopColor="#bd34fe" />
        </linearGradient>
        <linearGradient
          id="vite-b"
          x1="194.651"
          y1="8.818"
          x2="236.076"
          y2="292.989"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(0 .937) scale(.3122)"
        >
          <stop offset="0" stopColor="#ffbd4f" />
          <stop offset="1" stopColor="#ff980e" />
        </linearGradient>
      </defs>
      <path
        d="M124.766 19.52 67.324 122.238c-1.187 2.121-4.234 2.133-5.437.024L3.086 19.553c-1.313-2.302.652-5.087 3.262-4.62L64.07 25.968a3.204 3.204 0 0 0 1.168-.002l56.609-10.968c2.601-.504 4.555 2.262 3.261 4.522Zm0 0"
        fill="url(#vite-a)"
      />
      <path
        d="M91.46 1.43 48.754 9.676a1.589 1.589 0 0 0-1.269 1.336L42.27 56.77a1.59 1.59 0 0 0 1.878 1.762l12.7-2.758a1.59 1.59 0 0 1 1.907 1.903l-3.757 18.418a1.589 1.589 0 0 0 1.985 1.852l7.836-2.406a1.59 1.59 0 0 1 1.985 1.855l-5.965 29.285c-.387 1.899 2.09 2.87 3.184 1.25l.731-1.082 40.328-75.907c.933-1.757-.546-3.786-2.469-3.383l-13.004 2.727a1.589 1.589 0 0 1-1.873-1.98l7.54-28.453a1.59 1.59 0 0 0-1.866-1.922Zm0 0"
        fill="url(#vite-b)"
      />
    </svg>
  );
}
