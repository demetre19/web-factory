import React from 'react';

export interface Amb16Props {
  children?: React.ReactNode;
  className?: string;
}

export function Amb16({ children, className = '' }: Amb16Props) {
  return (
    <section
      className={`relative overflow-hidden rounded-xl bg-[#0A0C10] text-slate-100 ${className}`}
    >
      <style>{`
        @keyframes amb16-luminance {
          0%, 100% {
            transform: scale(0.9);
            opacity: 0.18;
          }
          45% {
            transform: scale(1.16);
            opacity: 0.42;
          }
        }
        .amb16-lumen {
          animation: amb16-luminance 8s cubic-bezier(0.42, 0, 0.58, 1) infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .amb16-lumen { animation: none; opacity: 0.25; }
        }
      `}</style>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="amb16-lumen absolute -inset-8"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(226,232,240,0.22) 0%, rgba(148,163,184,0.08) 42%, transparent 72%)',
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-[240px] flex-col justify-between p-6">
        {children ?? (
          <>
            <p className="text-xs font-medium text-slate-400">
              Focus Timer · Respiratory Pacing
            </p>
            <div className="mt-8 space-y-2">
              <div className="font-mono-code text-2xl font-medium tracking-tight text-white tabular-nums">
                25:00
              </div>
              <h3 className="text-base font-semibold text-slate-100">
                Breathing Background Luminance
              </h3>
              <p className="max-w-sm text-sm leading-relaxed text-slate-300">
                An 8-second radial luminance cycle gently expands and recedes to pace calm reading or focus sessions.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-400 tabular-nums">
              <span>4s inhale · 4s exhale</span>
              <span>Silence active</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default Amb16;
