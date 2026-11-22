'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { BookA, Search, X } from 'lucide-react';

export interface ModalMenu17Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  triggerClassName?: string;
  onSelectRoute?: (href: string, label: string) => void;
}

type AlphaBucket = 'All' | 'A–D' | 'E–L' | 'M–R' | 'S–Z';

interface SitemapEntry {
  label: string;
  href: string;
  bucket: Exclude<AlphaBucket, 'All'>;
  section: string;
}

const SITEMAP_ENTRIES: SitemapEntry[] = [
  { label: 'Access Control', href: '#access-control', bucket: 'A–D', section: 'Security' },
  { label: 'API Keys', href: '#api-keys', bucket: 'A–D', section: 'Developer' },
  { label: 'Audit Logs', href: '#audit-logs', bucket: 'A–D', section: 'Security' },
  { label: 'Billing History', href: '#billing-history', bucket: 'A–D', section: 'Finance' },
  { label: 'Compliance Reports', href: '#compliance', bucket: 'A–D', section: 'Security' },
  { label: 'Deployment Hooks', href: '#deploy-hooks', bucket: 'A–D', section: 'Platform' },
  { label: 'Edge Caching', href: '#edge-caching', bucket: 'E–L', section: 'Network' },
  { label: 'Environment Vars', href: '#env-vars', bucket: 'E–L', section: 'Platform' },
  { label: 'Failover Regions', href: '#failover', bucket: 'E–L', section: 'Network' },
  { label: 'GraphQL Explorer', href: '#graphql', bucket: 'E–L', section: 'Developer' },
  { label: 'Incident Status', href: '#incidents', bucket: 'E–L', section: 'Ops' },
  { label: 'Log Drains', href: '#log-drains', bucket: 'E–L', section: 'Ops' },
  { label: 'Member Invites', href: '#invites', bucket: 'M–R', section: 'Team' },
  { label: 'Metrics Export', href: '#metrics', bucket: 'M–R', section: 'Ops' },
  { label: 'Network Mesh', href: '#mesh', bucket: 'M–R', section: 'Network' },
  { label: 'Quota Limits', href: '#quotas', bucket: 'M–R', section: 'Finance' },
  { label: 'Release Channels', href: '#channels', bucket: 'M–R', section: 'Platform' },
  { label: 'Retention Rules', href: '#retention', bucket: 'M–R', section: 'Security' },
  { label: 'SAML Identity', href: '#saml', bucket: 'S–Z', section: 'Security' },
  { label: 'Scheduled Jobs', href: '#cron-jobs', bucket: 'S–Z', section: 'Platform' },
  { label: 'Usage Forecasts', href: '#forecasts', bucket: 'S–Z', section: 'Finance' },
];

const BUCKETS: AlphaBucket[] = ['All', 'A–D', 'E–L', 'M–R', 'S–Z'];

export function ModalMenu17({
  defaultOpen = false,
  triggerLabel = 'Open A–Z Sitemap',
  triggerClassName,
  onSelectRoute,
}: ModalMenu17Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [bucket, setBucket] = useState<AlphaBucket>('All');
  const [query, setQuery] = useState('');
  const headingId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const q = query.trim().toLowerCase();
  const filteredEntries = SITEMAP_ENTRIES.filter((entry) => {
    if (bucket !== 'All' && entry.bucket !== bucket) return false;
    if (!q) return true;
    return `${entry.label} ${entry.section}`.toLowerCase().includes(q);
  });

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
          'inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 border border-neutral-300 hover:bg-neutral-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 whitespace-nowrap shrink-0'
        }
      >
        <BookA className="h-4 w-4 text-neutral-600" aria-hidden="true" />
        <span>{triggerLabel}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/50 backdrop-blur-xs p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeMenu();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            className="w-full max-w-[720px] max-h-[85vh] flex flex-col overflow-hidden rounded-xl bg-white text-neutral-900 border border-neutral-200 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-6 py-4">
              <div>
                <h2
                  id={headingId}
                  className="text-base font-semibold text-neutral-900"
                >
                  A–Z Sitemap Matrix
                </h2>
                <p className="text-xs text-neutral-500">
                  Dense three-column alphabetical directory across 21 routes
                </p>
              </div>
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close A-Z sitemap"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 bg-neutral-50 px-6 py-3">
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 focus-within:border-neutral-900">
                <Search
                  className="h-4 w-4 shrink-0 text-neutral-400"
                  aria-hidden="true"
                />
                <label htmlFor={`${headingId}-search`} className="sr-only">
                  Search alphabetical sitemap
                </label>
                <input
                  ref={inputRef}
                  id={`${headingId}-search`}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter A–Z routes..."
                  className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                />
              </div>

              <div
                role="group"
                aria-label="Alphabetical range filter"
                className="flex items-center gap-1 overflow-x-auto"
              >
                {BUCKETS.map((b) => {
                  const active = bucket === b;
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBucket(b)}
                      aria-pressed={active}
                      className={`min-h-[34px] rounded-md px-2.5 py-1 font-mono text-xs font-medium whitespace-nowrap transition-colors ${
                        active
                          ? 'bg-neutral-900 text-white'
                          : 'text-neutral-600 hover:bg-neutral-200/70 hover:text-neutral-900'
                      }`}
                    >
                      {b}
                    </button>
                  );
                })}
              </div>
            </div>

            <nav
              aria-label="Alphabetical sitemap directory"
              className="flex-1 overflow-y-auto p-6"
            >
              <h3 className="sr-only">Sitemap Entries ({bucket})</h3>
              {filteredEntries.length === 0 ? (
                <div className="py-10 text-center text-sm text-neutral-500">
                  No routes matched &ldquo;{query}&rdquo; in {bucket}
                </div>
              ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1">
                  {filteredEntries.map((item) => (
                    <li
                      key={item.label}
                      className="border-b border-neutral-100"
                    >
                      <a
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSelect(item.href, item.label);
                        }}
                        className="flex min-h-[42px] items-baseline justify-between gap-2 py-2 text-sm hover:text-neutral-900 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 rounded-sm"
                      >
                        <span className="font-medium text-neutral-800 group-hover:underline underline-offset-4">
                          {item.label}
                        </span>
                        <span className="font-mono text-[11px] text-neutral-400 shrink-0">
                          {item.section}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

export default ModalMenu17;
