'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronDown, Search, X } from 'lucide-react';

export interface DropdownMenu9Props {
  onNavigate?: (label: string) => void;
  forceOpen?: boolean;
}

const HARDWARE_COLUMNS = [
  {
    heading: 'Reference Monitors',
    links: [
      { label: 'Studio Nearfield 04', href: '#nearfield-04' },
      { label: 'Mastering Ribbon Pair', href: '#ribbon-pair' },
      { label: 'Dual-Driver Sub Array', href: '#sub-array' },
    ],
  },
  {
    heading: 'Converters & DACs',
    links: [
      { label: 'Balanced Desktop DAC', href: '#desktop-dac' },
      { label: 'Clock Master Unit', href: '#clock-master' },
      { label: 'Class-A Headphone Amp', href: '#headphone-amp' },
    ],
  },
  {
    heading: 'Room Calibration',
    links: [
      { label: 'Measurement Mic Kit', href: '#mic-kit' },
      { label: 'Impulse Response Guide', href: '#impulse-guide' },
      { label: 'Bespoke Studio Consults', href: '#consults' },
    ],
  },
];

const QUICK_ACCESS_LINKS = [
  { label: 'Firmware Downloads', href: '#firmware' },
  { label: 'Authorized Dealers', href: '#dealers' },
  { label: 'Acoustic CAD Files', href: '#cad' },
];

export function DropdownMenu9({ onNavigate, forceOpen }: DropdownMenu9Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [query, setQuery] = useState('');
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  const openVisible = forceOpen ?? isOpen;
  const q = query.trim().toLowerCase();
  const filteredCols = HARDWARE_COLUMNS.map((col) => ({
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
    <header ref={headerRef} onMouseLeave={handleRegionLeave} className="relative z-20 px-4 pt-4">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-8 rounded-2xl border border-white/20 bg-slate-950/55 px-6 text-white shadow-xl backdrop-blur-xl">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.('Aether Audio Home');
          }}
          className="font-display text-lg font-semibold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          Aether Audio
        </a>

        <nav aria-label="Primary Navigation" className="flex items-center gap-7">
          <ul className="flex items-center gap-7 text-sm font-medium text-slate-200">
            <li>
              <a
                href="#acoustics"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Acoustics');
                }}
                className="transition-colors hover:text-white whitespace-nowrap shrink-0"
              >
                Acoustics
              </a>
            </li>
            <li>
              <a
                href="#listening-rooms"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Listening Rooms');
                }}
                className="transition-colors hover:text-white whitespace-nowrap shrink-0"
              >
                Listening Rooms
              </a>
            </li>
            <li>
              <a
                href="#support"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Support');
                }}
                className="transition-colors hover:text-white whitespace-nowrap shrink-0"
              >
                Support
              </a>
            </li>
            <li>
              <div onMouseEnter={handleTriggerEnter}>
                <button
                  type="button"
                  aria-expanded={openVisible}
                  aria-haspopup="true"
                  onClick={handleTriggerClick}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-sm font-medium transition-all whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${
                    openVisible
                      ? 'border-white/40 bg-white/20 text-white'
                      : 'border-white/20 bg-white/10 text-slate-100 hover:bg-white/15'
                  }`}
                >
                  <span>Hardware</span>
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
          className="absolute left-4 right-4 top-full z-30 mx-auto mt-3 max-w-5xl rounded-2xl border border-white/20 bg-slate-950/75 p-6 text-white shadow-2xl shadow-black/50 backdrop-blur-2xl"
        >
          {/* Full-width glass search strip */}
          <div className="mb-5">
            <label htmlFor="aether-search" className="sr-only">
              Search Aether hardware
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-300/80" />
              <input
                id="aether-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search monitors, DACs, calibration kits..."
                className="w-full rounded-xl border border-white/15 bg-white/10 py-2 pl-10 pr-8 text-xs text-white placeholder:text-slate-400 focus:border-cyan-400/60 focus:bg-white/15 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Row 1: 3 Link Columns */}
          <div className="grid grid-cols-3 gap-6 border-b border-white/10 pb-5">
            {filteredCols.map((col) => (
              <div key={col.heading}>
                <h3 className="mb-2.5 text-xs font-semibold tracking-wide text-cyan-200/80">
                  {col.heading}
                </h3>
                {col.links.length === 0 ? (
                  <p className="text-xs text-slate-400">No matches.</p>
                ) : (
                  <ul className="space-y-1">
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
                          className="block rounded-lg px-2.5 py-1.5 text-sm text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Row 2: 2-Column Wide Aurora Gradient Banner + Quick Resources */}
          <div className="mt-5 grid grid-cols-3 gap-6">
            <div className="col-span-2 flex items-center justify-between gap-6 rounded-xl border border-white/20 bg-gradient-to-r from-cyan-500/35 via-indigo-600/40 to-fuchsia-600/30 p-5">
              <div>
                <p className="text-xs font-medium text-cyan-200">Series IV Flagship</p>
                <p className="mt-1 font-display text-lg font-semibold text-white">
                  Aether Reference Monoblock
                </p>
                <p className="mt-1 text-xs text-slate-200">
                  CNC-milled chassis with dual-mono toroidal power supply.
                </p>
              </div>
              <a
                href="#monoblock"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Inspect Series IV Specs');
                  setIsOpen(false);
                  setIsPinned(false);
                }}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white/15 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/25"
              >
                <span>Inspect Specs</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="col-span-1 flex flex-col justify-center rounded-xl border border-white/10 bg-white/5 p-4">
              <h3 className="mb-2 text-xs font-semibold text-cyan-200/80">Technical Files</h3>
              <ul className="space-y-1">
                {QUICK_ACCESS_LINKS.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate?.(item.label);
                        setIsOpen(false);
                        setIsPinned(false);
                      }}
                      className="flex items-center justify-between py-1 text-xs font-medium text-slate-200 hover:text-white"
                    >
                      <span>{item.label}</span>
                      <ArrowUpRight className="h-3 w-3 opacity-60" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default DropdownMenu9;
