import React, { useState } from 'react';
import { ArrowRight, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { formatInitials } from '../../utils/specimenCatalog';

type ListMarkerStyle = 'diamond' | 'check' | 'arrow' | 'dash';

const LIST_ITEMS = [
  'Set line-height between 1.55 and 1.75 for sustained prose.',
  'Limit active type families to two curated faces plus one monospace.',
  'Align numerical tables using tabular numerals for vertical precision.',
];

export function Deco16() {
  const [markerStyle, setMarkerStyle] = useState<ListMarkerStyle>('check');

  const options: { id: ListMarkerStyle; label: string }[] = [
    { id: 'diamond', label: 'Bullets' },
    { id: 'check', label: 'Checkmarks' },
    { id: 'arrow', label: 'Arrows' },
    { id: 'dash', label: 'Dashes' },
  ];

  return (
    <div className="space-y-3.5">
      <div
        role="tablist"
        aria-label="List marker style"
        className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#F2EFE9] border border-[#E5E0D5]"
      >
        {options.map((opt) => {
          const active = markerStyle === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMarkerStyle(opt.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                active
                  ? 'bg-white text-[#181715] shadow-xs'
                  : 'text-[#57534E] hover:text-[#181715]'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <ul className="space-y-2.5 text-sm leading-relaxed text-[#292524]">
        {LIST_ITEMS.map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            {markerStyle === 'diamond' && (
              <span
                aria-hidden="true"
                className="text-[#9A3412] text-xs mt-1 shrink-0 select-none"
              >
                ◆
              </span>
            )}
            {markerStyle === 'check' && (
              <span
                aria-hidden="true"
                className="w-5 h-5 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] text-[#14532D] flex items-center justify-center mt-0.5 shrink-0"
              >
                <Check className="w-3 h-3" />
              </span>
            )}
            {markerStyle === 'arrow' && (
              <span
                aria-hidden="true"
                className="text-[#1E3A8A] mt-1 shrink-0"
              >
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
            {markerStyle === 'dash' && (
              <span
                aria-hidden="true"
                className="font-serif text-[#78716C] font-semibold mt-0.5 shrink-0 select-none"
              >
                —
              </span>
            )}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface AuthorAvatarItem {
  name: string;
  role: string;
}

export interface Deco17Props {
  authors?: AuthorAvatarItem[];
}

const MONOGRAM_PALETTES = [
  'bg-[#1E3A8A] text-white border-[#1E3A8A]',
  'bg-[#9A3412] text-white border-[#9A3412]',
  'bg-[#14532D] text-white border-[#14532D]',
  'bg-[#44403C] text-white border-[#44403C]',
];

export function Deco17({
  authors = [
    { name: 'Elena Vance', role: 'Lead Editor' },
    { name: 'Marcus Thorne', role: 'Type Foundry' },
    { name: 'Sora Takahashi', role: 'Layout Systems' },
  ],
}: Deco17Props) {
  return (
    <figure className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#E5E0D5] bg-[#FAF8F4] px-4 py-3.5">
      <div className="flex items-center -space-x-2.5">
        {authors.map((person, index) => {
          const initials = formatInitials(person.name);
          const palette = MONOGRAM_PALETTES[index % MONOGRAM_PALETTES.length];
          return (
            <span
              key={person.name}
              title={`${person.name} — ${person.role}`}
              aria-label={`${person.name}, ${person.role}`}
              className={`w-10 h-10 rounded-full border-2 border-[#FAF8F4] font-serif text-xs font-semibold tracking-wide flex items-center justify-center shadow-xs ${palette}`}
            >
              {initials}
            </span>
          );
        })}
      </div>
      <figcaption className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[#181715] truncate">
          {authors.map((a) => a.name).join(', ')}
        </p>
        <p className="text-xs text-[#57534E]">
          Editorial Contributors · {authors.length} Monograms
        </p>
      </figcaption>
    </figure>
  );
}

export interface Deco18Props {
  heading?: string;
  text?: string;
  surface?: 'white' | 'paper';
}

export function Deco18({
  heading = 'On Paper Weight & Ink Absorption',
  text = 'Uncoated cotton rag paper drinks ink subtly into its fibers, softening crisp hairline serifs into forms that feel organic rather than mechanical. When translating that warmth to luminous glass screens, designers compensate through measured contrast, generous leading, and subtle warm off-white surfaces that reduce halation and preserve sustained reading comfort across long monographs.',
  surface = 'white',
}: Deco18Props) {
  const [expanded, setExpanded] = useState(false);
  const fadeGradient =
    surface === 'paper'
      ? 'from-[#FAF8F4] via-[#FAF8F4]/85 to-transparent'
      : 'from-white via-white/85 to-transparent';

  return (
    <section aria-label={heading} className="space-y-2.5">
      <h4 className="font-serif text-base font-semibold text-[#181715]">
        {heading}
      </h4>
      <div className="relative">
        <p
          className={`text-sm leading-relaxed text-[#44403C] ${
            expanded ? '' : 'max-h-20 overflow-hidden'
          }`}
        >
          {text}
        </p>
        {!expanded && (
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t ${fadeGradient}`}
          />
        )}
      </div>
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((prev) => !prev)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A] hover:text-[#172554] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
      >
        <span>{expanded ? 'Show less' : 'Read more'}</span>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
        )}
      </button>
    </section>
  );
}
