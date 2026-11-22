'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import {
  ArrowRight,
  GitCommitHorizontal,
  Search,
  X,
} from 'lucide-react';

export interface ModalMenu16Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  triggerClassName?: string;
  onSelectRoute?: (href: string, label: string) => void;
}

interface TimelineStage {
  phase: string;
  heading: string;
  description: string;
  routes: { label: string; href: string }[];
}

const TIMELINE_STAGES: TimelineStage[] = [
  {
    phase: '01',
    heading: 'Plan & Scope',
    description: 'Architecture specs, capacity estimates, and schema drafts',
    routes: [
      { label: 'RFC Templates', href: '#rfc-templates' },
      { label: 'Quota Estimator', href: '#quota-estimator' },
      { label: 'Schema Planner', href: '#schema-planner' },
    ],
  },
  {
    phase: '02',
    heading: 'Build & Preview',
    description: 'Local sandboxes, feature branches, and integration tests',
    routes: [
      { label: 'Preview Branches', href: '#preview-branches' },
      { label: 'Seed Datasets', href: '#seed-datasets' },
      { label: 'CI Runner Matrix', href: '#ci-matrix' },
    ],
  },
  {
    phase: '03',
    heading: 'Ship & Rollout',
    description: 'Canary percentages, traffic shifting, and release gates',
    routes: [
      { label: 'Canary Controls', href: '#canary' },
      { label: 'Edge Promotion', href: '#edge-promotion' },
      { label: 'Instant Rollback', href: '#rollback' },
    ],
  },
  {
    phase: '04',
    heading: 'Observe & Audit',
    description: 'Post-deploy telemetry, incident timelines, and compliance',
    routes: [
      { label: 'Latency Heatmaps', href: '#latency' },
      { label: 'Error Budgets', href: '#error-budgets' },
      { label: 'Incident Logs', href: '#incidents' },
    ],
  },
];

export function ModalMenu16({
  defaultOpen = false,
  triggerLabel = 'Open Lifecycle Spine',
  triggerClassName,
  onSelectRoute,
}: ModalMenu16Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const headingId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const q = query.trim().toLowerCase();
  const visibleStages = TIMELINE_STAGES.map((stage) => ({
    ...stage,
    routes: stage.routes.filter((r) =>
      !q
        ? true
        : `${r.label} ${stage.heading} ${stage.description}`
            .toLowerCase()
            .includes(q)
    ),
  })).filter((stage) => stage.routes.length > 0);

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
          'inline-flex items-center gap-2 rounded-lg bg-[#111322] px-4 py-2.5 text-sm font-medium text-indigo-100 border border-indigo-900/60 hover:border-amber-400/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 whitespace-nowrap shrink-0'
        }
      >
        <GitCommitHorizontal
          className="h-4 w-4 text-amber-400"
          aria-hidden="true"
        />
        <span>{triggerLabel}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeMenu();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            className="w-full max-w-[600px] max-h-[85vh] flex flex-col overflow-hidden rounded-xl bg-[#0F111E] text-slate-100 border border-indigo-950 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4 border-b border-indigo-950/80 px-5 sm:px-6 py-4">
              <div>
                <h2
                  id={headingId}
                  className="text-base font-semibold tracking-tight text-white"
                >
                  Release Lifecycle Spine
                </h2>
                <p className="text-xs text-slate-400">
                  Sequential workflow phases from planning to observation
                </p>
              </div>
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close lifecycle spine menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-indigo-900/60 text-slate-400 hover:bg-indigo-950 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center gap-2.5 border-b border-indigo-950/80 bg-[#141729] px-5 sm:px-6 py-2.5">
              <Search
                className="h-4 w-4 shrink-0 text-amber-400"
                aria-hidden="true"
              />
              <label htmlFor={`${headingId}-search`} className="sr-only">
                Filter lifecycle stages and destinations
              </label>
              <input
                ref={inputRef}
                id={`${headingId}-search`}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search stages, canary tools, telemetry..."
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            <nav
              aria-label="Release lifecycle navigation"
              className="flex-1 overflow-y-auto p-5 sm:p-6"
            >
              {visibleStages.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">
                  No workflow routes matched &ldquo;{query}&rdquo;
                </div>
              ) : (
                <ol className="relative space-y-6 before:absolute before:left-[15px] before:top-3 before:bottom-3 before:w-px before:bg-indigo-900/70">
                  {visibleStages.map((stage) => (
                    <li key={stage.phase} className="relative pl-11">
                      <span className="absolute left-0 top-0.5 flex h-8 w-8 items-center justify-center rounded-full border border-amber-400/50 bg-[#171B30] font-mono text-xs font-semibold text-amber-400 tabular-nums">
                        {stage.phase}
                      </span>
                      <section aria-label={stage.heading}>
                        <h3 className="text-sm font-semibold text-white">
                          {stage.heading}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {stage.description}
                        </p>
                        <ul className="mt-2.5 flex flex-wrap gap-2">
                          {stage.routes.map((route) => (
                            <li key={route.label}>
                              <a
                                href={route.href}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleSelect(route.href, route.label);
                                }}
                                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-indigo-900/60 bg-[#171B30] px-3 py-1.5 text-xs font-medium text-indigo-100 hover:border-amber-400/70 hover:text-amber-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                              >
                                <span>{route.label}</span>
                                <ArrowRight
                                  className="h-3 w-3 opacity-60"
                                  aria-hidden="true"
                                />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </section>
                    </li>
                  ))}
                </ol>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

export default ModalMenu16;
