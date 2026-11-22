'use client';

import React, { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Menu,
  X,
  Search,
  FolderKanban,
  Users,
  BarChart3,
  BookOpen,
  LifeBuoy,
  FileText,
  Layers,
  Shield,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { filterMenuItems } from '@/lib/sheet-logic';
import type { SheetMenuProps } from './types';

const CATEGORIES = [
  {
    id: 'workspace',
    label: 'Workspace',
    items: [
      { id: 'projects', label: 'Projects', description: '12 active boards', category: 'Workspace', icon: FolderKanban },
      { id: 'team', label: 'Team Directory', description: '24 collaborators', category: 'Workspace', icon: Users },
      { id: 'reports', label: 'Quarterly Metrics', description: 'Updated today', category: 'Workspace', icon: BarChart3 },
    ],
  },
  {
    id: 'platform',
    label: 'Platform',
    items: [
      { id: 'workflows', label: 'Automations', description: '8 active rules', category: 'Platform', icon: Layers },
      { id: 'security', label: 'Access Control', description: 'SSO & audit log', category: 'Platform', icon: Shield },
    ],
  },
  {
    id: 'resources',
    label: 'Resources',
    items: [
      { id: 'docs', label: 'API Reference', description: 'SDK & schemas', category: 'Resources', icon: BookOpen },
      { id: 'notes', label: 'Release Notes', description: 'March edition', category: 'Resources', icon: FileText },
      { id: 'support', label: 'Support Desk', description: 'Under 2h reply', category: 'Resources', icon: LifeBuoy },
    ],
  },
];

export function SheetMenu1({
  open,
  defaultOpen = false,
  onOpenChange,
  contained = true,
  onSelectDestination,
}: SheetMenuProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [selectedCategoryId, setSelectedCategoryId] = useState('workspace');
  const [activeId, setActiveId] = useState('projects');
  const [query, setQuery] = useState('');
  const [signedOut, setSignedOut] = useState(false);
  const panelId = useId();
  const searchId = useId();
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

  const allItems = CATEGORIES.flatMap((c) => c.items);
  const activeCategory = CATEGORIES.find((c) => c.id === selectedCategoryId) ?? CATEGORIES[0];
  const searchResults = query.trim() ? filterMenuItems(allItems, query) : [];
  const activeLabel = allItems.find((i) => i.id === activeId)?.label ?? 'Projects';

  const handleSelect = (id: string, label: string) => {
    setActiveId(id);
    onSelectDestination?.(label);
    setOpen(false);
  };

  return (
    <div
      className={`${
        contained ? 'relative h-full w-full overflow-hidden' : 'min-h-screen w-full'
      } bg-white text-slate-900 flex flex-col`}
    >
      <header className="relative z-30 flex items-center justify-between h-14 px-4 bg-white border-b border-slate-200 shrink-0">
        <span className="font-display text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
          Verve Studio
        </span>

        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          aria-label={isOpen ? 'Close Verve Studio menu' : 'Open Verve Studio menu'}
          onClick={() => setOpen(!isOpen)}
          className="min-h-[44px] min-w-[44px] -mr-2 px-3 inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <span>{isOpen ? 'Close' : 'Menu'}</span>
          {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </header>

      <div className="relative flex-1 overflow-y-auto">
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.button
                type="button"
                aria-label="Close navigation backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
                onClick={() => setOpen(false)}
                className={`${contained ? 'absolute' : 'fixed top-14'} inset-0 z-10 bg-slate-900/30`}
              />

              <motion.nav
                id={panelId}
                aria-label="Split master-detail workspace menu"
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -14 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
                className={`${
                  contained ? 'absolute top-0 inset-x-0' : 'fixed top-14 inset-x-0'
                } z-20 bg-white border-b border-slate-200 shadow-xl max-h-[calc(100%-0.5rem)] flex flex-col overflow-hidden`}
              >
                <div className="p-3 border-b border-slate-100 shrink-0">
                  <label htmlFor={searchId} className="sr-only">
                    Search Verve destinations
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id={searchId}
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search across all categories..."
                      className="w-full min-h-[40px] pl-9 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-blue-600"
                    />
                  </div>
                </div>

                {query.trim() ? (
                  <div className="p-3 overflow-y-auto flex-1 space-y-1">
                    {searchResults.length === 0 ? (
                      <p className="py-6 text-center text-xs text-slate-500">
                        No destinations matching &ldquo;{query}&rdquo;
                      </p>
                    ) : (
                      searchResults.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelect(item.id, item.label)}
                            className="w-full min-h-[44px] px-3 py-2 rounded-lg flex items-center justify-between text-left hover:bg-slate-50"
                          >
                            <span className="flex items-center gap-2.5 min-w-0">
                              <Icon className="w-4 h-4 text-blue-600 shrink-0" />
                              <span className="text-sm font-medium text-slate-900 truncate">
                                {item.label}
                              </span>
                            </span>
                            <span className="text-[11px] text-slate-500 shrink-0">{item.category}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-[128px_1fr] min-h-[248px] flex-1 overflow-hidden">
                    <div className="bg-slate-50 border-r border-slate-200 p-2 space-y-1 overflow-y-auto">
                      {CATEGORIES.map((cat) => {
                        const selected = cat.id === activeCategory.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategoryId(cat.id)}
                            className={`w-full min-h-[44px] px-2 rounded-lg text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                              selected
                                ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <span className="truncate">{cat.label}</span>
                            <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
                          </button>
                        );
                      })}
                    </div>

                    <ul className="p-2.5 space-y-1 overflow-y-auto">
                      {activeCategory.items.map((item) => {
                        const Icon = item.icon;
                        const active = item.id === activeId;
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              onClick={() => handleSelect(item.id, item.label)}
                              className={`w-full min-h-[48px] px-2.5 py-2 rounded-lg text-left flex items-start gap-2.5 transition-colors ${
                                active ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-800'
                              }`}
                            >
                              <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                              <span className="min-w-0">
                                <span className="block text-sm font-medium truncate">{item.label}</span>
                                <span className="block text-xs text-slate-500 truncate">
                                  {item.description}
                                </span>
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                <footer className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                      EV
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">Elena Vance</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {signedOut ? 'Locked' : 'elena@verve.studio'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSignedOut((p) => !p)}
                    className="min-h-[38px] px-2.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-200/70 inline-flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{signedOut ? 'Resume' : 'Sign out'}</span>
                  </button>
                </footer>
              </motion.nav>
            </>
          )}
        </AnimatePresence>

        <main className="p-4 space-y-3">
          <div className="text-xs font-medium text-slate-500">Active pane · {activeLabel}</div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5">
            <h3 className="font-display text-lg font-semibold text-slate-900">{activeLabel}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Two-pane master-detail drop-down with a left category rail, right sub-menu pane, and
              instant cross-category search bar.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
