import React, { useState } from 'react';

export interface Amb4Props {
  children?: React.ReactNode;
  className?: string;
}

export function Amb4({ children, className = '' }: Amb4Props) {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <section
      className={`relative overflow-hidden rounded-xl bg-[#0B0C11] text-slate-100 ${className}`}
    >
      <style>{`
        @keyframes amb4-breathe {
          0%, 100% { transform: scale(0.94); opacity: 0.32; }
          50% { transform: scale(1.08); opacity: 0.62; }
        }
        @keyframes amb4-halo {
          0%, 100% { transform: scale(1); opacity: 0.25; }
          50% { transform: scale(1.18); opacity: 0.08; }
        }
        @keyframes amb4-cta-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(125, 211, 252, 0.25); }
          50% { transform: scale(1.025); box-shadow: 0 0 28px 2px rgba(125, 211, 252, 0.28); }
        }
        .amb4-glow { animation: amb4-breathe 5.5s ease-in-out infinite; }
        .amb4-ring { animation: amb4-halo 5.5s ease-in-out infinite; }
        .amb4-cta { animation: amb4-cta-pulse 5.5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .amb4-glow, .amb4-ring, .amb4-cta { animation: none; }
        }
      `}</style>

      <div className="relative z-10 flex min-h-[240px] flex-col items-start justify-between p-6">
        {children ?? (
          <>
            <p className="text-xs font-medium text-sky-200/75">
              Hero Call to Action · Focal Halo
            </p>
            <div className="my-5 space-y-2">
              <h3 className="text-lg font-semibold tracking-tight text-white">
                Calm Conversion Focus
              </h3>
              <p className="max-w-sm text-sm leading-relaxed text-slate-300">
                A gentle 5.5-second breathing glow draws attention directly to the primary action without jarring flashes.
              </p>
            </div>
            <div className="relative inline-flex items-center">
              <span
                aria-hidden="true"
                className="amb4-glow pointer-events-none absolute -inset-4 rounded-full blur-xl"
                style={{
                  background: 'radial-gradient(circle, rgba(56,189,248,0.45) 0%, transparent 72%)',
                }}
              />
              <span
                aria-hidden="true"
                className="amb4-ring pointer-events-none absolute -inset-1.5 rounded-lg border border-sky-300/35"
              />
              <button
                type="button"
                onClick={() => setAcknowledged((prev) => !prev)}
                className="amb4-cta relative rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 whitespace-nowrap"
              >
                {acknowledged ? 'Workspace Ready' : 'Start Quiet Trial'}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default Amb4;
