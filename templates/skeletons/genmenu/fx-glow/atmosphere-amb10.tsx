import React from 'react';

export interface Amb10Props {
  children?: React.ReactNode;
  className?: string;
}

export function Amb10({ children, className = '' }: Amb10Props) {
  return (
    <section
      className={`relative overflow-hidden rounded-xl bg-[#090B10] p-4 text-slate-100 ${className}`}
    >
      <style>{`
        @keyframes amb10-orb-left {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.45; }
          50% { transform: translate3d(14px, 8px, 0) scale(1.12); opacity: 0.65; }
        }
        @keyframes amb10-orb-right {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1.08); opacity: 0.38; }
          50% { transform: translate3d(-14px, -10px, 0) scale(0.95); opacity: 0.58; }
        }
        .amb10-l { animation: amb10-orb-left 14s ease-in-out infinite; }
        .amb10-r { animation: amb10-orb-right 17s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .amb10-l, .amb10-r { animation: none; }
        }
      `}</style>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="amb10-l absolute top-6 left-8 h-40 w-40 rounded-full blur-2xl"
          style={{
            background: 'radial-gradient(circle, rgba(245,158,11,0.38) 0%, transparent 72%)',
          }}
        />
        <div
          className="amb10-r absolute right-8 bottom-6 h-44 w-44 rounded-full blur-2xl"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.42) 0%, transparent 72%)',
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-[208px] flex-col justify-between rounded-lg border border-white/10 bg-[#12151E]/85 p-5 backdrop-blur-md">
        {children ?? (
          <>
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-base font-semibold text-white">Resident Access</h3>
              <span className="font-mono-code text-sm font-medium text-amber-200 tabular-nums">
                $48 / mo
              </span>
            </div>
            <p className="my-4 text-sm leading-relaxed text-slate-300">
              Backlit dual orbs sit behind the elevated card plane, softening card edges without washing out text.
            </p>
            <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-400">
              <span>24-hour workshop key</span>
              <span className="font-medium text-slate-200">Select tier</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default Amb10;
