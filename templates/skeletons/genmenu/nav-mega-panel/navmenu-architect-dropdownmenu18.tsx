'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  BatteryCharging,
  Bike,
  Car,
  ChevronDown,
  Compass,
  Gauge,
  Map,
  Search,
  ShieldCheck,
  Wrench,
  Zap,
  X,
} from 'lucide-react';

export interface DropdownMenu18Props {
  onNavigate?: (label: string) => void;
  forceOpen?: boolean;
}

const VEHICLE_COLUMNS = [
  {
    heading: 'Electric Fleet',
    items: [
      { label: 'Volt Urban GT', desc: '410 km city range', icon: Car, href: '#urban-gt' },
      { label: 'Trail Cargo Van', desc: '1,200 kg payload', icon: Compass, href: '#cargo-van' },
      { label: 'Commuter E-Bike', desc: 'Belt-drive 16 kg', icon: Bike, href: '#e-bike' },
    ],
  },
  {
    heading: 'Power & Charging',
    items: [
      { label: '350kW Hyperchargers', desc: '18-min 10-80% top-up', icon: Zap, href: '#hyperchargers' },
      { label: 'Home Wallbox Pro', desc: 'Solar excess routing', icon: BatteryCharging, href: '#wallbox' },
      { label: 'Live Station Map', desc: '4,800 EU stalls', icon: Map, href: '#stations' },
    ],
  },
  {
    heading: 'Ownership & Care',
    items: [
      { label: 'Over-the-Air Tuning', desc: 'Torque & regen profiles', icon: Gauge, href: '#ota' },
      { label: 'Mobile Service Vans', desc: 'Curbside maintenance', icon: Wrench, href: '#service' },
      { label: '8-Year Battery Cover', desc: 'Cell health guarantee', icon: ShieldCheck, href: '#warranty' },
    ],
  },
];

export function DropdownMenu18({ onNavigate, forceOpen }: DropdownMenu18Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [query, setQuery] = useState('');
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  const openVisible = forceOpen ?? isOpen;
  const q = query.trim().toLowerCase();
  const filteredCols = VEHICLE_COLUMNS.map((col) => ({
    ...col,
    items: col.items.filter(
      (item) => item.label.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q),
    ),
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
      className="relative z-20 w-full border-b border-lime-400/20 bg-[#11120E] text-white"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-6">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.('Volt Mobility Home');
          }}
          className="font-display text-lg font-bold tracking-tight text-lime-400 whitespace-nowrap shrink-0"
        >
          Volt Mobility
        </a>

        <nav aria-label="Primary Navigation" className="flex items-center gap-6">
          <ul className="flex items-center gap-6 text-sm font-semibold text-neutral-300">
            <li>
              <a
                href="#test-drive"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Book Test Drive');
                }}
                className="transition-colors hover:text-lime-400 whitespace-nowrap shrink-0"
              >
                Test Drive
              </a>
            </li>
            <li>
              <a
                href="#charging"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Charging Network');
                }}
                className="transition-colors hover:text-lime-400 whitespace-nowrap shrink-0"
              >
                Charging
              </a>
            </li>
            <li>
              <div onMouseEnter={handleTriggerEnter}>
                <button
                  type="button"
                  aria-expanded={openVisible}
                  aria-haspopup="true"
                  onClick={handleTriggerClick}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-bold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-400 ${
                    openVisible
                      ? 'bg-lime-400 text-neutral-950'
                      : 'bg-neutral-800 text-lime-300 hover:bg-neutral-700'
                  }`}
                >
                  <span>Vehicles</span>
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
          className="absolute left-0 right-0 top-full z-30 w-full border-b border-lime-400/20 bg-[#171914] text-white shadow-2xl shadow-black/60"
        >
          <div className="mx-auto max-w-6xl px-6 py-6">
            {/* Top Mega Search Bar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-4">
              <span className="text-xs font-semibold text-neutral-400">
                Explore Vehicles, Chargers &amp; Service Plans
              </span>
              <div className="relative w-80">
                <label htmlFor="volt-search" className="sr-only">
                  Search Volt models and chargers
                </label>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-lime-400" />
                <input
                  id="volt-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search models, kW, warranty..."
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 py-1.5 pl-8 pr-7 text-xs text-white placeholder:text-neutral-500 focus:border-lime-400 focus:outline-none"
                />
                {query && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* 3 Equal Columns Across Top */}
            <div className="grid grid-cols-3 gap-6">
              {filteredCols.map((col) => (
                <div key={col.heading}>
                  <h3 className="mb-3 text-xs font-bold tracking-wide text-lime-400">
                    {col.heading}
                  </h3>
                  {col.items.length === 0 ? (
                    <p className="text-xs text-neutral-500">No matches.</p>
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
                              className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-neutral-800/80"
                            >
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-lime-400/10 text-lime-400 group-hover:bg-lime-400 group-hover:text-neutral-950">
                                <Icon className="h-4 w-4" />
                              </span>
                              <span>
                                <span className="block text-sm font-semibold text-white">
                                  {item.label}
                                </span>
                                <span className="block text-xs text-neutral-400">
                                  {item.desc}
                                </span>
                              </span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {/* Full-Width Horizontal Bottom Featured Gradient Banner */}
            <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-xl bg-gradient-to-r from-lime-400 via-emerald-400 to-teal-500 p-5 text-neutral-950 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-neutral-900/80">
                  2027 Fleet Edition
                </p>
                <p className="mt-0.5 font-display text-lg font-bold">
                  Volt Tourer AWD — Now Available for 48-Hour Extended Trials
                </p>
              </div>
              <a
                href="#tourer-trial"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Reserve 48h Tourer Trial');
                  setIsOpen(false);
                  setIsPinned(false);
                }}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-neutral-950 px-4 py-2 text-xs font-bold text-lime-300 transition-colors hover:bg-neutral-800"
              >
                <span>Reserve Trial</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default DropdownMenu18;
