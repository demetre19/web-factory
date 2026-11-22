import React from 'react';

export interface Amb17Props {
  children?: React.ReactNode;
  className?: string;
}

export function Amb17({ children, className = '' }: Amb17Props) {
  return (
    <section
      className={`relative overflow-hidden rounded-xl bg-[#071318] text-slate-100 ${className}`}
    >
      <style>{`
        @keyframes amb17-ripple {
          0% { transform: scale(0.45); opacity: 0.42; }
          100% { transform: scale(1.35); opacity: 0; }
        }
        .amb17-ring-1 { animation: amb17-ripple 10s ease-out infinite; transform-origin: 290px 80px; }
        .amb17-ring-2 { animation: amb17-ripple 10s ease-out 3.3s infinite; transform-origin: 290px 80px; }
        .amb17-ring-3 { animation: amb17-ripple 10s ease-out 6.6s infinite; transform-origin: 290px 80px; }
        @media (prefers-reduced-motion: reduce) {
          .amb17-ring-1, .amb17-ring-2, .amb17-ring-3 { animation: none; opacity: 0.16; }
        }
      `}</style>

      <svg
        aria-hidden="true"
        viewBox="0 0 400 240"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <ellipse
          cx="290"
          cy="80"
          rx="110"
          ry="64"
          fill="none"
          stroke="#5EEAD4"
          strokeWidth="1"
          className="amb17-ring-1"
        />
        <ellipse
          cx="290"
          cy="80"
          rx="110"
          ry="64"
          fill="none"
          stroke="#5EEAD4"
          strokeWidth="1"
          className="amb17-ring-2"
        />
        <ellipse
          cx="290"
          cy="80"
          rx="110"
          ry="64"
          fill="none"
          stroke="#99F6E4"
          strokeWidth="0.9"
          className="amb17-ring-3"
        />
      </svg>

      <div className="relative z-10 flex min-h-[240px] flex-col justify-between p-6">
        {children ?? (
          <>
            <p className="text-xs font-medium text-teal-200/75">
              Hydrophone Array · Pelagic Log
            </p>
            <div className="mt-8 space-y-2">
              <h3 className="text-lg font-semibold tracking-tight text-white">
                Concentric Water Ripples
              </h3>
              <p className="max-w-sm text-sm leading-relaxed text-slate-300">
                Staggered elliptical SVG refraction rings expand and fade across deep marine teal surfaces.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-400 tabular-nums">
              <span>Depth 340 m</span>
              <span>Ambient 41 dB</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default Amb17;
