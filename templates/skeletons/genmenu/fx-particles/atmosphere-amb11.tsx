import React from 'react';

export interface Amb11Props {
  children?: React.ReactNode;
  className?: string;
}

export function Amb11({ children, className = '' }: Amb11Props) {
  return (
    <section
      className={`relative overflow-hidden rounded-xl bg-[#0D0F16] text-slate-100 ${className}`}
    >
      <style>{`
        @keyframes amb11-mesh-1 {
          0%, 100% { transform: translate3d(0%, 0%, 0) scale(1); }
          50% { transform: translate3d(18%, 12%, 0) scale(1.12); }
        }
        @keyframes amb11-mesh-2 {
          0%, 100% { transform: translate3d(0%, 0%, 0) scale(1.08); }
          50% { transform: translate3d(-16%, 10%, 0) scale(0.95); }
        }
        @keyframes amb11-mesh-3 {
          0%, 100% { transform: translate3d(0%, 0%, 0) scale(1); }
          50% { transform: translate3d(10%, -18%, 0) scale(1.1); }
        }
        .amb11-p1 { animation: amb11-mesh-1 21s ease-in-out infinite; }
        .amb11-p2 { animation: amb11-mesh-2 25s ease-in-out infinite; }
        .amb11-p3 { animation: amb11-mesh-3 19s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .amb11-p1, .amb11-p2, .amb11-p3 { animation: none; }
        }
      `}</style>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="amb11-p1 absolute -top-24 -left-16 h-72 w-72 rounded-full opacity-45 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(16,185,129,0.42) 0%, transparent 70%)',
          }}
        />
        <div
          className="amb11-p2 absolute -top-12 -right-12 h-72 w-72 rounded-full opacity-40 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(14,165,233,0.45) 0%, transparent 70%)',
          }}
        />
        <div
          className="amb11-p3 absolute -bottom-24 left-1/4 h-80 w-80 rounded-full opacity-40 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(168,85,247,0.34) 0%, transparent 72%)',
          }}
        />
        <div
          className="amb11-p1 absolute right-1/4 -bottom-16 h-60 w-60 rounded-full opacity-30 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(244,114,182,0.32) 0%, transparent 72%)',
          }}
        />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[#090B10]/35"
      />

      <div className="relative z-10 flex min-h-[240px] flex-col justify-between p-6">
        {children ?? (
          <>
            <p className="text-xs font-medium text-emerald-200/80">
              Soundscape · Binaural Field
            </p>
            <div className="mt-8 space-y-2">
              <h3 className="text-lg font-semibold tracking-tight text-white">
                Layered Mesh Atmosphere
              </h3>
              <p className="max-w-sm text-sm leading-relaxed text-slate-200">
                Overlapping radial anchor fields orbit across one another to produce an organic, fluid mesh gradient.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-white/15 pt-3 text-xs text-slate-300 tabular-nums">
              <span>Evening Rain</span>
              <span>42:00 duration</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default Amb11;
