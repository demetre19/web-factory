'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronDown, Search, X } from 'lucide-react';

export interface DropdownMenu1Props {
  onNavigate?: (label: string) => void;
  forceOpen?: boolean;
}

const PRACTICE_LINKS = [
  { label: 'Corporate Advisory', href: '#corporate-advisory' },
  { label: 'Cross-Border M&A', href: '#cross-border-ma' },
  { label: 'Venture Financing', href: '#venture-financing' },
  { label: 'Regulatory Compliance', href: '#regulatory-compliance' },
  { label: 'Intellectual Property', href: '#intellectual-property' },
  { label: 'Commercial Arbitration', href: '#commercial-arbitration' },
];

export function DropdownMenu1({ onNavigate, forceOpen }: DropdownMenu1Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [query, setQuery] = useState('');
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerWrapRef = useRef<HTMLDivElement>(null);

  const openVisible = forceOpen ?? isOpen;
  const filteredLinks = PRACTICE_LINKS.filter((item) =>
    item.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (triggerWrapRef.current && !triggerWrapRef.current.contains(event.target as Node)) {
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

  const handleMouseEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (isPinned) return;
    if (triggerWrapRef.current?.contains(document.activeElement)) return;
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
    <header className="relative z-20 w-full border-b border-stone-200 bg-white text-stone-900">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-6">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.('Vespera Legal Home');
          }}
          className="font-display text-lg font-semibold tracking-tight text-stone-950 whitespace-nowrap shrink-0"
        >
          Vespera Legal
        </a>

        <nav aria-label="Primary Navigation" className="flex items-center gap-7">
          <ul className="flex items-center gap-7 text-sm font-medium text-stone-600">
            <li>
              <a
                href="#partners"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Partners');
                }}
                className="transition-colors hover:text-stone-950 whitespace-nowrap shrink-0"
              >
                Partners
              </a>
            </li>
            <li>
              <a
                href="#briefings"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Briefings');
                }}
                className="transition-colors hover:text-stone-950 whitespace-nowrap shrink-0"
              >
                Briefings
              </a>
            </li>
            <li>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Contact');
                }}
                className="transition-colors hover:text-stone-950 whitespace-nowrap shrink-0"
              >
                Contact
              </a>
            </li>
            <li className="relative">
              <div
                ref={triggerWrapRef}
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  aria-expanded={openVisible}
                  aria-haspopup="true"
                  onClick={handleTriggerClick}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 ${
                    openVisible
                      ? 'bg-stone-100 text-stone-950'
                      : 'text-stone-700 hover:bg-stone-50 hover:text-stone-950'
                  }`}
                >
                  <span>Practice Areas</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-150 ${
                      openVisible ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openVisible && (
                  <div className="absolute right-0 top-full z-30 mt-2 w-[272px] rounded-lg border border-stone-200 bg-white shadow-lg shadow-stone-900/5">
                    <div className="border-b border-stone-100 p-2.5">
                      <label htmlFor="vespera-search" className="sr-only">
                        Search practice areas
                      </label>
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
                        <input
                          id="vespera-search"
                          type="search"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Filter divisions..."
                          className="w-full rounded-md border border-stone-200 bg-stone-50 py-1.5 pl-8 pr-7 text-xs text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:outline-none"
                        />
                        {query && (
                          <button
                            type="button"
                            aria-label="Clear search"
                            onClick={() => setQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="py-1.5">
                      <h3 className="px-4 pb-1 pt-1 text-[11px] font-semibold tracking-wider text-stone-400 uppercase">
                        Advisory Divisions
                      </h3>
                      {filteredLinks.length === 0 ? (
                        <p className="px-4 py-3 text-xs text-stone-500">
                          No practice areas match &ldquo;{query}&rdquo;.
                        </p>
                      ) : (
                        <ul className="divide-y divide-stone-100">
                          {filteredLinks.map((item) => (
                            <li key={item.label}>
                              <a
                                href={item.href}
                                onClick={(e) => {
                                  e.preventDefault();
                                  onNavigate?.(item.label);
                                  setIsOpen(false);
                                  setIsPinned(false);
                                }}
                                className="group flex items-center justify-between px-4 py-2.5 text-sm text-stone-700 transition-colors hover:bg-stone-50 hover:text-stone-950"
                              >
                                <span>{item.label}</span>
                                <ArrowUpRight className="h-3.5 w-3.5 text-stone-300 opacity-0 transition-all duration-150 group-hover:text-stone-700 group-hover:opacity-100" />
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
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

export default DropdownMenu1;
