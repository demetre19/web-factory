'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Anchor, ChevronDown, Container, FileCheck2, MapPin, Plane, Search, Train, X } from 'lucide-react';

export interface DropdownMenu5Props {
  onNavigate?: (label: string) => void;
  forceOpen?: boolean;
}

type FreightMode = 'ALL' | 'SEA' | 'AIR' | 'RAIL';

const LOGISTICS_ITEMS = [
  { label: 'Ocean Containers', code: 'SEA', mode: 'SEA' as const, icon: Anchor, href: '#ocean' },
  { label: 'Port Schedules', code: 'OPS', mode: 'SEA' as const, icon: Container, href: '#schedules' },
  { label: 'Air Priority', code: 'AIR', mode: 'AIR' as const, icon: Plane, href: '#air' },
  { label: 'Customs Clearance', code: 'DOC', mode: 'AIR' as const, icon: FileCheck2, href: '#customs' },
  { label: 'Rail Corridors', code: 'RAIL', mode: 'RAIL' as const, icon: Train, href: '#rail' },
  { label: 'Inland Hub Locator', code: 'MAP', mode: 'RAIL' as const, icon: MapPin, href: '#hubs' },
];

export function DropdownMenu5({ onNavigate, forceOpen }: DropdownMenu5Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [mode, setMode] = useState<FreightMode>('ALL');
  const [query, setQuery] = useState('');
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerWrapRef = useRef<HTMLDivElement>(null);

  const openVisible = forceOpen ?? isOpen;
  const q = query.trim().toLowerCase();
  const filteredItems = LOGISTICS_ITEMS.filter((item) => {
    if (mode !== 'ALL' && item.mode !== mode) return false;
    if (!q) return true;
    return item.label.toLowerCase().includes(q) || item.code.toLowerCase().includes(q);
  });

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
    <header className="relative z-20 w-full border-b border-slate-200 bg-slate-50 text-slate-900">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-6">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.('Nordic Freight Home');
          }}
          className="font-display text-lg font-semibold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          Nordic Freight
        </a>

        <nav aria-label="Primary Navigation" className="flex items-center gap-6">
          <ul className="flex items-center gap-6 text-sm font-medium text-slate-600">
            <li>
              <a
                href="#lanes"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Trade Lanes');
                }}
                className="transition-colors hover:text-slate-950 whitespace-nowrap shrink-0"
              >
                Trade Lanes
              </a>
            </li>
            <li>
              <a
                href="#tracking"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Track Shipment');
                }}
                className="transition-colors hover:text-slate-950 whitespace-nowrap shrink-0"
              >
                Tracking
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
                  className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
                    openVisible
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-300 bg-white text-slate-800 hover:border-slate-400'
                  }`}
                >
                  <span>Logistics</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-150 ${
                      openVisible ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openVisible && (
                  <div className="absolute right-0 top-full z-30 mt-2 w-[280px] rounded-md border border-slate-300 bg-white shadow-md shadow-slate-900/5">
                    <div className="border-b border-slate-200 bg-slate-50/80 p-2.5">
                      <label htmlFor="nordic-search" className="sr-only">
                        Search routes or codes
                      </label>
                      <div className="relative mb-2">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <input
                          id="nordic-search"
                          type="search"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Search lane or code..."
                          className="w-full rounded border border-slate-300 bg-white py-1.5 pl-8 pr-7 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
                        />
                        {query && (
                          <button
                            type="button"
                            aria-label="Clear search"
                            onClick={() => setQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>

                      <div role="group" aria-label="Filter freight mode" className="grid grid-cols-4 gap-1">
                        {(['ALL', 'SEA', 'AIR', 'RAIL'] as const).map((tab) => (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => setMode(tab)}
                            className={`rounded py-1 font-mono text-[10px] font-semibold transition-colors ${
                              mode === tab
                                ? 'bg-slate-900 text-white'
                                : 'bg-white text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-2">
                      <h3 className="px-2 pb-1 text-[11px] font-semibold text-slate-400">
                        Active Operations
                      </h3>
                      {filteredItems.length === 0 ? (
                        <p className="px-2 py-3 text-xs text-slate-500">
                          No routes match &ldquo;{query}&rdquo;.
                        </p>
                      ) : (
                        <ul className="space-y-0.5">
                          {filteredItems.map((item) => {
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
                                  className="group flex items-center justify-between rounded px-2 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-900 hover:text-white"
                                >
                                  <span className="flex items-center gap-2">
                                    <Icon className="h-3.5 w-3.5 text-slate-400 group-hover:text-sky-300" />
                                    <span>{item.label}</span>
                                  </span>
                                  <span className="font-mono text-[10px] tabular-nums text-slate-400 group-hover:text-slate-300">
                                    {item.code}
                                  </span>
                                </a>
                              </li>
                            );
                          })}
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

export default DropdownMenu5;
