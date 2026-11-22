'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  Command,
  Cpu,
  Database,
  GitBranch,
  HardDrive,
  Lock,
  Network,
  Radar,
  Search,
  Shield,
  Terminal,
  X,
} from 'lucide-react';

export interface DropdownMenu7Props {
  onNavigate?: (label: string) => void;
  forceOpen?: boolean;
}

const PRODUCT_COLUMNS = [
  {
    heading: 'Compute & Storage',
    items: [
      { label: 'Bare Metal Nodes', desc: 'Dedicated NVMe compute', icon: Cpu, href: '#bare-metal' },
      { label: 'Object Vault', desc: 'Zero-egress S3 storage', icon: HardDrive, href: '#vault' },
      { label: 'Distributed SQL', desc: 'Multi-region consensus', icon: Database, href: '#sql' },
    ],
  },
  {
    heading: 'Developer Workflow',
    items: [
      { label: 'Build Runners', desc: 'Cached container pipelines', icon: GitBranch, href: '#runners' },
      { label: 'CLI Control Plane', desc: 'Scriptable fleet ops', icon: Terminal, href: '#cli' },
      { label: 'Command Palette', desc: 'Keyboard-first deploys', icon: Command, href: '#palette' },
    ],
  },
  {
    heading: 'Network & Defense',
    items: [
      { label: 'Private Mesh', desc: 'Encrypted WireGuard overlay', icon: Network, href: '#mesh' },
      { label: 'DDoS Shield', desc: 'Edge packet scrubbing', icon: Shield, href: '#shield' },
      { label: 'Anomaly Radar', desc: 'Real-time threat rules', icon: Radar, href: '#radar' },
    ],
  },
];

export function DropdownMenu7({ onNavigate, forceOpen }: DropdownMenu7Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [query, setQuery] = useState('');
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  const openVisible = forceOpen ?? isOpen;
  const q = query.trim().toLowerCase();
  const filteredCols = PRODUCT_COLUMNS.map((col) => ({
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
      className="relative z-20 w-full border-b border-zinc-800 bg-[#0A0D10] text-zinc-100"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.('Onyx Systems Home');
          }}
          className="font-display text-lg font-semibold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          Onyx Systems
        </a>

        {/* Center Command Search Input */}
        <div className="relative hidden max-w-sm flex-1 md:block">
          <label htmlFor="onyx-search" className="sr-only">
            Search Onyx products
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <input
            id="onyx-search"
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
            placeholder="Search compute, CLI, network..."
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 py-1.5 pl-8 pr-10 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
              /
            </kbd>
          )}
        </div>

        <nav aria-label="Primary Navigation" className="flex items-center gap-6">
          <ul className="flex items-center gap-6 text-sm font-medium text-zinc-400">
            <li>
              <a
                href="#changelog"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Changelog');
                }}
                className="transition-colors hover:text-white whitespace-nowrap shrink-0"
              >
                Changelog
              </a>
            </li>
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
              <div onMouseEnter={handleTriggerEnter}>
                <button
                  type="button"
                  aria-expanded={openVisible}
                  aria-haspopup="true"
                  onClick={handleTriggerClick}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 ${
                    openVisible
                      ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-100 hover:border-zinc-700'
                  }`}
                >
                  <span>Products</span>
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
          className="absolute left-0 right-0 top-full z-30 w-full border-b border-zinc-800 bg-[#0F1318] shadow-2xl shadow-black/60"
        >
          <div className="mx-auto grid max-w-6xl grid-cols-12 gap-6 px-6 py-7">
            {/* LEFT Spotlight Card */}
            <div className="col-span-3">
              <h3 className="mb-3 text-xs font-semibold text-zinc-400">Spotlight</h3>
              <div className="flex h-[calc(100%-1.75rem)] flex-col justify-between rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950 via-teal-950 to-zinc-950 p-5">
                <div>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/15 text-emerald-300">
                    <Lock className="h-4 w-4" />
                  </span>
                  <p className="mt-3 font-display text-base font-semibold text-white">
                    Zero-Trust Enclaves
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-300">
                    Hardware-attested confidential workloads with isolated key custody.
                  </p>
                </div>
                <a
                  href="#enclaves"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate?.('Explore Zero-Trust Enclaves');
                    setIsOpen(false);
                    setIsPinned(false);
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-emerald-200"
                >
                  <span>Explore Enclaves</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* RIGHT 3 Engineering Columns */}
            {filteredCols.map((col) => (
              <div key={col.heading} className="col-span-3">
                <h3 className="mb-3 text-xs font-semibold text-zinc-400">{col.heading}</h3>
                {col.items.length === 0 ? (
                  <p className="text-xs text-zinc-500">No items match &ldquo;{query}&rdquo;.</p>
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
                            className="group flex items-start gap-2.5 rounded-lg p-2 transition-colors hover:bg-zinc-800/70"
                          >
                            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-emerald-400 transition-colors group-hover:border-emerald-500/40 group-hover:bg-emerald-500/10">
                              <Icon className="h-3.5 w-3.5" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-medium text-zinc-100">
                                {item.label}
                              </span>
                              <span className="block text-xs text-zinc-400">{item.desc}</span>
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

          <div className="border-t border-zinc-800/90 bg-zinc-950/90">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
              <p className="text-xs text-zinc-400">
                Migrating multi-cluster workloads? Book a complimentary topology review with our solutions engineers.
              </p>
              <div className="flex items-center gap-4 shrink-0">
                <a
                  href="#docs"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate?.('View API Reference');
                    setIsOpen(false);
                    setIsPinned(false);
                  }}
                  className="text-xs font-medium text-zinc-300 hover:text-white whitespace-nowrap"
                >
                  API Reference
                </a>
                <a
                  href="#architecture-review"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate?.('Schedule Architecture Review');
                    setIsOpen(false);
                    setIsPinned(false);
                  }}
                  className="inline-flex items-center gap-1 rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-emerald-400 whitespace-nowrap"
                >
                  <span>Book Review</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default DropdownMenu7;
