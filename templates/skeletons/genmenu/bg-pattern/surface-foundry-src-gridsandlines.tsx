import React, { useId } from 'react';

export interface BgProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * Bg1 — Subtle Dot Grid
 * Fine radial-gradient dot matrix using currentColor opacity for crisp light & dark rendering.
 */
export function Bg1({ children, className = '' }: BgProps) {
  return (
    <div
      className={`relative w-full overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 text-zinc-900/[0.16] dark:text-white/[0.16]"
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1.15px, transparent 1.15px)',
          backgroundSize: '20px 20px',
        }}
      />
      <div className="relative z-10 flex min-h-[280px] w-full items-center justify-center px-6 py-12">
        {children ?? (
          <div className="max-w-md text-center">
            <p className="font-mono text-xs tracking-wider text-zinc-500 dark:text-zinc-400">
              Bg1 · Subtle Dot Grid
            </p>
            <h3 className="mt-2 font-serif text-2xl font-medium tracking-tight">
              Measured Spatial Rhythm
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              A 20px radial dot matrix calibrated with 16% ink opacity so editorial copy stays effortless to scan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Bg2 — Diagonal Line Patterns
 * 45-degree repeating hairline rules at low opacity.
 */
export function Bg2({ children, className = '' }: BgProps) {
  return (
    <div
      className={`relative w-full overflow-hidden bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 text-zinc-900/[0.07] dark:text-white/[0.08]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-45deg, currentColor 0, currentColor 1px, transparent 1px, transparent 14px)',
        }}
      />
      <div className="relative z-10 flex min-h-[280px] w-full items-center justify-center px-6 py-12">
        {children ?? (
          <div className="max-w-md rounded-xl bg-white/85 px-6 py-5 backdrop-blur-[2px] dark:bg-zinc-900/80">
            <p className="font-mono text-xs tracking-wider text-zinc-500 dark:text-zinc-400">
              Bg2 · Diagonal Line Pattern
            </p>
            <h3 className="mt-2 font-serif text-2xl font-medium tracking-tight">
              Architectural Hatching
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Crisp 45-degree CSS linear stripes spaced every 14px for understated directional structure.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Bg3 — Grid + Gradient Hero Background
 * Square coordinate lines paired with a soft radial top wash and bottom edge vignette.
 */
export function Bg3({ children, className = '' }: BgProps) {
  return (
    <div
      className={`relative w-full overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 text-zinc-900/[0.06] dark:text-white/[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-90 dark:opacity-100"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 75% 60% at 50% 0%, rgba(37, 99, 235, 0.14), transparent 72%)',
        }}
      />
      <div className="relative z-10 flex min-h-[280px] w-full items-center justify-center px-6 py-12">
        {children ?? (
          <div className="max-w-md text-center">
            <p className="font-mono text-xs tracking-wider text-blue-700 dark:text-blue-400">
              Bg3 · Grid + Gradient Hero
            </p>
            <h3 className="mt-2 font-serif text-2xl font-medium tracking-tight">
              Illuminated Coordinate Plane
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Combines a 40px structural grid with a soft overhead cobalt ambient wash for product hero headers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Bg10 — Checkerboard Subtle
 * Micro-contrast conic checkerboard tiles using 4% ink opacity.
 */
export function Bg10({ children, className = '' }: BgProps) {
  return (
    <div
      className={`relative w-full overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 text-zinc-900/[0.04] dark:text-white/[0.05]"
        style={{
          backgroundImage:
            'conic-gradient(currentColor 90deg, transparent 90deg 180deg, currentColor 180deg 270deg, transparent 270deg)',
          backgroundSize: '44px 44px',
        }}
      />
      <div className="relative z-10 flex min-h-[280px] w-full items-center justify-center px-6 py-12">
        {children ?? (
          <div className="max-w-md text-center">
            <p className="font-mono text-xs tracking-wider text-zinc-500 dark:text-zinc-400">
              Bg10 · Subtle Checkerboard
            </p>
            <h3 className="mt-2 font-serif text-2xl font-medium tracking-tight">
              Low-Contrast Tiled Field
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Single-pass conic-gradient 22px tiles tuned to a whisper-quiet 4% luminance step.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Bg11 — Dashed-Grid Blueprint Feel
 * Engineering drafting sheet with major solid rules, minor dashed subdivisions, and corner crosshairs.
 */
export function Bg11({ children, className = '' }: BgProps) {
  const uid = useId().replace(/:/g, '');
  const patternId = `bg11-blueprint-${uid}`;

  return (
    <div
      className={`relative w-full overflow-hidden bg-slate-50 text-zinc-900 dark:bg-[#07101E] dark:text-zinc-100 ${className}`}
    >
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full text-blue-700/[0.15] dark:text-sky-400/[0.18]"
      >
        <defs>
          <pattern id={patternId} width="64" height="64" patternUnits="userSpaceOnUse">
            <path
              d="M 16 0 V 64 M 32 0 V 64 M 48 0 V 64 M 0 16 H 64 M 0 32 H 64 M 0 48 H 64"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
              strokeDasharray="2 3"
              opacity="0.55"
            />
            <path d="M 64 0 H 0 V 64" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M -3 0 H 3 M 0 -3 V 3" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.9" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
      <div className="relative z-10 flex min-h-[280px] w-full items-center justify-center px-6 py-12">
        {children ?? (
          <div className="max-w-md rounded-lg bg-white/80 px-6 py-5 backdrop-blur-[2px] dark:bg-slate-950/75">
            <p className="font-mono text-xs tracking-wider text-blue-700 dark:text-sky-400">
              Bg11 · Dashed Blueprint Grid
            </p>
            <h3 className="mt-2 font-serif text-2xl font-medium tracking-tight">
              Drafting Sheet Precision
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              Major 64px axes paired with 16px dashed SVG subdivisions and registration ticks.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Bg15 — Crosshatch Texture
 * Dual-angle copperplate-inspired SVG engraving mesh.
 */
export function Bg15({ children, className = '' }: BgProps) {
  const uid = useId().replace(/:/g, '');
  const patternId = `bg15-crosshatch-${uid}`;

  return (
    <div
      className={`relative w-full overflow-hidden bg-stone-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 ${className}`}
    >
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full text-zinc-900/[0.08] dark:text-white/[0.09]"
      >
        <defs>
          <pattern id={patternId} width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M 0 12 L 12 0 M -3 3 L 3 -3 M 9 15 L 15 9" stroke="currentColor" strokeWidth="0.8" />
            <path d="M 0 0 L 12 12 M -3 9 L 3 15 M 9 -3 L 15 3" stroke="currentColor" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
      <div className="relative z-10 flex min-h-[280px] w-full items-center justify-center px-6 py-12">
        {children ?? (
          <div className="max-w-md rounded-xl bg-stone-50/90 px-6 py-5 dark:bg-zinc-950/85">
            <p className="font-mono text-xs tracking-wider text-zinc-500 dark:text-zinc-400">
              Bg15 · Crosshatch Texture
            </p>
            <h3 className="mt-2 font-serif text-2xl font-medium tracking-tight">
              Engraved Mesh Surface
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Bilateral 12px vector hatching evokes fine intaglio printmaking without raster files.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Bg16 — Masked Gradient Edges
 * Square grid framed by a radial CSS mask so lines feather smoothly into the surrounding canvas.
 */
export function Bg16({ children, className = '' }: BgProps) {
  const maskStyle: React.CSSProperties = {
    maskImage: 'radial-gradient(ellipse 72% 68% at 50% 50%, #000 28%, transparent 100%)',
    WebkitMaskImage: 'radial-gradient(ellipse 72% 68% at 50% 50%, #000 28%, transparent 100%)',
  };

  return (
    <div
      className={`relative w-full overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 text-zinc-900/[0.11] dark:text-white/[0.13]"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '26px 26px',
          ...maskStyle,
        }}
      />
      <div className="relative z-10 flex min-h-[280px] w-full items-center justify-center px-6 py-12">
        {children ?? (
          <div className="max-w-md text-center">
            <p className="font-mono text-xs tracking-wider text-zinc-500 dark:text-zinc-400">
              Bg16 · Masked Gradient Edges
            </p>
            <h3 className="mt-2 font-serif text-2xl font-medium tracking-tight">
              Feathered Horizon Field
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              CSS radial mask-image dissolves crisp 26px grid lines softly into pure canvas around the edges.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
