import React from 'react';

export interface Amb8Props {
  children?: React.ReactNode;
  className?: string;
}

export function Amb8({ children, className = '' }: Amb8Props) {
  return (
    <section
      className={`relative overflow-hidden rounded-xl bg-[#0A0C12] text-slate-100 ${className}`}
    >
      <style>{`
        @keyframes amb8-spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .amb8-conic {
          animation: amb8-spin 24s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .amb8-conic { animation: none; }
        }
      `}</style>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="amb8-conic absolute top-1/2 left-1/2 h-[420px] w-[420px] opacity-35 blur-3xl"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, rgba(56,189,248,0.55) 70deg, transparent 150deg, rgba(167,139,250,0.45) 240deg, transparent 360deg)',
          }}
        />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-3 rounded-lg bg-[#0B0D13]/75 backdrop-blur-sm"
      />

      <div className="relative z-10 flex min-h-[240px] flex-col justify-between p-6">
        {children ?? (
          <>
            <p className="text-xs font-medium text-slate-400">
              Chronometer · Orbital Sweep
            </p>
            <div className="mt-8 space-y-2">
              <h3 className="text-lg font-semibold tracking-tight text-white">
                Slow Conic Light Sweep
              </h3>
              <p className="max-w-sm text-sm leading-relaxed text-slate-300">
                A blurred conic gradient rotates smoothly over 24 seconds beneath a subtle frosted inner plane.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-400 tabular-nums">
              <span>24s cycle</span>
              <span>Solar azimuth 142°</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default Amb8;
