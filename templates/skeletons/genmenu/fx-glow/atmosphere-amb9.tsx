import React from 'react';

export interface Amb9Props {
  children?: React.ReactNode;
  className?: string;
}

export function Amb9({ children, className = '' }: Amb9Props) {
  return (
    <section
      className={`relative overflow-hidden rounded-xl bg-[#111012] text-stone-100 ${className}`}
    >
      <style>{`
        @keyframes amb9-grain {
          0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.16; }
          25% { transform: translate3d(-2%, 1%, 0); opacity: 0.21; }
          50% { transform: translate3d(1%, -2%, 0); opacity: 0.15; }
          75% { transform: translate3d(-1%, -1%, 0); opacity: 0.2; }
        }
        @keyframes amb9-vignette {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 0.78; }
        }
        .amb9-noise { animation: amb9-grain 1.8s steps(4) infinite; }
        .amb9-glow { animation: amb9-vignette 9s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .amb9-noise, .amb9-glow { animation: none; }
        }
      `}</style>

      <div
        aria-hidden="true"
        className="amb9-glow pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 75% 25%, rgba(214,211,209,0.12) 0%, rgba(28,25,23,0.4) 55%, rgba(12,10,9,0.9) 100%)',
        }}
      />

      <svg
        aria-hidden="true"
        className="amb9-noise pointer-events-none absolute -inset-4 h-[112%] w-[112%]"
      >
        <filter id="amb9-turbulence">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.82"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#amb9-turbulence)" />
      </svg>

      <div className="relative z-10 flex min-h-[240px] flex-col justify-between p-6">
        {children ?? (
          <>
            <p className="text-xs font-medium text-stone-400">
              Screening Room · Print Archive
            </p>
            <div className="mt-8 space-y-2">
              <h3 className="text-lg font-semibold tracking-tight text-stone-50">
                Subtle Film Grain Shimmer
              </h3>
              <p className="max-w-sm text-sm leading-relaxed text-stone-300">
                Procedural SVG turbulence gently shifts in four discrete frames to give digital dark surfaces tactile warmth.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-stone-400">
              <span>35mm Restoration</span>
              <span>Hall B · 19:30</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default Amb9;
