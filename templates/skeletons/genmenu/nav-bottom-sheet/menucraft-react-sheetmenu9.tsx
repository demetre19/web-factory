'use client';

import React, { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Menu, X, Search, Sparkles, Compass, Bookmark, Bell, ChevronRight } from 'lucide-react';
import { filterMenuItems } from '@/lib/sheet-logic';
import type { SheetMenuProps } from './types';

const QUICK_ORBS = [
  { id: 'for-you', label: 'For You', icon: Sparkles },
  { id: 'nearby', label: 'Nearby', icon: Compass },
  { id: 'saved', label: 'Saved', icon: Bookmark },
  { id: 'alerts', label: 'Updates', icon: Bell },
];

const DESTINATIONS = [
  { id: 'trail-guide', label: 'City Walk Trails', category: 'Guides' },
  { id: 'markets', label: 'Weekend Markets', category: 'Local' },
  { id: 'coffee', label: 'Roastery Map', category: 'Food' },
];

export function SheetMenu9({
  open,
  defaultOpen = false,
  onOpenChange,
  contained = true,
  onSelectDestination,
}: SheetMenuProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [activeId, setActiveId] = useState('for-you');
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

  const allItems = [...QUICK_ORBS, ...DESTINATIONS];
  const filteredRows = filterMenuItems(DESTINATIONS, query);
  const activeLabel = allItems.find((i) => i.id === activeId)?.label ?? 'For You';

  const handleSelect = (id: string, label: string) => {
    setActiveId(id);
    onSelectDestination?.(label);
    setOpen(false);
  };

  return (
    <div
      className={`${
        contained ? 'relative h-full w-full overflow-hidden' : 'min-h-screen w-full'
      } bg-[#ECFDF5] text-[#064E3B] flex flex-col`}
    >
      <div className="relative z-30 p-3 shrink-0">
        <header className="h-12 px-4 rounded-full bg-white border border-emerald-200 shadow-xs flex items-center justify-between">
          <span className="font-display text-sm font-bold text-[#064E3B] whitespace-nowrap">
            Verdant Guide
          </span>

          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls={panelId}
            aria-label={isOpen ? 'Close floating island menu' : 'Open floating island menu'}
            onClick={() => setOpen(!isOpen)}
            className="min-h-[40px] px-3 rounded-full bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-emerald-800 transition-colors"
          >
            <span>{isOpen ? 'Close' : 'Menu'}</span>
            {isOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
          </button>
        </header>
      </div>

      <div className="relative flex-1 overflow-y-auto">
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.button
                type="button"
                aria-label="Close floating island backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
                onClick={() => setOpen(false)}
                className={`${contained ? 'absolute' : 'fixed top-16'} inset-0 z-10 bg-emerald-950/25`}
              />

              <motion.nav
                id={panelId}
                aria-label="Floating detached island menu"
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
                className={`${
                  contained ? 'absolute top-1 inset-x-3' : 'fixed top-[4.5rem] inset-x-3'
                } z-20 bg-white rounded-3xl border border-emerald-200 shadow-2xl p-3.5 space-y-3.5 max-h-[calc(100%-1rem)] overflow-y-auto`}
              >
                <div className="relative">
                  <Search className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    aria-label="Search Verdant Guide"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search parks, cafés, walks..."
                    className="w-full min-h-[42px] pl-10 pr-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm text-[#064E3B] placeholder:text-emerald-600/60 focus-visible:outline-2 focus-visible:outline-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {QUICK_ORBS.map((orb) => {
                    const Icon = orb.icon;
                    const active = activeId === orb.id;
                    return (
                      <button
                        key={orb.id}
                        type="button"
                        onClick={() => handleSelect(orb.id, orb.label)}
                        className="flex flex-col items-center gap-1.5 py-1 text-center"
                      >
                        <span
                          className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                            active
                              ? 'bg-emerald-700 text-white'
                              : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="text-[11px] font-medium truncate max-w-full">
                          {orb.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <ul className="space-y-1 border-t border-emerald-100 pt-2.5">
                  {filteredRows.map((row) => (
                    <li key={row.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(row.id, row.label)}
                        className="w-full min-h-[44px] px-3 rounded-xl flex items-center justify-between hover:bg-emerald-50 text-sm font-medium text-[#064E3B]"
                      >
                        <span>{row.label}</span>
                        <ChevronRight className="w-4 h-4 text-emerald-500" />
                      </button>
                    </li>
                  ))}
                </ul>
              </motion.nav>
            </>
          )}
        </AnimatePresence>

        <main className="px-4 pb-4 space-y-3">
          <div className="text-xs font-medium text-emerald-700">Selected · {activeLabel}</div>
          <div className="rounded-2xl border border-emerald-200 bg-white p-4 space-y-1.5">
            <h3 className="font-display text-lg font-bold text-[#064E3B]">{activeLabel}</h3>
            <p className="text-sm text-emerald-900/75 leading-relaxed">
              Detached floating island menu hovering below a pill top bar with circular quick orbs
              and rounded inset search.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
