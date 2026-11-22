import React from 'react';

export interface Amb12Props {
  children?: React.ReactNode;
  className?: string;
}

export function Amb12({ children, className = '' }: Amb12Props) {
  return (
    <section
      className={`relative overflow-hidden rounded-xl bg-[#0D1116] text-slate-100 ${className}`}
    >
      <style>{`
        @keyframes amb12-mist-a {
          0%, 100% { transform: translate3d(-12%, 0, 0); }
          50% { transform: translate3d(12%, 0, 0); }
        }
        @keyframes amb12-mist-b {
          0%, 100% { transform: translate3d(14%, 0, 0); }
          50% { transform: translate3d(-14%, 0, 0); }
        }
        .amb12-fog-a { animation: amb12-mist-a 26s ease-in-out infinite; }
        .amb12-fog-b { animation: amb12-mist-b 34s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .amb12-fog-a, .amb12-fog-b { animation: none; }
        }
      `}</style>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="amb12-fog-a absolute -right-1/4 bottom-4 -left-1/4 h-28 rounded-full opacity-35 blur-2xl"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(203,213,225,0.28) 35%, rgba(148,163,184,0.36) 65%, transparent 100%)',
          }}
        />
        <div
          className="amb12-fog-b absolute -right-1/4 bottom-12 -left-1/4 h-24 rounded-full opacity-25 blur-3xl"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(226,232,240,0.32) 50%, transparent 100%)',
          }}
        />
        <div
          className="amb12-fog-a absolute top-6 -right-1/4 -left-1/4 h-20 rounded-full opacity-20 blur-2xl"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(148,163,184,0.3) 45%, transparent 100%)',
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-[240px] flex-col justify-between p-6">
        {children ?? (
          <>
            <p className="text-xs font-medium text-slate-400">
              Alpine Station · 2,400 m
            </p>
            <div className="mt-8 space-y-2">
              <div className="font-mono-code text-2xl font-medium tracking-tight text-white tabular-nums">
                -2°C
              </div>
              <h3 className="text-base font-semibold text-slate-100">
                Valley Mist Advection
              </h3>
              <p className="max-w-sm text-sm leading-relaxed text-slate-300">
                Opposing horizontal fog bands drift quietly across upper and lower horizons without obscuring text.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-400 tabular-nums">
              <span>Visibility 1.8 km</span>
              <span>Wind 6 kt NW</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default Amb12;
