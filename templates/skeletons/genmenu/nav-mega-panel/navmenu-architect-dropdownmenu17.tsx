'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronDown, Search, X } from 'lucide-react';

export interface DropdownMenu17Props {
  onNavigate?: (label: string) => void;
  forceOpen?: boolean;
}

const BROADSHEET_COLUMNS = [
  {
    heading: 'Politics & Policy',
    links: [
      { label: 'Parliamentary Dispatch', href: '#parliament' },
      { label: 'Trade & Tariffs Ledger', href: '#tariffs' },
      { label: 'Municipal Infrastructure', href: '#municipal' },
      { label: 'Judicial Review', href: '#judicial' },
    ],
  },
  {
    heading: 'Culture & Letters',
    links: [
      { label: 'Sunday Book Review', href: '#books' },
      { label: 'Architecture Criticism', href: '#architecture' },
      { label: 'Cinema & Stage', href: '#cinema' },
      { label: 'Longform Essays', href: '#essays' },
    ],
  },
  {
    heading: 'Science & Climate',
    links: [
      { label: 'Grid & Energy Transition', href: '#energy' },
      { label: 'Oceanography Notes', href: '#oceans' },
      { label: 'Public Health Data', href: '#health' },
      { label: 'Space & Observatories', href: '#observatories' },
    ],
  },
];

export function DropdownMenu17({ onNavigate, forceOpen }: DropdownMenu17Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [query, setQuery] = useState('');
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  const openVisible = forceOpen ?? isOpen;
  const q = query.trim().toLowerCase();
  const filteredCols = BROADSHEET_COLUMNS.map((col) => ({
    ...col,
    links: col.links.filter((l) => l.label.toLowerCase().includes(q)),
  }));

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsPinned(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setIsPinned(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const cancelClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  };

  const handleTriggerEnter = () => {
    cancelClose();
    setIsOpen(true);
  };

  const handleRegionLeave = () => {
    if (isPinned) return;
    if (headerRef.current?.contains(document.activeElement)) return;
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 130);
  };

  const handleTriggerClick = () => {
    if (!isOpen || !isPinned) {
      setIsOpen(true);
      setIsPinned(true);
    } else {
      setIsOpen(false);
      setIsPinned(false);
    }
  };

  return (
    <header
      ref={headerRef}
      onMouseLeave={handleRegionLeave}
      className="relative z-20 w-full border-b-2 border-zinc-900 bg-[#FAF8F3] text-zinc-900"
    >
      {/* Masthead Row 1 */}
      <div className="mx-auto flex max-w-6xl items-center justify-between border-b border-zinc-300 px-6 py-3">
        <span className="text-xs font-medium text-zinc-500">Weekend Broadsheet</span>
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.('Chronicle Press Masthead');
          }}
          className="font-display text-2xl font-bold tracking-tight text-zinc-950 whitespace-nowrap"
        >
          Chronicle Press
        </a>
        <span className="text-xs font-medium text-zinc-500">Print &amp; Digital</span>
      </div>

      {/* Masthead Row 2: Section Nav + Search + Trigger */}
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-6 px-6">
        <nav aria-label="Primary Editions" className="flex items-center gap-6">
          <ul className="flex items-center gap-6 text-xs font-semibold tracking-wide text-zinc-700">
            <li>
              <a
                href="#front-page"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Front Page');
                }}
                className="hover:text-zinc-950 whitespace-nowrap"
              >
                Front Page
              </a>
            </li>
            <li>
              <a
                href="#opinion"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Opinion');
                }}
                className="hover:text-zinc-950 whitespace-nowrap"
              >
                Opinion
              </a>
            </li>
            <li>
              <a
                href="#podcasts"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Audio Editions');
                }}
                className="hover:text-zinc-950 whitespace-nowrap"
              >
                Audio
              </a>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          <div className="relative hidden w-60 sm:block">
            <label htmlFor="chronicle-search" className="sr-only">
              Search Chronicle archive
            </label>
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              id="chronicle-search"
              type="search"
              value={query}
              onFocus={() => {
                setIsOpen(true);
                setIsPinned(true);
              }}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
                setIsPinned(true);
              }}
              placeholder="Search sections & archive..."
              className="w-full border border-zinc-300 bg-white py-1 pl-8 pr-7 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div onMouseEnter={handleTriggerEnter}>
            <button
              type="button"
              aria-expanded={openVisible}
              aria-haspopup="true"
              onClick={handleTriggerClick}
              className={`inline-flex items-center gap-1.5 border px-3 py-1 text-xs font-bold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 ${
                openVisible
                  ? 'border-zinc-900 bg-zinc-900 text-[#FAF8F3]'
                  : 'border-zinc-400 bg-white text-zinc-900 hover:border-zinc-900'
              }`}
            >
              <span>Sections</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-150 ${
                  openVisible ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {openVisible && (
        <div
          onMouseEnter={cancelClose}
          className="absolute left-0 right-0 top-full z-30 w-full border-b-2 border-zinc-900 bg-[#FAF8F3] shadow-xl shadow-zinc-900/10"
        >
          <div className="mx-auto grid max-w-6xl grid-cols-4 divide-x divide-zinc-300 px-6 py-7">
            {filteredCols.map((col, idx) => (
              <div
                key={col.heading}
                className={idx === 0 ? 'pr-6' : 'px-6'}
              >
                <h3 className="mb-3 border-b border-zinc-900 pb-1.5 text-xs font-bold tracking-wide text-zinc-900">
                  {col.heading}
                </h3>
                {col.links.length === 0 ? (
                  <p className="text-xs text-zinc-500">No articles match.</p>
                ) : (
                  <ul className="divide-y divide-zinc-200/90">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate?.(link.label);
                            setIsOpen(false);
                            setIsPinned(false);
                          }}
                          className="group flex items-center justify-between py-2 text-sm font-medium text-zinc-800 hover:text-zinc-950"
                        >
                          <span className="group-hover:underline underline-offset-4">{link.label}</span>
                          <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400 opacity-0 group-hover:opacity-100" />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            <div className="pl-6">
              <h3 className="mb-3 border-b border-zinc-900 pb-1.5 text-xs font-bold tracking-wide text-zinc-900">
                Special Essay
              </h3>
              <div className="flex h-[calc(100%-2.25rem)] flex-col justify-between bg-gradient-to-br from-stone-800 via-zinc-900 to-amber-950 p-5 text-[#FAF8F3]">
                <div>
                  <p className="text-xs font-medium text-amber-200">Autumn Monograph</p>
                  <p className="mt-1.5 font-display text-base font-bold leading-snug">
                    How Municipal Railways Reshaped Port Cities
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-stone-300">
                    Cartographic archive and photographic survey from twelve harbors.
                  </p>
                </div>
                <a
                  href="#monograph"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate?.('Read Autumn Monograph');
                    setIsOpen(false);
                    setIsPinned(false);
                  }}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-amber-200 hover:underline"
                >
                  <span>Read Full Essay</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default DropdownMenu17;
