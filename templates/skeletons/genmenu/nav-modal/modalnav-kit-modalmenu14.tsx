'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Compass,
  Cpu,
  FileCode2,
  GitBranch,
  Search,
  Users,
  X,
} from 'lucide-react';

export interface ModalMenu14Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  triggerClassName?: string;
  onSelectRoute?: (href: string, label: string) => void;
}

interface SpokeCluster {
  id: string;
  heading: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
  links: { label: string; href: string }[];
}

const SPOKE_CLUSTERS: SpokeCluster[] = [
  {
    id: 'product',
    heading: 'Product Core',
    badgeColor: 'bg-[#2563EB] text-white',
    icon: GitBranch,
    links: [
      { label: 'Canvas Editor', href: '#canvas' },
      { label: 'Version History', href: '#versions' },
      { label: 'Design Tokens', href: '#tokens' },
    ],
  },
  {
    id: 'infra',
    heading: 'Cloud Engine',
    badgeColor: 'bg-[#F97316] text-white',
    icon: Cpu,
    links: [
      { label: 'Edge Workers', href: '#edge-workers' },
      { label: 'Queue Pipelines', href: '#pipelines' },
      { label: 'Replica Stores', href: '#replicas' },
    ],
  },
  {
    id: 'team',
    heading: 'Team & Org',
    badgeColor: 'bg-[#059669] text-white',
    icon: Users,
    links: [
      { label: 'Seat Directory', href: '#seats' },
      { label: 'Approval Rules', href: '#approvals' },
      { label: 'Audit Feed', href: '#audit' },
    ],
  },
  {
    id: 'docs',
    heading: 'SDK & Specs',
    badgeColor: 'bg-[#7C3AED] text-white',
    icon: FileCode2,
    links: [
      { label: 'REST Endpoints', href: '#rest' },
      { label: 'CLI Cookbook', href: '#cli-cookbook' },
      { label: 'Migration Notes', href: '#migrations' },
    ],
  },
];

export function ModalMenu14({
  defaultOpen = false,
  triggerLabel = 'Open Hub & Spokes',
  triggerClassName,
  onSelectRoute,
}: ModalMenu14Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const headingId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const q = query.trim().toLowerCase();
  const filteredClusters = SPOKE_CLUSTERS.map((cluster) => ({
    ...cluster,
    links: cluster.links.filter((link) =>
      !q
        ? true
        : `${link.label} ${cluster.heading}`.toLowerCase().includes(q)
    ),
  })).filter((cluster) => cluster.links.length > 0);

  const closeMenu = () => {
    setIsOpen(false);
    setQuery('');
    setTimeout(() => triggerRef.current?.focus(), 0);
  };

  const handleSelect = (href: string, label: string) => {
    onSelectRoute?.(href, label);
    closeMenu();
  };

  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add('overflow-hidden');
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 10);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.classList.remove('overflow-hidden');
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          triggerClassName ??
          'inline-flex items-center gap-2 rounded-lg bg-[#7C3AED] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#6D28D9] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] whitespace-nowrap shrink-0'
        }
      >
        <Compass className="h-4 w-4" aria-hidden="true" />
        <span>{triggerLabel}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeMenu();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            className="w-full max-w-[680px] max-h-[85vh] flex flex-col overflow-hidden rounded-2xl bg-[#F8FAFC] text-slate-900 border border-slate-200 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <h2
                  id={headingId}
                  className="text-base font-bold tracking-tight text-slate-900"
                >
                  Radial Hub &amp; Spoke Map
                </h2>
                <p className="text-xs text-slate-500">
                  Four domain spokes radiating from your central workspace hub
                </p>
              </div>
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close radial hub menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="border-b border-slate-200 bg-white px-6 py-3">
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 focus-within:border-[#7C3AED] focus-within:bg-white">
                <Search
                  className="h-4 w-4 shrink-0 text-slate-400"
                  aria-hidden="true"
                />
                <label htmlFor={`${headingId}-search`} className="sr-only">
                  Filter spoke destinations
                </label>
                <input
                  ref={inputRef}
                  id={`${headingId}-search`}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter spokes and destinations..."
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <nav
              aria-label="Hub and spoke navigation"
              className="flex-1 overflow-y-auto p-6"
            >
              {filteredClusters.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  No spokes matched &ldquo;{query}&rdquo;
                </div>
              ) : (
                <div className="relative">
                  {/* Central Hub Anchor */}
                  <div className="mb-5 flex justify-center">
                    <a
                      href="#hub-home"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSelect('#hub-home', 'Central Workspace Hub');
                      }}
                      className="inline-flex items-center gap-3 rounded-xl border-2 border-slate-900 bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
                    >
                      <Compass className="h-4 w-4 text-amber-400" aria-hidden="true" />
                      <span>Central Workspace Hub</span>
                    </a>
                  </div>

                  {/* 4 Spoke Quadrants */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredClusters.map((cluster) => {
                      const Icon = cluster.icon;
                      return (
                        <section
                          key={cluster.id}
                          aria-label={cluster.heading}
                          className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs"
                        >
                          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                            <span
                              className={`flex h-8 w-8 items-center justify-center rounded-lg ${cluster.badgeColor}`}
                            >
                              <Icon className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <h3 className="text-sm font-bold text-slate-900">
                              {cluster.heading}
                            </h3>
                          </div>
                          <ul className="mt-2.5 space-y-1">
                            {cluster.links.map((link) => (
                              <li key={link.label}>
                                <a
                                  href={link.href}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleSelect(link.href, link.label);
                                  }}
                                  className="group flex min-h-[38px] items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                                >
                                  <span>{link.label}</span>
                                  <ArrowUpRight
                                    className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-900"
                                    aria-hidden="true"
                                  />
                                </a>
                              </li>
                            ))}
                          </ul>
                        </section>
                      );
                    })}
                  </div>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

export default ModalMenu14;
