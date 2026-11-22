import React, { useState } from 'react';
import { formatInitials } from '../../utils/specimenCatalog';

export interface Deco1Props {
  quote?: string;
  author?: string;
  source?: string;
}

export function Deco1({
  quote = 'Good typography is invisible until it invites the reader to pause and linger over a well-turned sentence.',
  author = 'Beatrice Warde',
  source = 'The Crystal Goblet, 1955',
}: Deco1Props) {
  return (
    <figure className="relative pt-6 pb-2 px-4 sm:px-6">
      <span
        aria-hidden="true"
        className="pointer-events-none select-none font-serif text-7xl sm:text-8xl leading-none text-[#1E3A8A]/20 absolute -top-2 left-2 sm:left-3"
      >
        &ldquo;
      </span>
      <blockquote className="relative z-10">
        <p className="font-serif text-lg sm:text-xl leading-relaxed text-[#181715]">
          {quote}
        </p>
      </blockquote>
      <figcaption className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#57534E]">
        <span aria-hidden="true" className="inline-block w-5 h-px bg-[#C7BFB1]" />
        <cite className="not-italic font-semibold text-[#181715]">{author}</cite>
        {source && (
          <>
            <span aria-hidden="true">·</span>
            <span>{source}</span>
          </>
        )}
      </figcaption>
    </figure>
  );
}

export interface Deco2Props {
  marginLabel?: string;
  quote?: string;
  author?: string;
  source?: string;
}

export function Deco2({
  marginLabel = 'Marginalia · Sec. II',
  quote = 'Margins are not wasted space; they are the breathing room that frames the reader’s attention and gives cadence to the page.',
  author = 'Robert Bringhurst',
  source = 'The Elements of Typographic Style',
}: Deco2Props) {
  return (
    <figure className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-3 sm:gap-5 items-start">
      <div className="pt-1 text-xs font-medium text-[#78716C] sm:text-right leading-snug">
        <span>{marginLabel}</span>
      </div>
      <div className="border-l-4 border-[#1E3A8A] pl-4 sm:pl-5 py-1 bg-[#FAF8F4]/70">
        <blockquote>
          <p className="font-serif text-base sm:text-lg leading-relaxed text-[#181715]">
            {quote}
          </p>
        </blockquote>
        <figcaption className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#57534E]">
          <cite className="not-italic font-semibold text-[#181715]">{author}</cite>
          {source && (
            <>
              <span aria-hidden="true">·</span>
              <span>{source}</span>
            </>
          )}
        </figcaption>
      </div>
    </figure>
  );
}

export interface Deco3Props {
  quote?: string;
  author?: string;
  role?: string;
  avatarSrc?: string;
}

export function Deco3({
  quote = 'When layout proportions obey optical weight rather than rigid symmetry, prose acquires physical poise on the screen.',
  author = 'Clara Lindqvist',
  role = 'Principal Type Director, Basel',
  avatarSrc = '/src/assets/images/editorial_author_portrait_1795323009831.jpg',
}: Deco3Props) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <blockquote className="rounded-xl border border-[#E5E0D5] bg-[#FAF8F4] p-5 sm:p-6">
      <p className="font-serif text-base sm:text-lg leading-relaxed text-[#181715]">
        &ldquo;{quote}&rdquo;
      </p>
      <footer className="mt-5 pt-4 border-t border-[#E5E0D5] flex items-center gap-3.5">
        {!imgFailed && avatarSrc ? (
          <img
            src={avatarSrc}
            alt={`Portrait of ${author}`}
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="w-11 h-11 rounded-full object-cover border border-[#D6CEBE] shrink-0"
          />
        ) : (
          <span
            aria-hidden="true"
            className="w-11 h-11 rounded-full bg-[#EBE6DF] border border-[#D6CEBE] text-[#181715] font-serif font-semibold text-sm flex items-center justify-center shrink-0"
          >
            {formatInitials(author)}
          </span>
        )}
        <div className="min-w-0">
          <cite className="block not-italic text-sm font-semibold text-[#181715] truncate">
            {author}
          </cite>
          <span className="block text-xs text-[#57534E] truncate">{role}</span>
        </div>
      </footer>
    </blockquote>
  );
}

export interface Deco4Props {
  quote?: string;
  kicker?: string;
}

export function Deco4({
  quote = 'Every rule, fleuron, and indent exists to clarify thought—never to compete with it.',
  kicker = 'Chapter IV Pull Quote',
}: Deco4Props) {
  return (
    <aside aria-label="Pull quote" className="py-5 px-2 sm:px-6 text-center">
      <div className="flex items-center justify-center gap-3 mb-4" aria-hidden="true">
        <span className="h-px w-12 bg-[#D6CEBE]" />
        <span className="font-serif text-sm text-[#9A3412]">❦</span>
        <span className="h-px w-12 bg-[#D6CEBE]" />
      </div>
      <blockquote>
        <p className="font-serif italic text-xl sm:text-2xl leading-snug text-[#181715] max-w-xl mx-auto text-balance">
          {quote}
        </p>
      </blockquote>
      {kicker && (
        <p className="mt-3 text-xs tracking-wide text-[#78716C]">{kicker}</p>
      )}
      <div className="mt-4 h-px w-24 mx-auto bg-[#D6CEBE]" aria-hidden="true" />
    </aside>
  );
}
