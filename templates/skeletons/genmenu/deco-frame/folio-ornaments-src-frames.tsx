import React, { useId } from 'react';

export interface OrnFrameProps {
  className?: string;
}

/**
 * Orn7 — Corner-Accent Border Frame
 * Hairline archival card accented at all four corners with SVG L-brackets and registration dots.
 */
export function Orn7({ className = '' }: OrnFrameProps) {
  const cornerSvg = (positionClass: string) => (
    <svg
      viewBox="0 0 28 28"
      aria-hidden="true"
      className={`pointer-events-none absolute h-7 w-7 text-blue-700 dark:text-blue-400 ${positionClass}`}
    >
      <path
        d="M2 24 L2 2 L24 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
      <path
        d="M7 18 L7 7 L18 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.45"
      />
      <circle cx="7" cy="7" r="1.5" fill="currentColor" />
    </svg>
  );

  return (
    <article
      className={`relative border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-7 ${className}`}
    >
      {cornerSvg('top-0 left-0')}
      {cornerSvg('top-0 right-0 rotate-90')}
      {cornerSvg('bottom-0 right-0 rotate-180')}
      {cornerSvg('bottom-0 left-0 -rotate-90')}

      <header>
        <p className="text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
          Catalog Plate · ACC. 2026.07
        </p>
        <h3 className="mt-1.5 font-serif text-xl font-semibold text-zinc-950 dark:text-zinc-50">
          Mitered Corner-Accent Framing
        </h3>
      </header>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Four precision SVG registration brackets reinforce the perimeter without enclosing the card in heavy strokes.
      </p>
    </article>
  );
}

/**
 * Orn8 — Offset-Shadow Frame
 * Editorial card backed by a diagonal crosshatch SVG pattern offset shadow plate.
 */
export function Orn8({ className = '' }: OrnFrameProps) {
  const uid = useId().replace(/:/g, '');
  const patternId = `orn8-hatch-${uid}`;

  return (
    <div className={`relative pb-3 pr-3 ${className}`}>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 top-3 left-3 h-[calc(100%-0.75rem)] w-[calc(100%-0.75rem)] rounded-sm border border-zinc-300 dark:border-zinc-700"
      >
        <defs>
          <pattern
            id={patternId}
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="8"
              strokeWidth="1.5"
              className="stroke-zinc-300 dark:stroke-zinc-700"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>

      <article className="relative rounded-sm border border-zinc-900 dark:border-zinc-200 bg-white dark:bg-zinc-950 p-6">
        <p className="text-xs font-medium tracking-wider text-blue-700 dark:text-blue-400">
          Drafting Elevation · 08
        </p>
        <h3 className="mt-1.5 font-serif text-xl font-semibold text-zinc-950 dark:text-zinc-50">
          Hatched Offset-Shadow Plate
        </h3>
        <p className="mt-2.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Rather than a soft blur drop shadow, a diagonal SVG line pattern creates crisp architectural depth.
        </p>
      </article>
    </div>
  );
}

/**
 * Orn9 — Ribbon-Corner Frame
 * Specimen frame featuring an SVG folded corner ribbon and tucked crease polygon.
 */
export function Orn9({ className = '' }: OrnFrameProps) {
  return (
    <article
      className={`relative mt-2 mr-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 ${className}`}
    >
      {/* Folded SVG ribbon corner */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-2 -right-2 h-24 w-24 overflow-visible"
      >
        <svg viewBox="0 0 96 96" className="h-full w-full">
          {/* Top-left tucked crease */}
          <polygon
            points="22,0 30,8 22,8"
            className="fill-blue-900 dark:fill-blue-700"
          />
          {/* Bottom-right tucked crease */}
          <polygon
            points="96,74 88,66 88,74"
            className="fill-blue-900 dark:fill-blue-700"
          />
          {/* Main folded diagonal ribbon */}
          <polygon
            points="22,0 52,0 96,44 96,74"
            className="fill-blue-700 dark:fill-blue-500"
          />
          <text
            x="63"
            y="34"
            textAnchor="middle"
            transform="rotate(45 63 34)"
            className="fill-white text-[10px] font-semibold tracking-wider uppercase"
          >
            Folio
          </text>
        </svg>
      </div>

      <header className="pr-14">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Archival Monograph · First Printing
        </p>
        <h3 className="mt-1.5 font-serif text-xl font-semibold text-zinc-950 dark:text-zinc-50">
          Folded Ribbon-Corner Notice
        </h3>
      </header>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Two tucked crease triangles anchor the diagonal SVG ribbon cleanly against the upper-right perimeter.
      </p>
    </article>
  );
}

/**
 * Orn10 — Bracket-Corners Frame
 * Content block clasped by tall left and right architectural SVG brackets.
 */
export function Orn10({ className = '' }: OrnFrameProps) {
  return (
    <section
      aria-label="Bracket-corners framed specification"
      className={`relative bg-zinc-50 dark:bg-zinc-900/60 px-8 py-6 ${className}`}
    >
      {/* Left architectural SVG bracket */}
      <svg
        viewBox="0 0 20 120"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="pointer-events-none absolute top-2 bottom-2 left-2 h-[calc(100%-1rem)] w-5 text-blue-700 dark:text-blue-400"
      >
        <path
          d="M18 2 L4 2 L4 56 L0 60 L4 64 L4 118 L18 118"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Right architectural SVG bracket */}
      <svg
        viewBox="0 0 20 120"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="pointer-events-none absolute top-2 right-2 bottom-2 h-[calc(100%-1rem)] w-5 text-blue-700 dark:text-blue-400"
      >
        <path
          d="M2 2 L16 2 L16 56 L20 60 L16 64 L16 118 L2 118"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <h3 className="font-serif text-lg font-semibold text-zinc-950 dark:text-zinc-50">
        Structural Bracket Enclosure
      </h3>
      <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">Binding</dt>
          <dd className="font-medium text-zinc-900 dark:text-zinc-100">Smyth-sewn linen</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">Paper Stock</dt>
          <dd className="font-medium text-zinc-900 dark:text-zinc-100 tabular-nums">120 gsm cotton rag</dd>
        </div>
      </dl>
    </section>
  );
}

/**
 * Orn11 — Ticket-Edge Notches Frame
 * Voucher card featuring exact semicircular SVG side notches and a perforated tear-line.
 */
export function Orn11({ className = '' }: OrnFrameProps) {
  return (
    <article className={`relative ${className}`}>
      {/* Upper admission face */}
      <div className="rounded-t-lg border-t border-x border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-6 pt-5 pb-3">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-xs font-medium tracking-wider text-blue-700 dark:text-blue-400">
            Gallery Admission
          </p>
          <span className="font-mono text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
            NO. 0148
          </span>
        </div>
        <h3 className="mt-1 font-serif text-xl font-semibold text-zinc-950 dark:text-zinc-50">
          North Pavilion Viewing Pass
        </h3>
      </div>

      {/* Exact semicircular SVG side notches + perforated tear-line */}
      <div aria-hidden="true" className="relative flex h-6 items-center">
        <svg viewBox="0 0 12 24" className="h-6 w-3 shrink-0">
          <path
            d="M 0.5 0 L 12 0 L 12 24 L 0.5 24 A 11.5 11.5 0 0 0 0.5 0 Z"
            className="fill-white dark:fill-zinc-950"
          />
          <path
            d="M 0.5 0 A 11.5 11.5 0 0 1 0.5 24"
            fill="none"
            strokeWidth="1"
            className="stroke-zinc-300 dark:stroke-zinc-700"
          />
        </svg>

        <div className="flex h-6 flex-1 items-center bg-white dark:bg-zinc-950 px-2">
          <svg viewBox="0 0 400 4" preserveAspectRatio="none" className="h-1 w-full">
            <line
              x1="0"
              y1="2"
              x2="400"
              y2="2"
              strokeWidth="1.5"
              strokeDasharray="6 6"
              vectorEffect="non-scaling-stroke"
              className="stroke-zinc-300 dark:stroke-zinc-700"
            />
          </svg>
        </div>

        <svg viewBox="0 0 12 24" className="h-6 w-3 shrink-0">
          <path
            d="M 11.5 0 L 0 0 L 0 24 L 11.5 24 A 11.5 11.5 0 0 1 11.5 0 Z"
            className="fill-white dark:fill-zinc-950"
          />
          <path
            d="M 11.5 0 A 11.5 11.5 0 0 0 11.5 24"
            fill="none"
            strokeWidth="1"
            className="stroke-zinc-300 dark:stroke-zinc-700"
          />
        </svg>
      </div>

      {/* Lower ticket stub */}
      <div className="flex items-center justify-between gap-4 rounded-b-lg border-b border-x border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/70 px-6 py-3.5 text-xs text-zinc-600 dark:text-zinc-400">
        <span>Valid: Saturday 14:00</span>
        <span className="font-mono font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
          GATE B · ROW 4
        </span>
      </div>
    </article>
  );
}

/**
 * Orn12 — Stamp-Edge Border Frame
 * Postage-stamp serrated SVG scalloped perimeter on all four edges with inner postmark motif.
 */
export function Orn12({ className = '' }: OrnFrameProps) {
  const teethX = 18;
  const stepX = 360 / teethX;
  const topScallops = Array.from({ length: teethX }, (_, i) => {
    return `M ${i * stepX} 10 A ${stepX / 2} 8 0 0 1 ${(i + 1) * stepX} 10`;
  }).join(' ');

  const teethY = 9;
  const stepY = 180 / teethY;
  const leftScallops = Array.from({ length: teethY }, (_, i) => {
    return `M 10 ${i * stepY} A 8 ${stepY / 2} 0 0 0 10 ${(i + 1) * stepY}`;
  }).join(' ');

  return (
    <figure className={`relative p-3 ${className}`}>
      {/* Outer 4-sided scalloped SVG perimeter border */}
      <svg
        viewBox="0 0 360 180"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full text-zinc-400 dark:text-zinc-600"
      >
        {/* Top scalloped edge */}
        <path
          d={topScallops}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        {/* Bottom scalloped edge */}
        <g transform="translate(0, 180) scale(1, -1)">
          <path
            d={topScallops}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </g>
        {/* Left scalloped edge */}
        <path
          d={leftScallops}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        {/* Right scalloped edge */}
        <g transform="translate(360, 0) scale(-1, 1)">
          <path
            d={leftScallops}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      </svg>

      <div className="relative border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
        {/* Postmark SVG cancellation motif */}
        <svg
          viewBox="0 0 72 72"
          aria-hidden="true"
          className="pointer-events-none absolute top-3 right-3 h-14 w-14 text-blue-700/40 dark:text-blue-400/40"
        >
          <circle cx="36" cy="36" r="26" fill="none" stroke="currentColor" strokeWidth="1.25" />
          <circle
            cx="36"
            cy="36"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <path
            d="M4 28 Q 20 22, 36 28 T 68 28 M4 38 Q 20 32, 36 38 T 68 38"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>

        <p className="font-mono text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
          SERIES XII · 20c
        </p>
        <h3 className="mt-1 font-serif text-xl font-semibold text-zinc-950 dark:text-zinc-50">
          Commemorative Stamp Plate
        </h3>
        <figcaption className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Perforated SVG teeth surround an inset vignette stamped with a circular ink postmark.
        </figcaption>
      </div>
    </figure>
  );
}

/**
 * Orn13 — Glass-Edge Frame
 * Translucent frosted panel edged by a crisp SVG specular bevel highlight over tonal depth.
 */
export function Orn13({ className = '' }: OrnFrameProps) {
  const uid = useId().replace(/:/g, '');
  const rimGradId = `orn13-rim-${uid}`;

  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-zinc-200/80 dark:bg-zinc-900 p-4 ${className}`}
    >
      {/* Subtle tonal shapes behind the glass so backdrop-blur is visible */}
      <svg
        viewBox="0 0 400 180"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <circle cx="70" cy="40" r="64" className="fill-blue-700/20 dark:fill-blue-500/20" />
        <circle cx="330" cy="145" r="76" className="fill-zinc-400/25 dark:fill-zinc-700/35" />
      </svg>

      <article className="relative rounded-md bg-white/75 dark:bg-zinc-950/75 p-5 backdrop-blur-md">
        {/* Specular SVG bevel edge highlight */}
        <svg
          viewBox="0 0 400 160"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full rounded-md"
        >
          <defs>
            <linearGradient id={rimGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.85" />
              <stop offset="45%" stopColor="currentColor" stopOpacity="0.18" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.65" />
            </linearGradient>
          </defs>
          <rect
            x="1"
            y="1"
            width="398"
            height="158"
            rx="6"
            fill="none"
            stroke={`url(#${rimGradId})`}
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            className="text-white dark:text-zinc-300"
          />
        </svg>

        <p className="text-xs font-medium tracking-wider text-blue-700 dark:text-blue-400">
          Optical Bevel · 13
        </p>
        <h3 className="mt-1 font-serif text-xl font-semibold text-zinc-950 dark:text-zinc-50">
          Specular Glass-Edge Pane
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          A diagonal SVG gradient stroke catches light along the top-left and bottom-right glass bevels.
        </p>
      </article>
    </div>
  );
}
