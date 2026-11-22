'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Pin,
  Search,
  Star,
  X,
} from 'lucide-react';

export interface ModalMenu18Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  triggerClassName?: string;
  onSelectRoute?: (href: string, label: string) => void;
}

type WorkspaceEnv = 'Production' | 'Staging';

interface PinnableRoute {
  id: string;
  label: string;
  envNote: Record<WorkspaceEnv, string>;
  href: string;
}

const ALL_ROUTES: PinnableRoute[] = [
  {
    id: 'deployments',
    label: 'Active Deployments',
    envNote: {
      Production: '12 live regions',
      Staging: '4 preview builds',
    },
    href: '#deployments',
  },
  {
    id: 'database',
    label: 'Primary Database',
    envNote: {
      Production: 'us-east-1 cluster',
      Staging: 'ephemeral branch',
    },
    href: '#database',
  },
  {
    id: 'webhooks',
    label: 'Webhook Deliveries',
    envNote: {
      Production: '99.98% delivery',
      Staging: 'sandbox replay',
    },
    href: '#webhooks',
  },
  {
    id: 'alerts',
    label: 'Pager & Incident Rules',
    envNote: {
      Production: 'On-call escalation',
      Staging: 'Silent logging',
    },
    href: '#alerts',
  },
  {
    id: 'secrets',
    label: 'KMS Secret Store',
    envNote: {
      Production: 'Hardware HSM',
      Staging: 'Dev vault',
    },
    href: '#secrets',
  },
  {
    id: 'audit',
    label: 'Compliance Audit Feed',
    envNote: {
      Production: '365-day retention',
      Staging: '14-day retention',
    },
    href: '#audit',
  },
];

export function ModalMenu18({
  defaultOpen = false,
  triggerLabel = 'Open Pinned Shelf',
  triggerClassName,
  onSelectRoute,
}: ModalMenu18Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [env, setEnv] = useState<WorkspaceEnv>('Production');
  const [pinnedIds, setPinnedIds] = useState<string[]>([
    'deployments',
    'database',
  ]);
  const [query, setQuery] = useState('');
  const headingId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const q = query.trim().toLowerCase();
  const filteredRoutes = ALL_ROUTES.filter((r) =>
    !q
      ? true
      : `${r.label} ${r.envNote[env]}`.toLowerCase().includes(q)
  );
  const pinnedRoutes = ALL_ROUTES.filter((r) => pinnedIds.includes(r.id));

  const togglePin = (id: string) => {
    setPinnedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const closeMenu = () => {
    setIsOpen(false);
    setQuery('');
    setTimeout(() => triggerRef.current?.focus(), 0);
  };

  const handleSelect = (href: string, label: string) => {
    onSelectRoute?.(href, `${label} (${env})`);
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
          'inline-flex items-center gap-2 rounded-lg bg-[#161318] px-4 py-2.5 text-sm font-medium text-rose-100 border border-rose-950/80 hover:border-rose-500/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 whitespace-nowrap shrink-0'
        }
      >
        <Pin className="h-4 w-4 text-rose-400" aria-hidden="true" />
        <span>{triggerLabel}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeMenu();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            className="w-full max-w-[640px] max-h-[85vh] flex flex-col overflow-hidden rounded-xl bg-[#141216] text-zinc-100 border border-zinc-800 shadow-2xl"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-5 py-4">
              <div className="flex items-center gap-3">
                <h2
                  id={headingId}
                  className="text-base font-semibold text-white"
                >
                  Workspace &amp; Pinned Shelf
                </h2>
                <div
                  role="group"
                  aria-label="Environment context"
                  className="flex items-center rounded-lg bg-zinc-900 p-0.5 border border-zinc-800"
                >
                  {(['Production', 'Staging'] as WorkspaceEnv[]).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setEnv(opt)}
                      aria-pressed={env === opt}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        env === opt
                          ? 'bg-rose-500 text-white'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close workspace pinned shelf"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center gap-2.5 border-b border-zinc-800 bg-[#1B181E] px-5 py-2.5">
              <Search
                className="h-4 w-4 shrink-0 text-rose-400"
                aria-hidden="true"
              />
              <label htmlFor={`${headingId}-search`} className="sr-only">
                Search workspace routes
              </label>
              <input
                ref={inputRef}
                id={`${headingId}-search`}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${env.toLowerCase()} routes...`}
                className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
              />
            </div>

            <nav
              aria-label="Pinned and workspace routes"
              className="flex-1 overflow-y-auto p-5 space-y-5"
            >
              <section aria-label="Pinned Shelf">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-400 mb-2.5">
                  Pinned Shelf ({pinnedRoutes.length})
                </h3>
                {pinnedRoutes.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-zinc-800 px-3 py-3 text-xs text-zinc-500">
                    Star any destination below to pin it to your shelf.
                  </p>
                ) : (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {pinnedRoutes.map((route) => (
                      <li key={route.id}>
                        <a
                          href={route.href}
                          onClick={(e) => {
                            e.preventDefault();
                            handleSelect(route.href, route.label);
                          }}
                          className="flex min-h-[46px] items-center justify-between gap-2 rounded-lg border border-rose-500/30 bg-rose-950/20 px-3.5 py-2 hover:border-rose-400 transition-colors"
                        >
                          <div className="min-w-0">
                            <span className="block text-sm font-medium text-white truncate">
                              {route.label}
                            </span>
                            <span className="block text-[11px] text-rose-200/70">
                              {route.envNote[env]}
                            </span>
                          </div>
                          <ArrowUpRight
                            className="h-4 w-4 shrink-0 text-rose-400"
                            aria-hidden="true"
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section
                aria-label="All Destinations"
                className="border-t border-zinc-800 pt-4"
              >
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2.5">
                  All {env} Destinations
                </h3>
                {filteredRoutes.length === 0 ? (
                  <p className="py-6 text-center text-sm text-zinc-500">
                    No routes matched &ldquo;{query}&rdquo;
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {filteredRoutes.map((route) => {
                      const isPinned = pinnedIds.includes(route.id);
                      return (
                        <li
                          key={route.id}
                          className="flex items-center justify-between gap-2 rounded-lg hover:bg-zinc-900 px-2"
                        >
                          <a
                            href={route.href}
                            onClick={(e) => {
                              e.preventDefault();
                              handleSelect(route.href, route.label);
                            }}
                            className="flex min-h-[44px] flex-1 items-center justify-between gap-3 py-2 text-sm text-zinc-200 hover:text-white"
                          >
                            <span className="font-medium">{route.label}</span>
                            <span className="font-mono text-xs text-zinc-500">
                              {route.envNote[env]}
                            </span>
                          </a>
                          <button
                            type="button"
                            onClick={() => togglePin(route.id)}
                            aria-label={
                              isPinned
                                ? `Unpin ${route.label}`
                                : `Pin ${route.label}`
                            }
                            aria-pressed={isPinned}
                            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors ${
                              isPinned
                                ? 'text-rose-400 hover:bg-zinc-800'
                                : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
                            }`}
                          >
                            <Star
                              className={`h-4 w-4 ${
                                isPinned ? 'fill-rose-400' : ''
                              }`}
                              aria-hidden="true"
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

export default ModalMenu18;
