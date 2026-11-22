'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronDown, Search, X } from 'lucide-react';

export interface DropdownMenu6Props {
  onNavigate?: (label: string) => void;
  forceOpen?: boolean;
}

const RAIL_DIVISIONS = [
  { label: 'Private Banking', href: '#private-banking' },
  { label: 'Advisory & Tax', href: '#advisory-tax' },
  { label: 'Institutional Research', href: '#research' },
  { label: 'Family Office Desk', href: '#family-office' },
];

const WEALTH_COLUMNS = [
  {
    heading: 'Private Banking & Custody',
    links: [
      { label: 'Discretionary Portfolios', href: '#discretionary' },
      { label: 'Multi-Currency Treasury', href: '#treasury' },
      { label: 'Credit & Liquidity Lines', href: '#credit' },
      { label: 'Fiduciary Custody', href: '#custody' },
    ],
  },
  {
    heading: 'Advisory & Macro Research',
    links: [
      { label: 'Estate Structuring', href: '#estate' },
      { label: 'Cross-Border Trusts', href: '#trusts' },
      { label: 'Quarterly Macro Outlook', href: '#macro' },
      { label: 'Annual Stewardship Report', href: '#stewardship' },
    ],
  },
];

export function DropdownMenu6({ onNavigate, forceOpen }: DropdownMenu6Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [query, setQuery] = useState('');
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  const openVisible = forceOpen ?? isOpen;
  const q = query.trim().toLowerCase();
  const filteredRail = RAIL_DIVISIONS.filter((d) => d.label.toLowerCase().includes(q));
  const filteredCols = WEALTH_COLUMNS.map((col) => ({
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
      className="relative z-20 w-full border-b border-stone-200 bg-white text-stone-900"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-6">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.('Meridian Capital Home');
          }}
          className="font-display text-lg font-semibold tracking-tight text-stone-950 whitespace-nowrap shrink-0"
        >
          Meridian Capital
        </a>

        <nav aria-label="Primary Navigation" className="flex items-center gap-7">
          <ul className="flex items-center gap-7 text-sm font-medium text-stone-600">
            <li>
              <a
                href="#firm"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('The Firm');
                }}
                className="transition-colors hover:text-stone-950 whitespace-nowrap shrink-0"
              >
                The Firm
              </a>
            </li>
            <li>
              <a
                href="#perspectives"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Perspectives');
                }}
                className="transition-colors hover:text-stone-950 whitespace-nowrap shrink-0"
              >
                Perspectives
              </a>
            </li>
            <li>
              <a
                href="#offices"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Offices');
                }}
                className="transition-colors hover:text-stone-950 whitespace-nowrap shrink-0"
              >
                Offices
              </a>
            </li>
            <li>
              <div onMouseEnter={handleTriggerEnter}>
                <button
                  type="button"
                  aria-expanded={openVisible}
                  aria-haspopup="true"
                  onClick={handleTriggerClick}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 ${
                    openVisible
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-800 hover:bg-stone-100 hover:text-stone-950'
                  }`}
                >
                  <span>Wealth</span>
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
          className="absolute left-0 right-0 top-full z-30 w-full border-b border-stone-200 bg-white shadow-xl shadow-stone-900/5"
        >
          {/* Mega Panel Top Search Strip */}
          <div className="border-b border-stone-100 bg-stone-50/70">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3">
              <span className="text-xs font-medium text-stone-500">
                Wealth Management Directory
              </span>
              <div className="relative w-80">
                <label htmlFor="meridian-search" className="sr-only">
                  Search wealth solutions
                </label>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
                <input
                  id="meridian-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search portfolios, trusts, research..."
                  className="w-full rounded-md border border-stone-200 bg-white py-1.5 pl-8 pr-7 text-xs text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none"
                />
                {query && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-12 gap-8 px-6 py-7">
            {/* Left Vertical Division Rail */}
            <div className="col-span-3 border-r border-stone-100 pr-6">
              <h3 className="mb-3 text-xs font-semibold tracking-wide text-stone-500">
                Divisions
              </h3>
              {filteredRail.length === 0 ? (
                <p className="text-xs text-stone-400">No division match.</p>
              ) : (
                <ul className="space-y-1">
                  {filteredRail.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate?.(item.label);
                          setIsOpen(false);
                          setIsPinned(false);
                        }}
                        className="flex items-center justify-between rounded-md bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-800 transition-colors hover:bg-stone-900 hover:text-white"
                      >
                        <span>{item.label}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Center 2 Link Columns */}
            {filteredCols.map((col) => (
              <div key={col.heading} className="col-span-3">
                <h3 className="mb-3 border-b border-stone-100 pb-2 text-xs font-semibold tracking-wide text-stone-500">
                  {col.heading}
                </h3>
                {col.links.length === 0 ? (
                  <p className="text-xs text-stone-400">No links match &ldquo;{query}&rdquo;.</p>
                ) : (
                  <ul className="space-y-2">
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
                          className="group flex items-center justify-between py-1 text-sm text-stone-700 transition-colors hover:text-stone-950"
                        >
                          <span>{link.label}</span>
                          <ArrowUpRight className="h-3.5 w-3.5 text-stone-400 opacity-0 transition-opacity group-hover:opacity-100" />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            {/* Right Featured Gradient Card */}
            <div className="col-span-3">
              <h3 className="mb-3 border-b border-stone-100 pb-2 text-xs font-semibold tracking-wide text-stone-500">
                Featured Briefing
              </h3>
              <div className="flex h-[calc(100%-2rem)] flex-col justify-between rounded-lg bg-gradient-to-br from-slate-900 via-slate-800 to-stone-700 p-5 text-white">
                <div>
                  <p className="text-xs font-medium text-stone-300">2027 Outlook</p>
                  <p className="mt-1.5 font-display text-base font-semibold leading-snug">
                    Real Assets &amp; Sovereign Yield Curves
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-stone-300">
                    Portfolio positioning across duration and private debt.
                  </p>
                </div>
                <a
                  href="#outlook"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate?.('Read 2027 Outlook');
                    setIsOpen(false);
                    setIsPinned(false);
                  }}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-white underline-offset-4 hover:underline"
                >
                  <span>Read Summary</span>
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

export default DropdownMenu6;
