'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, ChevronRight, Search, X } from 'lucide-react';

export interface DropdownMenu19Props {
  onNavigate?: (label: string) => void;
  forceOpen?: boolean;
}

const ACCORDION_GROUPS = [
  {
    id: 'type',
    heading: 'Typeface Specimens',
    links: [
      { label: 'Cinder Grotesque', href: '#grotesque' },
      { label: 'Kiln Display Serif', href: '#serif' },
      { label: 'Furnace Mono', href: '#mono' },
    ],
  },
  {
    id: 'materials',
    heading: 'Material Studies',
    links: [
      { label: 'Basalt & Ash Finishes', href: '#basalt' },
      { label: 'Oxidized Brass Samples', href: '#brass' },
      { label: 'Raw Linen Bindings', href: '#linen' },
    ],
  },
  {
    id: 'editions',
    heading: 'Print Monographs',
    links: [
      { label: 'Issue 14: Tactile Grids', href: '#issue-14' },
      { label: 'Issue 13: Nocturnal Ink', href: '#issue-13' },
    ],
  },
];

export function DropdownMenu19({ onNavigate, forceOpen }: DropdownMenu19Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [openGroupId, setOpenGroupId] = useState<string>('type');
  const [query, setQuery] = useState('');
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerWrapRef = useRef<HTMLDivElement>(null);

  const openVisible = forceOpen ?? isOpen;
  const q = query.trim().toLowerCase();
  const filteredGroups = ACCORDION_GROUPS.map((group) => ({
    ...group,
    links: group.links.filter((l) => l.label.toLowerCase().includes(q)),
  })).filter((group) => group.links.length > 0);

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
    <header className="relative z-20 w-full border-b border-amber-200/15 bg-stone-950/60 text-stone-100 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-6">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.('Cinder Studio Home');
          }}
          className="font-display text-lg font-semibold tracking-tight text-amber-200 whitespace-nowrap shrink-0"
        >
          Cinder Studio
        </a>

        <nav aria-label="Primary Navigation" className="flex items-center gap-6">
          <ul className="flex items-center gap-6 text-sm font-medium text-stone-300">
            <li>
              <a
                href="#commission"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Commissions');
                }}
                className="transition-colors hover:text-amber-200 whitespace-nowrap shrink-0"
              >
                Commissions
              </a>
            </li>
            <li>
              <a
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('About');
                }}
                className="transition-colors hover:text-amber-200 whitespace-nowrap shrink-0"
              >
                About
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
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 ${
                    openVisible
                      ? 'border-amber-400/50 bg-amber-400/20 text-amber-100'
                      : 'border-white/15 bg-white/5 text-stone-100 hover:bg-white/10'
                  }`}
                >
                  <span>Archive</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-150 ${
                      openVisible ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openVisible && (
                  <div className="absolute right-0 top-full z-30 mt-2.5 w-[308px] overflow-hidden rounded-2xl border border-amber-200/20 bg-stone-950/85 text-stone-100 shadow-2xl shadow-black/60 backdrop-blur-2xl">
                    <div className="border-b border-white/10 p-3">
                      <label htmlFor="cinder-search" className="sr-only">
                        Search archive
                      </label>
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-amber-300/70" />
                        <input
                          id="cinder-search"
                          type="search"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Search archive..."
                          className="w-full rounded-lg border border-white/15 bg-white/10 py-1.5 pl-8 pr-7 text-xs text-white placeholder:text-stone-400 focus:border-amber-300/60 focus:outline-none"
                        />
                        {query && (
                          <button
                            type="button"
                            aria-label="Clear search"
                            onClick={() => setQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="divide-y divide-white/10 p-2">
                      {filteredGroups.length === 0 ? (
                        <p className="p-3 text-xs text-stone-400">
                          No archive items match &ldquo;{query}&rdquo;.
                        </p>
                      ) : (
                        filteredGroups.map((group) => {
                          const expanded = q.length > 0 || openGroupId === group.id;
                          return (
                            <div key={group.id} className="py-1">
                              <button
                                type="button"
                                aria-expanded={expanded}
                                onClick={() =>
                                  setOpenGroupId((prev) => (prev === group.id ? '' : group.id))
                                }
                                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-amber-200/90 hover:bg-white/5"
                              >
                                <span>{group.heading}</span>
                                <ChevronRight
                                  className={`h-3.5 w-3.5 transition-transform duration-150 ${
                                    expanded ? 'rotate-90' : ''
                                  }`}
                                />
                              </button>

                              {expanded && (
                                <ul className="mt-0.5 space-y-0.5 pl-2 pb-1">
                                  {group.links.map((link) => (
                                    <li key={link.label}>
                                      <a
                                        href={link.href}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          onNavigate?.(link.label);
                                          setIsOpen(false);
                                          setIsPinned(false);
                                        }}
                                        className="block rounded-lg px-2.5 py-1.5 text-sm text-stone-200 transition-colors hover:bg-amber-300/15 hover:text-white"
                                      >
                                        {link.label}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="border-t border-white/10 bg-amber-500/15 px-4 py-2.5">
                      <a
                        href="#reading-room"
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate?.('Book Reading Room Visit');
                          setIsOpen(false);
                          setIsPinned(false);
                        }}
                        className="group flex items-center justify-between text-xs font-medium text-amber-200 hover:text-white"
                      >
                        <span>Book Studio Reading Room</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </a>
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

export default DropdownMenu19;
