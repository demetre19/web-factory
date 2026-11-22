import React from 'react';

export interface Amb20Props {
  children?: React.ReactNode;
  className?: string;
}

const WAVE_ROWS = Array.from({ length: 14 }, (_, i) => 16 + i * 16);

export function Amb20({ children, className = '' }: Amb20Props) {
  return (
    <section
      className={`relative overflow-hidden rounded-xl bg-[#0C0E13] text-slate-100 ${className}`}
    >
      <style>{`
        @keyframes amb20-phase-a {
          0%, 100% { transform: translate3d(0px, 0px, 0); }
          50% { transform: translate3d(-18px, 3px, 0); }
        }
        @keyframes amb20-phase-b {
          0%, 100% { transform: translate3d(0px, 0px, 0); }
          50% { transform: translate3d(18px, -3px, 0); }
        }
        .amb20-a { animation: amb20-phase-a 16s ease-in-out infinite; }
        .amb20-b { animation: amb20-phase-b 16s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .amb20-a, .amb20-b { animation: none; }
        }
      `}</style>

      <svg
        aria-hidden="true"
        viewBox="0 0 400 240"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-30"
      >
        <g className="amb20-a" fill="none" stroke="#94A3B8" strokeWidth="0.65">
          {WAVE_ROWS.map((y) => (
            <path
              key={`a-${y}`}
              d={`M -30 ${y} Q 100 ${y - 12}, 200 ${y} T 430 ${y}`}
            />
          ))}
        </g>
        <g className="amb20-b" fill="none" stroke="#CBD5E1" strokeWidth="0.55" opacity="0.7">
          {WAVE_ROWS.map((y) => (
            <path
              key={`b-${y}`}
              d={`M -30 ${y + 3} Q 100 ${y + 15}, 200 ${y + 3} T 430 ${y + 3}`}
            />
          ))}
        </g>
      </svg>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0C0E13]/90 via-[#0C0E13]/55 to-transparent"
      />

      <div className="relative z-10 flex min-h-[240px] flex-col justify-between p-6">
        {children ?? (
          <>
            <p className="text-xs font-medium text-slate-400">
              Acoustic Panel · Woven Felt
            </p>
            <div className="mt-8 space-y-2">
              <h3 className="text-lg font-semibold tracking-tight text-white">
                Silk Moiré Interference
              </h3>
              <p className="max-w-sm text-sm leading-relaxed text-slate-300">
                Two opposing SVG hairline wave lattices shift subtly out of phase to produce a tactile silk shimmer.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-400 tabular-nums">
              <span>12 mm Wool Felt</span>
              <span>NRC 0.85 rating</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default Amb20;
