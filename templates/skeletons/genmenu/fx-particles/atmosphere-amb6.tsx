import React from 'react';

export interface Amb6Props {
  children?: React.ReactNode;
  className?: string;
}

const STARS = [
  { x: 12, y: 18, s: 1.5, cls: 'amb6-t1', delay: '0s' },
  { x: 24, y: 64, s: 1.2, cls: 'amb6-t2', delay: '1.1s' },
  { x: 35, y: 28, s: 2, cls: 'amb6-t3', delay: '0.4s' },
  { x: 48, y: 14, s: 1.4, cls: 'amb6-t1', delay: '2.2s' },
  { x: 58, y: 74, s: 1.6, cls: 'amb6-t2', delay: '0.7s' },
  { x: 67, y: 36, s: 2.2, cls: 'amb6-t3', delay: '1.8s' },
  { x: 78, y: 20, s: 1.3, cls: 'amb6-t1', delay: '2.9s' },
  { x: 88, y: 52, s: 1.8, cls: 'amb6-t2', delay: '1.3s' },
  { x: 93, y: 16, s: 1.5, cls: 'amb6-t3', delay: '0.2s' },
  { x: 16, y: 84, s: 1.4, cls: 'amb6-t2', delay: '2.5s' },
  { x: 42, y: 46, s: 1.2, cls: 'amb6-t1', delay: '1.6s' },
  { x: 74, y: 82, s: 2, cls: 'amb6-t3', delay: '0.9s' },
  { x: 84, y: 70, s: 1.2, cls: 'amb6-t1', delay: '2.1s' },
  { x: 29, y: 90, s: 1.6, cls: 'amb6-t2', delay: '1.5s' },
  { x: 63, y: 12, s: 1.3, cls: 'amb6-t3', delay: '2.7s' },
  { x: 52, y: 58, s: 1.1, cls: 'amb6-t1', delay: '0.6s' },
  { x: 9, y: 44, s: 1.8, cls: 'amb6-t3', delay: '1.9s' },
  { x: 91, y: 88, s: 1.5, cls: 'amb6-t2', delay: '0.3s' },
];

export function Amb6({ children, className = '' }: Amb6Props) {
  return (
    <section
      className={`relative overflow-hidden rounded-xl bg-[#070910] text-slate-100 ${className}`}
    >
      <style>{`
        @keyframes amb6-twinkle-1 {
          0%, 100% { opacity: 0.22; transform: scale(0.85); }
          50% { opacity: 0.9; transform: scale(1.2); }
        }
        @keyframes amb6-twinkle-2 {
          0%, 100% { opacity: 0.15; transform: scale(0.9); }
          50% { opacity: 0.75; transform: scale(1.15); }
        }
        @keyframes amb6-twinkle-3 {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.95; transform: scale(1.25); }
        }
        @keyframes amb6-sky-drift {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(-8px, -5px, 0); }
        }
        .amb6-t1 { animation: amb6-twinkle-1 4.2s ease-in-out infinite; }
        .amb6-t2 { animation: amb6-twinkle-2 5.8s ease-in-out infinite; }
        .amb6-t3 { animation: amb6-twinkle-3 6.6s ease-in-out infinite; }
        .amb6-layer { animation: amb6-sky-drift 36s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .amb6-t1, .amb6-t2, .amb6-t3, .amb6-layer { animation: none; }
        }
      `}</style>

      <div aria-hidden="true" className="amb6-layer pointer-events-none absolute -inset-3">
        {STARS.map((star, idx) => (
          <span
            key={idx}
            className={`${star.cls} absolute rounded-full bg-slate-100`}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.s}px`,
              height: `${star.s}px`,
              animationDelay: star.delay,
              boxShadow: star.s >= 2 ? '0 0 6px rgba(226,232,240,0.45)' : 'none',
            }}
          />
        ))}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#070910]/20 to-[#070910]/80"
      />

      <div className="relative z-10 flex min-h-[240px] flex-col justify-between p-6">
        {children ?? (
          <>
            <p className="text-xs font-medium text-slate-400">
              Observatory · Ephemeris Log
            </p>
            <div className="mt-8 space-y-2">
              <h3 className="text-lg font-semibold tracking-tight text-white">
                Zenith Seeing Window
              </h3>
              <p className="max-w-sm text-sm leading-relaxed text-slate-300">
                Staggered starlight points shimmer across two depth planes while keeping night-mode typography clear.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-400 tabular-nums">
              <span>23:40 UTC</span>
              <span>Bortle Class 2</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default Amb6;
