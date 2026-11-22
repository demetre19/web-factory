'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, Search, X } from 'lucide-react';

export interface DropdownMenu13Props {
  onNavigate?: (label: string) => void;
  forceOpen?: boolean;
}

const GEAR_COLUMNS = [
  {
    heading: 'Alpine Shelter',
    items: [
      { label: '4-Season Geodesic Tents', count: '14', href: '#tents' },
      { label: 'Ultralight Bivy Sacks', count: '08', href: '#bivy' },
      { label: 'Down Expedition Bags', count: '19', href: '#sleeping-bags' },
      { label: 'Insulated Sleeping Pads', count: '11', href: '#pads' },
    ],
  },
  {
    heading: 'Technical Outerwear',
    items: [
      { label: '3-Layer Hardshell Jackets', count: '22', href: '#hardshells' },
      { label: 'Merino Midweight Base', count: '16', href: '#merino' },
      { label: 'Summit Belay Parkas', count: '09', href: '#parkas' },
      { label: 'Waterproof Gaiters', count: '06', href: '#gaiters' },
    ],
  },
  {
    heading: 'Packs & Hardware',
    items: [
      { label: 'Haul & Alpine Packs', count: '15', href: '#packs' },
      { label: 'Carbon Trekking Poles', count: '07', href: '#poles' },
      { label: 'Titanium Cook Systems', count: '12', href: '#cookware' },
      { label: 'Avalanche Safety Kits', count: '05', href: '#avalanche' },
    ],
  },
];

export function DropdownMenu13({ onNavigate, forceOpen }: DropdownMenu13Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [query, setQuery] = useState('');
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  const openVisible = forceOpen ?? isOpen;
  const q = query.trim().toLowerCase();
  const filteredCols = GEAR_COLUMNS.map((col) => ({
    ...col,
    items: col.items.filter((item) => item.label.toLowerCase().includes(q)),
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
      className="relative z-20 w-full bg-[#1C1917] text-stone-100"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.('Tundra Gear Home');
          }}
          className="font-display text-lg font-bold tracking-tight text-orange-400 whitespace-nowrap shrink-0"
        >
          Tundra Gear
        </a>

        {/* Always-Visible Wide Catalog Search Bar */}
        <div className="relative hidden max-w-md flex-1 md:block">
          <label htmlFor="tundra-search" className="sr-only">
            Search Tundra Gear catalog
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            id="tundra-search"
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
            placeholder="Search tents, hardshells, packs..."
            className="w-full rounded-lg border border-stone-700 bg-stone-800/90 py-1.5 pl-9 pr-8 text-xs text-stone-100 placeholder:text-stone-400 focus:border-orange-500 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <nav aria-label="Primary Navigation" className="flex items-center gap-6">
          <ul className="flex items-center gap-6 text-sm font-medium text-stone-300">
            <li>
              <a
                href="#field-reports"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Field Reports');
                }}
                className="transition-colors hover:text-orange-400 whitespace-nowrap shrink-0"
              >
                Field Reports
              </a>
            </li>
            <li>
              <a
                href="#repair"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Repair Lab');
                }}
                className="transition-colors hover:text-orange-400 whitespace-nowrap shrink-0"
              >
                Repair Lab
              </a>
            </li>
            <li>
              <div onMouseEnter={handleTriggerEnter}>
                <button
                  type="button"
                  aria-expanded={openVisible}
                  aria-haspopup="true"
                  onClick={handleTriggerClick}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400 ${
                    openVisible
                      ? 'bg-orange-600 text-white'
                      : 'bg-stone-800 text-stone-100 hover:bg-stone-700'
                  }`}
                >
                  <span>Equipment</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-150 ${
                      openVisible ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>
            </li>
          </ul>
        </nav>
      </div>

      {openVisible && (
        <div
          onMouseEnter={cancelClose}
          className="absolute left-0 right-0 top-full z-30 w-full border-b border-stone-300 bg-[#FAF7F2] text-stone-900 shadow-2xl shadow-stone-950/20"
        >
          <div className="mx-auto grid max-w-6xl grid-cols-12 gap-8 px-6 py-8">
            <div className="col-span-8 grid grid-cols-3 gap-6">
              {filteredCols.map((col) => (
                <div key={col.heading}>
                  <h3 className="mb-3 border-b border-stone-300/70 pb-2 text-xs font-bold tracking-wide text-orange-700">
                    {col.heading}
                  </h3>
                  {col.items.length === 0 ? (
                    <p className="text-xs text-stone-500">No gear matches.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {col.items.map((item) => (
                        <li key={item.label}>
                          <a
                            href={item.href}
                            onClick={(e) => {
                              e.preventDefault();
                              onNavigate?.(item.label);
                              setIsOpen(false);
                              setIsPinned(false);
                            }}
                            className="group flex items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium text-stone-800 transition-colors hover:bg-orange-100/80"
                          >
                            <span>{item.label}</span>
                            <span className="font-mono text-[11px] tabular-nums text-stone-400 group-hover:text-orange-700">
                              {item.count}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            <div className="col-span-4">
              <h3 className="mb-3 border-b border-stone-300/70 pb-2 text-xs font-bold tracking-wide text-stone-500">
                Seasonal Drop
              </h3>
              <div className="flex h-[calc(100%-2.25rem)] flex-col justify-between rounded-xl bg-gradient-to-br from-orange-600 via-amber-700 to-stone-900 p-5 text-white">
                <div>
                  <p className="text-xs font-semibold text-orange-200">Winter Ridge Capsule</p>
                  <p className="mt-1 font-display text-lg font-bold leading-snug">
                    Sub-Zero Dyneema Alpine Kit
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-orange-50/90">
                    Tested at 4,200m with reinforced storm seams and repair patches included.
                  </p>
                </div>
                <a
                  href="#winter-drop"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate?.('Shop Winter Ridge Capsule');
                    setIsOpen(false);
                    setIsPinned(false);
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-amber-200 hover:text-white"
                >
                  <span>Explore Capsule</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-stone-300/80 bg-[#EDE6DC]">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
              <p className="text-xs font-medium text-stone-700">
                Lifetime hardware warranty &amp; complimentary seam resealing at all regional outposts.
              </p>
              <a
                href="#warranty"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Check Repair Coverage');
                  setIsOpen(false);
                  setIsPinned(false);
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-orange-700 hover:text-orange-900 whitespace-nowrap"
              >
                <span>Warranty Details</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default DropdownMenu13;
