'use client';

import React, { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Menu, X, Search, ChevronRight, ArrowLeft, Cpu, Shield, Cloud, Wrench } from 'lucide-react';
import { filterMenuItems } from '@/lib/sheet-logic';
import type { SheetMenuProps } from './types';

interface DrillNode {
  id: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: DrillNode[];
}

const DRILL_TREE: DrillNode[] = [
  {
    id: 'compute',
    label: 'Infrastructure',
    description: 'Clusters & edge nodes',
    icon: Cpu,
    children: [
      { id: 'pods', label: 'Container Pods', description: '18 healthy' },
      { id: 'gpu', label: 'GPU Workers', description: '4 allocated' },
      { id: 'autoscale', label: 'Autoscaling Rules', description: 'Min 2 / Max 16' },
    ],
  },
  {
    id: 'security',
    label: 'Security & IAM',
    description: 'Policies & tokens',
    icon: Shield,
    children: [
      { id: 'rbac', label: 'Role Bindings', description: '6 roles' },
      { id: 'certs', label: 'TLS Certificates', description: 'Auto-renew on' },
    ],
  },
  {
    id: 'deployments',
    label: 'Deployments',
    description: 'Production & staging',
    icon: Cloud,
  },
  {
    id: 'diagnostics',
    label: 'System Diagnostics',
    description: 'Trace & profiler',
    icon: Wrench,
  },
];

export function SheetMenu7({
  open,
  defaultOpen = false,
  onOpenChange,
  contained = true,
  onSelectDestination,
}: SheetMenuProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [activeParentId, setActiveParentId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState('deployments');
  const [query, setQuery] = useState('');
  const panelId = useId();
  const prefersReducedMotion = useReducedMotion();

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const flattened = DRILL_TREE.flatMap((n) => (n.children ? [n, ...n.children] : [n]));
  const activeParent = DRILL_TREE.find((n) => n.id === activeParentId) ?? null;
  const activeLabel = flattened.find((i) => i.id === activeId)?.label ?? 'Deployments';

  const currentList = query.trim()
    ? filterMenuItems(flattened, query)
    : activeParent?.children ?? DRILL_TREE;

  const handleSelect = (node: DrillNode) => {
    if (!query.trim() && node.children && node.children.length > 0) {
      setActiveParentId(node.id);
      return;
    }
    setActiveId(node.id);
    onSelectDestination?.(node.label);
    setOpen(false);
  };

  return (
    <div
      className={`${
        contained ? 'relative h-full w-full overflow-hidden' : 'min-h-screen w-full'
      } bg-[#090D16] text-slate-100 flex flex-col`}
    >
      <header className="relative z-30 flex items-center justify-between h-14 px-4 bg-[#0D1322] border-b border-slate-800 shrink-0">
        <span className="font-display text-base font-bold tracking-tight text-white whitespace-nowrap">
          Orbital Ops
        </span>

        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          aria-label={isOpen ? 'Close Orbital drill-down menu' : 'Open Orbital drill-down menu'}
          onClick={() => setOpen(!isOpen)}
          className="min-h-[44px] min-w-[44px] -mr-2 px-3 inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium text-sky-300 hover:bg-slate-800 transition-colors"
        >
          <span>{isOpen ? 'Close' : 'Stack'}</span>
          {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </header>

      <div className="relative flex-1 overflow-y-auto">
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.button
                type="button"
                aria-label="Close Orbital backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
                onClick={() => setOpen(false)}
                className={`${contained ? 'absolute' : 'fixed top-14'} inset-0 z-10 bg-black/65`}
              />

              <motion.nav
                id={panelId}
                aria-label="Multi-level drill-down navigation"
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -14 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
                className={`${
                  contained ? 'absolute top-0 inset-x-0' : 'fixed top-14 inset-x-0'
                } z-20 bg-[#0F172A] border-b border-slate-800 shadow-2xl max-h-[calc(100%-0.5rem)] overflow-y-auto`}
              >
                <div className="p-3.5 space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="search"
                      aria-label="Search all drill-down levels"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Jump to any nested node..."
                      className="w-full min-h-[40px] pl-9 pr-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-sky-400"
                    />
                  </div>

                  {!query.trim() && activeParent && (
                    <button
                      type="button"
                      onClick={() => setActiveParentId(null)}
                      className="w-full min-h-[40px] px-2.5 rounded-lg bg-slate-800/80 text-xs font-semibold text-sky-300 flex items-center gap-2 hover:bg-slate-800"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Root / {activeParent.label}</span>
                    </button>
                  )}

                  <ul className="space-y-1">
                    {currentList.map((node) => {
                      const Icon = node.icon;
                      const hasKids = !query.trim() && Boolean(node.children?.length);
                      const active = node.id === activeId;
                      return (
                        <li key={node.id}>
                          <button
                            type="button"
                            onClick={() => handleSelect(node)}
                            className={`w-full min-h-[48px] px-3 py-2 rounded-xl flex items-center justify-between gap-3 text-left transition-colors ${
                              active
                                ? 'bg-sky-500/20 text-sky-200 border border-sky-400/40'
                                : 'bg-slate-900/60 text-slate-100 hover:bg-slate-800'
                            }`}
                          >
                            <span className="flex items-center gap-2.5 min-w-0">
                              {Icon && <Icon className="w-4 h-4 text-sky-400 shrink-0" />}
                              <span className="min-w-0">
                                <span className="block text-sm font-medium truncate">
                                  {node.label}
                                </span>
                                {node.description && (
                                  <span className="block text-xs text-slate-400 truncate">
                                    {node.description}
                                  </span>
                                )}
                              </span>
                            </span>
                            {hasKids && <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </motion.nav>
            </>
          )}
        </AnimatePresence>

        <main className="p-4 space-y-3">
          <div className="text-xs font-mono text-sky-300">Node · {activeLabel}</div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-1.5">
            <h3 className="font-display text-lg font-semibold text-white">{activeLabel}</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Multi-level drill-down stack panel with breadcrumb back navigation and flat search
              bypass.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
