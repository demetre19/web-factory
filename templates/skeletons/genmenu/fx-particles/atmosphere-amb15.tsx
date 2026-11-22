import React from 'react';

export interface Amb15Props {
  children?: React.ReactNode;
  className?: string;
}

const MOTES = [
  { x: 10, size: 2, dur: '15s', delay: '0s', blur: '0px', op: 0.45 },
  { x: 18, size: 3, dur: '19s', delay: '-4s', blur: '1px', op: 0.3 },
  { x: 27, size: 1.5, dur: '13s', delay: '-7s', blur: '0px', op: 0.5 },
  { x: 36, size: 2.5, dur: '21s', delay: '-2s', blur: '0.5px', op: 0.35 },
  { x: 45, size: 2, dur: '16s', delay: '-9s', blur: '0px', op: 0.45 },
  { x: 54, size: 3.5, dur: '23s', delay: '-5s', blur: '1.5px', op: 0.25 },
  { x: 63, size: 1.8, dur: '14s', delay: '-11s', blur: '0px', op: 0.5 },
  { x: 72, size: 2.5, dur: '18s', delay: '-3s', blur: '0.5px', op: 0.38 },
  { x: 80, size: 2, dur: '17s', delay: '-8s', blur: '0px', op: 0.42 },
  { x: 88, size: 3, dur: '20s', delay: '-6s', blur: '1px', op: 0.32 },
  { x: 93, size: 1.6, dur: '15s', delay: '-12s', blur: '0px', op: 0.46 },
];

export function Amb15({ children, className = '' }: Amb15Props) {
  return (
    <section
      className={`relative overflow-hidden rounded-xl bg-[#100F0E] text-stone-100 ${className}`}
    >
      <style>{`
        @keyframes amb15-rise {
          0% {
            transform: translate3d(0px, 250px, 0) scale(0.85);
            opacity: 0;
          }
          18% {
            opacity: var(--mote-op, 0.4);
          }
          50% {
            transform: translate3d(14px, 110px, 0) scale(1);
          }
          82% {
            opacity: var(--mote-op, 0.4);
          }
          100% {
            transform: translate3d(-10px, -24px, 0) scale(0.9);
            opacity: 0;
          }
        }
        .amb15-mote {
          animation: amb15-rise linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .amb15-mote { animation: none; opacity: 0.25; transform: translate3d(0, 80px, 0); }
        }
      `}</style>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 100%, rgba(214,180,120,0.12) 0%, transparent 65%)',
        }}
      />

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {MOTES.map((m, idx) => (
          <span
            key={idx}
            className="amb15-mote absolute top-0 rounded-full bg-amber-100"
            style={
              {
                left: `${m.x}%`,
                width: `${m.size}px`,
                height: `${m.size}px`,
                filter: `blur(${m.blur})`,
                animationDuration: m.dur,
                animationDelay: m.delay,
                '--mote-op': m.op,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="relative z-10 flex min-h-[240px] flex-col justify-between p-6">
        {children ?? (
          <>
            <p className="text-xs font-medium text-amber-100/70">
              Rare Book Room · Folio IV
            </p>
            <div className="mt-8 space-y-2">
              <h3 className="text-lg font-semibold tracking-tight text-stone-50">
                Suspended Sunlight Motes
              </h3>
              <p className="max-w-sm text-sm leading-relaxed text-stone-300">
                Warm micro-particles ascend gently with subtle sinusoidal sway and shallow depth-of-field blur.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-stone-400 tabular-nums">
              <span>Edition 1928</span>
              <span>Rag cotton paper</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default Amb15;
