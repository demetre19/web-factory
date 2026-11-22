'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Box,
  ChevronDown,
  Compass,
  Cpu,
  Grid,
  Layers,
  PenTool,
  Ruler,
  Search,
  Sliders,
  X,
} from 'lucide-react';

export interface DropdownMenu15Props {
  onNavigate?: (label: string) => void;
  forceOpen?: boolean;
}

const WORKBENCH_COLS = [
  {
    heading: 'Parametric Modeling',
    items: [
      { label: 'Sketch Constraints', desc: '2D geometric solver', icon: PenTool, href: '#sketch' },
      { label: 'Surface Lofting', desc: 'NURBS class-A curves', icon: Compass, href: '#lofting' },
      { label: 'Assembly Mates', desc: 'Kinematic joint tree', icon: Layers, href: '#mates' },
    ],
  },
  {
    heading: 'Simulation & Export',
    items: [
      { label: 'Finite Element Mesh', desc: 'Thermal & stress FEA', icon: Grid, href: '#fea' },
      { label: 'Tolerance Stack', desc: 'GD&T dimension audit', icon: Ruler, href: '#tolerance' },
      { label: 'STEP / IGES Bridge', desc: 'Lossless kernel export', icon: Box, href: '#step' },
    ],
  },
];

const QUICK_TAGS = ['FEA', 'NURBS', 'STEP', 'Mesh', 'Solver'];

export function DropdownMenu15({ onNavigate, forceOpen }: DropdownMenu15Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [query, setQuery] = useState('');
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  const openVisible = forceOpen ?? isOpen;
  const q = query.trim().toLowerCase();
  const allItems = WORKBENCH_COLS.flatMap((c) => c.items);
  const searchResults = q
    ? allItems.filter(
        (item) => item.label.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q),
      )
    : allItems.slice(0, 3);

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
      className="relative z-20 w-full border-b border-neutral-800 bg-[#141619] text-neutral-100"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-6">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.('Strata CAD Home');
          }}
          className="font-display text-lg font-semibold tracking-tight text-cyan-400 whitespace-nowrap shrink-0"
        >
          Strata CAD
        </a>

        <nav aria-label="Primary Navigation" className="flex items-center gap-6">
          <ul className="flex items-center gap-6 text-sm font-medium text-neutral-400">
            <li>
              <a
                href="#kernels"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Kernels');
                }}
                className="transition-colors hover:text-white whitespace-nowrap shrink-0"
              >
                Kernels
              </a>
            </li>
            <li>
              <a
                href="#plugins"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Plugins');
                }}
                className="transition-colors hover:text-white whitespace-nowrap shrink-0"
              >
                Plugins
              </a>
            </li>
            <li>
              <div onMouseEnter={handleTriggerEnter}>
                <button
                  type="button"
                  aria-expanded={openVisible}
                  aria-haspopup="true"
                  onClick={handleTriggerClick}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-3.5 py-1.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 ${
                    openVisible
                      ? 'border-cyan-400 bg-cyan-400/15 text-cyan-300'
                      : 'border-neutral-700 bg-neutral-900 text-neutral-100 hover:border-neutral-600'
                  }`}
                >
                  <span>Workspace</span>
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
          className="absolute left-0 right-0 top-full z-30 w-full border-b border-neutral-800 bg-[#181B20] shadow-2xl shadow-black/60"
        >
          <div className="mx-auto grid max-w-6xl grid-cols-12 gap-8 px-6 py-7">
            {/* Zone 1: Left Dedicated Search Rail */}
            <div className="col-span-4 rounded-xl border border-neutral-800 bg-[#111317] p-4">
              <h3 className="mb-2 text-xs font-semibold text-cyan-300">
                Quick Command Search
              </h3>
              <label htmlFor="strata-rail-search" className="sr-only">
                Search Strata CAD tools
              </label>
              <div className="relative mb-3">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
                <input
                  id="strata-rail-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type tool, solver, format..."
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 py-1.5 pl-8 pr-7 text-xs text-white placeholder:text-neutral-500 focus:border-cyan-400 focus:outline-none"
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

              <div className="mb-3 flex flex-wrap gap-1.5">
                {QUICK_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setQuery(tag)}
                    className="rounded border border-neutral-700 bg-neutral-800/80 px-2 py-0.5 font-mono text-[10px] text-neutral-300 hover:border-cyan-400 hover:text-cyan-300"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <ul className="space-y-1 border-t border-neutral-800 pt-2.5">
                {searchResults.length === 0 ? (
                  <li className="py-2 text-xs text-neutral-500">No matching commands.</li>
                ) : (
                  searchResults.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate?.(item.label);
                          setIsOpen(false);
                          setIsPinned(false);
                        }}
                        className="flex items-center justify-between rounded px-2 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-cyan-300"
                      >
                        <span>{item.label}</span>
                        <ArrowRight className="h-3 w-3 opacity-60" />
                      </a>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* Zone 2: Center 2 Engineering Columns */}
            <div className="col-span-5 grid grid-cols-2 gap-6">
              {WORKBENCH_COLS.map((col) => (
                <div key={col.heading}>
                  <h3 className="mb-3 text-xs font-semibold text-neutral-400">{col.heading}</h3>
                  <ul className="space-y-1.5">
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
                            className="group flex items-start gap-2.5 rounded-lg p-2 transition-colors hover:bg-neutral-800/70"
                          >
                            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded border border-neutral-700 bg-neutral-900 text-cyan-400">
                              <Icon className="h-3.5 w-3.5" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-medium text-neutral-100">
                                {item.label}
                              </span>
                              <span className="block text-xs text-neutral-400">{item.desc}</span>
                            </span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>

            {/* Zone 3: Right Blueprint Gradient Card */}
            <div className="col-span-3">
              <h3 className="mb-3 text-xs font-semibold text-neutral-400">Kernel Release</h3>
              <div className="flex h-[calc(100%-1.75rem)] flex-col justify-between rounded-xl border border-cyan-500/25 bg-gradient-to-br from-cyan-950 via-slate-900 to-neutral-950 p-5">
                <div>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/15 text-cyan-300">
                    <Cpu className="h-4 w-4" />
                  </span>
                  <p className="mt-3 font-display text-base font-semibold text-white">
                    GPU Ray-Traced Sectioning
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-neutral-300">
                    Real-time cross-section slicing on 100k+ part assemblies.
                  </p>
                </div>
                <a
                  href="#gpu-kernel"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate?.('Inspect GPU Sectioning');
                    setIsOpen(false);
                    setIsPinned(false);
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200"
                >
                  <span>Benchmark Notes</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-800 bg-[#111317]">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
              <span className="flex items-center gap-2 text-xs text-neutral-400">
                <Sliders className="h-3.5 w-3.5 text-cyan-400" />
                <span>Desktop Linux, macOS, and WebGPU browser builds stay project-synced.</span>
              </span>
              <a
                href="#download"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Download Desktop Build');
                  setIsOpen(false);
                  setIsPinned(false);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:text-cyan-200 whitespace-nowrap"
              >
                <span>Download Client</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default DropdownMenu15;
