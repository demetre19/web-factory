import React, { useState } from 'react';
import {
  BookOpen,
  Check,
  Copy,
  CornerDownLeft,
  Feather,
  Sparkles,
} from 'lucide-react';

export function Deco5() {
  return (
    <div className="space-y-3 text-[15px] leading-relaxed text-[#292524]">
      <p>
        Editorial emphasis works best when calibrated to the reading rhythm. A{' '}
        <mark className="bg-[#FEF3C7] text-[#181715] px-1.5 py-0.5 rounded-sm font-medium">
          warm parchment highlighter wash
        </mark>{' '}
        draws immediate focus without harsh neon glare.
      </p>
      <p>
        For scholarly cross-references, prefer a{' '}
        <mark className="bg-transparent text-[#181715] font-medium border-b-2 border-[#1E3A8A]/70 pb-0.5">
          crisp lapis baseline stroke
        </mark>{' '}
        or subtle{' '}
        <mark className="bg-[#EBE6DF] text-[#181715] px-1.5 py-0.5 rounded border border-[#D6CEBE]">
          archival ink tint
        </mark>{' '}
        that preserves line height.
      </p>
    </div>
  );
}

export interface Deco6Props {
  statValue?: string;
  statLabel?: string;
  delta?: string;
}

export function Deco6({
  statValue = '68ch',
  statLabel = 'optimal reading measure',
  delta = '+19% retention',
}: Deco6Props) {
  return (
    <p className="text-[15px] leading-relaxed text-[#292524]">
      Across long-form archival monographs, setting prose at a{' '}
      <strong className="inline-flex items-baseline gap-1.5 px-2 py-0.5 mx-0.5 rounded bg-[#F2EFE9] border border-[#DFD8CA] font-semibold text-[#181715]">
        <data value={statValue} className="font-mono tabular-nums text-[#1E3A8A] font-semibold">
          {statValue}
        </data>
        <span className="text-xs font-medium text-[#57534E]">{statLabel}</span>
        <span className="text-xs font-mono tabular-nums text-[#14532D] font-medium">
          ({delta})
        </span>
      </strong>{' '}
      reduces horizontal eye fatigue during sustained reading sessions.
    </p>
  );
}

export interface Deco7Props {
  term?: string;
  phonetic?: string;
  definition?: string;
}

export function Deco7({
  term = 'leading',
  phonetic = '/ˈlɛdɪŋ/',
  definition = 'The vertical distance between baselines of successive lines of type, named for the strips of lead once placed between metal rows.',
}: Deco7Props) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hovered || focused || pinned;

  return (
    <div className="relative text-[15px] leading-relaxed text-[#292524]">
      <p>
        Careful{' '}
        <span
          className="relative inline-block"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <button
            type="button"
            aria-expanded={open}
            aria-label={`Definition of ${term}`}
            onClick={() => setPinned((prev) => !prev)}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              setPinned(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setPinned(false);
                setHovered(false);
                setFocused(false);
              }
            }}
            className="inline-flex items-baseline font-medium text-[#1E3A8A] border-b border-dotted border-[#1E3A8A] hover:text-[#172554] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] cursor-help transition-colors"
          >
            <dfn className="not-italic">{term}</dfn>
          </button>
          {open && (
            <span
              role="tooltip"
              className="absolute left-0 sm:left-1/2 sm:-translate-x-1/2 bottom-full mb-2.5 z-30 w-64 sm:w-72 rounded-lg border border-[#D6CEBE] bg-[#FFFFFF] p-3.5 text-left shadow-md"
            >
              <span className="flex items-baseline justify-between gap-2 mb-1">
                <span className="font-serif font-semibold text-sm text-[#181715]">
                  {term}
                </span>
                <span className="font-mono text-xs text-[#78716C]">{phonetic}</span>
              </span>
              <span className="block text-xs leading-relaxed text-[#44403C]">
                {definition}
              </span>
            </span>
          )}
        </span>{' '}
        allows ascenders and descenders to breathe without colliding across adjacent lines.
      </p>
      <p className="mt-2 text-xs text-[#78716C]">
        Click or hover the dotted-underline term above to inspect its glossary card.
      </p>
    </div>
  );
}

export function Deco9() {
  return (
    <p className="text-[15px] leading-loose text-[#292524]">
      Modern specimen sheets pair{' '}
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mx-0.5 rounded-md bg-[#F2EFE9] border border-[#DFD8CA] text-xs font-medium text-[#181715] align-baseline whitespace-nowrap">
        <Feather className="w-3.5 h-3.5 text-[#9A3412]" aria-hidden="true" />
        <span>Editorial Serif</span>
      </span>{' '}
      for display voice with{' '}
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mx-0.5 rounded-md bg-[#EFF6FF] border border-[#BFDBFE] text-xs font-medium text-[#1E3A8A] align-baseline whitespace-nowrap">
        <BookOpen className="w-3.5 h-3.5 text-[#1E3A8A]" aria-hidden="true" />
        <span>Archival Measure</span>
      </span>{' '}
      and{' '}
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mx-0.5 rounded-md bg-[#F0FDF4] border border-[#BBF7D0] text-xs font-medium text-[#14532D] align-baseline whitespace-nowrap">
        <Sparkles className="w-3.5 h-3.5 text-[#14532D]" aria-hidden="true" />
        <span>Optical Kerning</span>
      </span>{' '}
      inside running paragraphs.
    </p>
  );
}

interface FootnoteItem {
  id: number;
  label: string;
  citation: string;
}

const FOOTNOTES: FootnoteItem[] = [
  {
    id: 1,
    label: 'Jan Tschichold',
    citation: 'Tschichold, Jan. The Form of the Book: Essays on the Morality of Good Design. Hartley & Marks, 1991.',
  },
  {
    id: 2,
    label: 'Canonical Proportions',
    citation: 'The Van de Graaf canon divides a double-page spread into ninths to derive balanced inner and outer margins.',
  },
];

export function Deco10() {
  const [activeNote, setActiveNote] = useState<number>(1);

  return (
    <div className="space-y-4">
      <p className="text-[15px] leading-relaxed text-[#292524]">
        Classical book design relied on proportional grids codified by master typographers
        <sup className="ml-0.5 align-super">
          <button
            type="button"
            onClick={() => setActiveNote(1)}
            aria-label="Inspect footnote 1"
            aria-pressed={activeNote === 1}
            className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded font-mono text-[11px] leading-none font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#1E3A8A] ${
              activeNote === 1
                ? 'bg-[#1E3A8A] text-white'
                : 'bg-[#EBE6DF] text-[#1E3A8A] hover:bg-[#DFD8CA]'
            }`}
          >
            [1]
          </button>
        </sup>
        , establishing harmony across facing pages through canonical margin ratios
        <sup className="ml-0.5 align-super">
          <button
            type="button"
            onClick={() => setActiveNote(2)}
            aria-label="Inspect footnote 2"
            aria-pressed={activeNote === 2}
            className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded font-mono text-[11px] leading-none font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#1E3A8A] ${
              activeNote === 2
                ? 'bg-[#1E3A8A] text-white'
                : 'bg-[#EBE6DF] text-[#1E3A8A] hover:bg-[#DFD8CA]'
            }`}
          >
            [2]
          </button>
        </sup>
        .
      </p>

      <aside
        aria-label="Endnotes"
        className="border-t border-[#E5E0D5] pt-3 text-xs text-[#57534E]"
      >
        <ol className="space-y-2">
          {FOOTNOTES.map((note) => {
            const isSelected = activeNote === note.id;
            return (
              <li
                key={note.id}
                className={`flex items-start gap-2 rounded-md p-2 transition-colors ${
                  isSelected ? 'bg-[#F2EFE9] text-[#181715]' : 'text-[#57534E]'
                }`}
              >
                <span className="font-mono font-semibold text-[#1E3A8A] shrink-0">
                  [{note.id}]
                </span>
                <span className="flex-1 leading-relaxed">{note.citation}</span>
                <button
                  type="button"
                  onClick={() => setActiveNote(note.id)}
                  aria-label={`Highlight footnote ${note.id}`}
                  className="text-[#78716C] hover:text-[#181715] p-0.5 rounded focus-visible:outline-2 focus-visible:outline-[#1E3A8A]"
                >
                  <CornerDownLeft className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ol>
      </aside>
    </div>
  );
}

export function Deco19() {
  const [copied, setCopied] = useState(false);
  const sampleToken = 'font-variant-numeric: tabular-nums;';

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(sampleToken).catch(() => {});
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="space-y-3">
      <p className="text-[15px] leading-relaxed text-[#292524]">
        Ensure column alignment in specimen tables by applying{' '}
        <code className="font-mono text-[13px] bg-[#F2EFE9] text-[#9A3412] border border-[#DFD8CA] px-1.5 py-0.5 rounded">
          tabular-nums
        </code>{' '}
        alongside{' '}
        <code className="font-mono text-[13px] bg-[#F2EFE9] text-[#1E3A8A] border border-[#DFD8CA] px-1.5 py-0.5 rounded">
          text-wrap: balance
        </code>{' '}
        on multi-line display headings.
      </p>
      <div className="flex items-center justify-between gap-2 rounded-lg border border-[#E5E0D5] bg-[#FAF8F4] px-3 py-2">
        <code className="font-mono text-xs text-[#181715] truncate">
          {sampleToken}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy CSS inline token"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-[#181715] bg-white border border-[#D6CEBE] hover:bg-[#F2EFE9] transition-colors shrink-0 whitespace-nowrap"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#14532D]" aria-hidden="true" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#57534E]" aria-hidden="true" />
              <span>Copy CSS</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function Deco20() {
  const [lastKey, setLastKey] = useState<string>('⌘ + K');

  const shortcuts = [
    { label: 'Command Palette', keys: ['⌘', 'K'] },
    { label: 'Submit Draft', keys: ['Shift', 'Enter'] },
    { label: 'Close Inspector', keys: ['Esc'] },
  ];

  return (
    <div className="space-y-3">
      <p className="text-[15px] leading-relaxed text-[#292524]">
        Press{' '}
        <kbd className="inline-flex items-center justify-center min-w-6 px-1.5 py-0.5 font-mono text-xs font-medium text-[#181715] bg-white border border-[#C7BFB1] border-b-2 rounded shadow-[0_1px_0_0_#D6CEBE]">
          ⌘
        </kbd>
        <span className="mx-1 text-xs text-[#78716C]" aria-hidden="true">
          +
        </span>
        <kbd className="inline-flex items-center justify-center min-w-6 px-1.5 py-0.5 font-mono text-xs font-medium text-[#181715] bg-white border border-[#C7BFB1] border-b-2 rounded shadow-[0_1px_0_0_#D6CEBE]">
          K
        </kbd>{' '}
        to jump straight to any specimen, or click a shortcut below to test keycap states.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {shortcuts.map((shortcut) => {
          const chord = shortcut.keys.join(' + ');
          const active = lastKey === chord;
          return (
            <button
              key={shortcut.label}
              type="button"
              onClick={() => setLastKey(chord)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all cursor-pointer whitespace-nowrap ${
                active
                  ? 'border-[#1E3A8A] bg-[#EFF6FF] text-[#1E3A8A]'
                  : 'border-[#E5E0D5] bg-[#FAF8F4] text-[#44403C] hover:border-[#C7BFB1]'
              }`}
            >
              <span>{shortcut.label}</span>
              <span className="inline-flex items-center gap-1">
                {shortcut.keys.map((k, idx) => (
                  <React.Fragment key={k}>
                    {idx > 0 && <span className="text-[#78716C]">+</span>}
                    <kbd
                      className={`px-1.5 py-0.5 font-mono text-[11px] rounded border transition-transform ${
                        active
                          ? 'bg-white border-[#1E3A8A]/40 border-b translate-y-px text-[#1E3A8A]'
                          : 'bg-white border-[#C7BFB1] border-b-2 text-[#181715]'
                      }`}
                    >
                      {k}
                    </kbd>
                  </React.Fragment>
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
