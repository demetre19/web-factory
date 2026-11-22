'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  Droplets,
  FlaskConical,
  Leaf,
  Microscope,
  Recycle,
  Search,
  Sprout,
  Sun,
  Trees,
  X,
} from 'lucide-react';

export interface DropdownMenu10Props {
  onNavigate?: (label: string) => void;
  forceOpen?: boolean;
}

const SOLUTION_COLUMNS = [
  {
    heading: 'Crop Science',
    items: [
      { label: 'Soil Microbiome', icon: Sprout, href: '#microbiome' },
      { label: 'Nitrogen Fixation', icon: Leaf, href: '#nitrogen' },
      { label: 'Root Resilience', icon: Trees, href: '#roots' },
    ],
  },
  {
    heading: 'Lab & Formulation',
    items: [
      { label: 'Bio-Assay Screening', icon: Microscope, href: '#bio-assay' },
      { label: 'Precision Dosing', icon: FlaskConical, href: '#dosing' },
      { label: 'Moisture Retention', icon: Droplets, href: '#moisture' },
    ],
  },
  {
    heading: 'Field Sustainability',
    items: [
      { label: 'Carbon Capture Plots', icon: Sun, href: '#carbon-plots' },
      { label: 'Circular Packaging', icon: Recycle, href: '#packaging' },
      { label: 'Seed Coating Trials', icon: Sprout, href: '#seed-coating' },
    ],
  },
];

export function DropdownMenu10({ onNavigate, forceOpen }: DropdownMenu10Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [query, setQuery] = useState('');
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  const openVisible = forceOpen ?? isOpen;
  const q = query.trim().toLowerCase();
  const filteredCols = SOLUTION_COLUMNS.map((col) => ({
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
      className="relative z-20 w-full bg-[#0D3B2E] text-emerald-50"
    >
      {/* Symmetric Split Header with Centered Brand Wordmark */}
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-3 items-center gap-6 px-6">
        <nav aria-label="Secondary Navigation" className="justify-self-start">
          <ul className="flex items-center gap-6 text-sm font-medium text-emerald-100">
            <li>
              <a
                href="#research"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Field Trials');
                }}
                className="transition-colors hover:text-lime-200 whitespace-nowrap shrink-0"
              >
                Field Trials
              </a>
            </li>
            <li>
              <a
                href="#impact"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Impact');
                }}
                className="transition-colors hover:text-lime-200 whitespace-nowrap shrink-0"
              >
                Impact
              </a>
            </li>
          </ul>
        </nav>

        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.('Verdant Bio Home');
          }}
          className="justify-self-center font-display text-xl font-bold tracking-tight text-lime-200 whitespace-nowrap shrink-0"
        >
          Verdant Bio
        </a>

        <nav aria-label="Primary Navigation" className="justify-self-end">
          <ul className="flex items-center gap-6 text-sm font-medium text-emerald-100">
            <li>
              <a
                href="#partners"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Growers');
                }}
                className="transition-colors hover:text-lime-200 whitespace-nowrap shrink-0"
              >
                Growers
              </a>
            </li>
            <li>
              <div onMouseEnter={handleTriggerEnter}>
                <button
                  type="button"
                  aria-expanded={openVisible}
                  aria-haspopup="true"
                  onClick={handleTriggerClick}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300 ${
                    openVisible
                      ? 'bg-lime-300 text-emerald-950'
                      : 'bg-emerald-800/80 text-white hover:bg-emerald-700'
                  }`}
                >
                  <span>Solutions</span>
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
          className="absolute left-0 right-0 top-full z-30 w-full border-b border-emerald-900/15 bg-white text-emerald-950 shadow-xl shadow-emerald-950/10"
        >
          <div className="border-b border-emerald-900/10 bg-emerald-50/50">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
              <span className="text-xs font-semibold text-emerald-800">
                Agronomic Formulations &amp; Field Programs
              </span>
              <div className="relative w-72">
                <label htmlFor="verdant-search" className="sr-only">
                  Search Verdant Bio solutions
                </label>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-emerald-600" />
                <input
                  id="verdant-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter crop programs..."
                  className="w-full rounded-lg border border-emerald-900/20 bg-white py-1.5 pl-8 pr-7 text-xs text-emerald-950 placeholder:text-emerald-600/60 focus:border-emerald-800 focus:outline-none"
                />
                {query && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-700 hover:text-emerald-950"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-12 gap-8 px-6 py-7">
            <div className="col-span-8 grid grid-cols-3 gap-6">
              {filteredCols.map((col) => (
                <div key={col.heading}>
                  <h3 className="mb-3 text-xs font-bold tracking-wide text-emerald-700">
                    {col.heading}
                  </h3>
                  {col.items.length === 0 ? (
                    <p className="text-xs text-emerald-700/60">No matches.</p>
                  ) : (
                    <ul className="space-y-1">
                      {col.items.map((item) => {
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
                              className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-emerald-950 transition-colors hover:bg-emerald-50"
                            >
                              <Icon className="h-4 w-4 shrink-0 text-emerald-600 transition-colors group-hover:text-emerald-800" />
                              <span>{item.label}</span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            <div className="col-span-4">
              <h3 className="mb-3 text-xs font-bold tracking-wide text-emerald-700">
                Regional Pilot
              </h3>
              <div className="flex h-[calc(100%-1.75rem)] flex-col justify-between rounded-xl bg-gradient-to-br from-emerald-800 via-teal-700 to-lime-500 p-5 text-white">
                <div>
                  <p className="text-xs font-semibold text-lime-200">2026 Harvest Study</p>
                  <p className="mt-1 font-display text-lg font-bold leading-snug">
                    18% Yield Stability Across Dryland Acreage
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-emerald-50">
                    Explore multi-season soil data from 42 commercial partner farms.
                  </p>
                </div>
                <a
                  href="#harvest-study"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate?.('Read Harvest Study');
                    setIsOpen(false);
                    setIsPinned(false);
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-lime-200 hover:text-white"
                >
                  <span>View Dataset</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-emerald-900/10 bg-[#F4F1EA]">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
              <p className="text-xs font-medium text-emerald-900">
                Request an agronomic soil sample kit tailored to your watershed region.
              </p>
              <a
                href="#sample-kit"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Order Soil Sample Kit');
                  setIsOpen(false);
                  setIsPinned(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-md bg-emerald-900 px-3.5 py-1.5 text-xs font-semibold text-lime-200 transition-colors hover:bg-emerald-800 whitespace-nowrap shrink-0"
              >
                <span>Order Kit</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default DropdownMenu10;
