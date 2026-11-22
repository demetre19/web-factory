import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bookmark,
  Clock,
  Info,
  Lightbulb,
} from 'lucide-react';
import { calculateReadTime } from '../../utils/specimenCatalog';

export interface Deco8Props {
  index?: string;
  title?: string;
  description?: string;
}

export function Deco8({
  index = '01',
  title = 'Optical Margin Alignment',
  description = 'Allow curved letterforms and hanging punctuation to extend slightly beyond the text grid so the reader perceives a crisp, unbroken vertical edge.',
}: Deco8Props) {
  return (
    <article className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 py-2">
      <div className="flex items-center gap-3 sm:block shrink-0">
        <span className="font-serif text-4xl sm:text-5xl font-medium tracking-tight text-[#1E3A8A] tabular-nums leading-none">
          {index}
        </span>
        <span
          aria-hidden="true"
          className="block sm:mt-2 h-px w-10 bg-[#D6CEBE]"
        />
      </div>
      <div className="min-w-0">
        <h3 className="font-serif text-lg font-semibold text-[#181715] leading-snug">
          {title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-[#57534E]">
          {description}
        </p>
      </div>
    </article>
  );
}

export interface Deco11Props {
  figureNumber?: string;
  caption?: string;
  credit?: string;
  imageSrc?: string;
}

export function Deco11({
  figureNumber = 'Fig. 11',
  caption = 'Metal movable type blocks and brass spacing rules arranged on a limestone composing stone.',
  credit = 'Archival Press Workshop',
  imageSrc = '/src/assets/images/typographic_press_plate_1795323009727.jpg',
}: Deco11Props) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <figure className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-[#E5E0D5] bg-[#F2EFE9] aspect-[4/3]">
        {!imgFailed && imageSrc ? (
          <img
            src={imageSrc}
            alt={caption}
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-[#57534E]">
            <span className="font-serif text-2xl text-[#9A3412] mb-1">❦</span>
            <span className="text-xs font-medium">{figureNumber} — Plate Unavailable</span>
          </div>
        )}
      </div>
      <figcaption className="flex items-start gap-2.5 pt-1 text-xs text-[#57534E]">
        <span aria-hidden="true" className="font-serif text-base leading-none text-[#9A3412] pt-0.5 shrink-0">
          ❦
        </span>
        <div className="leading-relaxed">
          <span className="font-semibold text-[#181715] not-italic mr-1.5">
            {figureNumber} —
          </span>
          <span className="font-serif italic text-[13px] text-[#44403C]">
            {caption}
          </span>
          {credit && (
            <span className="ml-1.5 text-[#78716C]">({credit})</span>
          )}
        </div>
      </figcaption>
    </figure>
  );
}

export interface Deco12Props {
  title?: string;
  body?: string;
}

export function Deco12({
  title = 'Pro Tip: Match lowercase x-height when pairing faces',
  body = 'When combining an expressive serif display font with a humanist sans-serif body face, adjust their relative point sizes until their lowercase x-heights align optically.',
}: Deco12Props) {
  return (
    <aside
      aria-label="Pro tip"
      className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4]/70 p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#14532D] text-white flex items-center justify-center shrink-0 mt-0.5">
          <Lightbulb className="w-4 h-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-[#14532D] leading-snug">
            {title}
          </h4>
          <p className="mt-1 text-sm leading-relaxed text-[#1E3A2F]">
            {body}
          </p>
        </div>
      </div>
    </aside>
  );
}

type CalloutTone = 'warning' | 'note' | 'aside';

const CALLOUT_VARIANTS: Record<
  CalloutTone,
  {
    label: string;
    heading: string;
    body: string;
    containerClass: string;
    badgeClass: string;
    headingClass: string;
    Icon: React.ComponentType<{ className?: string }>;
  }
> = {
  warning: {
    label: 'Warning',
    heading: 'Warning: Avoid sub-14px prose in long-form essays',
    body: 'Setting body copy below 14px or tightening line-height below 1.45 impairs scanning speed on high-DPI displays.',
    containerClass: 'border-[#FDE68A] bg-[#FFFBEB]',
    badgeClass: 'bg-[#B45309] text-white',
    headingClass: 'text-[#78350F]',
    Icon: AlertTriangle,
  },
  note: {
    label: 'Note',
    heading: 'Note: Prefer hairline rules over heavy drop shadows',
    body: 'A crisp 1px warm-stone border creates clear containment on light archival surfaces without visual muddiness.',
    containerClass: 'border-[#BFDBFE] bg-[#EFF6FF]/70',
    badgeClass: 'bg-[#1E3A8A] text-white',
    headingClass: 'text-[#1E3A8A]',
    Icon: Info,
  },
  aside: {
    label: 'Aside',
    heading: 'Editorial Aside: On Wide Margins',
    body: 'Historically, wide outer margins existed so scholars could annotate pages in ink without obscuring the typeset column.',
    containerClass: 'border-[#D6CEBE] bg-[#F2EFE9]/80',
    badgeClass: 'bg-[#44403C] text-white',
    headingClass: 'text-[#181715]',
    Icon: Bookmark,
  },
};

export function Deco13() {
  const [tone, setTone] = useState<CalloutTone>('warning');
  const current = CALLOUT_VARIANTS[tone];
  const ActiveIcon = current.Icon;

  return (
    <div className="space-y-3">
      <div
        role="tablist"
        aria-label="Callout variant"
        className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#F2EFE9] border border-[#E5E0D5]"
      >
        {(['warning', 'note', 'aside'] as CalloutTone[]).map((key) => {
          const selected = tone === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setTone(key)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selected
                  ? 'bg-white text-[#181715] shadow-xs'
                  : 'text-[#57534E] hover:text-[#181715]'
              }`}
            >
              {CALLOUT_VARIANTS[key].label}
            </button>
          );
        })}
      </div>

      <aside
        role="note"
        aria-label={current.label}
        className={`rounded-xl border p-4 transition-colors ${current.containerClass}`}
      >
        <div className="flex items-start gap-3">
          <span
            className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${current.badgeClass}`}
          >
            <ActiveIcon className="w-4 h-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h4 className={`text-sm font-semibold leading-snug ${current.headingClass}`}>
              {current.heading}
            </h4>
            <p className="mt-1 text-sm leading-relaxed text-[#292524]">
              {current.body}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

export interface Deco14Props {
  chapter?: string;
  title?: string;
  wordCount?: number;
  progressPercent?: number;
}

export function Deco14({
  chapter = 'Chapter 03',
  title = 'Rhythm, Measure & White Space',
  wordCount = 1320,
  progressPercent = 64,
}: Deco14Props) {
  const minutes = calculateReadTime(wordCount);
  const clampedProgress = Math.max(0, Math.min(100, progressPercent));

  return (
    <header className="rounded-xl border border-[#E5E0D5] bg-[#FAF8F4] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#57534E]">
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold text-[#1E3A8A]">{chapter}</span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Clock className="w-3.5 h-3.5 text-[#78716C]" aria-hidden="true" />
            <time dateTime={`PT${minutes}M`}>{minutes} min read</time>
          </span>
        </div>
        <span className="font-mono tabular-nums text-[#78716C]">
          {clampedProgress}% complete
        </span>
      </div>
      <h3 className="mt-2 font-serif text-lg sm:text-xl font-semibold text-[#181715]">
        {title}
      </h3>
      <div
        className="mt-3 h-1.5 w-full rounded-full bg-[#E5E0D5] overflow-hidden"
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${chapter} reading progress`}
      >
        <div
          className="h-full bg-[#1E3A8A] rounded-full transition-transform duration-200"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </header>
  );
}

export interface Deco15Props {
  directionLabel?: string;
  sectionIndex?: string;
  title?: string;
  href?: string;
  onNavigate?: () => void;
}

export function Deco15({
  directionLabel = 'Next Section',
  sectionIndex = 'Chapter 04',
  title = 'Grid Systems & Asymmetric Margins',
  href = '#specimen-grid',
  onNavigate,
}: Deco15Props) {
  return (
    <nav aria-label="Section pagination">
      <a
        href={href}
        onClick={(e) => {
          if (onNavigate) {
            e.preventDefault();
            onNavigate();
          }
        }}
        className="group flex items-center justify-between gap-4 rounded-xl border border-[#E5E0D5] bg-[#FAF8F4] px-5 py-4 hover:border-[#1E3A8A]/50 hover:bg-white transition-colors focus-visible:outline-2 focus-visible:outline-[#1E3A8A]"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-[#57534E]">
            <span>{directionLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[#1E3A8A]">{sectionIndex}</span>
          </div>
          <p className="mt-1 font-serif text-base sm:text-lg font-semibold text-[#181715] truncate group-hover:text-[#1E3A8A] transition-colors">
            {title}
          </p>
        </div>
        <span
          aria-hidden="true"
          className="w-9 h-9 rounded-full border border-[#D6CEBE] bg-white flex items-center justify-center text-[#181715] group-hover:border-[#1E3A8A] group-hover:text-[#1E3A8A] group-hover:translate-x-1 transition-all duration-150 shrink-0"
        >
          <ArrowRight className="w-4 h-4" />
        </span>
      </a>
    </nav>
  );
}
