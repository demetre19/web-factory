import React from 'react';

export interface OrnAccentProps {
  className?: string;
}

/**
 * Orn17 — Drop-Cap Treatment
 * Illuminated serif initial housed inside a geometric SVG filigree tile beside editorial prose.
 */
export function Orn17({ className = '' }: OrnAccentProps) {
  return (
    <article
      className={`rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 ${className}`}
    >
      <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        <span
          aria-hidden="true"
          className="relative float-left mr-4 mb-1 flex h-14 w-14 items-center justify-center bg-zinc-50 dark:bg-zinc-900 select-none"
        >
          <svg
            viewBox="0 0 56 56"
            className="pointer-events-none absolute inset-0 h-full w-full text-blue-700 dark:text-blue-400"
          >
            <rect
              x="2"
              y="2"
              width="52"
              height="52"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
            />
            <rect
              x="6"
              y="6"
              width="44"
              height="44"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
              strokeOpacity="0.45"
            />
            <polygon points="28,0 31,3 28,6 25,3" fill="currentColor" />
            <polygon points="28,50 31,53 28,56 25,53" fill="currentColor" />
            <polygon points="0,28 3,25 6,28 3,31" fill="currentColor" />
            <polygon points="50,28 53,25 56,28 53,31" fill="currentColor" />
          </svg>
          <span className="font-serif text-3xl font-bold leading-none text-zinc-950 dark:text-zinc-50">
            T
          </span>
        </span>
        <span className="sr-only">T</span>
        he illuminated initial anchors the opening paragraph of a folio essay, establishing scale and rhythm before a single subheading appears on the sheet. When framed with fine geometric corner ticks, it bridges classic book arts and modern grid systems.
      </p>
    </article>
  );
}

/**
 * Orn18 — Boxed Callout with Decorative Edges
 * Editorial admonition callout framed by scalloped/notched SVG top and bottom border trims.
 */
export function Orn18({ className = '' }: OrnAccentProps) {
  const topTrim = Array.from({ length: 16 }, (_, i) => {
    const x1 = i * 24;
    const mid = x1 + 12;
    const x2 = x1 + 24;
    return `M ${x1} 10 L ${mid - 4} 10 L ${mid} 3 L ${mid + 4} 10 L ${x2} 10`;
  }).join(' ');

  return (
    <aside
      aria-label="Archival preservation notice"
      className={`relative bg-zinc-50 dark:bg-zinc-900/70 border-x border-zinc-200 dark:border-zinc-800 ${className}`}
    >
      {/* Top decorative SVG edge */}
      <svg
        viewBox="0 0 384 12"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="block h-3 w-full text-blue-700/70 dark:text-blue-400/70"
      >
        <path
          d={topTrim}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="px-6 py-4">
        <h3 className="font-serif text-base font-semibold text-zinc-950 dark:text-zinc-50">
          Curatorial Preservation Note
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Light-sensitive woodcut broadsides are rotated every ninety days to preserve mineral pigment saturation without chemical stabilizers.
        </p>
      </div>

      {/* Bottom decorative SVG edge */}
      <svg
        viewBox="0 0 384 12"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="block h-3 w-full rotate-180 text-blue-700/70 dark:text-blue-400/70"
      >
        <path
          d={topTrim}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </aside>
  );
}

/**
 * Orn19 — Numbered-Section Ornament
 * Chapter index numeral framed inside a concentric SVG compass/astrolabe ring.
 */
export function Orn19({
  className = '',
  number = '04',
}: OrnAccentProps & { number?: string }) {
  return (
    <section
      aria-label="Numbered section ornament"
      className={`rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 ${className}`}
    >
      <header className="flex items-center gap-5">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
          <svg
            viewBox="0 0 64 64"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full text-blue-700 dark:text-blue-400"
          >
            <circle
              cx="32"
              cy="32"
              r="29"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeOpacity="0.45"
            />
            <circle
              cx="32"
              cy="32"
              r="23"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
            {/* Cardinal ticks */}
            <line x1="32" y1="0" x2="32" y2="6" stroke="currentColor" strokeWidth="1.5" />
            <line x1="32" y1="58" x2="32" y2="64" stroke="currentColor" strokeWidth="1.5" />
            <line x1="0" y1="32" x2="6" y2="32" stroke="currentColor" strokeWidth="1.5" />
            <line x1="58" y1="32" x2="64" y2="32" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="font-mono text-lg font-medium tabular-nums text-zinc-950 dark:text-zinc-50">
            {number}
          </span>
        </div>

        <div>
          <p className="text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
            Chapter Division
          </p>
          <h3 className="mt-0.5 font-serif text-xl font-semibold text-zinc-950 dark:text-zinc-50">
            Proportional Grid Systems
          </h3>
        </div>
      </header>

      <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Concentric SVG rings and cardinal degree ticks give chapter indices architectural weight without oversized display noise.
      </p>
    </section>
  );
}

/**
 * Orn20 — Vertical Side-Label
 * Essay block flanked by a rotated vertical margin label anchored to an SVG finial rule.
 */
export function Orn20({ className = '' }: OrnAccentProps) {
  return (
    <article
      className={`grid grid-cols-[auto_1fr] gap-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 ${className}`}
    >
      <div className="flex flex-col items-center justify-between gap-2 py-0.5">
        <svg viewBox="0 0 16 28" aria-hidden="true" className="h-7 w-4 shrink-0 text-blue-700 dark:text-blue-400">
          <polygon points="8,1 13,6 8,11 3,6" fill="currentColor" />
          <line x1="8" y1="11" x2="8" y2="28" stroke="currentColor" strokeWidth="1.25" />
        </svg>

        <span className="font-mono text-[11px] font-medium tracking-widest text-zinc-500 dark:text-zinc-400 [writing-mode:vertical-rl] rotate-180 whitespace-nowrap select-none">
          FOLIO IV · ARCHIVE
        </span>

        <svg viewBox="0 0 16 28" aria-hidden="true" className="h-7 w-4 shrink-0 text-blue-700 dark:text-blue-400">
          <line x1="8" y1="0" x2="8" y2="17" stroke="currentColor" strokeWidth="1.25" />
          <circle cx="8" cy="21" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.25" />
        </svg>
      </div>

      <div className="border-l border-zinc-200 dark:border-zinc-800 pl-5">
        <h3 className="font-serif text-xl font-semibold text-zinc-950 dark:text-zinc-50">
          Vertical Margin Index
        </h3>
        <p className="mt-2.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Rotated side-labels paired with terminal SVG diamond finials turn the left reading gutter into an unobtrusive structural spine.
        </p>
        <p className="mt-2.5 text-xs text-zinc-500 dark:text-zinc-400">
          Cataloged · Autumn Specimen Series
        </p>
      </div>
    </article>
  );
}
