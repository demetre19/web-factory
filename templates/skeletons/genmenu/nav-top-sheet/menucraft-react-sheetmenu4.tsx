'use client';

import React, { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Menu, X, ChevronDown, ChevronRight, Search, Settings } from 'lucide-react';
import type { SheetMenuProps } from './types';

const TREE_GROUPS = [
  {
    id: 'collections',
    label: 'Collections',
    children: [
      { id: 'lighting', label: 'Architectural Lighting' },
      { id: 'seating', label: 'Sculpted Seating' },
      { id: 'ceramics', label: 'Kiln Ceramics' },
    ],
  },
  {
    id: 'services',
    label: 'Bespoke Services',
    children: [
      { id: 'sizing', label: 'Custom Sizing' },
      { id: 'swatches', label: 'Material Swatches' },
      { id: 'trade', label: 'Trade Program' },
    ],
  },
  {
    id: 'showrooms',
    label: 'Showrooms',
    children: [
      { id: 'copenhagen', label: 'Copenhagen Studio' },
      { id: 'kyoto', label: 'Kyoto Gallery' },
    ],
  },
];

export function SheetMenu4({
  open,
  defaultOpen = false,
  onOpenChange,
  contained = true,
  onSelectDestination,
}: SheetMenuProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [expandedGroup, setExpandedGroup] = useState<string>('collections');
  const [activeId, setActiveId] = useState('lighting');
  const [query, setQuery] = useState('');
  const [tradeTier, setTradeTier] = useState(true);
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

  const q = query.trim().toLowerCase();
  const allChildren = TREE_GROUPS.flatMap((g) => g.children);
  const activeLabel =
    allChildren.find((c) => c.id === activeId)?.label ?? 'Architectural Lighting';

  const handleSelect = (id: string, label: string) => {
    setActiveId(id);
    onSelectDestination?.(label);
    setOpen(false);
  };

  return (
    <div
      className={`${
        contained ? 'relative h-full w-full overflow-hidden' : 'min-h-screen w-full'
      } bg-[#FAF8F5] text-[#1B4332] flex flex-col`}
    >
      <header className="relative z-30 flex items-center justify-between h-14 px-4 bg-[#FAF8F5] border-b border-[#E3DDD3] shrink-0">
        <span className="font-display text-base font-bold tracking-tight text-[#1B4332] whitespace-nowrap">
          Atelier Arden
        </span>

        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          aria-label={isOpen ? 'Close Atelier Arden tree menu' : 'Open Atelier Arden tree menu'}
          onClick={() => setOpen(!isOpen)}
          className="min-h-[44px] min-w-[44px] -mr-2 px-3 inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium text-[#1B4332] hover:bg-[#EFECE6] transition-colors"
        >
          <span>{isOpen ? 'Close' : 'Index'}</span>
          {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </header>

      <div className="relative flex-1 overflow-y-auto">
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.button
                type="button"
                aria-label="Close Atelier Arden backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
                onClick={() => setOpen(false)}
                className={`${contained ? 'absolute' : 'fixed top-14'} inset-0 z-10 bg-[#1B4332]/25`}
              />

              <motion.nav
                id={panelId}
                aria-label="Accordion tree navigation"
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
                className={`${
                  contained ? 'absolute top-0 inset-x-0' : 'fixed top-14 inset-x-0'
                } z-20 bg-[#FAF8F5] border-b border-[#D8D0C4] shadow-lg max-h-[calc(100%-0.5rem)] flex flex-col overflow-hidden`}
              >
                <div className="p-3.5 border-b border-[#E3DDD3] shrink-0">
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#6B705C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="search"
                      aria-label="Filter catalog tree"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Filter catalog folders..."
                      className="w-full min-h-[40px] pl-9 pr-3 rounded-lg bg-white border border-[#D8D0C4] text-sm text-[#1B4332] placeholder:text-[#8A8F7A] focus-visible:outline-2 focus-visible:outline-[#C2410C]"
                    />
                  </div>
                </div>

                <div className="p-3 space-y-1.5 overflow-y-auto flex-1">
                  {TREE_GROUPS.map((group) => {
                    const matchedChildren = q
                      ? group.children.filter((c) => c.label.toLowerCase().includes(q))
                      : group.children;
                    if (q && matchedChildren.length === 0) return null;
                    const isExpanded = Boolean(q) || expandedGroup === group.id;

                    return (
                      <section key={group.id} className="rounded-xl border border-[#E3DDD3] bg-white/70 overflow-hidden">
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          onClick={() =>
                            setExpandedGroup((prev) => (prev === group.id ? '' : group.id))
                          }
                          className="w-full min-h-[44px] px-3 flex items-center justify-between text-left text-sm font-semibold text-[#1B4332] hover:bg-[#EFECE6]"
                        >
                          <span>{group.label}</span>
                          <span className="flex items-center gap-2 text-xs text-[#6B705C]">
                            <span className="tabular-nums">{matchedChildren.length}</span>
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </span>
                        </button>

                        {isExpanded && (
                          <ul className="border-t border-[#E3DDD3] bg-[#FAF8F5] py-1 px-2 space-y-0.5">
                            {matchedChildren.map((child) => {
                              const active = child.id === activeId;
                              return (
                                <li key={child.id}>
                                  <button
                                    type="button"
                                    onClick={() => handleSelect(child.id, child.label)}
                                    className={`w-full min-h-[40px] pl-4 pr-2.5 rounded-lg text-left text-sm flex items-center justify-between transition-colors ${
                                      active
                                        ? 'bg-[#1B4332] text-[#FAF8F5] font-medium'
                                        : 'text-[#3F4A3C] hover:bg-[#EFECE6]'
                                    }`}
                                  >
                                    <span>{child.label}</span>
                                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </section>
                    );
                  })}
                </div>

                <footer className="px-4 py-2.5 bg-[#EFECE6] border-t border-[#E3DDD3] flex items-center justify-between gap-2 shrink-0">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#1B4332] truncate">Julian Mercer</p>
                    <p className="text-[11px] text-[#6B705C] truncate">
                      {tradeTier ? 'Trade Partner · 15%' : 'Standard Client'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTradeTier((p) => !p)}
                    className="min-h-[38px] px-2.5 rounded-lg border border-[#D8D0C4] bg-[#FAF8F5] text-xs font-medium text-[#1B4332] inline-flex items-center gap-1"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>{tradeTier ? 'Trade' : 'Personal'}</span>
                  </button>
                </footer>
              </motion.nav>
            </>
          )}
        </AnimatePresence>

        <main className="p-4 space-y-3">
          <div className="text-xs font-medium text-[#6B705C]">Archive · {activeLabel}</div>
          <div className="rounded-xl border border-[#E3DDD3] bg-[#F3EFE8] p-4 space-y-1.5">
            <h3 className="font-display text-lg font-semibold text-[#1B4332]">{activeLabel}</h3>
            <p className="text-sm text-[#3F4A3C] leading-relaxed">
              Expandable accordion tree drop-down with nested child folders, live folder search, and
              account tier footer.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
