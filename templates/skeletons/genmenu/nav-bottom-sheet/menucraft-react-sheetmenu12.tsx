'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Camera,
  Music,
  Palette,
  Compass,
  Gift,
  Calendar,
  ShoppingBag,
  MessageCircle,
  Bookmark,
  Video,
  Award,
  MapPin,
  Search,
  LayoutGrid,
  X,
} from 'lucide-react';
import {
  computeLiveDragHeightPercent,
  filterMenuItems,
  getNextSnapPoint,
  resolveSnapAfterDrag,
  type SnapPoint,
} from '@/lib/sheet-logic';
import type { SheetMenuProps } from './types';

const SNAP_POINTS: SnapPoint[] = [
  { id: 'row1', label: '1 Row', heightPercent: 38 },
  { id: 'row2', label: '2 Rows', heightPercent: 58 },
  { id: 'all', label: 'All Apps', heightPercent: 88 },
];

const COLOR_TILES = [
  { id: 'studio', label: 'Studio', icon: Palette, bg: 'bg-sky-100 text-sky-900', iconColor: 'text-sky-600' },
  { id: 'audio', label: 'Beats', icon: Music, bg: 'bg-rose-100 text-rose-900', iconColor: 'text-rose-600' },
  { id: 'shots', label: 'Photos', icon: Camera, bg: 'bg-amber-100 text-amber-900', iconColor: 'text-amber-600' },
  { id: 'explore', label: 'Explore', icon: Compass, bg: 'bg-emerald-100 text-emerald-900', iconColor: 'text-emerald-600' },
  { id: 'events', label: 'Events', icon: Calendar, bg: 'bg-violet-100 text-violet-900', iconColor: 'text-violet-600' },
  { id: 'shop', label: 'Shop', icon: ShoppingBag, bg: 'bg-orange-100 text-orange-900', iconColor: 'text-orange-600' },
  { id: 'chat', label: 'Lounge', icon: MessageCircle, bg: 'bg-cyan-100 text-cyan-900', iconColor: 'text-cyan-600' },
  { id: 'saved', label: 'Saved', icon: Bookmark, bg: 'bg-pink-100 text-pink-900', iconColor: 'text-pink-600' },
  { id: 'clips', label: 'Reels', icon: Video, bg: 'bg-indigo-100 text-indigo-900', iconColor: 'text-indigo-600' },
  { id: 'gifts', label: 'Rewards', icon: Gift, bg: 'bg-lime-100 text-lime-900', iconColor: 'text-lime-700' },
  { id: 'badges', label: 'Ranks', icon: Award, bg: 'bg-yellow-100 text-yellow-900', iconColor: 'text-yellow-700' },
  { id: 'places', label: 'Spots', icon: MapPin, bg: 'bg-teal-100 text-teal-900', iconColor: 'text-teal-600' },
];

export function SheetMenu12({
  open,
  defaultOpen = false,
  onOpenChange,
  contained = true,
  onSelectDestination,
}: SheetMenuProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [snapId, setSnapId] = useState('row2');
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const [activeId, setActiveId] = useState('studio');
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
  const filtered = filterMenuItems(COLOR_TILES, query);
  const visibleTiles = query.trim()
    ? filtered
    : currentSnap.id === 'row1'
      ? filtered.slice(0, 3)
      : currentSnap.id === 'row2'
        ? filtered.slice(0, 6)
        : filtered;

  const activeLabel = COLOR_TILES.find((t) => t.id === activeId)?.label ?? 'Studio';

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
      } bg-[#F5F3FF] text-[#1E1B4B] flex flex-col justify-between`}
    >
      <main className="p-4 space-y-3 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between">
          <span className="font-display text-base font-extrabold">Popdeck</span>
          <span className="text-xs font-medium text-indigo-700">Tile · {activeLabel}</span>
        </div>
        <div className="rounded-3xl bg-white border border-indigo-100 p-4 space-y-1.5">
          <h3 className="font-display text-xl font-bold">{activeLabel}</h3>
          <p className="text-sm text-indigo-950/75 leading-relaxed">
            Inverted thumb-zone bottom sheet placing the live Search Bar right at the bottom edge
            beneath the 3-column pastel app grid.
          </p>
        </div>
      </main>

      <div className="p-3 bg-white border-t border-indigo-100 shrink-0">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={sheetId}
          onClick={() => setOpen(true)}
          className="w-full min-h-[48px] px-4 rounded-2xl bg-[#4F46E5] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#4338CA] transition-colors"
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Open Thumb Launcher</span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close Popdeck backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
              onClick={() => setOpen(false)}
              className={`${contained ? 'absolute' : 'fixed'} inset-0 z-20 bg-indigo-950/40`}
            />

            <motion.div
              id={sheetId}
              role="dialog"
              aria-modal="true"
              aria-label="Popdeck thumb-zone search bottom sheet"
              initial={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
              animate={prefersReducedMotion ? { opacity: 1 } : { y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: `${heightPercent}%` }}
              className={`${
                contained ? 'absolute' : 'fixed'
              } bottom-0 inset-x-0 z-30 bg-white rounded-t-3xl border-t border-indigo-100 shadow-2xl flex flex-col overflow-hidden ${
                dragHeight === null ? 'transition-[height] duration-200 ease-out' : ''
              }`}
            >
              <div className="px-4 pt-2 pb-2 shrink-0">
                <button
                  type="button"
                  aria-label="Drag handle to switch 1 Row, 2 Rows, All Apps"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className="w-full py-2 flex items-center justify-center touch-none cursor-grab active:cursor-grabbing"
                >
                  <span className="w-10 h-1.5 rounded-full bg-indigo-200" />
                </button>

                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-indigo-50">
                    {SNAP_POINTS.map((point) => (
                      <button
                        key={point.id}
                        type="button"
                        onClick={() => setSnapId(point.id)}
                        className={`min-h-[30px] px-2.5 rounded-lg text-xs font-bold transition-colors ${
                          snapId === point.id
                            ? 'bg-[#4F46E5] text-white'
                            : 'text-indigo-700 hover:bg-indigo-100'
                        }`}
                      >
                        {point.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    aria-label="Close Popdeck sheet"
                    onClick={() => setOpen(false)}
                    className="min-h-[40px] min-w-[40px] rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <nav aria-label="App tiles grid" className="flex-1 overflow-y-auto px-4 py-2">
                <ul className="grid grid-cols-3 gap-2">
                  {visibleTiles.map((tile) => {
                    const Icon = tile.icon;
                    return (
                      <li key={tile.id}>
                        <button
                          type="button"
                          onClick={() => handleSelect(tile.id, tile.label)}
                          className={`w-full min-h-[76px] p-2 rounded-2xl flex flex-col items-center justify-center gap-1.5 ${
                            tile.bg
                          } ${activeId === tile.id ? 'ring-2 ring-[#4F46E5]' : ''}`}
                        >
                          <Icon className={`w-5 h-5 ${tile.iconColor}`} />
                          <span className="text-xs font-bold truncate max-w-full">{tile.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="p-3 bg-indigo-50/70 border-t border-indigo-100 shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 text-indigo-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    aria-label="Thumb-zone app search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Thumb search apps..."
                    className="w-full min-h-[44px] pl-10 pr-3 rounded-2xl bg-white border border-indigo-200 text-sm text-[#1E1B4B] placeholder:text-indigo-400 focus-visible:outline-2 focus-visible:outline-[#4F46E5]"
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
