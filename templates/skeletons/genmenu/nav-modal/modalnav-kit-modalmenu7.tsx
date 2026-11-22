'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { ArrowRight, Bookmark, Search, X } from 'lucide-react';

export interface ModalMenu7Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  triggerClassName?: string;
  onSelectRoute?: (href: string, label: string) => void;
}

interface VerticalTabSection {
  id: string;
  tabLabel: string;
  heading: string;
  intro: string;
  links: { title: string; meta: string; href: string }[];
}

const RAIL_SECTIONS: VerticalTabSection[] = [
  {
    id: 'journal',
    tabLabel: 'Journal',
    heading: 'Seasonal Essays & Field Notes',
    intro:
      'Long-form writing from botanists, landscape historians, and craftspeople.',
    links: [
      {
        title: 'Timber Framing in Wet Climates',
        meta: 'Issue 18 · 11 min read',
        href: '#timber-framing',
      },
      {
        title: 'Seed Vaults of the Northern Coast',
        meta: 'Issue 17 · 8 min read',
        href: '#seed-vaults',
      },
      {
        title: 'Natural Lime Plaster Finishes',
        meta: 'Issue 16 · 14 min read',
        href: '#lime-plaster',
      },
      {
        title: 'Notes on Dry-Stone Retaining Walls',
        meta: 'Issue 15 · 9 min read',
        href: '#dry-stone',
      },
    ],
  },
  {
    id: 'monographs',
    tabLabel: 'Monographs',
    heading: 'Printed Editions & Catalogues',
    intro:
      'Archival linen-bound volumes printed on uncoated cotton rag paper.',
    links: [
      {
        title: 'Vol. IV: Alpine Pasture Vernacular',
        meta: 'Hardcover · 240 pages',
        href: '#vol-4',
      },
      {
        title: 'Vol. III: Kiln & Clay Typologies',
        meta: 'Hardcover · 196 pages',
        href: '#vol-3',
      },
      {
        title: 'Vol. II: Coastal Boathouses',
        meta: 'Second Printing · 180 pages',
        href: '#vol-2',
      },
    ],
  },
  {
    id: 'curators',
    tabLabel: 'Curators',
    heading: 'Editorial Fellows & Contributors',
    intro:
      'Meet the researchers, photographers, and archivists shaping our quarterly series.',
    links: [
      {
        title: 'Resident Fellowship Program',
        meta: 'Spring 2027 Applications',
        href: '#fellowship',
      },
      {
        title: 'Contributor Directory',
        meta: '42 authors & photographers',
        href: '#contributors',
      },
      {
        title: 'Editorial Advisory Board',
        meta: 'Institutional partners',
        href: '#advisory-board',
      },
    ],
  },
  {
    id: 'visit',
    tabLabel: 'Visit',
    heading: 'Reading Room & Archive Access',
    intro:
      'Reserve a table in our Portland library or browse regional stockists.',
    links: [
      {
        title: 'Reading Room Hours',
        meta: 'Wed–Sat · 11:00–17:00',
        href: '#reading-hours',
      },
      {
        title: 'Bookshop & Stockists',
        meta: '28 international locations',
        href: '#bookshops',
      },
      {
        title: 'Library Subscriptions',
        meta: 'Academic & studio tiers',
        href: '#subscriptions',
      },
    ],
  },
];

export function ModalMenu7({
  defaultOpen = false,
  triggerLabel = 'Open Vertical Rail',
  triggerClassName,
  onSelectRoute,
}: ModalMenu7Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeId, setActiveId] = useState<string>('journal');
  const [query, setQuery] = useState('');
  const headingId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const currentSection =
    RAIL_SECTIONS.find((s) => s.id === activeId) ?? RAIL_SECTIONS[0];

  const q = query.trim().toLowerCase();
  const searchMatches = q
    ? RAIL_SECTIONS.flatMap((sec) =>
        sec.links
          .filter((link) =>
            `${link.title} ${link.meta} ${sec.tabLabel}`
              .toLowerCase()
              .includes(q)
          )
          .map((link) => ({ ...link, chapter: sec.tabLabel }))
      )
    : [];

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
          'inline-flex items-center gap-2 rounded-lg bg-[#F5F1EA] px-4 py-2.5 text-sm font-medium text-[#14532D] border border-[#D8D0C0] hover:border-[#14532D]/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14532D] whitespace-nowrap shrink-0'
        }
      >
        <Bookmark className="h-4 w-4 text-[#14532D]" aria-hidden="true" />
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
            className="w-full max-w-[660px] max-h-[85vh] flex flex-col overflow-hidden rounded-xl bg-[#F5F1EA] text-[#1C1917] border border-[#D8CFC0] shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4 border-b border-[#E2DACB] px-5 sm:px-6 py-3.5">
              <h2
                id={headingId}
                className="font-serif text-lg font-medium text-[#1C1917]"
              >
                Alder &amp; Field Directory
              </h2>
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close editorial directory"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#D8CFC0] text-[#44403C] hover:bg-[#EAE3D5] hover:text-[#1C1917] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14532D]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center gap-2.5 border-b border-[#E2DACB] bg-[#EFE9DD] px-5 sm:px-6 py-2.5">
              <Search
                className="h-4 w-4 shrink-0 text-[#14532D]"
                aria-hidden="true"
              />
              <label htmlFor={`${headingId}-search`} className="sr-only">
                Search chapters and monographs
              </label>
              <input
                ref={inputRef}
                id={`${headingId}-search`}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search essays, monographs, contributors..."
                className="w-full bg-transparent text-sm text-[#1C1917] placeholder:text-[#78716C] focus:outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
              <div
                role="tablist"
                aria-label="Directory chapters"
                className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible bg-[#EAE3D5] p-3 md:w-44 shrink-0 border-b md:border-b-0 md:border-r border-[#DDD4C4]"
              >
                {RAIL_SECTIONS.map((section) => {
                  const isActive = !q && section.id === currentSection.id;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => {
                        setQuery('');
                        setActiveId(section.id);
                      }}
                      className={`min-h-[42px] rounded-lg px-3.5 py-2 text-left text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14532D] ${
                        isActive
                          ? 'bg-[#14532D] text-[#F5F1EA]'
                          : 'text-[#44403C] hover:bg-[#DFD6C5] hover:text-[#1C1917]'
                      }`}
                    >
                      {section.tabLabel}
                    </button>
                  );
                })}
              </div>

              {q ? (
                <nav
                  aria-label="Search results across all chapters"
                  className="flex-1 p-5 sm:p-6 space-y-4"
                >
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-[#78716C]">
                    Matches Across Chapters ({searchMatches.length})
                  </h3>
                  {searchMatches.length === 0 ? (
                    <p className="py-8 text-center text-sm text-[#57534E]">
                      No entries matched &ldquo;{query}&rdquo;
                    </p>
                  ) : (
                    <ul className="divide-y divide-[#E5DEC9]">
                      {searchMatches.map((item) => (
                        <li key={item.title}>
                          <a
                            href={item.href}
                            onClick={(e) => {
                              e.preventDefault();
                              handleSelect(item.href, item.title);
                            }}
                            className="group flex min-h-[52px] items-center justify-between gap-4 py-3 hover:text-[#14532D] transition-colors"
                          >
                            <div className="min-w-0">
                              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#14532D]">
                                {item.chapter}
                              </span>
                              <span className="block text-sm font-semibold text-[#1C1917] group-hover:text-[#14532D]">
                                {item.title}
                              </span>
                              <span className="block text-xs text-[#78716C]">
                                {item.meta}
                              </span>
                            </div>
                            <ArrowRight
                              className="h-4 w-4 shrink-0 text-[#A8A29E] group-hover:text-[#14532D]"
                              aria-hidden="true"
                            />
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </nav>
              ) : (
                <nav
                  role="tabpanel"
                  aria-label={`${currentSection.tabLabel} links`}
                  className="flex-1 p-5 sm:p-6 space-y-5"
                >
                  <div className="border-b border-[#E2DACB] pb-4">
                    <h3 className="font-serif text-xl font-medium text-[#1C1917]">
                      {currentSection.heading}
                    </h3>
                    <p className="mt-1 text-sm text-[#57534E] leading-relaxed">
                      {currentSection.intro}
                    </p>
                  </div>

                  <ul className="divide-y divide-[#E5DEC9]">
                    {currentSection.links.map((item) => (
                      <li key={item.title}>
                        <a
                          href={item.href}
                          onClick={(e) => {
                            e.preventDefault();
                            handleSelect(item.href, item.title);
                          }}
                          className="group flex min-h-[52px] items-center justify-between gap-4 py-3 hover:text-[#14532D] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14532D] rounded-sm"
                        >
                          <div className="min-w-0">
                            <span className="block text-sm font-semibold text-[#1C1917] group-hover:text-[#14532D] transition-colors">
                              {item.title}
                            </span>
                            <span className="block text-xs text-[#78716C] mt-0.5">
                              {item.meta}
                            </span>
                          </div>
                          <ArrowRight
                            className="h-4 w-4 shrink-0 text-[#A8A29E] group-hover:translate-x-0.5 group-hover:text-[#14532D] transition-all"
                            aria-hidden="true"
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ModalMenu7;
