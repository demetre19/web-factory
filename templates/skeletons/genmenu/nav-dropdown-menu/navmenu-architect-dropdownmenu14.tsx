'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Anchor,
  ArrowRight,
  ChevronDown,
  Compass,
  Navigation,
  Radio,
  Search,
  Ship,
  Waves,
  X,
} from 'lucide-react';

export interface DropdownMenu14Props {
  onNavigate?: (label: string) => void;
  forceOpen?: boolean;
}

type MarineTab = 'vessels' | 'ports';

const MARINE_DATA: Record<
  MarineTab,
  Array<{ label: string; meta: string; icon: React.ComponentType<{ className?: string }>; href: string }>
> = {
  vessels: [
    { label: 'Container Carriers', meta: '14,000 TEU', icon: Ship, href: '#carriers' },
    { label: 'Autonomous Tugs', meta: 'Harbor ops', icon: Navigation, href: '#tugs' },
    { label: 'Ice-Class Tankers', meta: 'Baltic route', icon: Waves, href: '#tankers' },
  ],
  ports: [
    { label: 'Rotterdam Deepwater', meta: 'Berth A1-A8', icon: Anchor, href: '#rotterdam' },
    { label: 'VHF Dispatch Grid', meta: '24h Watch', icon: Radio, href: '#vhf' },
    { label: 'Charting Telemetry', meta: 'AIS Live', icon: Compass, href: '#ais' },
  ],
};

export function DropdownMenu14({ onNavigate, forceOpen }: DropdownMenu14Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [tab, setTab] = useState<MarineTab>('vessels');
  const [query, setQuery] = useState('');
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerWrapRef = useRef<HTMLDivElement>(null);

  const openVisible = forceOpen ?? isOpen;
  const q = query.trim().toLowerCase();
  const activeList = q
    ? [...MARINE_DATA.vessels, ...MARINE_DATA.ports].filter(
        (item) => item.label.toLowerCase().includes(q) || item.meta.toLowerCase().includes(q),
      )
    : MARINE_DATA[tab];

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
    <header className="relative z-20 w-full border-b border-sky-900/60 bg-[#0A192F] text-sky-50">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-6">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.('Nautilus Marine Home');
          }}
          className="font-display text-lg font-semibold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          Nautilus Marine
        </a>

        <nav aria-label="Primary Navigation" className="flex items-center gap-6">
          <ul className="flex items-center gap-6 text-sm font-medium text-sky-200">
            <li>
              <a
                href="#charters"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Charters');
                }}
                className="transition-colors hover:text-white whitespace-nowrap shrink-0"
              >
                Charters
              </a>
            </li>
            <li>
              <a
                href="#safety"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Maritime Safety');
                }}
                className="transition-colors hover:text-white whitespace-nowrap shrink-0"
              >
                Safety
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
                  className={`inline-flex items-center gap-1.5 rounded-md border px-3.5 py-1.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 ${
                    openVisible
                      ? 'border-sky-400 bg-sky-400 text-[#0A192F]'
                      : 'border-sky-800 bg-[#112240] text-sky-100 hover:border-sky-600'
                  }`}
                >
                  <span>Fleet</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-150 ${
                      openVisible ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openVisible && (
                  <div className="absolute right-0 top-full z-30 mt-2 w-[296px] overflow-hidden rounded-xl border border-sky-800/80 bg-[#0F2341] shadow-2xl shadow-black/50">
                    <div className="border-b border-sky-800/60 p-3">
                      <label htmlFor="nautilus-search" className="sr-only">
                        Search fleet and ports
                      </label>
                      <div className="relative mb-2.5">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-sky-400" />
                        <input
                          id="nautilus-search"
                          type="search"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Search vessel or port..."
                          className="w-full rounded-lg border border-sky-800 bg-[#0A192F] py-1.5 pl-8 pr-7 text-xs text-white placeholder:text-sky-400/60 focus:border-sky-400 focus:outline-none"
                        />
                        {query && (
                          <button
                            type="button"
                            aria-label="Clear search"
                            onClick={() => setQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-sky-400 hover:text-white"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>

                      <div role="tablist" aria-label="Fleet categories" className="grid grid-cols-2 gap-1 rounded-lg bg-[#0A192F] p-1">
                        <button
                          type="button"
                          role="tab"
                          aria-selected={!q && tab === 'vessels'}
                          onClick={() => {
                            setQuery('');
                            setTab('vessels');
                          }}
                          className={`rounded-md py-1 text-xs font-semibold transition-colors ${
                            !q && tab === 'vessels'
                              ? 'bg-sky-400 text-[#0A192F]'
                              : 'text-sky-200 hover:text-white'
                          }`}
                        >
                          Vessels
                        </button>
                        <button
                          type="button"
                          role="tab"
                          aria-selected={!q && tab === 'ports'}
                          onClick={() => {
                            setQuery('');
                            setTab('ports');
                          }}
                          className={`rounded-md py-1 text-xs font-semibold transition-colors ${
                            !q && tab === 'ports'
                              ? 'bg-sky-400 text-[#0A192F]'
                              : 'text-sky-200 hover:text-white'
                          }`}
                        >
                          Ports
                        </button>
                      </div>
                    </div>

                    <div className="p-2">
                      <h3 className="px-2.5 pb-1 pt-1 text-[11px] font-semibold text-sky-300/70">
                        {q ? 'Matching Entries' : tab === 'vessels' ? 'Active Fleet' : 'Harbor Terminals'}
                      </h3>
                      {activeList.length === 0 ? (
                        <p className="px-2.5 py-3 text-xs text-sky-300/70">
                          No entries match &ldquo;{query}&rdquo;.
                        </p>
                      ) : (
                        <ul className="space-y-0.5">
                          {activeList.map((item) => {
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
                                  className="group flex items-center justify-between rounded-lg px-2.5 py-2 transition-colors hover:bg-sky-900/60"
                                >
                                  <span className="flex items-center gap-2.5">
                                    <Icon className="h-4 w-4 text-sky-400" />
                                    <span className="text-xs font-semibold text-white">
                                      {item.label}
                                    </span>
                                  </span>
                                  <span className="font-mono text-[11px] tabular-nums text-sky-300/80">
                                    {item.meta}
                                  </span>
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>

                    <div className="border-t border-sky-800/70 bg-[#081426] px-4 py-2.5">
                      <a
                        href="#dispatch"
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate?.('Open Port Dispatch');
                          setIsOpen(false);
                          setIsPinned(false);
                        }}
                        className="group flex items-center justify-between text-xs font-medium text-sky-300 hover:text-white"
                      >
                        <span>View Live Berth Schedules</span>
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

export default DropdownMenu14;
