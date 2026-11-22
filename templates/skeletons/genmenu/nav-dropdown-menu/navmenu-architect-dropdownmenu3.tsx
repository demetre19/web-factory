'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Compass, Layers, Palette, PenTool, Search, Sparkles, X } from 'lucide-react';

export interface DropdownMenu3Props {
  onNavigate?: (label: string) => void;
  forceOpen?: boolean;
}

const SERVICE_ITEMS = [
  { label: 'Brand Architecture', sub: 'Identity systems & visual grammar', icon: Compass, href: '#brand' },
  { label: 'Product Interfaces', sub: 'Web applications & design tokens', icon: Layers, href: '#interfaces' },
  { label: 'Editorial Direction', sub: 'Typography & print monographs', icon: PenTool, href: '#editorial' },
  { label: 'Art Direction', sub: 'Campaign sets & spatial staging', icon: Palette, href: '#art-direction' },
  { label: 'Interactive Prototypes', sub: 'Motion studies & micro-flows', icon: Sparkles, href: '#prototypes' },
];

export function DropdownMenu3({ onNavigate, forceOpen }: DropdownMenu3Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [query, setQuery] = useState('');
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerWrapRef = useRef<HTMLDivElement>(null);

  const openVisible = forceOpen ?? isOpen;
  const filteredServices = SERVICE_ITEMS.filter(
    (item) =>
      item.label.toLowerCase().includes(query.trim().toLowerCase()) ||
      item.sub.toLowerCase().includes(query.trim().toLowerCase()),
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
    <header className="relative z-20 px-4 pt-4">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-8 rounded-2xl border border-white/60 bg-white/45 px-5 text-slate-900 shadow-lg shadow-sky-950/5 backdrop-blur-xl">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.('Solstice Studio Home');
          }}
          className="font-display text-lg font-semibold tracking-tight text-slate-950 whitespace-nowrap shrink-0"
        >
          Solstice Studio
        </a>

        <nav aria-label="Primary Navigation" className="flex items-center gap-6">
          <ul className="flex items-center gap-6 text-sm font-medium text-slate-800">
            <li>
              <a
                href="#work"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Selected Work');
                }}
                className="transition-colors hover:text-slate-950 whitespace-nowrap shrink-0"
              >
                Work
              </a>
            </li>
            <li>
              <a
                href="#journal"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Journal');
                }}
                className="transition-colors hover:text-slate-950 whitespace-nowrap shrink-0"
              >
                Journal
              </a>
            </li>
            <li>
              <a
                href="#studio"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Studio');
                }}
                className="transition-colors hover:text-slate-950 whitespace-nowrap shrink-0"
              >
                Studio
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
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-sm font-medium transition-all whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
                    openVisible
                      ? 'border-white/80 bg-white/80 text-slate-950 shadow-sm'
                      : 'border-white/50 bg-white/35 text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <span>Services</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-150 ${
                      openVisible ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openVisible && (
                  <div className="absolute right-0 top-full z-30 mt-3 w-[300px] rounded-2xl border border-white/70 bg-white/75 p-2.5 shadow-xl shadow-sky-950/15 backdrop-blur-2xl">
                    <div className="mb-2">
                      <label htmlFor="solstice-search" className="sr-only">
                        Search studio services
                      </label>
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                        <input
                          id="solstice-search"
                          type="search"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Find a discipline..."
                          className="w-full rounded-xl border border-white/70 bg-white/60 py-1.5 pl-8 pr-7 text-xs text-slate-900 placeholder:text-slate-500 focus:border-teal-600 focus:bg-white/90 focus:outline-none"
                        />
                        {query && (
                          <button
                            type="button"
                            aria-label="Clear search"
                            onClick={() => setQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h3 className="sr-only">Design Services</h3>
                    {filteredServices.length === 0 ? (
                      <p className="px-3 py-4 text-center text-xs text-slate-600">
                        No services match &ldquo;{query}&rdquo;.
                      </p>
                    ) : (
                      <ul className="space-y-0.5">
                        {filteredServices.map((item) => {
                          const Icon = item.icon;
                          return (
                            <li key={item.label}>
                              <a
                                href={item.href}
                                onClick={(e) => {
                                  e.preventDefault();
                                  onNavigate?.(item.label);
                                  setIsOpen(false);
                                  setIsPinned(false);
                                }}
                                className="group flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-white/85"
                              >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900/5 text-slate-700 transition-colors group-hover:bg-teal-600 group-hover:text-white">
                                  <Icon className="h-4 w-4" />
                                </span>
                                <span className="min-w-0">
                                  <span className="block text-sm font-semibold text-slate-900">
                                    {item.label}
                                  </span>
                                  <span className="block truncate text-xs text-slate-600">
                                    {item.sub}
                                  </span>
                                </span>
                              </a>
                            </li>
                          );
                        })}
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

export default DropdownMenu3;
