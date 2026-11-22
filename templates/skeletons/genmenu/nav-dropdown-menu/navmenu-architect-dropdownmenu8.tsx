'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Compass,
  Film,
  Flame,
  LayoutGrid,
  Megaphone,
  Music2,
  Search,
  Shapes,
  Video,
  X,
} from 'lucide-react';

export interface DropdownMenu8Props {
  onNavigate?: (label: string) => void;
  forceOpen?: boolean;
}

const EXPLORE_TABS = [
  {
    id: 'suites',
    heading: 'Creative Suites',
    sub: 'Motion, vectors, and grids',
    items: [
      { label: 'Motion Storyboards', desc: 'Keyframe curves & camera rigs', icon: Film, href: '#storyboards' },
      { label: 'Vector Foundry', desc: 'Variable glyph & icon sets', icon: Shapes, href: '#vectors' },
      { label: 'Modular Grids', desc: 'Responsive artboard rules', icon: LayoutGrid, href: '#grids' },
      { label: 'Color Systems Playbook', desc: 'Perceptual contrast palettes', icon: BookOpen, href: '#color-playbook' },
    ],
  },
  {
    id: 'broadcast',
    heading: 'Broadcast & Sound',
    sub: 'Audio scoring and live stages',
    items: [
      { label: 'Spatial Scoring', desc: 'Multi-channel stems & cues', icon: Music2, href: '#scoring' },
      { label: 'Live Stages', desc: 'Low-latency studio feeds', icon: Video, href: '#stages' },
      { label: 'Launch Campaigns', desc: 'Synchronized press kits', icon: Megaphone, href: '#campaigns' },
      { label: 'Weekly Featured Reels', desc: 'Curated community reels', icon: Flame, href: '#featured-reels' },
    ],
  },
  {
    id: 'guides',
    heading: 'Guides & Curations',
    sub: 'Monographs and field notes',
    items: [
      { label: 'Creative Direction Map', desc: 'Editorial moodboarding guide', icon: Compass, href: '#direction-map' },
      { label: 'Typography Specimen Index', desc: 'Pairing notes & licensing', icon: BookOpen, href: '#specimens' },
      { label: 'Motion Timing Curves', desc: 'Physics & spring presets', icon: Film, href: '#timing' },
      { label: 'Studio Residency Archive', desc: 'Past cohorts & essays', icon: Shapes, href: '#archive' },
    ],
  },
];

export function DropdownMenu8({ onNavigate, forceOpen }: DropdownMenu8Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [activeTabId, setActiveTabId] = useState('suites');
  const [query, setQuery] = useState('');
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  const openVisible = forceOpen ?? isOpen;
  const q = query.trim().toLowerCase();

  const activeTab = EXPLORE_TABS.find((t) => t.id === activeTabId) ?? EXPLORE_TABS[0];
  const allItems = EXPLORE_TABS.flatMap((t) =>
    t.items.map((item) => ({ ...item, group: t.heading })),
  );
  const displayedItems = q
    ? allItems.filter(
        (item) =>
          item.label.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q),
      )
    : activeTab.items;

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
      className="relative z-20 w-full border-b border-rose-200/70 bg-white text-slate-900"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-6">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.('Prism Collective Home');
          }}
          className="font-display text-lg font-bold tracking-tight text-violet-700 whitespace-nowrap shrink-0"
        >
          Prism Collective
        </a>

        <nav aria-label="Primary Navigation" className="flex items-center gap-6">
          <ul className="flex items-center gap-6 text-sm font-semibold text-slate-700">
            <li>
              <a
                href="#showcase"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Showcase');
                }}
                className="transition-colors hover:text-rose-600 whitespace-nowrap shrink-0"
              >
                Showcase
              </a>
            </li>
            <li>
              <a
                href="#artists"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Artists');
                }}
                className="transition-colors hover:text-rose-600 whitespace-nowrap shrink-0"
              >
                Artists
              </a>
            </li>
            <li>
              <a
                href="#events"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Events');
                }}
                className="transition-colors hover:text-rose-600 whitespace-nowrap shrink-0"
              >
                Events
              </a>
            </li>
            <li>
              <div onMouseEnter={handleTriggerEnter}>
                <button
                  type="button"
                  aria-expanded={openVisible}
                  aria-haspopup="true"
                  onClick={handleTriggerClick}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-semibold transition-all whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 ${
                    openVisible
                      ? 'bg-gradient-to-r from-rose-500 to-violet-600 text-white shadow-md shadow-rose-500/20'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  <span>Explore</span>
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
          className="absolute left-0 right-0 top-full z-30 w-full border-b border-rose-200 bg-white shadow-2xl shadow-violet-950/10"
        >
          {/* Global Search Header */}
          <div className="border-b border-rose-100 bg-rose-50/40">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
              <span className="text-xs font-bold text-rose-700">
                Browse by category or search across all creative tools
              </span>
              <div className="relative w-80">
                <label htmlFor="prism-search" className="sr-only">
                  Search Prism tools
                </label>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-rose-400" />
                <input
                  id="prism-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search motion, scoring, guides..."
                  className="w-full rounded-lg border border-rose-200 bg-white py-1.5 pl-8 pr-7 text-xs text-slate-900 placeholder:text-slate-400 focus:border-violet-600 focus:outline-none"
                />
                {query && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-12 gap-8 px-6 py-7">
            {/* Left Vertical Interactive Tabs */}
            <div className="col-span-3 border-r border-slate-100 pr-4">
              <h3 className="mb-2.5 text-xs font-bold tracking-wide text-slate-400">
                Categories
              </h3>
              <div role="tablist" aria-label="Explore categories" className="space-y-1.5">
                {EXPLORE_TABS.map((tab) => {
                  const isActive = !q && tab.id === activeTab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onMouseEnter={() => {
                        setQuery('');
                        setActiveTabId(tab.id);
                      }}
                      onClick={() => {
                        setQuery('');
                        setActiveTabId(tab.id);
                      }}
                      className={`w-full rounded-xl px-3.5 py-2.5 text-left transition-colors ${
                        isActive
                          ? 'bg-gradient-to-r from-rose-500 to-violet-600 text-white'
                          : 'bg-slate-50 text-slate-800 hover:bg-rose-50'
                      }`}
                    >
                      <span className="block text-sm font-bold">{tab.heading}</span>
                      <span
                        className={`block text-xs ${
                          isActive ? 'text-white/85' : 'text-slate-500'
                        }`}
                      >
                        {tab.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Center Dynamic 2-Col Grid */}
            <div className="col-span-5">
              <h3 className="mb-3 text-xs font-bold tracking-wide text-violet-700">
                {q ? `Search Results (${displayedItems.length})` : activeTab.heading}
              </h3>
              {displayedItems.length === 0 ? (
                <p className="rounded-lg bg-rose-50 p-4 text-xs text-rose-700">
                  No tools found for &ldquo;{query}&rdquo;.
                </p>
              ) : (
                <ul className="grid grid-cols-2 gap-2.5">
                  {displayedItems.map((item) => {
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
                          className="group flex items-start gap-2.5 rounded-xl border border-slate-100 p-2.5 transition-colors hover:border-rose-200 hover:bg-rose-50/70"
                        >
                          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700 group-hover:bg-rose-500 group-hover:text-white">
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-slate-900">
                              {item.label}
                            </span>
                            <span className="block text-xs text-slate-500">{item.desc}</span>
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Right Featured Card */}
            <div className="col-span-4">
              <h3 className="mb-3 text-xs font-bold tracking-wide text-slate-500">
                Featured Release
              </h3>
              <div className="flex h-[calc(100%-1.75rem)] flex-col justify-between rounded-2xl bg-gradient-to-br from-amber-400 via-rose-500 to-violet-600 p-6 text-white">
                <div>
                  <p className="text-xs font-semibold text-amber-100">Autumn Residency</p>
                  <p className="mt-1 font-display text-xl font-bold leading-tight">
                    Chromatic Typography &amp; Spatial Sound
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-white/90">
                    Twelve independent studios collaborating on kinetic web posters.
                  </p>
                </div>
                <a
                  href="#residency"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate?.('Open Residency Monograph');
                    setIsOpen(false);
                    setIsPinned(false);
                  }}
                  className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-xs font-bold text-rose-600 transition-transform hover:translate-x-0.5"
                >
                  <span>View Monograph</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-violet-700 via-fuchsia-600 to-rose-500 text-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
              <p className="text-xs font-medium text-white/95">
                Applications open for the Winter Experimental Design Grant — submissions close December 15.
              </p>
              <a
                href="#grant"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Apply for Design Grant');
                  setIsOpen(false);
                  setIsPinned(false);
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-200 hover:text-white whitespace-nowrap shrink-0"
              >
                <span>Submit Portfolio</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default DropdownMenu8;
