'use client';

import React, { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Menu, X, Search, ArrowUpRight, Flame, Disc } from 'lucide-react';
import { filterMenuItems } from '@/lib/sheet-logic';
import type { SheetMenuProps } from './types';

const FILTER_CATEGORIES = ['All', 'Drops', 'Editorial', 'Audio'] as const;

const LINKS = [
  { id: 'showcase', index: '01', label: 'Showcase', category: 'Editorial' },
  { id: 'drops', index: '02', label: 'Seasonal Drops', category: 'Drops' },
  { id: 'lookbook', index: '03', label: 'Lookbook 09', category: 'Editorial' },
  { id: 'radio', index: '04', label: 'Kinetic Radio', category: 'Audio' },
];

export function SheetMenu3({
  open,
  defaultOpen = false,
  onOpenChange,
  contained = true,
  onSelectDestination,
}: SheetMenuProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [activeId, setActiveId] = useState('showcase');
  const [catFilter, setCatFilter] = useState<(typeof FILTER_CATEGORIES)[number]>('All');
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

  const scoped =
    catFilter === 'All' ? LINKS : LINKS.filter((l) => l.category === catFilter);
  const visibleLinks = filterMenuItems(scoped, query);
  const activeLabel = LINKS.find((l) => l.id === activeId)?.label ?? 'Showcase';

  const handleSelect = (id: string, label: string) => {
    setActiveId(id);
    onSelectDestination?.(label);
    setOpen(false);
  };

  return (
    <div
      className={`${
        contained ? 'relative h-full w-full overflow-hidden' : 'min-h-screen w-full'
      } bg-[#FFFBEB] text-zinc-950 flex flex-col`}
    >
      <header className="relative z-30 flex items-center justify-between h-14 px-4 bg-[#FFFBEB] border-b-2 border-zinc-950 shrink-0">
        <span className="font-display text-lg font-extrabold tracking-tight text-zinc-950 whitespace-nowrap">
          KINETIC
        </span>

        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          aria-label={isOpen ? 'Close KINETIC navigation' : 'Open KINETIC navigation'}
          onClick={() => setOpen(!isOpen)}
          className="min-h-[44px] px-3.5 inline-flex items-center justify-center gap-2 rounded-full bg-zinc-950 text-[#FACC15] text-xs font-bold hover:bg-indigo-600 hover:text-white transition-colors"
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
                aria-label="Close KINETIC backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
                onClick={() => setOpen(false)}
                className={`${contained ? 'absolute' : 'fixed top-14'} inset-0 z-10 bg-zinc-950/35`}
              />

              <motion.nav
                id={panelId}
                aria-label="Category scroller and spotlight menu"
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
                className={`${
                  contained ? 'absolute top-0 inset-x-0' : 'fixed top-14 inset-x-0'
                } z-20 bg-[#FFFBEB] border-b-2 border-zinc-950 shadow-xl max-h-[calc(100%-0.5rem)] overflow-y-auto`}
              >
                <div className="p-3.5 space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="search"
                      aria-label="Search KINETIC drops and links"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search drops, looks, mixes..."
                      className="w-full min-h-[42px] pl-10 pr-3 rounded-xl border-2 border-zinc-950 bg-white text-sm font-medium text-zinc-950 placeholder:text-zinc-400 focus-visible:outline-2 focus-visible:outline-indigo-600"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {FILTER_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCatFilter(cat)}
                        className={`min-h-[36px] px-3 rounded-lg border-2 border-zinc-950 text-xs font-bold whitespace-nowrap transition-colors ${
                          catFilter === cat
                            ? 'bg-zinc-950 text-[#FACC15]'
                            : 'bg-white text-zinc-950 hover:bg-[#FEF08A]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelect('drops', 'Seasonal Drops')}
                      className="p-3 rounded-xl border-2 border-zinc-950 bg-[#F43F5E] text-white text-left space-y-1 hover:bg-[#E11D48] transition-colors"
                    >
                      <Flame className="w-4 h-4" />
                      <span className="block font-display text-sm font-extrabold">Drop 09 Live</span>
                      <span className="block text-[11px] text-rose-100">14 pieces</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelect('radio', 'Kinetic Radio')}
                      className="p-3 rounded-xl border-2 border-zinc-950 bg-[#4F46E5] text-white text-left space-y-1 hover:bg-[#4338CA] transition-colors"
                    >
                      <Disc className="w-4 h-4" />
                      <span className="block font-display text-sm font-extrabold">Radio Stream</span>
                      <span className="block text-[11px] text-indigo-100">Episode 42</span>
                    </button>
                  </div>

                  <ul className="divide-y-2 divide-zinc-950/15">
                    {visibleLinks.map((item) => {
                      const active = item.id === activeId;
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => handleSelect(item.id, item.label)}
                            className={`w-full min-h-[48px] px-2.5 py-2 rounded-xl flex items-center justify-between text-left transition-colors ${
                              active
                                ? 'bg-[#FACC15] text-zinc-950'
                                : 'text-zinc-950 hover:bg-white'
                            }`}
                          >
                            <span className="flex items-baseline gap-2.5">
                              <span className="font-mono text-xs font-bold text-zinc-500">
                                {item.index}
                              </span>
                              <span className="font-display text-xl font-extrabold tracking-tight">
                                {item.label}
                              </span>
                            </span>
                            <ArrowUpRight className="w-4 h-4 shrink-0" />
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
          <div className="text-xs font-bold text-indigo-700">Selected · {activeLabel}</div>
          <div className="rounded-2xl border-2 border-zinc-950 bg-[#FACC15] p-4 space-y-1.5">
            <h3 className="font-display text-2xl font-extrabold tracking-tight text-zinc-950">
              {activeLabel}
            </h3>
            <p className="text-sm font-medium text-zinc-900 leading-relaxed">
              Horizontal category filter strip paired with 2 spotlight promo cards and oversized
              links.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
