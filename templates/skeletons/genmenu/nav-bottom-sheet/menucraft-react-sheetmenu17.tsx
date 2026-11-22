'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Search, Sparkles, Tag, Zap, FolderOpen, ChevronUp, X } from 'lucide-react';
import {
  computeLiveDragHeightPercent,
  filterMenuItems,
  getNextSnapPoint,
  resolveSnapAfterDrag,
  type SnapPoint,
} from '@/lib/sheet-logic';
import type { SheetMenuProps } from './types';

const SNAP_POINTS: SnapPoint[] = [
  { id: 'peek', label: 'Hero Tiles', heightPercent: 46 },
  { id: 'full', label: 'All Folders', heightPercent: 88 },
];

const FOLDER_ITEMS = [
  { id: 'campaigns', label: 'Autumn Campaigns', category: 'Marketing' },
  { id: 'merch', label: 'Sticker Packs', category: 'Shop' },
  { id: 'collab', label: 'Creator Collabs', category: 'Community' },
  { id: 'assets', label: 'Brand Assets', category: 'Design' },
];

export function SheetMenu17({
  open,
  defaultOpen = false,
  onOpenChange,
  contained = true,
  onSelectDestination,
}: SheetMenuProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [snapId, setSnapId] = useState('peek');
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const [activeId, setActiveId] = useState('flash');
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
  const filteredFolders = filterMenuItems(FOLDER_ITEMS, query);
  const activeLabel =
    [
      { id: 'flash', label: 'Flash Drops' },
      { id: 'deals', label: 'Bundle Deals' },
      { id: 'new', label: 'New Arrivals' },
      ...FOLDER_ITEMS,
    ].find((i) => i.id === activeId)?.label ?? 'Flash Drops';

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
      } bg-[#FFF1F2] text-rose-950 flex flex-col justify-between`}
    >
      <main className="p-4 space-y-3 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between">
          <span className="font-display text-base font-extrabold">Citrus Club</span>
          <span className="text-xs font-bold text-rose-600">{activeLabel}</span>
        </div>
        <div className="rounded-3xl bg-white border border-rose-200 p-4 space-y-1.5">
          <h3 className="font-display text-xl font-extrabold">{activeLabel}</h3>
          <p className="text-sm text-rose-900/75 leading-relaxed">
            Playful asymmetric Bento feature tiles at Peek height expanding into categorized folders
            with live search.
          </p>
        </div>
      </main>

      <div className="p-3 bg-white border-t border-rose-200 shrink-0">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={sheetId}
          onClick={() => setOpen(true)}
          className="w-full min-h-[48px] px-4 rounded-2xl bg-[#E11D48] text-white text-sm font-bold flex items-center justify-between hover:bg-[#BE123C] transition-colors"
        >
          <span>Open Feature Bento</span>
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close Citrus backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
              onClick={() => setOpen(false)}
              className={`${contained ? 'absolute' : 'fixed'} inset-0 z-20 bg-rose-950/35`}
            />

            <motion.div
              id={sheetId}
              role="dialog"
              aria-modal="true"
              aria-label="Citrus feature bento bottom sheet"
              initial={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
              animate={prefersReducedMotion ? { opacity: 1 } : { y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: `${heightPercent}%` }}
              className={`${
                contained ? 'absolute' : 'fixed'
              } bottom-0 inset-x-0 z-30 bg-white rounded-t-3xl border-t border-rose-200 shadow-2xl flex flex-col overflow-hidden ${
                dragHeight === null ? 'transition-[height] duration-200 ease-out' : ''
              }`}
            >
              <div className="px-4 pt-2 pb-3 shrink-0 space-y-2.5">
                <button
                  type="button"
                  aria-label="Drag handle to resize feature bento sheet"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className="w-full py-2 flex items-center justify-center touch-none cursor-grab active:cursor-grabbing"
                >
                  <span className="w-10 h-1.5 rounded-full bg-rose-200" />
                </button>

                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-rose-50">
                    {SNAP_POINTS.map((point) => (
                      <button
                        key={point.id}
                        type="button"
                        onClick={() => setSnapId(point.id)}
                        className={`min-h-[30px] px-2.5 rounded-lg text-xs font-bold ${
                          snapId === point.id ? 'bg-[#E11D48] text-white' : 'text-rose-700'
                        }`}
                      >
                        {point.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    aria-label="Close Citrus sheet"
                    onClick={() => setOpen(false)}
                    className="min-h-[40px] min-w-[40px] rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-rose-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    aria-label="Search Citrus collections"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search drops & folders..."
                    className="w-full min-h-[40px] pl-9 pr-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-950 placeholder:text-rose-400 focus-visible:outline-2 focus-visible:outline-[#E11D48]"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelect('flash', 'Flash Drops')}
                    className="col-span-2 p-3.5 rounded-2xl bg-[#FACC15] text-zinc-950 text-left flex items-center justify-between"
                  >
                    <div>
                      <span className="block font-display text-base font-extrabold">Flash Drops</span>
                      <span className="block text-xs text-zinc-800">Ends in 3h</span>
                    </div>
                    <Zap className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelect('deals', 'Bundle Deals')}
                    className="p-3 rounded-2xl bg-[#FCE7F3] text-rose-950 text-left space-y-1"
                  >
                    <Tag className="w-4 h-4 text-rose-600" />
                    <span className="block text-xs font-bold">Bundle Deals</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelect('new', 'New Arrivals')}
                    className="p-3 rounded-2xl bg-[#DBEAFE] text-blue-950 text-left space-y-1"
                  >
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="block text-xs font-bold">New Arrivals</span>
                  </button>
                </div>

                {(currentSnap.heightPercent >= 70 || query.trim()) && (
                  <ul className="space-y-1.5">
                    {filteredFolders.map((folder) => (
                      <li key={folder.id}>
                        <button
                          type="button"
                          onClick={() => handleSelect(folder.id, folder.label)}
                          className="w-full min-h-[44px] px-3 rounded-xl bg-rose-50/70 hover:bg-rose-100 flex items-center justify-between text-left"
                        >
                          <span className="flex items-center gap-2 text-sm font-semibold">
                            <FolderOpen className="w-4 h-4 text-rose-600" />
                            <span>{folder.label}</span>
                          </span>
                          <span className="text-xs text-rose-500">{folder.category}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
