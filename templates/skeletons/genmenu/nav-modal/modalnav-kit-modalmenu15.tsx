'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  GalleryHorizontalEnd,
  Search,
  X,
} from 'lucide-react';

export interface ModalMenu15Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  triggerClassName?: string;
  onSelectRoute?: (href: string, label: string) => void;
}

interface DeckCard {
  id: string;
  edition: string;
  title: string;
  summary: string;
  href: string;
  tone: string;
}

const FEATURED_DECK: DeckCard[] = [
  {
    id: 'card-1',
    edition: 'Collection 01',
    title: 'Stoneware & Salt Glaze',
    summary: 'Wood-fired vessels and tactile table objects from Kyoto kilns.',
    href: '#stoneware',
    tone: 'bg-[#EDE6DA]',
  },
  {
    id: 'card-2',
    edition: 'Collection 02',
    title: 'Woven Linen Textiles',
    summary: 'Unbleached Belgian flax throws, napkins, and curtain lengths.',
    href: '#linen',
    tone: 'bg-[#E5EAE4]',
  },
  {
    id: 'card-3',
    edition: 'Collection 03',
    title: 'Hand-Turned Ash',
    summary: 'Architectural stools and serving boards in oiled timber.',
    href: '#ash-timber',
    tone: 'bg-[#ECE4DF]',
  },
  {
    id: 'card-4',
    edition: 'Collection 04',
    title: 'Cast Brass Hardware',
    summary: 'Unlacquered cabinet pulls and architectural door levers.',
    href: '#brass',
    tone: 'bg-[#EAE6DC]',
  },
];

const QUICK_INDEX = [
  { label: 'Atelier Locations', href: '#ateliers' },
  { label: 'Trade Program', href: '#trade' },
  { label: 'Care & Patina Guide', href: '#care-guide' },
  { label: 'Private Orders', href: '#private-orders' },
];

export function ModalMenu15({
  defaultOpen = false,
  triggerLabel = 'Open Card-Deck Strip',
  triggerClassName,
  onSelectRoute,
}: ModalMenu15Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const headingId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const deckRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const q = query.trim().toLowerCase();
  const filteredCards = FEATURED_DECK.filter((c) =>
    !q ? true : `${c.title} ${c.summary} ${c.edition}`.toLowerCase().includes(q)
  );
  const filteredQuick = QUICK_INDEX.filter((item) =>
    !q ? true : item.label.toLowerCase().includes(q)
  );

  const scrollDeck = (direction: -1 | 1) => {
    deckRef.current?.scrollBy({ left: direction * 240, behavior: 'smooth' });
  };

  const closeMenu = () => {
    setIsOpen(false);
    setQuery('');
    setTimeout(() => triggerRef.current?.focus(), 0);
  };

  const handleSelect = (href: string, label: string) => {
    onSelectRoute?.(href, label);
    closeMenu();
  };

  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add('overflow-hidden');
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 10);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.classList.remove('overflow-hidden');
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          triggerClassName ??
          'inline-flex items-center gap-2 rounded-lg bg-[#FBF9F5] px-4 py-2.5 text-sm font-serif font-medium text-[#292524] border border-[#D8CFC0] hover:border-[#78350F]/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78350F] whitespace-nowrap shrink-0'
        }
      >
        <GalleryHorizontalEnd
          className="h-4 w-4 text-[#78350F]"
          aria-hidden="true"
        />
        <span>{triggerLabel}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 backdrop-blur-xs p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeMenu();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            className="w-full max-w-[680px] max-h-[85vh] flex flex-col overflow-hidden rounded-xl bg-[#FBF9F5] text-[#1C1917] border border-[#DED5C5] shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4 border-b border-[#E6DEC8] px-6 py-4">
              <h2
                id={headingId}
                className="font-serif text-lg font-medium text-[#1C1917]"
              >
                Seasonal Collections &amp; Index
              </h2>
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close collections deck"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#DED5C5] text-[#44403C] hover:bg-[#EFE8DA] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78350F]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center gap-2.5 border-b border-[#E6DEC8] bg-[#F4EFE5] px-6 py-2.5">
              <Search
                className="h-4 w-4 shrink-0 text-[#78350F]"
                aria-hidden="true"
              />
              <label htmlFor={`${headingId}-search`} className="sr-only">
                Search collections and ateliers
              </label>
              <input
                ref={inputRef}
                id={`${headingId}-search`}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search collections, materials, ateliers..."
                className="w-full bg-transparent text-sm text-[#1C1917] placeholder:text-[#8C8377] focus:outline-none"
              />
            </div>

            <nav
              aria-label="Seasonal collections and quick links"
              className="flex-1 overflow-y-auto p-6 space-y-6"
            >
              {filteredCards.length === 0 && filteredQuick.length === 0 ? (
                <div className="py-10 text-center text-sm text-[#57534E]">
                  No collections matched &ldquo;{query}&rdquo;
                </div>
              ) : (
                <>
                  {filteredCards.length > 0 && (
                    <section aria-label="Featured Collections">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-[#78716C]">
                          Featured Editions
                        </h3>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => scrollDeck(-1)}
                            aria-label="Scroll collections left"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#DED5C5] text-[#44403C] hover:bg-[#EFE8DA]"
                          >
                            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => scrollDeck(1)}
                            aria-label="Scroll collections right"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#DED5C5] text-[#44403C] hover:bg-[#EFE8DA]"
                          >
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <ul
                        ref={deckRef}
                        className="flex gap-3.5 overflow-x-auto snap-x snap-mandatory pb-2"
                      >
                        {filteredCards.map((card) => (
                          <li
                            key={card.id}
                            className="w-[220px] shrink-0 snap-start"
                          >
                            <a
                              href={card.href}
                              onClick={(e) => {
                                e.preventDefault();
                                handleSelect(card.href, card.title);
                              }}
                              className={`group flex h-full flex-col justify-between rounded-xl border border-[#DDD3C1] p-4 transition-colors hover:border-[#78350F] ${card.tone}`}
                            >
                              <div>
                                <span className="font-mono text-[11px] text-[#78350F]">
                                  {card.edition}
                                </span>
                                <h4 className="mt-1.5 font-serif text-lg font-medium text-[#1C1917] leading-snug">
                                  {card.title}
                                </h4>
                                <p className="mt-1.5 text-xs leading-relaxed text-[#57534E]">
                                  {card.summary}
                                </p>
                              </div>
                              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#78350F]">
                                <span>Browse</span>
                                <ArrowRight
                                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                                  aria-hidden="true"
                                />
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {filteredQuick.length > 0 && (
                    <section
                      aria-label="Atelier Services"
                      className="border-t border-[#E6DEC8] pt-5"
                    >
                      <h3 className="text-xs font-semibold uppercase tracking-widest text-[#78716C] mb-3">
                        Atelier &amp; Trade Services
                      </h3>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {filteredQuick.map((item) => (
                          <li key={item.label}>
                            <a
                              href={item.href}
                              onClick={(e) => {
                                e.preventDefault();
                                handleSelect(item.href, item.label);
                              }}
                              className="flex min-h-[42px] items-center justify-between rounded-lg border border-[#E5DEC9] bg-white px-3.5 py-2 text-sm font-medium text-[#292524] hover:border-[#78350F] transition-colors"
                            >
                              <span>{item.label}</span>
                              <ArrowRight
                                className="h-3.5 w-3.5 text-[#A8A29E]"
                                aria-hidden="true"
                              />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

export default ModalMenu15;
