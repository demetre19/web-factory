'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import {
  Activity,
  Blocks,
  BookMarked,
  ChevronRight,
  Code2,
  CreditCard,
  Database,
  Globe,
  HardDrive,
  LayoutGrid,
  LifeBuoy,
  Search,
  Shield,
  Sliders,
  Sparkles,
  TerminalSquare,
  Users,
  Webhook,
  X,
} from 'lucide-react';

export interface ModalMenu4Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  triggerClassName?: string;
  onSelectRoute?: (href: string, label: string) => void;
}

interface TabNavItem {
  label: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface TabGroup {
  heading: string;
  items: TabNavItem[];
}

interface CategoryTab {
  id: string;
  label: string;
  groups: TabGroup[];
}

const CATEGORY_TABS: CategoryTab[] = [
  {
    id: 'product',
    label: 'Product',
    groups: [
      {
        heading: 'Core Capabilities',
        items: [
          {
            label: 'Analytics Workspace',
            description: 'Funnel attribution and cohort retention',
            href: '#analytics',
            icon: Activity,
          },
          {
            label: 'Managed Storage',
            description: 'High-throughput object & block volumes',
            href: '#storage',
            icon: HardDrive,
          },
        ],
      },
      {
        heading: 'Platform Controls',
        items: [
          {
            label: 'Access Policies',
            description: 'Fine-grained RBAC & SSO enforcement',
            href: '#access',
            icon: Shield,
          },
          {
            label: 'Usage Billing',
            description: 'Real-time spend alerts and budgets',
            href: '#billing',
            icon: CreditCard,
          },
        ],
      },
    ],
  },
  {
    id: 'solutions',
    label: 'Solutions',
    groups: [
      {
        heading: 'By Team',
        items: [
          {
            label: 'Platform Engineering',
            description: 'Standardize internal developer portals',
            href: '#platform-eng',
            icon: Blocks,
          },
          {
            label: 'Product & Growth',
            description: 'Self-serve experimentation & flags',
            href: '#growth',
            icon: Sparkles,
          },
        ],
      },
      {
        heading: 'By Scale',
        items: [
          {
            label: 'Multi-Region Global',
            description: 'Sub-30ms edge routing worldwide',
            href: '#global',
            icon: Globe,
          },
          {
            label: 'Enterprise Teams',
            description: 'Dedicated tenants & custom SLAs',
            href: '#enterprise',
            icon: Users,
          },
        ],
      },
    ],
  },
  {
    id: 'developers',
    label: 'Developers',
    groups: [
      {
        heading: 'SDKs & Tooling',
        items: [
          {
            label: 'TypeScript & Node SDK',
            description: 'Typed client with edge runtime support',
            href: '#ts-sdk',
            icon: Code2,
          },
          {
            label: 'CLI Workflows',
            description: 'Local previews and schema migrations',
            href: '#cli',
            icon: TerminalSquare,
          },
        ],
      },
      {
        heading: 'Extensibility',
        items: [
          {
            label: 'Webhook Events',
            description: 'Signed delivery with replay queues',
            href: '#webhooks',
            icon: Webhook,
          },
          {
            label: 'Query Connectors',
            description: 'Postgres, warehouse, and stream sync',
            href: '#connectors',
            icon: Database,
          },
        ],
      },
    ],
  },
  {
    id: 'resources',
    label: 'Resources',
    groups: [
      {
        heading: 'Learning',
        items: [
          {
            label: 'Reference Library',
            description: 'Architectural blueprints and patterns',
            href: '#library',
            icon: BookMarked,
          },
          {
            label: 'Configuration Guides',
            description: 'Step-by-step production checklists',
            href: '#guides',
            icon: Sliders,
          },
        ],
      },
      {
        heading: 'Support',
        items: [
          {
            label: 'Help & Status Center',
            description: 'Incident history and uptime reports',
            href: '#support',
            icon: LifeBuoy,
          },
          {
            label: 'Template Gallery',
            description: 'Starter kits for common stacks',
            href: '#templates',
            icon: LayoutGrid,
          },
        ],
      },
    ],
  },
];

export function ModalMenu4({
  defaultOpen = false,
  triggerLabel = 'Open Tabbed Menu',
  triggerClassName,
  onSelectRoute,
}: ModalMenu4Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeTabId, setActiveTabId] = useState<string>('product');
  const [query, setQuery] = useState('');
  const headingId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const activeTab =
    CATEGORY_TABS.find((t) => t.id === activeTabId) ?? CATEGORY_TABS[0];

  const q = query.trim().toLowerCase();
  const crossTabResults = q
    ? CATEGORY_TABS.flatMap((tab) =>
        tab.groups.flatMap((group) =>
          group.items
            .filter((item) =>
              `${item.label} ${item.description} ${tab.label} ${group.heading}`
                .toLowerCase()
                .includes(q)
            )
            .map((item) => ({ ...item, tabLabel: tab.label }))
        )
      )
    : [];

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
          'inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-slate-900 border border-slate-200 hover:border-blue-500/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 whitespace-nowrap shrink-0'
        }
      >
        <LayoutGrid className="h-4 w-4 text-blue-600" aria-hidden="true" />
        <span>{triggerLabel}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeMenu();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            className="w-full max-w-[640px] max-h-[85vh] flex flex-col overflow-hidden rounded-xl bg-white text-slate-900 border border-slate-200 shadow-xl"
          >
            <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-3">
              <h2
                id={headingId}
                className="text-base font-semibold tracking-tight text-slate-900"
              >
                Browse Platform
              </h2>
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close platform menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="px-6 pb-3 space-y-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-blue-600 focus-within:bg-white">
                <Search
                  className="h-4 w-4 shrink-0 text-slate-400"
                  aria-hidden="true"
                />
                <label htmlFor={`${headingId}-search`} className="sr-only">
                  Search across all platform tabs
                </label>
                <input
                  ref={inputRef}
                  id={`${headingId}-search`}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search across all categories..."
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              {!q && (
                <div
                  role="tablist"
                  aria-label="Menu categories"
                  className="flex items-center gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1"
                >
                  {CATEGORY_TABS.map((tab) => {
                    const isActive = tab.id === activeTab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveTabId(tab.id)}
                        className={`flex-1 min-h-[38px] rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                          isActive
                            ? 'bg-white text-blue-600 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {q ? (
              <nav
                aria-label="Cross-tab search results"
                className="flex-1 overflow-y-auto p-6"
              >
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Matches Across Platform ({crossTabResults.length})
                </h3>
                {crossTabResults.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">
                    No capabilities matched &ldquo;{query}&rdquo;
                  </p>
                ) : (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {crossTabResults.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={`${item.tabLabel}-${item.label}`}>
                          <a
                            href={item.href}
                            onClick={(e) => {
                              e.preventDefault();
                              handleSelect(item.href, item.label);
                            }}
                            className="group flex items-start gap-3 rounded-lg border border-slate-100 p-3 hover:border-blue-200 hover:bg-blue-50/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                          >
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                              <Icon className="h-4 w-4" aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[11px] font-medium text-blue-600">
                                {item.tabLabel}
                              </span>
                              <span className="block text-sm font-semibold text-slate-900 truncate">
                                {item.label}
                              </span>
                              <p className="mt-0.5 text-xs text-slate-500">
                                {item.description}
                              </p>
                            </div>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </nav>
            ) : (
              <nav
                aria-label={`${activeTab.label} navigation`}
                role="tabpanel"
                className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-6"
              >
                {activeTab.groups.map((group) => (
                  <section key={group.heading} aria-label={group.heading}>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                      {group.heading}
                    </h3>
                    <ul className="space-y-2">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <li key={item.label}>
                            <a
                              href={item.href}
                              onClick={(e) => {
                                e.preventDefault();
                                handleSelect(item.href, item.label);
                              }}
                              className="group flex items-start gap-3 rounded-lg p-2.5 -mx-2.5 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                            >
                              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Icon className="h-4 w-4" aria-hidden="true" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                    {item.label}
                                  </span>
                                  <ChevronRight
                                    className="h-3.5 w-3.5 shrink-0 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-hidden="true"
                                  />
                                </div>
                                <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                                  {item.description}
                                </p>
                              </div>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
              </nav>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ModalMenu4;
