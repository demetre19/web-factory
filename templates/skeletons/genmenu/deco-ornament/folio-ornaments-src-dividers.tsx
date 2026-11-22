import React, { useId } from 'react';

export interface OrnDividerProps {
  className?: string;
}

/**
 * Orn1 — Angled Section Divider
 * Oblique full-width SVG polygon wedge transitioning between two contrasting editorial bands.
 */
export function Orn1({
  className = '',
  flip = false,
}: OrnDividerProps & { flip?: boolean }) {
  return (
    <section
      aria-label="Angled section transition"
      className={`overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 ${className}`}
    >
      <div className="bg-zinc-100 dark:bg-zinc-900 px-6 pt-6 pb-8">
        <p className="text-xs font-medium tracking-wider text-blue-700 dark:text-blue-400">
          Exhibition Note · 01
        </p>
        <h3 className="mt-1 font-serif text-xl font-semibold text-zinc-950 dark:text-zinc-50">
          Oblique Plane Transitions
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Diagonal seams guide the eye downward from introductory context into the archival register below.
        </p>
      </div>

      <div role="separator" aria-hidden="true" className="relative -mt-px bg-zinc-100 dark:bg-zinc-900">
        <svg
          viewBox="0 0 800 48"
          preserveAspectRatio="none"
          className={`block h-10 w-full ${flip ? '-scale-x-100' : ''}`}
        >
          <polygon
            points="0,48 800,6 800,48"
            className="fill-white dark:fill-zinc-950"
          />
          <line
            x1="0"
            y1="48"
            x2="800"
            y2="6"
            vectorEffect="non-scaling-stroke"
            strokeWidth="1.5"
            className="stroke-blue-700/60 dark:stroke-blue-400/60"
          />
        </svg>
      </div>

      <div className="bg-white dark:bg-zinc-950 px-6 pt-3 pb-6">
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          Gallery Wing B opens at 10:00 with full daylight illumination across the limestone courtyard.
        </p>
      </div>
    </section>
  );
}

/**
 * Orn2 — Wave & Curved Section Divider
 * Layered SVG separator combining a parabolic curved arch and a sinusoidal wave crest.
 */
export function Orn2({
  className = '',
  variant = 'layered',
}: OrnDividerProps & { variant?: 'layered' | 'wave' | 'curved' }) {
  return (
    <section
      aria-label="Wave and curved section transition"
      className={`overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 ${className}`}
    >
      <div className="bg-zinc-100 dark:bg-zinc-900 px-6 pt-6 pb-6">
        <p className="text-xs font-medium tracking-wider text-blue-700 dark:text-blue-400">
          Hydrology Folio · 02
        </p>
        <h3 className="mt-1 font-serif text-xl font-semibold text-zinc-950 dark:text-zinc-50">
          Harmonic Wave &amp; Curved Seam
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Soft sinusoidal harmonics overlay a broad cubic arch to soften vertical band shifts.
        </p>
      </div>

      <div role="separator" aria-hidden="true" className="bg-zinc-100 dark:bg-zinc-900">
        <svg
          viewBox="0 0 800 56"
          preserveAspectRatio="none"
          className="block h-12 w-full"
        >
          {(variant === 'layered' || variant === 'wave') && (
            <path
              d="M0,26 C133,4 266,46 400,26 C534,6 667,46 800,24 L800,56 L0,56 Z"
              className="fill-blue-700/15 dark:fill-blue-400/20"
            />
          )}
          {(variant === 'layered' || variant === 'curved') && (
            <>
              <path
                d="M0,48 Q400,6 800,48 L800,56 L0,56 Z"
                className="fill-white dark:fill-zinc-950"
              />
              <path
                d="M0,48 Q400,6 800,48"
                fill="none"
                vectorEffect="non-scaling-stroke"
                strokeWidth="1.25"
                className="stroke-zinc-300 dark:stroke-zinc-700"
              />
            </>
          )}
          {variant === 'wave' && (
            <path
              d="M0,34 C133,12 266,54 400,34 C534,14 667,54 800,32 L800,56 L0,56 Z"
              className="fill-white dark:fill-zinc-950"
            />
          )}
        </svg>
      </div>

      <div className="bg-white dark:bg-zinc-950 px-6 pt-2 pb-6">
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          Tidal charts recorded between spring equinox and midsummer remain on permanent loan.
        </p>
      </div>
    </section>
  );
}

/**
 * Orn3 — Zigzag Section Divider
 * Precision geometric sawtooth SVG seam between stacked content surfaces.
 */
export function Orn3({ className = '' }: OrnDividerProps) {
  const teethCount = 24;
  const width = 720;
  const step = width / teethCount;

  const pointsList: string[] = [];
  for (let i = 0; i <= teethCount; i += 1) {
    const x = i * step;
    const y = i % 2 === 0 ? 28 : 8;
    pointsList.push(`${x},${y}`);
  }
  const polylinePoints = pointsList.join(' ');
  const polygonPoints = `${polylinePoints} ${width},32 0,32`;

  return (
    <section
      aria-label="Zigzag section transition"
      className={`overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 ${className}`}
    >
      <div className="bg-zinc-100 dark:bg-zinc-900 px-6 pt-6 pb-5">
        <p className="text-xs font-medium tracking-wider text-blue-700 dark:text-blue-400">
          Print Bindery · 03
        </p>
        <h3 className="mt-1 font-serif text-xl font-semibold text-zinc-950 dark:text-zinc-50">
          Sawtooth Pinking Partition
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Repeating triangular teeth create a tactile paper-cut separation between editorial blocks.
        </p>
      </div>

      <div role="separator" aria-hidden="true" className="bg-zinc-100 dark:bg-zinc-900">
        <svg
          viewBox={`0 0 ${width} 32`}
          preserveAspectRatio="none"
          className="block h-7 w-full"
        >
          <polygon points={polygonPoints} className="fill-white dark:fill-zinc-950" />
          <polyline
            points={polylinePoints}
            fill="none"
            vectorEffect="non-scaling-stroke"
            strokeWidth="1.25"
            className="stroke-zinc-300 dark:stroke-zinc-700"
          />
        </svg>
      </div>

      <div className="bg-white dark:bg-zinc-950 px-6 pt-3 pb-6">
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          Deckled signatures are collated in batches of sixteen before linen thread sewing begins.
        </p>
      </div>
    </section>
  );
}

/**
 * Orn4 — Dotted-Line & Gradient-Fade Divider
 * Horizontal SVG dotted rule masked with a symmetrical linear gradient fade.
 */
export function Orn4({ className = '' }: OrnDividerProps) {
  const uid = useId().replace(/:/g, '');
  const gradId = `orn4-grad-${uid}`;
  const maskId = `orn4-mask-${uid}`;

  return (
    <section
      aria-label="Dotted gradient-fade section divider"
      className={`rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 ${className}`}
    >
      <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        Early specimen sheets relied on measured pauses rather than heavy borders to mark thematic shifts across broadsheet columns.
      </p>

      <div role="separator" aria-orientation="horizontal" className="my-5 flex items-center justify-center">
        <svg viewBox="0 0 600 24" className="h-6 w-full" aria-hidden="true">
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="22%" stopColor="white" stopOpacity="1" />
              <stop offset="78%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <mask id={maskId}>
              <rect x="0" y="0" width="600" height="24" fill={`url(#${gradId})`} />
            </mask>
          </defs>

          <g mask={`url(#${maskId})`}>
            <line
              x1="16"
              y1="12"
              x2="282"
              y2="12"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="1 10"
              className="stroke-zinc-400 dark:stroke-zinc-600"
            />
            <line
              x1="318"
              y1="12"
              x2="584"
              y2="12"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="1 10"
              className="stroke-zinc-400 dark:stroke-zinc-600"
            />
          </g>

          <polygon
            points="300,6 306,12 300,18 294,12"
            className="fill-blue-700 dark:fill-blue-400"
          />
          <circle cx="288" cy="12" r="1.75" className="fill-zinc-500 dark:fill-zinc-400" />
          <circle cx="312" cy="12" r="1.75" className="fill-zinc-500 dark:fill-zinc-400" />
        </svg>
      </div>

      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        As the eye passes the center diamond, density tapers gracefully toward the outer margins without harsh termination.
      </p>
    </section>
  );
}

/**
 * Orn5 — Double-Rule Icon-Centered Divider
 * Twin parallel SVG hairlines broken cleanly by a centered geometric compass emblem.
 */
export function Orn5({ className = '' }: OrnDividerProps) {
  return (
    <section
      aria-label="Double-rule icon-centered divider"
      className={`rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 ${className}`}
    >
      <header>
        <p className="text-xs font-medium tracking-wider text-blue-700 dark:text-blue-400">
          Cartographic Index · 05
        </p>
        <h3 className="mt-1 font-serif text-lg font-semibold text-zinc-950 dark:text-zinc-50">
          Meridian Double-Rule Break
        </h3>
      </header>

      <div role="separator" aria-orientation="horizontal" className="my-5">
        <svg viewBox="0 0 600 36" className="h-9 w-full" aria-hidden="true">
          <line
            x1="0"
            y1="15.5"
            x2="270"
            y2="15.5"
            strokeWidth="1.25"
            className="stroke-zinc-300 dark:stroke-zinc-700"
          />
          <line
            x1="0"
            y1="20.5"
            x2="270"
            y2="20.5"
            strokeWidth="0.75"
            className="stroke-zinc-400/70 dark:stroke-zinc-600"
          />

          <line
            x1="330"
            y1="15.5"
            x2="600"
            y2="15.5"
            strokeWidth="1.25"
            className="stroke-zinc-300 dark:stroke-zinc-700"
          />
          <line
            x1="330"
            y1="20.5"
            x2="600"
            y2="20.5"
            strokeWidth="0.75"
            className="stroke-zinc-400/70 dark:stroke-zinc-600"
          />

          <circle
            cx="300"
            cy="18"
            r="13"
            fill="none"
            strokeWidth="1.25"
            className="stroke-blue-700 dark:stroke-blue-400"
          />
          <path
            d="M300 7 L303.2 14.8 L311 18 L303.2 21.2 L300 29 L296.8 21.2 L289 18 L296.8 14.8 Z"
            className="fill-blue-700 dark:fill-blue-400"
          />
          <circle cx="300" cy="18" r="2.2" className="fill-white dark:fill-zinc-950" />
        </svg>
      </div>

      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Twin baseline rules establish architectural order while the central compass star anchors symmetry.
      </p>
    </section>
  );
}

/**
 * Orn6 — Ornamental Flourish Divider
 * Symmetrical botanical scroll and fleuron SVG flourish between literary excerpts.
 */
export function Orn6({ className = '' }: OrnDividerProps) {
  return (
    <section
      aria-label="Ornamental flourish divider"
      className={`rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 ${className}`}
    >
      <p className="font-serif text-base italic leading-relaxed text-zinc-800 dark:text-zinc-200">
        “Every margin carries a quiet geometry, waiting only for the typographer’s hand to bring proportion into view.”
      </p>

      <div role="separator" aria-orientation="horizontal" className="my-5 flex justify-center">
        <svg
          viewBox="0 0 440 44"
          className="h-11 w-full max-w-md text-zinc-700 dark:text-zinc-300"
          aria-hidden="true"
        >
          {/* Outer tapering hairlines */}
          <line
            x1="12"
            y1="22"
            x2="138"
            y2="22"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.45"
          />
          <line
            x1="302"
            y1="22"
            x2="428"
            y2="22"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.45"
          />

          {/* Left symmetrical scroll */}
          <path
            d="M142 22 C158 22, 162 10, 176 10 C188 10, 192 22, 182 26 C174 29, 168 20, 176 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
          />
          <path
            d="M142 22 C158 22, 162 34, 176 34 C188 34, 192 22, 182 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.6"
            strokeLinecap="round"
          />

          {/* Right symmetrical scroll */}
          <path
            d="M298 22 C282 22, 278 10, 264 10 C252 10, 248 22, 258 26 C266 29, 272 20, 264 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
          />
          <path
            d="M298 22 C282 22, 278 34, 264 34 C252 34, 248 22, 258 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.6"
            strokeLinecap="round"
          />

          {/* Central Aldine fleuron */}
          <path
            d="M220 7 C225 14, 229 19, 220 22 C211 19, 215 14, 220 7 Z"
            className="fill-blue-700 dark:fill-blue-400"
          />
          <path
            d="M220 37 C225 30, 229 25, 220 22 C211 25, 215 30, 220 37 Z"
            className="fill-blue-700/70 dark:fill-blue-400/70"
          />
          <path
            d="M202 22 C209 17, 215 17, 220 22 C215 27, 209 27, 202 22 Z"
            fill="currentColor"
          />
          <path
            d="M238 22 C231 17, 225 17, 220 22 C225 27, 231 27, 238 22 Z"
            fill="currentColor"
          />
          <circle cx="220" cy="22" r="2.2" className="fill-white dark:fill-zinc-950" />
        </svg>
      </div>

      <p className="text-xs tracking-wide text-zinc-500 dark:text-zinc-400 text-center">
        From the Antwerp Press Specimen Ledger, Chapter III
      </p>
    </section>
  );
}
