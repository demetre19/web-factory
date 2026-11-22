import React, { useId } from 'react';
import type { BgProps } from './GridsAndLines';

/**
 * Bg4 — Noise / Grain Texture Overlay
 * Pure inline SVG fractalNoise filter overlay over a subtle tonal surface (zero external images).
 */
export function Bg4({ children, className = '' }: BgProps) {
  const uid = useId().replace(/:/g, '');
  const filterId = `bg4-noise-${uid}`;

  return (
    <div
      className={`relative w-full overflow-hidden bg-stone-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 ${className}`}
    >
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.26] dark:opacity-[0.22]">
        <filter id={filterId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${filterId})`} />
      </svg>
      <div className="relative z-10 flex min-h-[280px] w-full items-center justify-center px-6 py-12">
        {children ?? (
          <div className="max-w-md text-center">
            <p className="font-mono text-xs tracking-wider text-zinc-600 dark:text-zinc-400">
              Bg4 · Noise / Grain Overlay
            </p>
            <h3 className="mt-2 font-serif text-2xl font-medium tracking-tight">
              Tactile Film & Paper Grain
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              Generated live via SVG feTurbulence and desaturated feColorMatrix with zero raster assets.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Bg8 — Geometric Pattern Bands (Triangles, Hexagons, Diamonds)
 * Precision vector band combining interlocking hexagon, triangle, and diamond geometry.
 */
export function Bg8({ children, className = '' }: BgProps) {
  const uid = useId().replace(/:/g, '');
  const patternId = `bg8-geo-${uid}`;

  return (
    <div
      className={`relative w-full overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 ${className}`}
    >
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full text-zinc-900/[0.11] dark:text-white/[0.13]"
      >
        <defs>
          <pattern id={patternId} width="56" height="56" patternUnits="userSpaceOnUse">
            <polygon points="28,4 50,16 50,40 28,52 6,40 6,16" fill="none" stroke="currentColor" strokeWidth="1" />
            <polygon points="28,14 40,28 28,42 16,28" fill="currentColor" opacity="0.22" />
            <polygon points="0,0 14,0 7,12" fill="none" stroke="currentColor" strokeWidth="0.9" />
            <polygon points="56,0 42,0 49,12" fill="none" stroke="currentColor" strokeWidth="0.9" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
      <div className="relative z-10 flex min-h-[280px] w-full items-center justify-center px-6 pb-20 pt-10">
        {children ?? (
          <div className="max-w-md text-center">
            <p className="font-mono text-xs tracking-wider text-zinc-500 dark:text-zinc-400">
              Bg8 · Geometric Pattern Band
            </p>
            <h3 className="mt-2 font-serif text-2xl font-medium tracking-tight">
              Hexagon & Diamond Frieze
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Repeating SVG tessellation band uniting hexagons, inner diamonds, and corner triangles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Bg18 — Paper / Linen Texture Feel
 * Fine perpendicular warp-and-weft CSS weave paired with an archival surface tone.
 */
export function Bg18({ children, className = '' }: BgProps) {
  return (
    <div
      className={`relative w-full overflow-hidden bg-[#F9F6F0] text-zinc-900 dark:bg-[#121110] dark:text-zinc-100 ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 text-stone-900/[0.045] dark:text-stone-100/[0.045]"
        style={{
          backgroundImage: [
            'repeating-linear-gradient(0deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 5px)',
            'repeating-linear-gradient(90deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 5px)',
          ].join(', '),
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 45%, rgba(120, 113, 108, 0.09) 100%)',
        }}
      />
      <div className="relative z-10 flex min-h-[280px] w-full items-center justify-center px-6 py-12">
        {children ?? (
          <div className="max-w-md text-center">
            <p className="font-mono text-xs tracking-wider text-stone-600 dark:text-stone-400">
              Bg18 · Paper & Linen Texture
            </p>
            <h3 className="mt-2 font-serif text-2xl font-medium tracking-tight">
              Woven Archival Cloth
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-700 dark:text-stone-300">
              Perpendicular 5px warp-and-weft hairlines and a soft perimeter vignette evoke heavy cotton linen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Bg19 — Striped Accent Borders
 * Precision diagonal hatched top and bottom perimeter bands framing clean central prose.
 */
export function Bg19({ children, className = '' }: BgProps) {
  const stripeStyle = {
    backgroundImage:
      'repeating-linear-gradient(-45deg, currentColor 0, currentColor 2px, transparent 2px, transparent 8px)',
  };

  return (
    <div
      className={`relative w-full overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-4 border-b border-zinc-900/10 text-zinc-900/[0.14] dark:border-white/10 dark:text-white/[0.16]"
        style={stripeStyle}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-4 border-t border-zinc-900/10 text-zinc-900/[0.14] dark:border-white/10 dark:text-white/[0.16]"
        style={stripeStyle}
      />
      <div className="relative z-10 flex min-h-[280px] w-full items-center justify-center px-6 py-14">
        {children ?? (
          <div className="max-w-md text-center">
            <p className="font-mono text-xs tracking-wider text-zinc-500 dark:text-zinc-400">
              Bg19 · Striped Accent Borders
            </p>
            <h3 className="mt-2 font-serif text-2xl font-medium tracking-tight">
              Precision Perimeter Rails
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Crisp 16px hatched border bands top and bottom create an unmistakable editorial frame.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Bg20 — Corner Flourish Motifs
 * Architectural SVG corner brackets with delicate radial arcs and diamond finials.
 */
export function Bg20({ children, className = '' }: BgProps) {
  const CornerOrnament = ({ className: posClass }: { className: string }) => (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      className={`pointer-events-none absolute h-12 w-12 text-zinc-900/30 dark:text-white/30 ${posClass}`}
    >
      <path d="M 4 40 V 8 A 4 4 0 0 1 8 4 H 40" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <path d="M 10 28 A 18 18 0 0 1 28 10" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.65" />
      <polygon points="10,6 13,9 10,12 7,9" fill="currentColor" opacity="0.7" />
    </svg>
  );

  return (
    <div
      className={`relative w-full overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 ${className}`}
    >
      <CornerOrnament className="top-4 left-4" />
      <CornerOrnament className="top-4 right-4 rotate-90" />
      <CornerOrnament className="right-4 bottom-4 rotate-180" />
      <CornerOrnament className="bottom-4 left-4 -rotate-90" />
      <div className="relative z-10 flex min-h-[280px] w-full items-center justify-center px-10 py-12">
        {children ?? (
          <div className="max-w-md text-center">
            <p className="font-mono text-xs tracking-wider text-zinc-500 dark:text-zinc-400">
              Bg20 · Corner Flourish Motifs
            </p>
            <h3 className="mt-2 font-serif text-2xl font-medium tracking-tight">
              Mitered Specimen Brackets
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Four rotated SVG corner ornaments anchor an open editorial field with subtle classical poise.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
