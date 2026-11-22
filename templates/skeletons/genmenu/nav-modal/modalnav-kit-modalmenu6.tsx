'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { ArrowUpRight, Compass, Search, Sparkles, X } from 'lucide-react';

export interface ModalMenu6Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  triggerClassName?: string;
  onSelectRoute?: (href: string, label: string) => void;
}

interface SpotlightNavGroup {
  heading: string;
  items: { label: string; note: string; href: string }[];
}

const GALLERY_GROUPS: SpotlightNavGroup[] = [
  {
    heading: 'Exhibitions',
    items: [
      {
        label: 'Current Viewing Rooms',
        note: 'Four concurrent sculptural installations',
        href: '#viewing-rooms',
      },
      {
        label: 'Upcoming Vernissages',
        note: 'Winter calendar · Paris & Kyoto',
        href: '#vernissages',
      },
      {
        label: 'Permanent Collection',
        note: 'Post-war metalwork and ceramics',
        href: '#collection',
      },
      {
        label: 'Public Commissions',
        note: 'Site-specific architectural works',
        href: '#commissions',
      },
    ],
  },
  {
    heading: 'Archives & Study',
    items: [
      {
        label: 'Artist Monographs',
        note: 'Biographies & studio essays',
        href: '#monographs',
      },
      {
        label: 'Provenance Records',
        note: 'Verified cataloguing index',
        href: '#provenance',
      },
      {
        label: 'Curatorial Talks',
        note: 'Recorded symposia & panels',
        href: '#talks',
      },
      {
        label: 'Private Appointments',
        note: 'Schedule collector viewings',
        href: '#appointments',
      },
    ],
  },
];

export function ModalMenu6({
  defaultOpen = false,
  triggerLabel = 'Open Obsidian Spotlight',
  triggerClassName,
  onSelectRoute,
}: ModalMenu6Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const headingId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const q = query.trim().toLowerCase();
  const filteredGroups = GALLERY_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      !q
        ? true
        : `${item.label} ${item.note} ${group.heading}`
            .toLowerCase()
            .includes(q)
    ),
  })).filter((group) => group.items.length > 0);

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
          'inline-flex items-center gap-2 rounded-lg bg-[#121110] px-4 py-2.5 text-sm font-medium text-[#F5F2EB] border border-[#2C2823] hover:border-amber-500/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 whitespace-nowrap shrink-0'
        }
      >
        <Compass className="h-4 w-4 text-amber-400" aria-hidden="true" />
        <span>{triggerLabel}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeMenu();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            className="w-full max-w-[700px] max-h-[85vh] flex flex-col overflow-hidden rounded-xl bg-[#121110] text-[#F5F2EB] border border-[#2C2823] shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4 border-b border-[#25221E] px-4 sm:px-6 py-3.5 sm:py-4">
              <div className="flex items-center gap-3">
                <h2
                  id={headingId}
                  className="font-serif text-lg font-medium tracking-tight text-[#F5F2EB]"
                >
                  Gallery Navigation
                </h2>
                <span className="hidden sm:inline text-xs text-[#9C9488]">
                  ·
                </span>
                <span className="hidden sm:inline text-xs text-[#9C9488]">
                  Autumn / Winter 2026
                </span>
              </div>
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close gallery navigation"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#2C2823] text-[#B8AFA2] hover:bg-[#1E1B18] hover:text-[#F5F2EB] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center gap-2.5 border-b border-[#25221E] bg-[#161412] px-4 sm:px-6 py-2.5">
              <Search
                className="h-4 w-4 shrink-0 text-amber-400/80"
                aria-hidden="true"
              />
              <label htmlFor={`${headingId}-search`} className="sr-only">
                Search gallery exhibitions and archives
              </label>
              <input
                ref={inputRef}
                id={`${headingId}-search`}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search exhibitions, monographs, provenance..."
                className="w-full bg-transparent text-sm text-[#F5F2EB] placeholder:text-[#7A7267] focus:outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12">
              <nav
                aria-label="Gallery exhibitions and archives"
                className="md:col-span-7 p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 border-b md:border-b-0 md:border-r border-[#25221E]"
              >
                {filteredGroups.length === 0 ? (
                  <div className="sm:col-span-2 py-8 text-center text-sm text-[#9C9488]">
                    No gallery routes matched &ldquo;{query}&rdquo;
                  </div>
                ) : (
                  filteredGroups.map((group) => (
                    <section key={group.heading} aria-label={group.heading}>
                      <h3 className="text-xs font-semibold uppercase tracking-widest text-amber-400/90 mb-2.5 sm:mb-3">
                        {group.heading}
                      </h3>
                      <ul className="space-y-1.5 sm:space-y-2.5">
                        {group.items.map((item) => (
                          <li key={item.label}>
                            <a
                              href={item.href}
                              onClick={(e) => {
                                e.preventDefault();
                                handleSelect(item.href, item.label);
                              }}
                              className="group block rounded-lg p-2 -mx-2 hover:bg-[#1C1916] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                            >
                              <span className="flex items-center justify-between gap-2 text-sm font-medium text-[#F5F2EB] group-hover:text-amber-300 transition-colors">
                                <span>{item.label}</span>
                                <ArrowUpRight
                                  className="h-3.5 w-3.5 shrink-0 text-[#7A7267] group-hover:text-amber-400 transition-colors"
                                  aria-hidden="true"
                                />
                              </span>
                              <span className="mt-0.5 block text-xs text-[#9C9488] leading-snug">
                                {item.note}
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))
                )}
              </nav>

              <aside
                aria-label="Featured exhibition spotlight"
                className="md:col-span-5 bg-[#191714] p-4 sm:p-6 flex flex-col justify-between gap-4 sm:gap-5"
              >
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-400">
                    Featured Retrospective
                  </p>
                  <div className="mt-3 rounded-lg border border-[#2E2922] bg-gradient-to-br from-[#26211B] via-[#1B1814] to-[#121110] p-4">
                    <Sparkles
                      className="h-5 w-5 text-amber-400 mb-3"
                      aria-hidden="true"
                    />
                    <h3 className="font-serif text-xl font-medium text-[#F5F2EB] leading-snug">
                      Cast Bronze &amp; Quiet Form
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-[#B8AFA2]">
                      Twenty-four monumental studies examining patination, shadow
                      geometry, and acoustic resonance in Main Hall B.
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleSelect('#cast-bronze', 'Cast Bronze & Quiet Form')
                    }
                    className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-[#121110] hover:bg-amber-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                  >
                    <span>Explore Exhibition</span>
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <a
                    href="#visitor-hours"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSelect('#visitor-hours', 'Visitor Hours & Tickets');
                    }}
                    className="inline-flex min-h-[38px] w-full items-center justify-center text-xs font-medium text-[#B8AFA2] hover:text-[#F5F2EB] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg"
                  >
                    Hours: Tue–Sun, 10:00–18:00 · Free Entry
                  </a>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ModalMenu6;
