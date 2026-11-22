import React from 'react';

export interface Amb1Props {
  children?: React.ReactNode;
  className?: string;
}

export function Amb1({ children, className = '' }: Amb1Props) {
  return (
    <section
      className={`relative overflow-hidden rounded-xl bg-[#0B0E14] text-slate-100 ${className}`}
    >
      <style>{`
        @keyframes amb1-blob-a {
          0%, 100% { transform: translate3d(-8%, -6%, 0) scale(1); }
          50% { transform: translate3d(14%, 10%, 0) scale(1.14); }
        }
        @keyframes amb1-blob-b {
          0%, 100% { transform: translate3d(12%, 8%, 0) scale(1.06); }
          50% { transform: translate3d(-12%, -10%, 0) scale(0.92); }
        }
        @keyframes amb1-blob-c {
          0%, 100% { transform: translate3d(0%, 12%, 0) scale(0.96); }
          50% { transform: translate3d(8%, -12%, 0) scale(1.12); }
        }
        .amb1-a { animation: amb1-blob-a 22s ease-in-out infinite; }
        .amb1-b { animation: amb1-blob-b 27s ease-in-out infinite; }
        .amb1-c { animation: amb1-blob-c 19s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .amb1-a, .amb1-b, .amb1-c { animation: none; }
        }
      `}</style>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="amb1-a absolute -top-24 -left-16 h-72 w-72 rounded-full opacity-35 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(20,184,166,0.55) 0%, transparent 70%)',
          }}
        />
        <div
          className="amb1-b absolute -right-16 -bottom-24 h-80 w-80 rounded-full opacity-30 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)',
          }}
        />
        <div
          className="amb1-c absolute top-1/3 left-1/3 h-60 w-60 rounded-full opacity-25 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(56,189,248,0.45) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-[240px] flex-col justify-between p-6">
        {children ?? (
          <>
            <p className="text-xs font-medium tracking-wide text-teal-200/75">
              Monograph · Spatial Architecture
            </p>
            <div className="mt-8 space-y-2">
              <h3 className="text-lg font-semibold tracking-tight text-white">
                Quiet Daylight Studios
              </h3>
              <p className="max-w-sm text-sm leading-relaxed text-slate-300">
                Diffuse color washes hold ambient depth behind editorial prose without reducing body contrast.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-400">
              <span>Zurich Archive</span>
              <span className="font-medium text-slate-200">Read essay →</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default Amb1;
