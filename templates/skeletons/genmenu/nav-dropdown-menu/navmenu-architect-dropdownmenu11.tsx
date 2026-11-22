'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

export interface DropdownMenu11Props {
  onNavigate?: (label: string) => void;
  forceOpen?: boolean;
}

const EXHIBITIONS = [
  { num: '01', label: 'Brutalist Timber Studies', room: 'North Wing', href: '#timber' },
  { num: '02', label: 'Monochrome Lithographs', room: 'Gallery B', href: '#lithographs' },
  { num: '03', label: 'Kinetic Glassworks', room: 'Atrium', href: '#glassworks' },
  { num: '04', label: 'Post-War Ceramic Forms', room: 'East Vault', href: '#ceramics' },
  { num: '05', label: 'Acoustic Light Sculptures', room: 'Basement', href: '#acoustic-light' },
  { num: '06', label: 'Archival Type Specimens', room: 'Reading Room', href: '#specimens' },
];

export function DropdownMenu11({ onNavigate, forceOpen }: DropdownMenu11Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerWrapRef = useRef<HTMLDivElement>(null);

  const openVisible = forceOpen ?? isOpen;
  const q = query.trim().toLowerCase();
  const filtered = EXHIBITIONS.filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      item.room.toLowerCase().includes(q) ||
      item.num.includes(q),
  );

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (headerWrapRef.current && !headerWrapRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsPinned(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setIsPinned(false);
        setSearchExpanded(false);
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

  const handleMouseEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (isPinned) return;
    if (headerWrapRef.current?.contains(document.activeElement)) return;
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
    <header className="relative z-20 w-full border-b border-stone-300/80 bg-[#FAF8F4] text-stone-900">
      <div
        ref={headerWrapRef}
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6"
      >
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.('Atelier Vance Home');
          }}
          className="font-display text-xl font-medium tracking-tight text-stone-950 whitespace-nowrap shrink-0"
        >
          Atelier Vance
        </a>

        <nav aria-label="Primary Navigation" className="flex items-center gap-5">
          {/* Expandable Inline Search Bar in Header */}
          <div className="flex items-center">
            {searchExpanded ? (
              <div className="relative flex items-center">
                <label htmlFor="vance-inline-search" className="sr-only">
                  Search exhibitions
                </label>
                <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-stone-400" />
                <input
                  id="vance-inline-search"
                  type="search"
                  autoFocus
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setIsOpen(true);
                    setIsPinned(true);
                  }}
                  placeholder="Search index..."
                  className="w-44 rounded-full border border-stone-300 bg-white py-1 pl-8 pr-7 text-xs text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none"
                />
                <button
                  type="button"
                  aria-label="Close inline search"
                  onClick={() => {
                    setQuery('');
                    setSearchExpanded(false);
                  }}
                  className="absolute right-2 text-stone-400 hover:text-stone-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                aria-label="Open header search"
                onClick={() => {
                  setSearchExpanded(true);
                  setIsOpen(true);
                  setIsPinned(true);
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-600 transition-colors hover:border-stone-900 hover:text-stone-950"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <ul className="flex items-center gap-6 text-sm font-medium text-stone-600">
            <li>
              <a
                href="#collection"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Permanent Collection');
                }}
                className="transition-colors hover:text-stone-950 whitespace-nowrap shrink-0"
              >
                Collection
              </a>
            </li>
            <li>
              <a
                href="#visit"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Visit');
                }}
                className="transition-colors hover:text-stone-950 whitespace-nowrap shrink-0"
              >
                Visit
              </a>
            </li>
            <li className="relative">
              <div
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  aria-expanded={openVisible}
                  aria-haspopup="true"
                  onClick={handleTriggerClick}
                  className={`inline-flex items-center gap-1.5 border-b-2 pb-1 pt-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 ${
                    openVisible
                      ? 'border-stone-950 text-stone-950'
                      : 'border-transparent text-stone-700 hover:text-stone-950'
                  }`}
                >
                  <span>Exhibitions</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-150 ${
                      openVisible ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openVisible && (
                  <div className="absolute right-0 top-full z-30 mt-3 w-[308px] border border-stone-300 bg-[#FAF8F4] shadow-lg shadow-stone-900/10">
                    <div className="border-b border-stone-200 p-2.5">
                      <label htmlFor="vance-panel-search" className="sr-only">
                        Filter exhibitions
                      </label>
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
                        <input
                          id="vance-panel-search"
                          type="search"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Filter by title or room..."
                          className="w-full border border-stone-300 bg-white py-1.5 pl-8 pr-7 text-xs text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none"
                        />
                        {query && (
                          <button
                            type="button"
                            aria-label="Clear search"
                            onClick={() => setQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h3 className="px-4 pb-1 pt-2.5 text-[11px] font-semibold tracking-wider text-stone-400 uppercase">
                      Current Program
                    </h3>
                    {filtered.length === 0 ? (
                      <p className="px-4 py-4 text-xs text-stone-500">
                        No exhibitions match &ldquo;{query}&rdquo;.
                      </p>
                    ) : (
                      <ul className="divide-y divide-stone-200/80 pb-1">
                        {filtered.map((item) => (
                          <li key={item.num}>
                            <a
                              href={item.href}
                              onClick={(e) => {
                                e.preventDefault();
                                onNavigate?.(`${item.num} ${item.label}`);
                                setIsOpen(false);
                                setIsPinned(false);
                              }}
                              className="group flex items-baseline justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-stone-900 hover:text-stone-50"
                            >
                              <span className="flex items-baseline gap-2.5">
                                <span className="font-mono text-[11px] tabular-nums text-stone-400 group-hover:text-stone-300">
                                  {item.num}
                                </span>
                                <span className="text-sm font-medium">{item.label}</span>
                              </span>
                              <span className="text-[11px] text-stone-400 group-hover:text-stone-300">
                                {item.room}
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default DropdownMenu11;
