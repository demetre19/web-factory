'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronUp, Search, X } from 'lucide-react';
import {
  computeLiveDragHeightPercent,
  filterMenuItems,
  getNextSnapPoint,
  groupItemsAlphabetically,
  resolveSnapAfterDrag,
  type SnapPoint,
} from '@/lib/sheet-logic';
import type { SheetMenuProps } from './types';

const SNAP_POINTS: SnapPoint[] = [
  { id: 'half', label: 'Half', heightPercent: 62 },
  { id: 'full', label: 'Full', heightPercent: 92 },
];

const DIRECTORY_ITEMS = [
  { id: 'api', label: 'API Keys', description: 'Tokens & rotation' },
  { id: 'analytics', label: 'Analytics', description: 'Funnel telemetry' },
  { id: 'billing', label: 'Billing', description: 'Invoices & tax ID' },
  { id: 'compliance', label: 'Compliance', description: 'SOC2 exports' },
  { id: 'deployments', label: 'Deployments', description: 'Edge releases' },
  { id: 'permissions', label: 'Permissions', description: 'Role policies' },
  { id: 'support', label: 'Support Queue', description: 'SLA tickets' },
];

export function SheetMenu19({
  open,
  defaultOpen = false,
  onOpenChange,
  contained = true,
  onSelectDestination,
}: SheetMenuProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [snapId, setSnapId] = useState('half');
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const [activeId, setActiveId] = useState('analytics');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ y: number; basePercent: number; moved: boolean } | null>(null);
  const sheetId = useId();
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

  const currentSnap = SNAP_POINTS.find((s) => s.id === snapId) ?? SNAP_POINTS[0];
  const heightPercent = dragHeight ?? currentSnap.heightPercent;

  const filtered = filterMenuItems(DIRECTORY_ITEMS, query);
  const grouped = groupItemsAlphabetically(filtered);
  const visibleGroups = selectedLetter
    ? grouped.filter((g) => g.letter === selectedLetter)
    : grouped;

  const activeLabel = DIRECTORY_ITEMS.find((d) => d.id === activeId)?.label ?? 'Analytics';

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartRef.current = { y: e.clientY, basePercent: currentSnap.heightPercent, moved: false };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragStartRef.current) return;
    const deltaY = e.clientY - dragStartRef.current.y;
    if (Math.abs(deltaY) > 6) dragStartRef.current.moved = true;
    const containerHeight =
      containerRef.current?.clientHeight ?? (typeof window !== 'undefined' ? window.innerHeight : 700);
    setDragHeight(
      computeLiveDragHeightPercent({
        baseHeightPercent: dragStartRef.current.basePercent,
        deltaY,
        containerHeight,
      })
    );
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragStartRef.current) return;
    const deltaY = e.clientY - dragStartRef.current.y;
    const wasMoved = dragStartRef.current.moved;
    dragStartRef.current = null;
    setDragHeight(null);

    if (!wasMoved) {
      const next = getNextSnapPoint(SNAP_POINTS, currentSnap.id, 'cycle');
      if (next) setSnapId(next.id);
      return;
    }

    const containerHeight =
      containerRef.current?.clientHeight ?? (typeof window !== 'undefined' ? window.innerHeight : 700);
    const outcome = resolveSnapAfterDrag({
      snapPoints: SNAP_POINTS,
      currentSnapId: currentSnap.id,
      deltaY,
      containerHeight,
    });
    if (outcome.action === 'dismiss') setOpen(false);
    else setSnapId(outcome.snap.id);
  };

  const handleSelect = (id: string, label: string) => {
    setActiveId(id);
    onSelectDestination?.(label);
    setOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`${
        contained ? 'relative h-full w-full overflow-hidden' : 'min-h-screen w-full'
      } bg-[#F7F5F0] text-stone-900 flex flex-col justify-between`}
    >
      <main className="p-4 space-y-3 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between">
          <span className="font-display text-base font-bold">Lexicon A–Z</span>
          <span className="text-xs text-stone-500">{activeLabel}</span>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-4 space-y-1.5">
          <h3 className="font-display text-lg font-bold">{activeLabel}</h3>
          <p className="text-sm text-stone-600 leading-relaxed">
            Alphabetical A–Z directory bottom sheet with quick-jump letter rail and sticky top
            search bar.
          </p>
        </div>
      </main>

      <div className="p-3 bg-white border-t border-stone-200 shrink-0">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={sheetId}
          onClick={() => setOpen(true)}
          className="w-full min-h-[48px] px-4 rounded-2xl bg-stone-900 text-white text-sm font-semibold flex items-center justify-between hover:bg-stone-800 transition-colors"
        >
          <span>Open A–Z Directory</span>
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close Lexicon backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
              onClick={() => setOpen(false)}
              className={`${contained ? 'absolute' : 'fixed'} inset-0 z-20 bg-stone-950/35`}
            />

            <motion.div
              id={sheetId}
              role="dialog"
              aria-modal="true"
              aria-label="Lexicon A to Z directory bottom sheet"
              initial={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
              animate={prefersReducedMotion ? { opacity: 1 } : { y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: `${heightPercent}%` }}
              className={`${
                contained ? 'absolute' : 'fixed'
              } bottom-0 inset-x-0 z-30 bg-[#FAF9F6] rounded-t-3xl border-t border-stone-200 shadow-2xl flex flex-col overflow-hidden ${
                dragHeight === null ? 'transition-[height] duration-200 ease-out' : ''
              }`}
            >
              <div className="px-4 pt-2 pb-3 border-b border-stone-200 shrink-0 space-y-2.5">
                <button
                  type="button"
                  aria-label="Drag handle to resize A-Z directory"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className="w-full py-2 flex items-center justify-center touch-none cursor-grab active:cursor-grabbing"
                >
                  <span className="w-10 h-1.5 rounded-full bg-stone-300" />
                </button>

                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-stone-200/70">
                    {SNAP_POINTS.map((point) => (
                      <button
                        key={point.id}
                        type="button"
                        onClick={() => setSnapId(point.id)}
                        className={`min-h-[30px] px-2.5 rounded-lg text-xs font-medium ${
                          snapId === point.id ? 'bg-white text-stone-950 shadow-xs' : 'text-stone-600'
                        }`}
                      >
                        {point.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    aria-label="Close A-Z sheet"
                    onClick={() => setOpen(false)}
                    className="min-h-[40px] min-w-[40px] rounded-full text-stone-600 hover:bg-stone-200/70 flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    aria-label="Search A-Z directory"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setSelectedLetter(null);
                    }}
                    placeholder="Search A–Z directory..."
                    className="w-full min-h-[40px] pl-9 pr-3 rounded-xl bg-white border border-stone-200 text-sm text-stone-900 placeholder:text-stone-400 focus-visible:outline-2 focus-visible:outline-stone-900"
                  />
                </div>
              </div>

              <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
                  {visibleGroups.map((group) => (
                    <section key={group.letter}>
                      <h2 className="text-[11px] font-mono font-bold text-stone-500 border-b border-stone-200 pb-1">
                        {group.letter}
                      </h2>
                      <ul className="divide-y divide-stone-100">
                        {group.items.map((item) => (
                          <li key={item.id}>
                            <button
                              type="button"
                              onClick={() => handleSelect(item.id, item.label)}
                              className="w-full min-h-[44px] py-1.5 text-left flex items-center justify-between hover:bg-stone-100 px-1.5 rounded-lg"
                            >
                              <span className="text-sm font-medium text-stone-900">
                                {item.label}
                              </span>
                              <span className="text-xs text-stone-500">{item.description}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>

                <div
                  aria-label="Alphabetical quick jump rail"
                  className="w-9 border-l border-stone-200 bg-stone-100/70 py-2 flex flex-col items-center justify-start gap-1 shrink-0"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedLetter(null)}
                    className={`w-7 h-7 rounded-md text-[10px] font-mono font-bold ${
                      selectedLetter === null ? 'bg-stone-900 text-white' : 'text-stone-600'
                    }`}
                  >
                    All
                  </button>
                  {grouped.map((g) => (
                    <button
                      key={g.letter}
                      type="button"
                      onClick={() =>
                        setSelectedLetter((prev) => (prev === g.letter ? null : g.letter))
                      }
                      className={`w-7 h-7 rounded-md text-[10px] font-mono font-bold ${
                        selectedLetter === g.letter ? 'bg-stone-900 text-white' : 'text-stone-600'
                      }`}
                    >
                      {g.letter}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
