import React from 'react';

export interface Amb3Props {
  children?: React.ReactNode;
  className?: string;
}

export function Amb3({ children, className = '' }: Amb3Props) {
  return (
    <section
      className={`relative overflow-hidden rounded-xl bg-[#0D0F18] text-slate-100 ${className}`}
    >
      <style>{`
        @keyframes amb3-pan {
          0%, 100% { transform: translate3d(0%, 0%, 0) scale(1.1); }
          33% { transform: translate3d(-14%, -8%, 0) scale(1.15); }
          66% { transform: translate3d(-6%, -16%, 0) scale(1.1); }
        }
        .amb3-surface {
          animation: amb3-pan 20s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .amb3-surface { animation: none; }
        }
      `}</style>

      <div
        aria-hidden="true"
        className="amb3-surface pointer-events-none absolute -inset-12 opacity-90"
        style={{
          backgroundImage:
            'linear-gradient(125deg, #0B1120 0%, #172554 28%, #312E81 52%, #1E293B 76%, #0F172A 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[#090A0F]/30"
      />

      <div className="relative z-10 flex min-h-[240px] flex-col justify-between p-6">
        {children ?? (
          <>
            <p className="text-xs font-medium text-indigo-200/80">
              Release Notes · November Edition
            </p>
            <div className="mt-8 space-y-2">
              <h3 className="text-lg font-semibold tracking-tight text-white">
                Mineral Gradient Canvas
              </h3>
              <p className="max-w-sm text-sm leading-relaxed text-slate-200/90">
                An oversized multi-stop slate and indigo wash pans subtly across the backdrop on compositor layers.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-white/15 pt-3 text-xs text-slate-300">
              <span>5 min read</span>
              <span className="font-medium text-white">View changelog →</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default Amb3;
