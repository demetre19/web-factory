'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, ChevronUp, LogOut, Menu, Search, Ticket, Compass, X } from 'lucide-react';
import {
  computeLiveDragHeightPercent,
  filterMenuItems,
  getNextSnapPoint,
  resolveSnapAfterDrag,
  type SnapPoint,
} from '@/lib/sheet-logic';
import type { SheetMenuProps } from './types';

const SNAP_POINTS: SnapPoint[] = [
  { id: 'peek', label: 'Peek', heightPercent: 38 },
  { id: 'half', label: 'Half', heightPercent: 68 },
  { id: 'full', label: 'Full', heightPercent: 92 },
];

const GALLERY_LINKS = [
  { id: 'explore', label: 'Explore', description: 'Current curation' },
  { id: 'exhibitions', label: 'Exhibitions', description: '12 rooms open' },
  { id: 'saved', label: 'Saved Works', description: '18 pieces' },
  { id: 'collectors', label: 'Collectors', description: 'Private viewing' },
  { id: 'monographs', label: 'Monographs', description: 'Essays & prints' },
];

export function SheetMenu11({
  open,
  defaultOpen = false,
  onOpenChange,
  contained = true,
  onSelectDestination,
}: SheetMenuProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [snapId, setSnapId] = useState('half');
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const [activeId, setActiveId] = useState('explore');
  const [query, setQuery] = useState('');
  const [signedOut, setSignedOut] = useState(false);

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
  const filteredLinks = filterMenuItems(GALLERY_LINKS, query);
  const activeLabel = GALLERY_LINKS.find((l) => l.id === activeId)?.label ?? 'Explore';

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
      } bg-[#F8F8F7] text-zinc-950 flex flex-col justify-between`}
    >
      <main className="p-4 space-y-3 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between">
          <span className="font-display text-base font-bold">Kunsthalle</span>
          <span className="text-xs text-zinc-500">Gallery · {activeLabel}</span>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 space-y-1.5">
          <h3 className="font-display text-xl font-bold">{activeLabel}</h3>
          <p className="text-sm text-zinc-600 leading-relaxed">
            Progressive-layer bottom sheet revealing 2 quick cards at Peek, large editorial links at
            Half, and curator profile footer at Full.
          </p>
        </div>
      </main>

      <div className="p-3 bg-white border-t border-zinc-200 shrink-0">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={sheetId}
          onClick={() => setOpen(true)}
          className="w-full min-h-[48px] px-4 rounded-2xl bg-zinc-950 text-white text-sm font-medium flex items-center justify-between hover:bg-zinc-800 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Menu className="w-4 h-4" />
            <span>Open Progressive Sheet</span>
          </span>
          <ChevronUp className="w-4 h-4 text-zinc-400" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Dismiss bottom sheet"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
              onClick={() => setOpen(false)}
              className={`${contained ? 'absolute' : 'fixed'} inset-0 z-20 bg-zinc-950/40`}
            />

            <motion.div
              id={sheetId}
              role="dialog"
              aria-modal="true"
              aria-label="Kunsthalle progressive bottom sheet"
              initial={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
              animate={prefersReducedMotion ? { opacity: 1 } : { y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: `${heightPercent}%` }}
              className={`${
                contained ? 'absolute' : 'fixed'
              } bottom-0 inset-x-0 z-30 bg-white rounded-t-3xl border-t border-zinc-200 shadow-2xl flex flex-col overflow-hidden ${
                dragHeight === null ? 'transition-[height] duration-200 ease-out' : ''
              }`}
            >
              <div className="px-4 pt-2 pb-3 border-b border-zinc-100 shrink-0 space-y-2.5">
                <button
                  type="button"
                  aria-label="Drag or tap handle to change sheet snap height"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className="w-full py-2 flex items-center justify-center touch-none cursor-grab active:cursor-grabbing"
                >
                  <span className="w-10 h-1.5 rounded-full bg-zinc-300" />
                </button>

                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-zinc-100">
                    {SNAP_POINTS.map((point) => (
                      <button
                        key={point.id}
                        type="button"
                        onClick={() => setSnapId(point.id)}
                        className={`min-h-[32px] px-2.5 rounded-lg text-xs font-medium transition-colors ${
                          snapId === point.id
                            ? 'bg-white text-zinc-950 shadow-xs'
                            : 'text-zinc-600 hover:text-zinc-950'
                        }`}
                      >
                        {point.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    aria-label="Close progressive sheet"
                    onClick={() => setOpen(false)}
                    className="min-h-[40px] min-w-[40px] rounded-full text-zinc-600 hover:bg-zinc-100 flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    aria-label="Search gallery works and rooms"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search exhibitions, artists..."
                    className="w-full min-h-[40px] pl-9 pr-3 rounded-xl bg-zinc-100 text-sm text-zinc-950 placeholder:text-zinc-500 focus-visible:outline-2 focus-visible:outline-zinc-950"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelect('exhibitions', 'Exhibitions')}
                    className="p-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200/70 text-left space-y-1"
                  >
                    <Compass className="w-4 h-4 text-zinc-800" />
                    <span className="block text-xs font-bold">Room Map</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelect('collectors', 'Collectors')}
                    className="p-3 rounded-2xl bg-zinc-950 text-white hover:bg-zinc-800 text-left space-y-1"
                  >
                    <Ticket className="w-4 h-4 text-zinc-300" />
                    <span className="block text-xs font-bold">Entry Pass</span>
                  </button>
                </div>

                {(currentSnap.heightPercent >= 55 || query.trim()) && (
                  <nav aria-label="Large gallery links">
                    <ul className="divide-y divide-zinc-100">
                      {filteredLinks.map((item) => (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => handleSelect(item.id, item.label)}
                            className="w-full min-h-[50px] py-2 px-1 flex items-center justify-between text-left hover:bg-zinc-50 rounded-lg"
                          >
                            <div>
                              <span className="block font-display text-xl font-bold">{item.label}</span>
                              <span className="block text-xs text-zinc-500">{item.description}</span>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-zinc-400 shrink-0" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </nav>
                )}
              </div>

              {currentSnap.heightPercent >= 80 && (
                <footer className="px-4 py-2.5 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-zinc-900 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                      ML
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">Maya Lin</p>
                      <p className="text-[11px] text-zinc-500 truncate">
                        {signedOut ? 'Signed out' : 'Curator'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSignedOut((p) => !p)}
                    className="min-h-[38px] px-2.5 rounded-lg border border-zinc-200 bg-white text-xs font-medium inline-flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{signedOut ? 'Sign in' : 'Sign out'}</span>
                  </button>
                </footer>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
