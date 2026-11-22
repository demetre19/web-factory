import React from 'react';

export interface Amb7Props {
  children?: React.ReactNode;
  className?: string;
}

export function Amb7({ children, className = '' }: Amb7Props) {
  return (
    <section
      className={`relative overflow-hidden rounded-xl bg-[#0B0D12] text-slate-100 ${className}`}
    >
      <style>{`
        @keyframes amb7-grid-drift {
          0% { transform: translate3d(0px, 0px, 0); }
          100% { transform: translate3d(-28px, -28px, 0); }
        }
        .amb7-grid {
          animation: amb7-grid-drift 12s linear infinite;
          background-image:
            linear-gradient(to right, rgba(148, 163, 184, 0.14) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.14) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        @media (prefers-reduced-motion: reduce) {
          .amb7-grid { animation: none; }
        }
      `}</style>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          maskImage: 'radial-gradient(ellipse at 70% 35%, black 20%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 70% 35%, black 20%, transparent 78%)',
        }}
      >
        <div className="amb7-grid absolute -inset-7" />
      </div>

      <div className="relative z-10 flex min-h-[240px] flex-col justify-between p-6">
        {children ?? (
          <>
            <p className="text-xs font-medium text-slate-400">
              Coordinate Plane · Datum 01
            </p>
            <div className="mt-8 space-y-2">
              <h3 className="text-lg font-semibold tracking-tight text-white">
                Drifting Reference Grid
              </h3>
              <p className="max-w-sm text-sm leading-relaxed text-slate-300">
                A seamless 28px architectural grid translates diagonally via transform under a soft radial edge mask.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-400 tabular-nums">
              <span>Scale 1:50</span>
              <span>Grid snap 28 px</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default Amb7;
