import React from 'react';

export interface Amb18Props {
  children?: React.ReactNode;
  className?: string;
}

export function Amb18({ children, className = '' }: Amb18Props) {
  return (
    <section
      className={`relative overflow-hidden rounded-xl bg-[#0B0C0F] text-stone-100 ${className}`}
    >
      <style>{`
        @keyframes amb18-sweep {
          0%, 100% { transform: translate3d(-45%, -10%, 0) rotate(24deg); opacity: 0.25; }
          50% { transform: translate3d(45%, 8%, 0) rotate(24deg); opacity: 0.42; }
        }
        .amb18-beam {
          animation: amb18-sweep 18s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .amb18-beam { animation: none; transform: translate3d(0%, 0%, 0) rotate(24deg); opacity: 0.25; }
        }
      `}</style>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="amb18-beam absolute -top-24 left-1/4 h-[380px] w-40 blur-2xl"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(245,245,244,0.22) 50%, transparent 100%)',
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-[240px] flex-col justify-between p-6">
        {children ?? (
          <>
            <p className="text-xs font-medium text-stone-400">
              Gallery Three · Exhibition Note
            </p>
            <div className="mt-8 space-y-2">
              <h3 className="text-lg font-semibold tracking-tight text-stone-50">
                Diagonal Spotlight Sweep
              </h3>
              <p className="max-w-sm text-sm leading-relaxed text-stone-300">
                A feathered volumetric beam traverses quietly across dark limestone slate like afternoon clerestory light.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-stone-400">
              <span>Light &amp; Shadow Studies</span>
              <span>May – September</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default Amb18;
