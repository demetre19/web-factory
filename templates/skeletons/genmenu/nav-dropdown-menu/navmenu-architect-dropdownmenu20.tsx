'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  ArrowRight,
  ChevronDown,
  Cloud,
  Database,
  FolderGit2,
  Key,
  Layers,
  Search,
  Server,
  Shield,
  Terminal,
  Webhook,
  X,
} from 'lucide-react';

export interface DropdownMenu20Props {
  onNavigate?: (label: string) => void;
  forceOpen?: boolean;
}

const MODULE_COLUMNS = [
  {
    heading: 'Data & Pipelines',
    items: [
      { label: 'Warehouse Sync', desc: 'Incremental CDC streams', icon: Database, href: '#warehouse' },
      { label: 'Batch Orchestrator', desc: 'DAG dependency graphs', icon: Layers, href: '#orchestrator' },
      { label: 'Event Webhooks', desc: 'Signed HTTP fanout', icon: Webhook, href: '#webhooks' },
    ],
  },
  {
    heading: 'Runtime & Fleet',
    items: [
      { label: 'Regional Clusters', desc: 'Multi-zone autoscaling', icon: Server, href: '#clusters' },
      { label: 'Edge Gateways', desc: 'Anycast TLS termination', icon: Cloud, href: '#gateways' },
      { label: 'Live Telemetry', desc: 'Latency & throughput logs', icon: Activity, href: '#telemetry' },
    ],
  },
  {
    heading: 'Access & Source',
    items: [
      { label: 'Repo Connectors', desc: 'PR preview environments', icon: FolderGit2, href: '#repos' },
      { label: 'Role Policies', desc: 'Scoped team permissions', icon: Shield, href: '#policies' },
      { label: 'Token Vault', desc: 'Short-lived OIDC keys', icon: Key, href: '#vault' },
    ],
  },
];

export function DropdownMenu20({ onNavigate, forceOpen }: DropdownMenu20Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [query, setQuery] = useState('');
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  const openVisible = forceOpen ?? isOpen;
  const q = query.trim().toLowerCase();
  const filteredCols = MODULE_COLUMNS.map((col) => ({
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
      className="relative z-20 w-full border-b border-slate-200 bg-white text-slate-900"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.('Quarry Cloud Home');
            }}
            className="font-display text-lg font-bold tracking-tight text-slate-950 whitespace-nowrap"
          >
            Quarry Cloud
          </a>
          <span className="text-xs text-slate-300" aria-hidden="true">
            /
          </span>
          <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
            Core Workspace
          </span>
        </div>

        {/* Central App-Shell Command Search */}
        <div className="relative hidden max-w-sm flex-1 md:block">
          <label htmlFor="quarry-search" className="sr-only">
            Search Quarry modules
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            id="quarry-search"
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
            placeholder="Jump to module, pipeline, policy..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <nav aria-label="Primary Navigation" className="flex items-center gap-6">
          <ul className="flex items-center gap-6 text-sm font-medium text-slate-600">
            <li>
              <a
                href="#billing"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Billing');
                }}
                className="transition-colors hover:text-slate-950 whitespace-nowrap shrink-0"
              >
                Billing
              </a>
            </li>
            <li>
              <a
                href="#audit"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Audit Log');
                }}
                className="transition-colors hover:text-slate-950 whitespace-nowrap shrink-0"
              >
                Audit Log
              </a>
            </li>
            <li>
              <div onMouseEnter={handleTriggerEnter}>
                <button
                  type="button"
                  aria-expanded={openVisible}
                  aria-haspopup="true"
                  onClick={handleTriggerClick}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                    openVisible
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <span>Modules</span>
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
          className="absolute left-0 right-0 top-full z-30 w-full border-b border-slate-200 bg-white shadow-xl shadow-slate-900/10"
        >
          <div className="mx-auto grid max-w-6xl grid-cols-12 gap-6 px-6 py-7">
            {filteredCols.map((col) => (
              <div key={col.heading} className="col-span-3">
                <h3 className="mb-3 text-xs font-semibold tracking-wide text-slate-400">
                  {col.heading}
                </h3>
                {col.items.length === 0 ? (
                  <p className="text-xs text-slate-400">No matches.</p>
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
                            className="group flex items-start gap-2.5 rounded-lg p-2 transition-colors hover:bg-indigo-50/70"
                          >
                            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
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
            ))}

            <div className="col-span-3">
              <h3 className="mb-3 text-xs font-semibold tracking-wide text-slate-400">
                Featured Capability
              </h3>
              <div className="flex h-[calc(100%-1.75rem)] flex-col justify-between rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-slate-900 p-5 text-white">
                <div>
                  <p className="text-xs font-medium text-indigo-200">Zero-Downtime Sync</p>
                  <p className="mt-1 font-display text-base font-bold leading-snug">
                    Logical Replication Across Regions
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-indigo-100">
                    Stream schema and table snapshots without locking production reads.
                  </p>
                </div>
                <a
                  href="#replication"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate?.('Configure Replication');
                    setIsOpen(false);
                    setIsPinned(false);
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-white hover:underline"
                >
                  <span>Read Setup Guide</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-50">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
              <span className="flex items-center gap-2 text-xs text-slate-600">
                <Terminal className="h-3.5 w-3.5 text-indigo-600" />
                <span>Install the Quarry CLI to scaffold pipelines directly from your terminal.</span>
              </span>
              <a
                href="#cli-install"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Open CLI Install Guide');
                  setIsOpen(false);
                  setIsPinned(false);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
              >
                <span>CLI Docs</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default DropdownMenu20;
