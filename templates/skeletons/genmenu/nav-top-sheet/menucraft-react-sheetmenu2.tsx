'use client';

import React, { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Terminal,
  X,
  Search,
  Activity,
  Server,
  Database,
  Shield,
  Webhook,
  CreditCard,
  Command,
  CornerDownLeft,
  HelpCircle,
} from 'lucide-react';
import { filterMenuItems } from '@/lib/sheet-logic';
import type { SheetMenuProps } from './types';

const COMMAND_ACTIONS = [
  { id: 'analytics', label: 'Open Analytics', category: 'Jump', shortcut: 'G A', icon: Activity },
  { id: 'clusters', label: 'Inspect Clusters', category: 'Jump', shortcut: 'G C', icon: Server },
  { id: 'storage', label: 'Query Storage', category: 'Data', shortcut: 'G S', icon: Database },
  { id: 'secrets', label: 'Rotate Secrets', category: 'Security', shortcut: 'G K', icon: Shield },
  { id: 'webhooks', label: 'Replay Webhooks', category: 'Events', shortcut: 'G W', icon: Webhook },
  { id: 'billing', label: 'Billing & Invoices', category: 'Finance', shortcut: 'G B', icon: CreditCard },
];

const RECENT_QUERIES = ['Analytics', 'Secrets', 'Billing'];

export function SheetMenu2({
  open,
  defaultOpen = false,
  onOpenChange,
  contained = true,
  onSelectDestination,
}: SheetMenuProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [activeId, setActiveId] = useState('analytics');
  const [query, setQuery] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);
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

  const filtered = filterMenuItems(COMMAND_ACTIONS, query);
  const activeLabel = COMMAND_ACTIONS.find((a) => a.id === activeId)?.label ?? 'Open Analytics';

  const handleSelect = (id: string, label: string) => {
    setActiveId(id);
    onSelectDestination?.(label);
    setOpen(false);
  };

  return (
    <div
      className={`${
        contained ? 'relative h-full w-full overflow-hidden' : 'min-h-screen w-full'
      } bg-[#0B0F19] text-slate-100 flex flex-col`}
    >
      <header className="relative z-30 flex items-center justify-between h-14 px-4 bg-[#0B0F19] border-b border-slate-800 shrink-0">
        <span className="font-display text-base font-bold tracking-tight text-white whitespace-nowrap">
          Northstar Cloud
        </span>

        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          aria-label={isOpen ? 'Close command palette' : 'Open command palette'}
          onClick={() => setOpen(!isOpen)}
          className="min-h-[44px] px-3 inline-flex items-center gap-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-teal-300 hover:bg-slate-800 transition-colors"
        >
          {isOpen ? <X className="w-3.5 h-3.5" /> : <Command className="w-3.5 h-3.5" />}
          <span>{isOpen ? 'ESC' : '⌘K'}</span>
        </button>
      </header>

      <div className="relative flex-1 overflow-y-auto">
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.button
                type="button"
                aria-label="Close command palette backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
                onClick={() => setOpen(false)}
                className={`${contained ? 'absolute' : 'fixed top-14'} inset-0 z-10 bg-black/65`}
              />

              <motion.nav
                id={panelId}
                aria-label="Command palette navigation"
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -14 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
                className={`${
                  contained ? 'absolute top-0 inset-x-0' : 'fixed top-14 inset-x-0'
                } z-20 bg-[#111827] border-b border-slate-700 shadow-2xl max-h-[calc(100%-0.5rem)] overflow-y-auto`}
              >
                <div className="p-3.5 space-y-3">
                  <div className="relative">
                    <label htmlFor={searchId} className="sr-only">
                      Type a command or destination
                    </label>
                    <Search className="w-4 h-4 text-teal-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id={searchId}
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Type a command or jump to..."
                      className="w-full min-h-[44px] pl-10 pr-14 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-teal-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400">
                      ↵ Run
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-slate-400 mr-1">Recent:</span>
                    {RECENT_QUERIES.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setQuery(chip)}
                        className="min-h-[30px] px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  <ul className="divide-y divide-slate-800/80">
                    {filtered.length === 0 ? (
                      <li className="py-5 text-center text-xs text-slate-400">
                        No commands match &ldquo;{query}&rdquo;
                      </li>
                    ) : (
                      filtered.map((item) => {
                        const Icon = item.icon;
                        const active = item.id === activeId;
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              onClick={() => handleSelect(item.id, item.label)}
                              className={`w-full min-h-[44px] px-2.5 py-2 rounded-lg flex items-center justify-between gap-2 text-left transition-colors ${
                                active
                                  ? 'bg-teal-500/15 text-teal-200'
                                  : 'text-slate-200 hover:bg-slate-800/80'
                              }`}
                            >
                              <span className="flex items-center gap-2.5 min-w-0">
                                <Icon className="w-4 h-4 text-teal-400 shrink-0" />
                                <span className="text-sm font-medium truncate">{item.label}</span>
                              </span>
                              <span className="flex items-center gap-2 shrink-0">
                                <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-[10px] text-slate-400">
                                  {item.shortcut}
                                </kbd>
                                <CornerDownLeft className="w-3.5 h-3.5 text-slate-500" />
                              </span>
                            </button>
                          </li>
                        );
                      })
                    )}
                  </ul>

                  {helpOpen && (
                    <p className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-300">
                      Press any shortcut pair or tap a recent chip to filter commands instantly.
                    </p>
                  )}
                </div>

                <footer className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1.5 font-mono">
                    <Terminal className="w-3.5 h-3.5 text-teal-400" />
                    <span>{filtered.length} commands</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setHelpOpen((p) => !p)}
                    className="min-h-[36px] px-2 inline-flex items-center gap-1 text-slate-300 hover:text-white"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{helpOpen ? 'Hide hints' : 'Shortcuts'}</span>
                  </button>
                </footer>
              </motion.nav>
            </>
          )}
        </AnimatePresence>

        <main className="p-4 space-y-3">
          <div className="text-xs font-mono text-teal-300">Command · {activeLabel}</div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-1.5">
            <h3 className="font-display text-lg font-semibold text-white">{activeLabel}</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Spotlight command-palette drop-down with recent query chips, keyboard shortcut hints,
              and instant command filtering.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
