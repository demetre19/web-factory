import React from 'react';
import type { BgProps } from './GridsAndLines';

/**
 * Bg5 — Concentric Circle Motifs
 * Off-center orbital SVG rings with alternating solid and dashed hairlines.
 */
export function Bg5({ children, className = '' }: BgProps) {
  const radii = [56, 102, 152, 206, 264, 326, 392];
  return (
    <div
      className={`relative w-full overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 800 400"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full text-zinc-900/[0.11] dark:text-white/[0.13]"
      >
        {radii.map((r, idx) => (
          <circle
            key={r}
            cx="600"
            cy="200"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={idx % 2 === 0 ? '1' : '0.85'}
            strokeDasharray={idx % 2 === 1 ? '4 6' : undefined}
            opacity={1 - idx * 0.1}
          />
        ))}
      </svg>
      <div className="relative z-10 flex min-h-[280px] w-full items-center px-8 py-12">
        {children ?? (
          <div className="max-w-sm">
            <p className="font-mono text-xs tracking-wider text-zinc-500 dark:text-zinc-400">
              Bg5 · Concentric Circle Motifs
            </p>
            <h3 className="mt-2 font-serif text-2xl font-medium tracking-tight">
              Orbital Acoustic Rings
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Seven graduated SVG circles radiate from an asymmetric anchor with alternating solid and dashed strokes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Bg6 — Wave / Curve Section Background
 * Layered cubic-bezier SVG waves along the lower horizon with stepped opacities.
 */
export function Bg6({ children, className = '' }: BgProps) {
  return (
    <div
      className={`relative w-full overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 1200 320"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-44 w-full text-sky-700 dark:text-sky-400"
      >
        <path
          d="M0,160 C220,90 420,230 680,150 C920,76 1060,175 1200,130 L1200,320 L0,320 Z"
          fill="currentColor"
          opacity="0.06"
        />
        <path
          d="M0,210 C260,150 480,270 760,195 C980,136 1100,220 1200,185 L1200,320 L0,320 Z"
          fill="currentColor"
          opacity="0.08"
        />
        <path
          d="M0,255 C320,210 560,295 880,235 C1040,205 1130,250 1200,232 L1200,320 L0,320 Z"
          fill="currentColor"
          opacity="0.11"
        />
      </svg>
      <div className="relative z-10 flex min-h-[280px] w-full items-center justify-center px-6 py-12">
        {children ?? (
          <div className="max-w-md text-center">
            <p className="font-mono text-xs tracking-wider text-sky-700 dark:text-sky-400">
              Bg6 · Wave & Curve Backdrop
            </p>
            <h3 className="mt-2 font-serif text-2xl font-medium tracking-tight">
              Stepped Tidal Horizon
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Three translucent bezier contours nest cleanly along the footer plane to anchor section transitions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Bg7 — Blob / Organic Shapes
 * Asymmetric organic SVG silhouettes layered behind editorial typography.
 */
export function Bg7({ children, className = '' }: BgProps) {
  return (
    <div
      className={`relative w-full overflow-hidden bg-[#FAF9F6] text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 800 400"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <path
          d="M118,-18 C178,-5 210,58 192,118 C174,178 106,222 44,205 C-18,188 -62,110 -44,48 C-26,-14 58,-31 118,-18 Z"
          transform="translate(95 65)"
          className="fill-emerald-700/[0.08] dark:fill-emerald-400/[0.11]"
        />
        <path
          d="M142,20 C196,52 214,132 178,186 C142,240 52,268 -6,232 C-64,196 -88,96 -52,42 C-16,-12 88,-12 142,20 Z"
          transform="translate(560 120)"
          className="fill-amber-700/[0.08] dark:fill-amber-300/[0.10]"
        />
        <path
          d="M142,20 C196,52 214,132 178,186 C142,240 52,268 -6,232 C-64,196 -88,96 -52,42 C-16,-12 88,-12 142,20 Z"
          transform="translate(548 112)"
          fill="none"
          strokeWidth="1"
          className="stroke-zinc-900/[0.08] dark:stroke-white/[0.10]"
        />
      </svg>
      <div className="relative z-10 flex min-h-[280px] w-full items-center justify-center px-6 py-12">
        {children ?? (
          <div className="max-w-md text-center">
            <p className="font-mono text-xs tracking-wider text-emerald-800 dark:text-emerald-400">
              Bg7 · Organic Blob Forms
            </p>
            <h3 className="mt-2 font-serif text-2xl font-medium tracking-tight">
              Botanical Silhouette Balance
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Smooth closed cubic curves paired with an offset hairline outline bring warmth without blur haze.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Bg9 — Gradient Orbs / Glows
 * Dual asymmetric radial CSS light pools calibrated for crisp foreground legibility.
 */
export function Bg9({ children, className = '' }: BgProps) {
  return (
    <div
      className={`relative w-full overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-16 h-80 w-80 rounded-full opacity-95 dark:opacity-60"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(14, 165, 233, 0.28) 0%, transparent 68%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -bottom-24 h-80 w-80 rounded-full opacity-95 dark:opacity-60"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(245, 158, 11, 0.26) 0%, transparent 68%)',
        }}
      />
      <div className="relative z-10 flex min-h-[280px] w-full items-center justify-center px-6 py-12">
        {children ?? (
          <div className="max-w-md text-center">
            <p className="font-mono text-xs tracking-wider text-zinc-500 dark:text-zinc-400">
              Bg9 · Gradient Orbs / Glows
            </p>
            <h3 className="mt-2 font-serif text-2xl font-medium tracking-tight">
              Ambient Chromatic Depth
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Opposing cool-sky and warm-amber radial gradients create soft dimensionality with zero blur cost.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Bg12 — Constellation / Dot-and-Line Network
 * Connected geometric graph of coordinate vertices and fine vector edges.
 */
export function Bg12({ children, className = '' }: BgProps) {
  const nodes = [
    { x: 55, y: 65, r: 3 },
    { x: 165, y: 120, r: 2.2 },
    { x: 105, y: 265, r: 3.2 },
    { x: 245, y: 215, r: 2.4 },
    { x: 310, y: 72, r: 2.6 },
    { x: 470, y: 95, r: 3.4 },
    { x: 560, y: 260, r: 2.5 },
    { x: 655, y: 78, r: 2.8 },
    { x: 735, y: 190, r: 3.2 },
    { x: 690, y: 310, r: 2.2 },
  ];
  const edges = [
    [0, 1],
    [1, 2],
    [1, 3],
    [2, 3],
    [1, 4],
    [0, 4],
    [4, 5],
    [3, 6],
    [5, 6],
    [5, 7],
    [7, 8],
    [8, 9],
    [6, 9],
  ];

  return (
    <div
      className={`relative w-full overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 800 360"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full text-zinc-900 dark:text-white"
      >
        {edges.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.14"
          />
        ))}
        {nodes.map((node, i) => (
          <g key={i}>
            <circle cx={node.x} cy={node.y} r={node.r + 4.5} fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.16" />
            <circle cx={node.x} cy={node.y} r={node.r} fill="currentColor" opacity="0.34" />
          </g>
        ))}
      </svg>
      <div className="relative z-10 flex min-h-[280px] w-full items-center justify-center px-6 py-12">
        {children ?? (
          <div className="max-w-md rounded-xl bg-white/70 px-6 py-5 backdrop-blur-[1px] dark:bg-zinc-950/70">
            <p className="font-mono text-xs tracking-wider text-zinc-500 dark:text-zinc-400">
              Bg12 · Constellation Network
            </p>
            <h3 className="mt-2 font-serif text-2xl font-medium tracking-tight">
              Vector Node Topology
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Linked SVG coordinate vertices with halo rings map relational depth across the stage.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Bg13 — Layered Color Bands
 * Stepped diagonal architectural strata at progressive tonal opacities.
 */
export function Bg13({ children, className = '' }: BgProps) {
  return (
    <div
      className={`relative w-full overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-10 top-12 h-24 -rotate-3 bg-zinc-900/[0.03] dark:bg-white/[0.035]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-10 top-28 h-28 -rotate-3 bg-indigo-600/[0.045] dark:bg-indigo-400/[0.06]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-10 bottom-2 h-28 -rotate-3 bg-zinc-900/[0.055] dark:bg-white/[0.065]"
      />
      <div className="relative z-10 flex min-h-[280px] w-full items-center justify-center px-6 py-12">
        {children ?? (
          <div className="max-w-md text-center">
            <p className="font-mono text-xs tracking-wider text-indigo-700 dark:text-indigo-400">
              Bg13 · Layered Color Bands
            </p>
            <h3 className="mt-2 font-serif text-2xl font-medium tracking-tight">
              Stepped Elevation Strata
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Three gently canted translucent planes establish visual rhythm without hard borders.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Bg14 — Radial Sunburst
 * Masked repeating conic rays emanating from an upper-right focal origin.
 */
export function Bg14({ children, className = '' }: BgProps) {
  return (
    <div
      className={`relative w-full overflow-hidden bg-[#FFFDF8] text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 text-amber-800/[0.08] dark:text-amber-300/[0.10]"
        style={{
          backgroundImage:
            'repeating-conic-gradient(from 0deg at 82% 22%, currentColor 0deg 5deg, transparent 5deg 15deg)',
          maskImage: 'radial-gradient(circle at 82% 22%, #000 8%, transparent 74%)',
          WebkitMaskImage: 'radial-gradient(circle at 82% 22%, #000 8%, transparent 74%)',
        }}
      />
      <div className="relative z-10 flex min-h-[280px] w-full items-center px-8 py-12">
        {children ?? (
          <div className="max-w-sm">
            <p className="font-mono text-xs tracking-wider text-amber-800 dark:text-amber-400">
              Bg14 · Radial Sunburst
            </p>
            <h3 className="mt-2 font-serif text-2xl font-medium tracking-tight">
              Conic Horizon Rays
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              CSS repeating-conic-gradient beams softly attenuated with a matching radial fade mask.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Bg17 — Aurora Gradient
 * Multi-stop flowing linear and radial gradient sweep in muted teal, indigo, and sage.
 */
export function Bg17({ children, className = '' }: BgProps) {
  return (
    <div
      className={`relative w-full overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-95 dark:opacity-75"
        style={{
          backgroundImage: [
            'radial-gradient(ellipse 68% 55% at 16% 24%, rgba(20, 184, 166, 0.25), transparent 68%)',
            'radial-gradient(ellipse 64% 58% at 84% 20%, rgba(99, 102, 241, 0.23), transparent 66%)',
            'radial-gradient(ellipse 72% 48% at 52% 86%, rgba(56, 189, 248, 0.21), transparent 70%)',
          ].join(', '),
        }}
      />
      <div className="relative z-10 flex min-h-[280px] w-full items-center justify-center px-6 py-12">
        {children ?? (
          <div className="max-w-md text-center">
            <p className="font-mono text-xs tracking-wider text-teal-800 dark:text-teal-300">
              Bg17 · Aurora Gradient
            </p>
            <h3 className="mt-2 font-serif text-2xl font-medium tracking-tight">
              Atmospheric Ribbon Wash
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              Overlapping teal, indigo, and sky elliptical gradients maintain high text contrast in both modes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
