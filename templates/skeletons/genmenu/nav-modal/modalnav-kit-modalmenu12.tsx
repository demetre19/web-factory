'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  FileText,
  FolderTree,
  Search,
  X,
} from 'lucide-react';

export interface ModalMenu12Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  triggerClassName?: string;
  onSelectRoute?: (href: string, label: string) => void;
}

interface TreeLeaf {
  label: string;
  href: string;
  kind: string;
}

interface TreeBranch {
  id: string;
  heading: string;
  items: TreeLeaf[];
}

const TREE_BRANCHES: TreeBranch[] = [
  {
    id: 'runtime',
    heading: 'Runtime & Compute',
    items: [
      { label: 'Node Pools', href: '#node-pools', kind: 'CFG' },
      { label: 'Autoscaler Policies', href: '#autoscaler', kind: 'CFG' },
      { label: 'Live Pod Inspector', href: '#pod-inspector', kind: 'VIEW' },
    ],
  },
  {
    id: 'networking',
    heading: 'Networking & DNS',
    items: [
      { label: 'TLS Certificates', href: '#tls-certs', kind: 'SEC' },
      { label: 'Private Mesh Tunnels', href: '#mesh', kind: 'NET' },
      { label: 'Ingress Firewall', href: '#firewall', kind: 'SEC' },
    ],
  },
  {
    id: 'observability',
    heading: 'Observability & Traces',
    items: [
      { label: 'Distributed Traces', href: '#traces', kind: 'LOG' },
      { label: 'Error Aggregation', href: '#errors', kind: 'LOG' },
      { label: 'SLO Burn Alerts', href: '#slo-alerts', kind: 'ALT' },
    ],
  },
  {
    id: 'docs',
    heading: 'Architecture Runbooks',
    items: [
      { label: 'Failover Playbook', href: '#failover', kind: 'DOC' },
      { label: 'Zero-Downtime Migrations', href: '#migrations', kind: 'DOC' },
    ],
  },
];

export function ModalMenu12({
  defaultOpen = false,
  triggerLabel = 'Open Tree Explorer',
  triggerClassName,
  onSelectRoute,
}: ModalMenu12Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [expandedIds, setExpandedIds] = useState<string[]>([
    'runtime',
    'networking',
  ]);
  const [query, setQuery] = useState('');
  const headingId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const q = query.trim().toLowerCase();
  const visibleBranches = TREE_BRANCHES.map((branch) => ({
    ...branch,
    items: branch.items.filter((item) =>
      !q
        ? true
        : `${item.label} ${item.kind} ${branch.heading}`
            .toLowerCase()
            .includes(q)
    ),
  })).filter((branch) => branch.items.length > 0);

  const allExpanded = expandedIds.length === TREE_BRANCHES.length;

  const toggleBranch = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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
          'inline-flex items-center gap-2 rounded-lg bg-[#0D1311] px-4 py-2.5 text-sm font-medium text-emerald-100 border border-emerald-900/60 hover:border-emerald-500/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 whitespace-nowrap shrink-0'
        }
      >
        <FolderTree className="h-4 w-4 text-emerald-400" aria-hidden="true" />
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
            className="w-full max-w-[560px] max-h-[85vh] flex flex-col overflow-hidden rounded-xl bg-[#0B100E] text-emerald-50 border border-emerald-900/50 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-emerald-900/40 px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <FolderTree
                  className="h-4 w-4 text-emerald-400"
                  aria-hidden="true"
                />
                <h2
                  id={headingId}
                  className="text-sm font-semibold tracking-tight text-white"
                >
                  Collapsible System Tree
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedIds(
                      allExpanded ? [] : TREE_BRANCHES.map((b) => b.id)
                    )
                  }
                  className="rounded-md border border-emerald-900/60 px-2.5 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-950/80 transition-colors"
                >
                  {allExpanded ? 'Collapse All' : 'Expand All'}
                </button>
                <button
                  type="button"
                  onClick={closeMenu}
                  aria-label="Close system tree"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-emerald-300/80 hover:bg-emerald-950 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5 border-b border-emerald-900/40 bg-[#0F1714] px-5 py-2.5">
              <Search
                className="h-4 w-4 shrink-0 text-emerald-400"
                aria-hidden="true"
              />
              <label htmlFor={`${headingId}-search`} className="sr-only">
                Search directory tree
              </label>
              <input
                ref={inputRef}
                id={`${headingId}-search`}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter tree nodes and runbooks..."
                className="w-full bg-transparent text-sm text-emerald-50 placeholder:text-emerald-200/40 focus:outline-none"
              />
            </div>

            <nav
              aria-label="Collapsible system tree"
              className="flex-1 overflow-y-auto p-4 space-y-2"
            >
              {visibleBranches.length === 0 ? (
                <div className="py-10 text-center text-sm text-emerald-200/60">
                  No tree nodes matched &ldquo;{query}&rdquo;
                </div>
              ) : (
                visibleBranches.map((branch) => {
                  const isOpenBranch = Boolean(q) || expandedIds.includes(branch.id);
                  return (
                    <section key={branch.id} aria-label={branch.heading}>
                      <button
                        type="button"
                        aria-expanded={isOpenBranch}
                        onClick={() => toggleBranch(branch.id)}
                        className="flex min-h-[40px] w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-semibold text-emerald-100 hover:bg-emerald-950/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                      >
                        <span className="flex items-center gap-2">
                          {isOpenBranch ? (
                            <ChevronDown
                              className="h-4 w-4 text-emerald-400"
                              aria-hidden="true"
                            />
                          ) : (
                            <ChevronRight
                              className="h-4 w-4 text-emerald-500/70"
                              aria-hidden="true"
                            />
                          )}
                          <h3>{branch.heading}</h3>
                        </span>
                        <span className="font-mono text-xs text-emerald-400/70 tabular-nums">
                          {branch.items.length}
                        </span>
                      </button>

                      {isOpenBranch && (
                        <ul className="ml-4 mt-1 space-y-0.5 border-l border-emerald-800/60 pl-3">
                          {branch.items.map((leaf) => (
                            <li key={leaf.label}>
                              <a
                                href={leaf.href}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleSelect(leaf.href, leaf.label);
                                }}
                                className="flex min-h-[40px] items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-sm text-emerald-100/85 hover:bg-emerald-900/35 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                              >
                                <span className="flex items-center gap-2.5 truncate">
                                  <FileText
                                    className="h-3.5 w-3.5 shrink-0 text-emerald-400/70"
                                    aria-hidden="true"
                                  />
                                  <span className="truncate">{leaf.label}</span>
                                </span>
                                <span className="font-mono text-[10px] tracking-wider text-emerald-400/80 shrink-0">
                                  {leaf.kind}
                                </span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  );
                })
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

export default ModalMenu12;
