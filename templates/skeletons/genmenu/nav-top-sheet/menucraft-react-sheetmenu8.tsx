'use client';

import React, { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Menu, X, Search } from 'lucide-react';
import { filterMenuItems } from '@/lib/sheet-logic';
import type { SheetMenuProps } from './types';

const EDITION_INDEX = [
  { id: 'front', num: '01', label: 'Front Page', meta: '12 stories' },
  { id: 'economy', num: '02', label: 'Markets', meta: '8 briefs' },
  { id: 'culture', num: '03', label: 'Arts & Film', meta: '6 essays' },
  { id: 'science', num: '04', label: 'Science', meta: '5 reports' },
  { id: 'architecture', num: '05', label: 'Urbanism', meta: '4 features' },
  { id: 'letters', num: '06', label: 'Letters', meta: '9 replies' },
  { id: 'podcasts', num: '07', label: 'Audio Dispatch', meta: '22 min' },
  { id: 'archive', num: '08', label: 'Print Archive', meta: '1998–2026' },
];

export function SheetMenu8({
  open,
  defaultOpen = false,
  onOpenChange,
  contained = true,
  onSelectDestination,
}: SheetMenuProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [activeId, setActiveId] = useState('front');
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

  const filtered = filterMenuItems(EDITION_INDEX, query);
  const activeLabel = EDITION_INDEX.find((e) => e.id === activeId)?.label ?? 'Front Page';

  const handleSelect = (id: string, label: string) => {
    setActiveId(id);
    onSelectDestination?.(label);
    setOpen(false);
  };

  return (
    <div
      className={`${
        contained ? 'relative h-full w-full overflow-hidden' : 'min-h-screen w-full'
      } bg-[#F9F7F2] text-zinc-950 flex flex-col`}
    >
      <header className="relative z-30 flex items-center justify-between h-14 px-4 bg-[#F9F7F2] border-b border-zinc-950 shrink-0">
        <span className="font-display text-lg font-extrabold tracking-tight text-zinc-950 whitespace-nowrap">
          The Broadsheet
        </span>

        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          aria-label={isOpen ? 'Close edition index' : 'Open edition index'}
          onClick={() => setOpen(!isOpen)}
          className="min-h-[44px] px-2.5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-950 hover:underline"
        >
          <span>{isOpen ? 'Close' : 'Sections'}</span>
          {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </header>

      <div className="relative flex-1 overflow-y-auto">
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.button
                type="button"
                aria-label="Close broadsheet backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
                onClick={() => setOpen(false)}
                className={`${contained ? 'absolute' : 'fixed top-14'} inset-0 z-10 bg-zinc-950/25`}
              />

              <motion.nav
                id={panelId}
                aria-label="Broadsheet typographic index"
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
                className={`${
                  contained ? 'absolute top-0 inset-x-0' : 'fixed top-14 inset-x-0'
                } z-20 bg-[#F9F7F2] border-b-2 border-zinc-950 shadow-xl max-h-[calc(100%-0.5rem)] overflow-y-auto`}
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 border-b border-zinc-950 pb-2">
                    <Search className="w-4 h-4 text-zinc-700 shrink-0" />
                    <input
                      type="search"
                      aria-label="Search broadsheet sections"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search edition index..."
                      className="w-full min-h-[36px] bg-transparent text-sm text-zinc-950 placeholder:text-zinc-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    {filtered.map((item) => {
                      const active = item.id === activeId;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelect(item.id, item.label)}
                          className={`min-h-[48px] py-2 px-1.5 border-b border-zinc-300 text-left flex flex-col justify-center transition-colors ${
                            active ? 'bg-zinc-950 text-[#F9F7F2]' : 'hover:bg-zinc-200/60'
                          }`}
                        >
                          <div className="flex items-baseline justify-between gap-1">
                            <span className="font-mono text-[10px] tabular-nums opacity-60">
                              {item.num}
                            </span>
                            <span className="text-[10px] opacity-60">{item.meta}</span>
                          </div>
                          <span className="text-sm font-semibold truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <footer className="px-4 py-2 border-t border-zinc-300 flex items-center justify-between text-[11px] text-zinc-600">
                  <span>Saturday Edition · No. 412</span>
                  <span>Morning Print</span>
                </footer>
              </motion.nav>
            </>
          )}
        </AnimatePresence>

        <main className="p-4 space-y-3">
          <div className="text-xs font-medium text-zinc-500">Section · {activeLabel}</div>
          <div className="border-t-2 border-zinc-950 pt-3 space-y-1.5">
            <h3 className="font-display text-2xl font-extrabold text-zinc-950">{activeLabel}</h3>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Dense 2-column broadsheet index with an underlined editorial search bar and numbered
              print metadata.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
