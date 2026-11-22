'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronUp, Search, Star, X } from 'lucide-react';
import {
  computeLiveDragHeightPercent,
  filterMenuItems,
  getNextSnapPoint,
  resolveSnapAfterDrag,
  type SnapPoint,
} from '@/lib/sheet-logic';
import type { SheetMenuProps } from './types';

const SNAP_POINTS: SnapPoint[] = [
  { id: 'compact', label: '44%', heightPercent: 44 },
  { id: 'mid', label: '72%', heightPercent: 72 },
  { id: 'full', label: '92%', heightPercent: 92 },
];

const TABLE_ITEMS = [
  { id: 'inbox', code: '01', label: 'Unified Inbox', category: 'Recent', starred: true },
  { id: 'invoices', code: '02', label: 'Invoices & Tax', category: 'Starred', starred: true },
  { id: 'payroll', code: '03', label: 'Global Payroll', category: 'Recent', starred: false },
  { id: 'vendors', code: '04', label: 'Vendor Ledger', category: 'All', starred: false },
  { id: 'audit', code: '05', label: 'Audit Trail', category: 'Starred', starred: true },
  { id: 'exports', code: '06', label: 'CSV Exports', category: 'Recent', starred: false },
];

export function SheetMenu16({
  open,
  defaultOpen = false,
  onOpenChange,
  contained = true,
  onSelectDestination,
}: SheetMenuProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [snapId, setSnapId] = useState('mid');
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const [tab, setTab] = useState<'all' | 'starred' | 'recent'>('all');
  const [activeId, setActiveId] = useState('inbox');
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

  const currentSnap = SNAP_POINTS.find((s) => s.id === snapId) ?? SNAP_POINTS[1];
  const heightPercent = dragHeight ?? currentSnap.heightPercent;
  const scoped = TABLE_ITEMS.filter((item) => {
    if (tab === 'starred') return item.starred;
    if (tab === 'recent') return item.category === 'Recent';
    return true;
  });
  const filtered = filterMenuItems(scoped, query);
  const activeLabel = TABLE_ITEMS.find((i) => i.id === activeId)?.label ?? 'Unified Inbox';

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
      } bg-slate-100 text-slate-900 flex flex-col justify-between`}
    >
      <main className="p-4 space-y-3 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between">
          <span className="font-display text-base font-bold">Swiss Index</span>
          <span className="text-xs font-mono text-slate-500">{activeLabel}</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1.5">
          <h3 className="font-display text-lg font-bold">{activeLabel}</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Segmented tabbed bottom sheet with a hairline tabular index, monospace codes, and live
            search bar.
          </p>
        </div>
      </main>

      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={sheetId}
          onClick={() => setOpen(true)}
          className="w-full min-h-[48px] px-4 rounded-xl bg-slate-900 text-white text-sm font-semibold flex items-center justify-between hover:bg-slate-800 transition-colors"
        >
          <span>Open Tabbed Index</span>
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close Swiss Index backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
              onClick={() => setOpen(false)}
              className={`${contained ? 'absolute' : 'fixed'} inset-0 z-20 bg-slate-900/35`}
            />

            <motion.div
              id={sheetId}
              role="dialog"
              aria-modal="true"
              aria-label="Swiss segmented tabular bottom sheet"
              initial={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
              animate={prefersReducedMotion ? { opacity: 1 } : { y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: `${heightPercent}%` }}
              className={`${
                contained ? 'absolute' : 'fixed'
              } bottom-0 inset-x-0 z-30 bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl flex flex-col overflow-hidden ${
                dragHeight === null ? 'transition-[height] duration-200 ease-out' : ''
              }`}
            >
              <div className="px-4 pt-2 pb-3 border-b border-slate-200 shrink-0 space-y-2.5">
                <button
                  type="button"
                  aria-label="Drag handle to resize tabular sheet"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className="w-full py-2 flex items-center justify-center touch-none cursor-grab active:cursor-grabbing"
                >
                  <span className="w-10 h-1.5 rounded-full bg-slate-300" />
                </button>

                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-slate-100">
                    {SNAP_POINTS.map((point) => (
                      <button
                        key={point.id}
                        type="button"
                        onClick={() => setSnapId(point.id)}
                        className={`min-h-[28px] px-2 rounded-md text-xs font-mono ${
                          snapId === point.id ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        {point.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    aria-label="Close tabular sheet"
                    onClick={() => setOpen(false)}
                    className="min-h-[40px] min-w-[40px] rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    aria-label="Search ledger index"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Filter tabular rows..."
                    className="w-full min-h-[40px] pl-9 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-slate-900"
                  />
                </div>

                <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-slate-100">
                  {(['all', 'starred', 'recent'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTab(t)}
                      className={`min-h-[32px] rounded-md text-xs font-semibold capitalize ${
                        tab === t ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-2">
                <ul className="divide-y divide-slate-100">
                  {filtered.map((row) => (
                    <li key={row.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(row.id, row.label)}
                        className="w-full min-h-[46px] px-1.5 py-2 flex items-center justify-between text-left hover:bg-slate-50 rounded-md"
                      >
                        <span className="flex items-center gap-3 min-w-0">
                          <span className="font-mono text-xs tabular-nums text-slate-400">
                            {row.code}
                          </span>
                          <span className="text-sm font-medium text-slate-900 truncate">
                            {row.label}
                          </span>
                        </span>
                        <span className="flex items-center gap-2 shrink-0 text-xs text-slate-500">
                          <span>{row.category}</span>
                          {row.starred && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
