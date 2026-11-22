import React from 'react';

export interface Amb13Props {
  children?: React.ReactNode;
  className?: string;
}

export function Amb13({ children, className = '' }: Amb13Props) {
  return (
    <section
      className={`relative overflow-hidden rounded-xl bg-[#0B1018] text-slate-100 ${className}`}
    >
      <style>{`
        @keyframes amb13-wave-slide-a {
          0% { transform: translate3d(0%, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes amb13-wave-slide-b {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0%, 0, 0); }
        }
        .amb13-w1 { animation: amb13-wave-slide-a 24s linear infinite; }
        .amb13-w2 { animation: amb13-wave-slide-b 32s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .amb13-w1, .amb13-w2 { animation: none; }
        }
      `}</style>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 bottom-0 left-0 h-28 overflow-hidden"
      >
        <svg
          viewBox="0 0 800 100"
          preserveAspectRatio="none"
          className="amb13-w1 absolute bottom-0 left-0 h-24 w-[200%]"
        >
          <path
            d="M0,55 C100,25 200,85 300,55 C350,40 375,40 400,55 C500,25 600,85 700,55 C750,40 775,40 800,55 L800,100 L0,100 Z"
            fill="rgba(56, 189, 248, 0.14)"
          />
        </svg>
        <svg
          viewBox="0 0 800 100"
          preserveAspectRatio="none"
          className="amb13-w2 absolute bottom-0 left-0 h-20 w-[200%]"
        >
          <path
            d="M0,62 C110,88 210,36 310,62 C360,74 380,74 400,62 C510,88 610,36 710,62 C760,74 780,74 800,62 L800,100 L0,100 Z"
            fill="rgba(148, 163, 184, 0.16)"
          />
        </svg>
      </div>

      <div className="relative z-10 flex min-h-[240px] flex-col justify-between p-6">
        {children ?? (
          <>
            <p className="text-xs font-medium text-sky-200/75">
              Harbor Almanac · Tide Table
            </p>
            <div className="mt-8 space-y-2">
              <h3 className="text-lg font-semibold tracking-tight text-white">
                Gentle Section-Bottom Waves
              </h3>
              <p className="max-w-sm text-sm leading-relaxed text-slate-300">
                Seamless dual-period SVG sine paths translate horizontally along the lower margin to soften section transitions.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-300 tabular-nums">
              <span>High Tide 06:14</span>
              <span>1.9 m swell</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default Amb13;
