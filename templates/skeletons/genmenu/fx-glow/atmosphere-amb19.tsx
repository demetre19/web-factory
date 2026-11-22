import React from 'react';

export interface Amb19Props {
  children?: React.ReactNode;
  className?: string;
}

export function Amb19({ children, className = '' }: Amb19Props) {
  return (
    <section
      className={`relative overflow-hidden rounded-xl bg-[#08090E] text-slate-100 ${className}`}
    >
      <style>{`
        @keyframes amb19-corona {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.45; }
          50% { transform: scale(1.04) rotate(8deg); opacity: 0.72; }
        }
        .amb19-rim {
          animation: amb19-corona 14s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .amb19-rim { animation: none; }
        }
      `}</style>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="amb19-rim absolute -right-16 -bottom-32 h-72 w-72 rounded-full blur-xl"
          style={{
            background:
              'radial-gradient(circle at 30% 25%, rgba(251,191,36,0.48) 0%, rgba(148,163,184,0.22) 38%, transparent 66%)',
          }}
        />
        <div className="absolute -right-12 -bottom-36 h-72 w-72 rounded-full bg-[#08090E]" />
      </div>

      <div className="relative z-10 flex min-h-[240px] flex-col justify-between p-6">
        {children ?? (
          <>
            <p className="text-xs font-medium text-amber-200/75">
              Orbital Telemetry · Terminator Pass
            </p>
            <div className="mt-8 space-y-2">
              <h3 className="text-lg font-semibold tracking-tight text-white">
                Eclipse Rim Halo
              </h3>
              <p className="max-w-sm text-sm leading-relaxed text-slate-300">
                An occluded planetary sphere crops a soft amber corona into a slow-breathing horizon crescent.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-400 tabular-nums">
              <span>Transit 04:12 UTC</span>
              <span>Inclination 51.6°</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default Amb19;
