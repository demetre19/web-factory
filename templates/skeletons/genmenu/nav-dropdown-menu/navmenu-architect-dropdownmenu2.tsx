'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  ArrowRight,
  ChevronDown,
  Cpu,
  Database,
  KeyRound,
  Layers,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';

export interface DropdownMenu2Props {
  onNavigate?: (label: string) => void;
  forceOpen?: boolean;
}

const TILE_SERVICES = [
  { label: 'Edge Compute', short: 'Workers', icon: Cpu, href: '#edge-compute' },
  { label: 'Managed DB', short: 'Postgres', icon: Database, href: '#postgres' },
  { label: 'Event Queues', short: 'Streams', icon: Layers, href: '#queues' },
  { label: 'Audit Vault', short: 'Immutable', icon: ShieldCheck, href: '#audit-vault' },
];

const SECURITY_LINKS = [
  { label: 'Live Traces', desc: 'Distributed span inspector', icon: Activity, href: '#traces' },
  { label: 'Secrets KMS', desc: 'Hardware-backed rotation', icon: KeyRound, href: '#kms' },
];

export function DropdownMenu2({ onNavigate, forceOpen }: DropdownMenu2Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [query, setQuery] = useState('');
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerWrapRef = useRef<HTMLDivElement>(null);

  const openVisible = forceOpen ?? isOpen;
  const q = query.trim().toLowerCase();
  const filteredTiles = TILE_SERVICES.filter(
    (item) => item.label.toLowerCase().includes(q) || item.short.toLowerCase().includes(q),
  );
  const filteredSecurity = SECURITY_LINKS.filter(
    (item) => item.label.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q),
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
    <header className="relative z-20 w-full border-b border-slate-800 bg-[#0B0F17] text-slate-100">
      <div
        ref={headerWrapRef}
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6"
      >
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.('Kinetix Cloud Home');
          }}
          className="font-display text-lg font-semibold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          Kinetix Cloud
        </a>

        {/* Split Header Center Search Bar */}
        <div className="relative hidden max-w-xs flex-1 md:block">
          <label htmlFor="kinetix-header-search" className="sr-only">
            Search Kinetix platform
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            id="kinetix-header-search"
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
            placeholder="Search platform modules..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900/90 py-1.5 pl-8 pr-8 text-xs text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <nav aria-label="Primary Navigation" className="flex items-center gap-6">
          <ul className="flex items-center gap-6 text-sm font-medium text-slate-300">
            <li>
              <a
                href="#pricing"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Pricing');
                }}
                className="transition-colors hover:text-white whitespace-nowrap shrink-0"
              >
                Pricing
              </a>
            </li>
            <li>
              <a
                href="#docs"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Docs');
                }}
                className="transition-colors hover:text-white whitespace-nowrap shrink-0"
              >
                Docs
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
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${
                    openVisible
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-200 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <span>Platform</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-sky-400 transition-transform duration-150 ${
                      openVisible ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openVisible && (
                  <div className="absolute right-0 top-full z-30 mt-2 w-[320px] overflow-hidden rounded-xl border border-slate-800 bg-[#0F1624] shadow-2xl shadow-black/50">
                    <div className="space-y-3 p-3">
                      {filteredTiles.length === 0 && filteredSecurity.length === 0 ? (
                        <p className="px-2 py-4 text-center text-xs text-slate-400">
                          No modules matching &ldquo;{query}&rdquo;.
                        </p>
                      ) : (
                        <>
                          {filteredTiles.length > 0 && (
                            <div>
                              <h3 className="px-1 pb-2 text-[11px] font-semibold tracking-wide text-slate-400">
                                Core Infrastructure
                              </h3>
                              <ul className="grid grid-cols-2 gap-1.5">
                                {filteredTiles.map((item) => {
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
                                        className="group flex flex-col gap-1.5 rounded-lg border border-slate-800/80 bg-slate-900/60 p-2.5 transition-colors hover:border-sky-500/40 hover:bg-slate-800"
                                      >
                                        <span className="flex h-6 w-6 items-center justify-center rounded bg-sky-500/10 text-sky-400">
                                          <Icon className="h-3.5 w-3.5" />
                                        </span>
                                        <span>
                                          <span className="block text-xs font-semibold text-slate-100">
                                            {item.label}
                                          </span>
                                          <span className="block text-[11px] text-slate-400">
                                            {item.short}
                                          </span>
                                        </span>
                                      </a>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          )}

                          {filteredSecurity.length > 0 && (
                            <div className="border-t border-slate-800/80 pt-2.5">
                              <h3 className="px-1 pb-1.5 text-[11px] font-semibold tracking-wide text-slate-400">
                                Security &amp; Telemetry
                              </h3>
                              <ul className="space-y-0.5">
                                {filteredSecurity.map((item) => {
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
                                        className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-slate-800/80"
                                      >
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-slate-700/80 bg-slate-900 text-sky-400">
                                          <Icon className="h-3.5 w-3.5" />
                                        </span>
                                        <span className="min-w-0">
                                          <span className="block text-xs font-semibold text-slate-100">
                                            {item.label}
                                          </span>
                                          <span className="block text-[11px] text-slate-400">
                                            {item.desc}
                                          </span>
                                        </span>
                                      </a>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="border-t border-slate-800 bg-slate-900/90 px-4 py-2.5">
                      <a
                        href="#changelog"
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate?.('Read Autumn Runtime Notes');
                          setIsOpen(false);
                          setIsPinned(false);
                        }}
                        className="group flex items-center justify-between text-xs font-medium text-sky-300 hover:text-sky-200"
                      >
                        <span>Read Autumn Runtime Notes</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
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

export default DropdownMenu2;
