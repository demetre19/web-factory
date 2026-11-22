'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import {
  ChevronRight,
  Columns3,
  Search,
  X,
} from 'lucide-react';

export interface ModalMenu13Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  triggerClassName?: string;
  onSelectRoute?: (href: string, label: string) => void;
}

interface MillerLeaf {
  label: string;
  summary: string;
  href: string;
}

interface MillerCategory {
  id: string;
  label: string;
  leaves: MillerLeaf[];
}

interface MillerDomain {
  id: string;
  label: string;
  categories: MillerCategory[];
}

const MILLER_DATA: MillerDomain[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    categories: [
      {
        id: 'projects',
        label: 'Projects',
        leaves: [
          {
            label: 'Active Environments',
            summary: 'Production and preview deployments',
            href: '#environments',
          },
          {
            label: 'Build Queue',
            summary: 'Pending and running worker jobs',
            href: '#build-queue',
          },
          {
            label: 'Artifact Registry',
            summary: 'Immutable container snapshots',
            href: '#artifacts',
          },
        ],
      },
      {
        id: 'teams',
        label: 'Teams & Access',
        leaves: [
          {
            label: 'Member Directory',
            summary: 'Seats, invites, and SSO status',
            href: '#members',
          },
          {
            label: 'Policy Roles',
            summary: 'Least-privilege permission groups',
            href: '#roles',
          },
        ],
      },
    ],
  },
  {
    id: 'engineering',
    label: 'Engineering',
    categories: [
      {
        id: 'compute',
        label: 'Compute',
        leaves: [
          {
            label: 'Edge Functions',
            summary: 'Sub-10ms globally distributed handlers',
            href: '#edge-functions',
          },
          {
            label: 'Scheduled Cron',
            summary: 'Recurring background triggers',
            href: '#cron',
          },
          {
            label: 'GPU Runners',
            summary: 'Dedicated inference instances',
            href: '#gpu-runners',
          },
        ],
      },
      {
        id: 'storage',
        label: 'Storage',
        leaves: [
          {
            label: 'Managed Postgres',
            summary: 'Automated branching & PITR backups',
            href: '#postgres',
          },
          {
            label: 'Object Buckets',
            summary: 'S3-compatible media storage',
            href: '#buckets',
          },
        ],
      },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    categories: [
      {
        id: 'monitoring',
        label: 'Monitoring',
        leaves: [
          {
            label: 'Uptime Checks',
            summary: 'Global synthetic health probes',
            href: '#uptime',
          },
          {
            label: 'Audit Trail',
            summary: 'Compliance-ready action logs',
            href: '#audit-trail',
          },
        ],
      },
      {
        id: 'finance',
        label: 'Billing',
        leaves: [
          {
            label: 'Spend Breakdown',
            summary: 'Cost attribution per environment',
            href: '#spend',
          },
          {
            label: 'Payment Methods',
            summary: 'Cards, ACH, and PO invoicing',
            href: '#payment-methods',
          },
        ],
      },
    ],
  },
];

export function ModalMenu13({
  defaultOpen = false,
  triggerLabel = 'Open Miller Columns',
  triggerClassName,
  onSelectRoute,
}: ModalMenu13Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [domainId, setDomainId] = useState<string>('workspace');
  const [categoryId, setCategoryId] = useState<string>('projects');
  const [query, setQuery] = useState('');
  const headingId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const activeDomain =
    MILLER_DATA.find((d) => d.id === domainId) ?? MILLER_DATA[0];
  const activeCategory =
    activeDomain.categories.find((c) => c.id === categoryId) ??
    activeDomain.categories[0];

  const q = query.trim().toLowerCase();
  const flatPaths = q
    ? MILLER_DATA.flatMap((d) =>
        d.categories.flatMap((c) =>
          c.leaves
            .filter((l) =>
              `${l.label} ${l.summary} ${c.label} ${d.label}`
                .toLowerCase()
                .includes(q)
            )
            .map((l) => ({
              ...l,
              breadcrumb: `${d.label} / ${c.label}`,
            }))
        )
      )
    : [];

  const handleDomainSelect = (nextDomain: MillerDomain) => {
    setDomainId(nextDomain.id);
    setCategoryId(nextDomain.categories[0].id);
  };

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
          'inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-900 border border-slate-300 hover:bg-slate-200/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 whitespace-nowrap shrink-0'
        }
      >
        <Columns3 className="h-4 w-4 text-slate-700" aria-hidden="true" />
        <span>{triggerLabel}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 backdrop-blur-xs p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeMenu();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            className="w-full max-w-[720px] max-h-[85vh] flex flex-col overflow-hidden rounded-xl bg-white text-slate-900 border border-slate-200 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-3.5">
              <div>
                <h2
                  id={headingId}
                  className="text-sm font-semibold text-slate-900"
                >
                  Three-Pane Miller Browser
                </h2>
                <p className="text-xs text-slate-500">
                  {activeDomain.label} › {activeCategory.label}
                </p>
              </div>
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close Miller column menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center gap-2.5 border-b border-slate-200 bg-slate-50 px-5 py-2.5">
              <Search
                className="h-4 w-4 shrink-0 text-slate-400"
                aria-hidden="true"
              />
              <label htmlFor={`${headingId}-search`} className="sr-only">
                Search all column paths
              </label>
              <input
                ref={inputRef}
                id={`${headingId}-search`}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search across all 3 columns..."
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            {q ? (
              <nav
                aria-label="Matching column destinations"
                className="flex-1 overflow-y-auto p-4"
              >
                <h3 className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Path Matches ({flatPaths.length})
                </h3>
                {flatPaths.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">
                    No paths matched &ldquo;{query}&rdquo;
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {flatPaths.map((item) => (
                      <li key={item.href}>
                        <a
                          href={item.href}
                          onClick={(e) => {
                            e.preventDefault();
                            handleSelect(item.href, item.label);
                          }}
                          className="flex min-h-[50px] items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-slate-100 transition-colors"
                        >
                          <div className="min-w-0">
                            <span className="font-mono text-[11px] text-slate-400">
                              {item.breadcrumb}
                            </span>
                            <span className="block text-sm font-semibold text-slate-900">
                              {item.label}
                            </span>
                            <span className="block text-xs text-slate-500">
                              {item.summary}
                            </span>
                          </div>
                          <ChevronRight
                            className="h-4 w-4 shrink-0 text-slate-400"
                            aria-hidden="true"
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </nav>
            ) : (
              <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 min-h-[300px]">
                {/* Column 1: Domains */}
                <section
                  aria-label="Domains"
                  className="md:col-span-3 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50 p-3"
                >
                  <h3 className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    01. Domain
                  </h3>
                  <ul className="flex md:flex-col gap-1 overflow-x-auto">
                    {MILLER_DATA.map((dom) => {
                      const active = dom.id === activeDomain.id;
                      return (
                        <li key={dom.id} className="shrink-0">
                          <button
                            type="button"
                            onClick={() => handleDomainSelect(dom)}
                            className={`flex min-h-[38px] w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                              active
                                ? 'bg-slate-900 text-white'
                                : 'text-slate-700 hover:bg-slate-200/70'
                            }`}
                          >
                            <span>{dom.label}</span>
                            <ChevronRight
                              className="hidden md:block h-3.5 w-3.5 opacity-60"
                              aria-hidden="true"
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>

                {/* Column 2: Categories */}
                <section
                  aria-label="Categories"
                  className="md:col-span-4 border-b md:border-b-0 md:border-r border-slate-200 p-3"
                >
                  <h3 className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    02. Category
                  </h3>
                  <ul className="flex md:flex-col gap-1 overflow-x-auto">
                    {activeDomain.categories.map((cat) => {
                      const active = cat.id === activeCategory.id;
                      return (
                        <li key={cat.id} className="shrink-0">
                          <button
                            type="button"
                            onClick={() => setCategoryId(cat.id)}
                            className={`flex min-h-[38px] w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                              active
                                ? 'bg-slate-100 text-slate-900 font-semibold'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            <span>{cat.label}</span>
                            <ChevronRight
                              className="hidden md:block h-3.5 w-3.5 text-slate-400"
                              aria-hidden="true"
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>

                {/* Column 3: Leaf Destinations */}
                <nav
                  aria-label="Leaf destinations"
                  className="md:col-span-5 p-3"
                >
                  <h3 className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    03. Destinations
                  </h3>
                  <ul className="space-y-1">
                    {activeCategory.leaves.map((leaf) => (
                      <li key={leaf.label}>
                        <a
                          href={leaf.href}
                          onClick={(e) => {
                            e.preventDefault();
                            handleSelect(leaf.href, leaf.label);
                          }}
                          className="block rounded-lg px-2.5 py-2 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                        >
                          <span className="block text-sm font-semibold text-slate-900">
                            {leaf.label}
                          </span>
                          <span className="mt-0.5 block text-xs text-slate-500">
                            {leaf.summary}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ModalMenu13;
