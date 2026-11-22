import React from 'react';

export interface Amb2Props {
  children?: React.ReactNode;
  className?: string;
}

const NODES = [
  { cx: 48, cy: 46, r: 2.2, cls: 'amb2-node-a' },
  { cx: 132, cy: 32, r: 1.8, cls: 'amb2-node-b' },
  { cx: 224, cy: 62, r: 2.5, cls: 'amb2-node-c' },
  { cx: 318, cy: 38, r: 1.8, cls: 'amb2-node-a' },
  { cx: 92, cy: 126, r: 2.1, cls: 'amb2-node-c' },
  { cx: 186, cy: 148, r: 2.4, cls: 'amb2-node-b' },
  { cx: 274, cy: 118, r: 1.9, cls: 'amb2-node-a' },
  { cx: 356, cy: 168, r: 2.2, cls: 'amb2-node-b' },
  { cx: 56, cy: 204, r: 1.7, cls: 'amb2-node-b' },
  { cx: 162, cy: 214, r: 2.1, cls: 'amb2-node-a' },
  { cx: 266, cy: 198, r: 2.3, cls: 'amb2-node-c' },
];

const LINKS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [0, 4],
  [1, 5],
  [2, 6],
  [4, 5],
  [5, 6],
  [6, 7],
  [4, 8],
  [5, 9],
  [6, 10],
  [9, 10],
];

export function Amb2({ children, className = '' }: Amb2Props) {
  return (
    <section
      className={`relative overflow-hidden rounded-xl bg-[#0C1017] text-slate-100 ${className}`}
    >
      <style>{`
        @keyframes amb2-drift-a {
          0%, 100% { transform: translate3d(0px, 0px, 0); }
          50% { transform: translate3d(6px, -8px, 0); }
        }
        @keyframes amb2-drift-b {
          0%, 100% { transform: translate3d(0px, 0px, 0); }
          50% { transform: translate3d(-7px, 6px, 0); }
        }
        @keyframes amb2-drift-c {
          0%, 100% { transform: translate3d(0px, 0px, 0); }
          50% { transform: translate3d(5px, 7px, 0); }
        }
        @keyframes amb2-link-pulse {
          0%, 100% { opacity: 0.14; }
          50% { opacity: 0.34; }
        }
        .amb2-node-a { animation: amb2-drift-a 11s ease-in-out infinite; }
        .amb2-node-b { animation: amb2-drift-b 14s ease-in-out infinite; }
        .amb2-node-c { animation: amb2-drift-c 16s ease-in-out infinite; }
        .amb2-line { animation: amb2-link-pulse 9s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .amb2-node-a, .amb2-node-b, .amb2-node-c, .amb2-line { animation: none; }
        }
      `}</style>

      <svg
        aria-hidden="true"
        viewBox="0 0 400 240"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        {LINKS.map(([from, to], idx) => (
          <line
            key={idx}
            x1={NODES[from].cx}
            y1={NODES[from].cy}
            x2={NODES[to].cx}
            y2={NODES[to].cy}
            stroke="#94A3B8"
            strokeWidth="0.75"
            className="amb2-line"
            style={{ animationDelay: `${(idx % 5) * 1.1}s` }}
          />
        ))}
        {NODES.map((node, idx) => (
          <circle
            key={idx}
            cx={node.cx}
            cy={node.cy}
            r={node.r}
            fill="#CBD5E1"
            fillOpacity="0.45"
            className={node.cls}
          />
        ))}
      </svg>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0C1017]/90 via-[#0C1017]/35 to-transparent"
      />

      <div className="relative z-10 flex min-h-[240px] flex-col justify-between p-6">
        {children ?? (
          <>
            <p className="text-xs font-medium text-slate-400">
              Telemetry · Field Array 04
            </p>
            <div className="mt-8 space-y-2">
              <div className="font-mono-code text-2xl font-medium tracking-tight text-white tabular-nums">
                98.4 dB
              </div>
              <h3 className="text-base font-semibold text-slate-100">
                Signal Floor Stability
              </h3>
              <p className="max-w-sm text-sm leading-relaxed text-slate-300">
                Low-opacity vector nodes drift gently without distracting from tabular measurements.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-400 tabular-nums">
              <span>Sample rate 48 kHz</span>
              <span>11 sensors online</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default Amb2;
