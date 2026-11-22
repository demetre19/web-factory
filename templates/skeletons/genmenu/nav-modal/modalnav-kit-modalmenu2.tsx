'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Building2,
  Compass,
  FileText,
  Layers,
  Lock,
  Menu,
  Search,
  ShieldCheck,
  Users,
  Workflow,
  X,
} from 'lucide-react';

export interface ModalMenu2Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  triggerClassName?: string;
  onSelectRoute?: (href: string, label: string) => void;
}

interface SplitNavItem {
  id: string;
  label: string;
  href: string;
  summary: string;
  highlights: string[];
  routeLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SplitNavGroup {
  heading: string;
  items: SplitNavItem[];
}

const SPLIT_GROUPS: SplitNavGroup[] = [
  {
    heading: 'Core Platform',
    items: [
      {
        id: 'architecture',
        label: 'System Architecture',
        href: '#architecture',
        routeLabel: '/platform/architecture',
        summary:
          'Multi-region edge routing, deterministic state sync, and zero-downtime deployment pipelines built for regulated teams.',
        highlights: ['Edge topologies', 'Failover guarantees', 'SLA benchmarks'],
        icon: Layers,
      },
      {
        id: 'automation',
        label: 'Workflow Engine',
        href: '#automation',
        routeLabel: '/platform/workflows',
        summary:
          'Event-driven approval chains and scheduled batch triggers with full auditability across every execution step.',
        highlights: ['Visual DAG builder', 'Webhook retries', 'Idempotency keys'],
        icon: Workflow,
      },
      {
        id: 'security',
        label: 'Security & Compliance',
        href: '#security',
        routeLabel: '/platform/security',
        summary:
          'Hardware-backed key isolation, SOC 2 Type II controls, and granular role-based access policies.',
        highlights: ['SAML & SCIM provisioning', 'Audit log streaming', 'Key rotation'],
        icon: ShieldCheck,
      },
      {
        id: 'privacy',
        label: 'Data Governance',
        href: '#governance',
        routeLabel: '/platform/governance',
        summary:
          'Regional data residency enforcement and automated retention schedules across primary and replica stores.',
        highlights: ['EU & US residency', 'PII redaction rules', 'Export tooling'],
        icon: Lock,
      },
    ],
  },
  {
    heading: 'Organization',
    items: [
      {
        id: 'company',
        label: 'About the Practice',
        href: '#about',
        routeLabel: '/company/about',
        summary:
          'Founded by systems engineers in Zurich and Toronto to bring calm reliability to critical enterprise tooling.',
        highlights: ['Leadership team', 'Engineering principles', 'Annual report'],
        icon: Building2,
      },
      {
        id: 'customers',
        label: 'Customer Stories',
        href: '#customers',
        routeLabel: '/company/customers',
        summary:
          'How financial institutions, healthcare networks, and logistics operators standardize operations.',
        highlights: ['Case studies', 'Architecture briefings', 'ROI metrics'],
        icon: Users,
      },
      {
        id: 'changelog',
        label: 'Release Notes',
        href: '#changelog',
        routeLabel: '/company/releases',
        summary:
          'Monthly platform updates, deprecation notices, and detailed migration guidance for engineering leads.',
        highlights: ['November 2026 release', 'API v3 changelog', 'RSS feed'],
        icon: FileText,
      },
      {
        id: 'contact',
        label: 'Advisory Desk',
        href: '#advisory',
        routeLabel: '/company/advisory',
        summary:
          'Schedule a direct architecture review with our principal solutions engineers or request security packets.',
        highlights: ['Architecture review', 'Security questionnaire', 'Office locations'],
        icon: Compass,
      },
    ],
  },
];

export function ModalMenu2({
  defaultOpen = false,
  triggerLabel = 'Open Split Directory',
  triggerClassName,
  onSelectRoute,
}: ModalMenu2Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string>('architecture');
  const headingId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const q = query.trim().toLowerCase();
  const filteredGroups = SPLIT_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      !q
        ? true
        : `${item.label} ${item.summary} ${item.routeLabel} ${group.heading}`
            .toLowerCase()
            .includes(q)
    ),
  })).filter((group) => group.items.length > 0);

  const visibleItems = filteredGroups.flatMap((g) => g.items);
  const activeItem =
    visibleItems.find((i) => i.id === activeId) ?? visibleItems[0] ?? null;
  const ActiveIcon = activeItem?.icon;

  const closeMenu = () => {
    setIsOpen(false);
    setQuery('');
    setTimeout(() => triggerRef.current?.focus(), 0);
  };

  const handleSelect = (item: SplitNavItem) => {
    onSelectRoute?.(item.href, item.label);
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
          'inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-slate-900 border border-slate-200 shadow-xs hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 whitespace-nowrap shrink-0'
        }
      >
        <Menu className="h-4 w-4 text-slate-600" aria-hidden="true" />
        <span>{triggerLabel}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-xs p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeMenu();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            className="w-full max-w-[680px] max-h-[85vh] flex flex-col overflow-hidden rounded-xl bg-white text-slate-900 border border-slate-200 shadow-xl"
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 sm:px-6 py-3.5">
              <div>
                <h2
                  id={headingId}
                  className="text-base font-semibold tracking-tight text-slate-900"
                >
                  Directory &amp; Platform Index
                </h2>
                <p className="text-xs text-slate-500">
                  Search or hover any destination to inspect its scope
                </p>
              </div>
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close directory menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center gap-2.5 border-b border-slate-200 bg-slate-50/60 px-5 sm:px-6 py-2.5">
              <Search
                className="h-4 w-4 shrink-0 text-slate-400"
                aria-hidden="true"
              />
              <label htmlFor={`${headingId}-search`} className="sr-only">
                Search platform directory
              </label>
              <input
                ref={inputRef}
                id={`${headingId}-search`}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search capabilities, compliance, releases..."
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            {visibleItems.length === 0 || !activeItem || !ActiveIcon ? (
              <div className="p-10 text-center">
                <p className="text-sm font-medium text-slate-700">
                  No directory items matched &ldquo;{query}&rdquo;
                </p>
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="mt-3 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12">
                <nav
                  aria-label="Platform and organization navigation"
                  className="md:col-span-6 p-4 sm:p-5 space-y-5 border-b md:border-b-0 md:border-r border-slate-200"
                >
                  {filteredGroups.map((group) => (
                    <section key={group.heading} aria-label={group.heading}>
                      <h3 className="px-2.5 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {group.heading}
                      </h3>
                      <ul className="space-y-1">
                        {group.items.map((item) => {
                          const isSelected = item.id === activeItem.id;
                          const Icon = item.icon;
                          return (
                            <li key={item.id}>
                              <a
                                href={item.href}
                                onMouseEnter={() => setActiveId(item.id)}
                                onFocus={() => setActiveId(item.id)}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleSelect(item);
                                }}
                                className={`flex min-h-[42px] items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
                                  isSelected
                                    ? 'bg-slate-900 text-white'
                                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                              >
                                <span className="flex items-center gap-2.5 truncate">
                                  <Icon
                                    className={`h-4 w-4 shrink-0 ${
                                      isSelected ? 'text-slate-200' : 'text-slate-400'
                                    }`}
                                    aria-hidden="true"
                                  />
                                  <span className="truncate">{item.label}</span>
                                </span>
                                <ArrowUpRight
                                  className={`h-3.5 w-3.5 shrink-0 ${
                                    isSelected ? 'text-slate-300' : 'text-slate-400'
                                  }`}
                                  aria-hidden="true"
                                />
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  ))}
                </nav>

                <aside
                  aria-label="Selected destination preview"
                  className="md:col-span-6 bg-slate-50 p-5 sm:p-6 flex flex-col justify-between gap-5"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-900">
                        <ActiveIcon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono text-xs text-slate-500 truncate">
                          {activeItem.routeLabel}
                        </p>
                        <h3 className="text-base font-semibold text-slate-900 truncate">
                          {activeItem.label}
                        </h3>
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed text-slate-600">
                      {activeItem.summary}
                    </p>

                    <div className="border-t border-slate-200 pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        Included Sections
                      </p>
                      <ul className="space-y-1.5 text-sm text-slate-700">
                        {activeItem.highlights.map((bullet) => (
                          <li key={bullet} className="flex items-center gap-2">
                            <span
                              className="h-1 w-1 rounded-full bg-slate-400 shrink-0"
                              aria-hidden="true"
                            />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelect(activeItem)}
                    className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                  >
                    <span>Open {activeItem.label}</span>
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </aside>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ModalMenu2;
