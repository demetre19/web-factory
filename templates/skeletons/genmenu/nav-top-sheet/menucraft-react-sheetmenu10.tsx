'use client';

import React, { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Menu, X, Search } from 'lucide-react';
import { filterMenuItems } from '@/lib/sheet-logic';
import type { SheetMenuProps } from './types';

const TIMELINE_EVENTS = [
  { id: 'now', time: 'Now', label: 'Live Broadcast', category: 'Stream', highlight: true },
  { id: 'standup', time: '09:30', label: 'Morning Briefing', category: 'Pinned', highlight: false },
  { id: 'review', time: '14:00', label: 'Design Critique', category: 'Pinned', highlight: false },
  { id: 'digest', time: 'Yesterday', label: 'Weekly Digest', category: 'Archive', highlight: false },
];

export function SheetMenu10({
  open,
  defaultOpen = false,
  onOpenChange,
  contained = true,
  onSelectDestination,
}: SheetMenuProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [activeId, setActiveId] = useState('now');
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

  const filtered = filterMenuItems(TIMELINE_EVENTS, query);
  const activeLabel = TIMELINE_EVENTS.find((t) => t.id === activeId)?.label ?? 'Live Broadcast';

  const handleSelect = (id: string, label: string) => {
    setActiveId(id);
    onSelectDestination?.(label);
    setOpen(false);
  };

  return (
    <div
      className={`${
        contained ? 'relative h-full w-full overflow-hidden' : 'min-h-screen w-full'
      } bg-[#18121E] text-[#FDF7FF] flex flex-col`}
    >
      <header className="relative z-30 flex items-center gap-2 h-14 px-3 bg-[#1E1626] border-b border-[#342642] shrink-0">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-rose-300 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            aria-label="Search timeline directly from header"
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!isOpen) setOpen(true);
            }}
            placeholder="Search Pulse timeline..."
            className="w-full min-h-[38px] pl-8 pr-3 rounded-xl bg-[#120D17] border border-[#3C2C4D] text-xs text-white placeholder:text-purple-300/60 focus-visible:outline-2 focus-visible:outline-rose-400"
          />
        </div>

        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          aria-label={isOpen ? 'Close Pulse timeline menu' : 'Open Pulse timeline menu'}
          onClick={() => setOpen(!isOpen)}
          className="min-h-[40px] min-w-[40px] px-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold inline-flex items-center justify-center gap-1 hover:bg-rose-400 transition-colors shrink-0"
        >
          {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </header>

      <div className="relative flex-1 overflow-y-auto">
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.button
                type="button"
                aria-label="Close Pulse backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
                onClick={() => setOpen(false)}
                className={`${contained ? 'absolute' : 'fixed top-14'} inset-0 z-10 bg-black/65`}
              />

              <motion.nav
                id={panelId}
                aria-label="Timeline rail navigation"
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -14 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
                className={`${
                  contained ? 'absolute top-0 inset-x-0' : 'fixed top-14 inset-x-0'
                } z-20 bg-[#1E1626] border-b border-[#3C2C4D] shadow-2xl p-4 max-h-[calc(100%-0.5rem)] overflow-y-auto`}
              >
                <ol className="relative pl-5 border-l border-[#4B3860] space-y-2.5">
                  {filtered.length === 0 ? (
                    <li className="text-xs text-purple-300 py-3">No timeline nodes found.</li>
                  ) : (
                    filtered.map((item) => {
                      const active = item.id === activeId;
                      return (
                        <li key={item.id} className="relative">
                          <span
                            aria-hidden="true"
                            className={`absolute -left-[25px] top-3.5 w-2.5 h-2.5 rounded-full border-2 border-[#1E1626] ${
                              item.highlight || active ? 'bg-rose-400' : 'bg-purple-400/60'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => handleSelect(item.id, item.label)}
                            className={`w-full min-h-[48px] px-3 py-2 rounded-xl text-left flex items-center justify-between gap-2 transition-colors ${
                              active
                                ? 'bg-rose-500 text-white'
                                : 'bg-[#281E33] text-purple-50 hover:bg-[#332741]'
                            }`}
                          >
                            <div>
                              <span className="block text-sm font-semibold">{item.label}</span>
                              <span className="block text-[11px] opacity-75">{item.category}</span>
                            </div>
                            <span className="font-mono text-xs tabular-nums opacity-85">
                              {item.time}
                            </span>
                          </button>
                        </li>
                      );
                    })
                  )}
                </ol>
              </motion.nav>
            </>
          )}
        </AnimatePresence>

        <main className="p-4 space-y-3">
          <div className="text-xs font-medium text-rose-300">Timeline · {activeLabel}</div>
          <div className="rounded-2xl border border-[#342642] bg-[#241B2D] p-4 space-y-1.5">
            <h3 className="font-display text-lg font-bold text-white">{activeLabel}</h3>
            <p className="text-sm text-purple-100/80 leading-relaxed">
              Header-embedded search input opening a chronological vertical timeline rail drop-down.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
