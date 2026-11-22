import React, { useId } from 'react';

export interface OrnTypographyProps {
  className?: string;
}

/**
 * Orn14 — Decorative Rules Between Text
 * Inter-paragraph SVG colophon rule separating two narrative prose paragraphs.
 */
export function Orn14({ className = '' }: OrnTypographyProps) {
  return (
    <article
      className={`rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 ${className}`}
    >
      <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        Early typographic manuals emphasized that whitespace alone could not govern dense commentary without measured horizontal breaks.
      </p>

      <div role="separator" aria-orientation="horizontal" className="my-4 flex justify-center">
        <svg viewBox="0 0 320 18" className="h-4.5 w-64" aria-hidden="true">
          <line
            x1="8"
            y1="9"
            x2="128"
            y2="9"
            strokeWidth="1"
            className="stroke-zinc-300 dark:stroke-zinc-700"
          />
          <line
            x1="192"
            y1="9"
            x2="312"
            y2="9"
            strokeWidth="1"
            className="stroke-zinc-300 dark:stroke-zinc-700"
          />
          <circle cx="138" cy="9" r="1.5" className="fill-zinc-400 dark:fill-zinc-500" />
          <circle cx="147" cy="9" r="1.5" className="fill-zinc-500 dark:fill-zinc-400" />
          <polygon
            points="160,3 166,9 160,15 154,9"
            fill="none"
            strokeWidth="1.5"
            className="stroke-blue-700 dark:stroke-blue-400"
          />
          <circle cx="160" cy="9" r="1.5" className="fill-blue-700 dark:fill-blue-400" />
          <circle cx="173" cy="9" r="1.5" className="fill-zinc-500 dark:fill-zinc-400" />
          <circle cx="182" cy="9" r="1.5" className="fill-zinc-400 dark:fill-zinc-500" />
        </svg>
      </div>

      <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        Placed between consecutive paragraphs, a delicate lozenge rule signals a brief cadence pause without starting a new chapter.
      </p>
    </article>
  );
}

/**
 * Orn15 — Header Underline Treatments
 * Showcases hand-drawn ink stroke, multi-stop gradient bar, and double-line SVG underlines.
 */
export function Orn15({
  className = '',
  variant = 'all',
}: OrnTypographyProps & { variant?: 'all' | 'hand-drawn' | 'gradient' | 'double' }) {
  const uid = useId().replace(/:/g, '');
  const barGradId = `orn15-bar-${uid}`;

  return (
    <header
      className={`space-y-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 ${className}`}
    >
      {(variant === 'all' || variant === 'hand-drawn') && (
        <div>
          <h2 className="inline-block font-serif text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
            Hand-Drawn Brush Stroke
            <svg
              viewBox="0 0 260 14"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="mt-1 block h-3 w-full text-blue-700 dark:text-blue-400"
            >
              <path
                d="M2 8.5 C 52 3.5, 118 11.5, 178 6.5 C 216 3.5, 242 7.5, 258 5.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
              <path
                d="M12 11.5 C 74 9.5, 148 12.5, 232 9.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.9"
                strokeOpacity="0.45"
                strokeLinecap="round"
              />
            </svg>
          </h2>
        </div>
      )}

      {(variant === 'all' || variant === 'gradient') && (
        <div>
          <h3 className="inline-block font-sans text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Gradient Bar Emphasis
            <svg
              viewBox="0 0 220 6"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="mt-1.5 block h-1.5 w-full"
            >
              <defs>
                <linearGradient id={barGradId} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1d4ed8" />
                  <stop offset="55%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <rect x="0" y="1" width="220" height="4" rx="2" fill={`url(#${barGradId})`} />
            </svg>
          </h3>
        </div>
      )}

      {(variant === 'all' || variant === 'double') && (
        <div>
          <p className="inline-block font-serif text-base font-medium text-zinc-800 dark:text-zinc-200">
            Double-Line Editorial Rule
            <svg
              viewBox="0 0 220 8"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="mt-1.5 block h-2 w-full text-zinc-400 dark:text-zinc-600"
            >
              <line x1="0" y1="2" x2="220" y2="2" stroke="currentColor" strokeWidth="1.5" />
              <line x1="0" y1="6" x2="184" y2="6" stroke="currentColor" strokeWidth="0.85" />
              <circle cx="192" cy="6" r="1.25" className="fill-blue-700 dark:fill-blue-400" />
            </svg>
          </p>
        </div>
      )}
    </header>
  );
}

/**
 * Orn16 — Quote Ornament Marks
 * Sculptural SVG opening and closing quotation glyphs framing an editorial pull quote.
 */
export function Orn16({ className = '' }: OrnTypographyProps) {
  return (
    <figure
      className={`relative rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-7 py-6 ${className}`}
    >
      {/* Opening SVG quote ornament */}
      <svg
        viewBox="0 0 40 32"
        aria-hidden="true"
        className="mb-2 h-7 w-9 text-blue-700/75 dark:text-blue-400/75"
      >
        <path
          d="M16 4 C9 6, 4 12, 4 20 C4 25, 7.5 28, 12 28 C16 28, 18.5 25, 18.5 21.5 C18.5 18, 16 15.5, 12.5 15.5 C11 15.5, 9.8 16, 9 16.8 C9.8 12.2, 12.6 8.8, 17 7 Z"
          fill="currentColor"
        />
        <path
          d="M34 4 C27 6, 22 12, 22 20 C22 25, 25.5 28, 30 28 C34 28, 36.5 25, 36.5 21.5 C36.5 18, 34 15.5, 30.5 15.5 C29 15.5, 27.8 16, 27 16.8 C27.8 12.2, 30.6 8.8, 35 7 Z"
          fill="currentColor"
        />
      </svg>

      <blockquote className="font-serif text-lg italic leading-relaxed text-zinc-900 dark:text-zinc-100">
        Ornament is never an afterthought pasted onto prose; when proportioned well, it acts as punctuation for the page itself.
      </blockquote>

      <div className="mt-4 flex items-center justify-between gap-4">
        <figcaption className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Clara Lindqvist · Monograph on Structural Print
        </figcaption>

        {/* Closing SVG quote ornament */}
        <svg
          viewBox="0 0 40 32"
          aria-hidden="true"
          className="h-6 w-8 rotate-180 text-zinc-300 dark:text-zinc-700"
        >
          <path
            d="M16 4 C9 6, 4 12, 4 20 C4 25, 7.5 28, 12 28 C16 28, 18.5 25, 18.5 21.5 C18.5 18, 16 15.5, 12.5 15.5 C11 15.5, 9.8 16, 9 16.8 C9.8 12.2, 12.6 8.8, 17 7 Z"
            fill="currentColor"
          />
          <path
            d="M34 4 C27 6, 22 12, 22 20 C22 25, 25.5 28, 30 28 C34 28, 36.5 25, 36.5 21.5 C36.5 18, 34 15.5, 30.5 15.5 C29 15.5, 27.8 16, 27 16.8 C27.8 12.2, 30.6 8.8, 35 7 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </figure>
  );
}
