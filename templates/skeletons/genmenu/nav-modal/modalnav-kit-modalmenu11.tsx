'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  Folder,
  Layers,
  Search,
  X,
} from 'lucide-react';

export interface ModalMenu11Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  triggerClassName?: string;
  onSelectRoute?: (href: string, label: string) => void;
}

interface DrillNode {
  id: string;
  label: string;
  description: string;
  href?: string;
  children?: DrillNode[];
}

const DRILL_TREE: DrillNode[] = [
  {
    id: 'core',
    label: 'Core Platform',
    description: 'Routing, runtime nodes, and edge configuration',
    children: [
      {
        id: 'core-routing',
        label: 'Edge Routing Rules',
        description: 'Geo-steered traffic policies and failover weights',
        href: '#edge-routing',
      },
      {
        id: 'core-workers',
        label: 'Serverless Workers',
        description: 'Cold-start budgets and regional placement',
        href: '#workers',
      },
      {
        id: 'core-queues',
        label: 'Background Queues',
        description: 'Dead-letter policies and retry backoff curves',
        href: '#queues',
      },
      {
        id: 'core-cache',
        label: 'Distributed Cache',
        description: 'Tag invalidation and stale-while-revalidate',
        href: '#cache',
      },
    ],
  },
  {
    id: 'apis',
    label: 'Developer APIs',
    description: 'REST endpoints, GraphQL schemas, and webhooks',
    children: [
      {
        id: 'apis-rest',
        label: 'REST Reference v3',
        description: 'OpenAPI specification and pagination rules',
        href: '#rest-v3',
      },
      {
        id: 'apis-webhooks',
        label: 'Webhook Signatures',
        description: 'HMAC verification and event payload catalog',
        href: '#webhooks',
      },
      {
        id: 'apis-tokens',
        label: 'Scoped Access Tokens',
        description: 'Short-lived JWT minting and revocation',
        href: '#tokens',
      },
    ],
  },
  {
    id: 'billing',
    label: 'Billing & Usage',
    description: 'Metered quotas, invoices, and spend caps',
    children: [
      {
        id: 'billing-usage',
        label: 'Metered Telemetry',
        description: 'Daily bandwidth and compute consumption',
        href: '#usage',
      },
      {
        id: 'billing-invoices',
        label: 'Monthly Invoices',
        description: 'PDF statements and tax registration IDs',
        href: '#invoices',
      },
      {
        id: 'billing-alerts',
        label: 'Budget Thresholds',
        description: 'Automated slack & email spend warnings',
        href: '#budget-alerts',
      },
    ],
  },
  {
    id: 'governance',
    label: 'Team Governance',
    description: 'Directory sync, audit trail, and approvals',
    children: [
      {
        id: 'gov-sso',
        label: 'SAML & OIDC Sync',
        description: 'Okta, Entra ID, and SCIM group mapping',
        href: '#sso',
      },
      {
        id: 'gov-audit',
        label: 'Audit Stream',
        description: 'Immutable security event exports',
        href: '#audit-stream',
      },
    ],
  },
];

export function ModalMenu11({
  defaultOpen = false,
  triggerLabel = 'Open Drill-Down Stack',
  triggerClassName,
  onSelectRoute,
}: ModalMenu11Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [stack, setStack] = useState<DrillNode[]>([]);
  const [query, setQuery] = useState('');
  const headingId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const currentFolder = stack[stack.length - 1] ?? null;
  const currentItems = currentFolder?.children ?? DRILL_TREE;

  const q = query.trim().toLowerCase();
  const flatMatches = q
    ? DRILL_TREE.flatMap((parent) =>
        (parent.children ?? [])
          .filter((child) =>
            `${child.label} ${child.description} ${parent.label}`
              .toLowerCase()
              .includes(q)
          )
          .map((child) => ({ ...child, parentLabel: parent.label }))
      )
    : [];

  const closeMenu = () => {
    setIsOpen(false);
    setStack([]);
    setQuery('');
    setTimeout(() => triggerRef.current?.focus(), 0);
  };

  const handleSelectLeaf = (href: string, label: string) => {
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
          'inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 whitespace-nowrap shrink-0'
        }
      >
        <Layers className="h-4 w-4 text-slate-300" aria-hidden="true" />
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
            className="w-full max-w-[520px] max-h-[85vh] flex flex-col overflow-hidden rounded-xl bg-white text-slate-900 border border-slate-200 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
              <div className="flex items-center gap-2 min-w-0">
                {stack.length > 0 && !q && (
                  <button
                    type="button"
                    onClick={() => setStack((s) => s.slice(0, -1))}
                    aria-label="Go back one level"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
                <h2
                  id={headingId}
                  className="text-sm font-semibold text-slate-900 truncate"
                >
                  {q
                    ? 'Search All Levels'
                    : currentFolder
                      ? currentFolder.label
                      : 'Drill-Down Directory'}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close drill-down menu"
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
                Search nested directory
              </label>
              <input
                ref={inputRef}
                id={`${headingId}-search`}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search across all nested levels..."
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            {!q && (
              <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50/50 px-5 py-2 text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => setStack([])}
                  className={`font-medium hover:text-slate-900 ${
                    stack.length === 0 ? 'text-slate-900' : ''
                  }`}
                >
                  All Sections
                </button>
                {stack.map((node, idx) => (
                  <React.Fragment key={node.id}>
                    <span aria-hidden="true">/</span>
                    <button
                      type="button"
                      onClick={() => setStack((s) => s.slice(0, idx + 1))}
                      className="font-medium text-slate-900 truncate"
                    >
                      {node.label}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}

            <nav
              aria-label="Hierarchical drill-down navigation"
              className="flex-1 overflow-y-auto p-3"
            >
              <h3 className="sr-only">
                {q ? 'Search Results' : currentFolder?.label ?? 'Root Categories'}
              </h3>

              {q ? (
                flatMatches.length === 0 ? (
                  <p className="py-10 text-center text-sm text-slate-500">
                    No nested pages matched &ldquo;{query}&rdquo;
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {flatMatches.map((item) => (
                      <li key={item.id}>
                        <a
                          href={item.href ?? '#'}
                          onClick={(e) => {
                            e.preventDefault();
                            handleSelectLeaf(item.href ?? '#', item.label);
                          }}
                          className="flex min-h-[54px] items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                        >
                          <div className="min-w-0">
                            <span className="text-[11px] font-medium text-slate-400">
                              {item.parentLabel}
                            </span>
                            <span className="block text-sm font-semibold text-slate-900">
                              {item.label}
                            </span>
                            <span className="block text-xs text-slate-500 truncate">
                              {item.description}
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
                )
              ) : (
                <ul className="space-y-1">
                  {currentItems.map((node) => {
                    const hasChildren = Boolean(node.children?.length);
                    return (
                      <li key={node.id}>
                        {hasChildren ? (
                          <button
                            type="button"
                            onClick={() => setStack((s) => [...s, node])}
                            className="flex min-h-[56px] w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <Folder
                                className="mt-0.5 h-4 w-4 shrink-0 text-slate-500"
                                aria-hidden="true"
                              />
                              <div className="min-w-0">
                                <span className="block text-sm font-semibold text-slate-900">
                                  {node.label}
                                </span>
                                <span className="block text-xs text-slate-500 truncate">
                                  {node.description}
                                </span>
                              </div>
                            </div>
                            <span className="flex items-center gap-1.5 text-xs font-mono text-slate-400 shrink-0 tabular-nums">
                              <span>{node.children?.length}</span>
                              <ChevronRight className="h-4 w-4" aria-hidden="true" />
                            </span>
                          </button>
                        ) : (
                          <a
                            href={node.href ?? '#'}
                            onClick={(e) => {
                              e.preventDefault();
                              handleSelectLeaf(node.href ?? '#', node.label);
                            }}
                            className="flex min-h-[54px] items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                          >
                            <div className="min-w-0">
                              <span className="block text-sm font-semibold text-slate-900">
                                {node.label}
                              </span>
                              <span className="block text-xs text-slate-500">
                                {node.description}
                              </span>
                            </div>
                            <ChevronRight
                              className="h-4 w-4 shrink-0 text-slate-400"
                              aria-hidden="true"
                            />
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

export default ModalMenu11;
