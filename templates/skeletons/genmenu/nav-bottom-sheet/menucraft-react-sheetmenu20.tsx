'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Search,
  Play,
  Pause,
  ListMusic,
  ArrowUpRight,
  Disc3,
  ChevronUp,
  X,
  Radio,
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
  { id: 'dock', label: 'Dock', heightPercent: 38 },
  { id: 'browse', label: 'Browse', heightPercent: 68 },
  { id: 'full', label: 'Full', heightPercent: 92 },
];

const LARGE_NAV = [
  { id: 'discover', label: 'Discover', description: 'Fresh cuts' },
  { id: 'live', label: 'Live Sets', description: '4 rooms' },
  { id: 'mixes', label: 'Saved Mixes', description: '28 tracks' },
  { id: 'playlists', label: 'Playlists', description: 'Curated' },
];

export function SheetMenu20({
  open,
  defaultOpen = false,
  onOpenChange,
  contained = true,
  onSelectDestination,
}: SheetMenuProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [snapId, setSnapId] = useState('browse');
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const [activeId, setActiveId] = useState('discover');
  const [playing, setPlaying] = useState(true);
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
  const filteredNav = filterMenuItems(LARGE_NAV, query);
  const activeLabel = LARGE_NAV.find((n) => n.id === activeId)?.label ?? 'Discover';

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
      } bg-[#14111D] text-[#F4F1FF] flex flex-col justify-between`}
    >
      <main className="p-4 space-y-3 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between">
          <span className="font-display text-base font-extrabold text-white">Nightwave</span>
          <span className="text-xs font-semibold text-[#A3E635]">{activeLabel}</span>
        </div>
        <div className="rounded-2xl border border-[#2D2640] bg-[#211C30] p-4 space-y-1.5">
          <h3 className="font-display text-xl font-bold text-white">{activeLabel}</h3>
          <p className="text-sm text-purple-100/80 leading-relaxed">
            Dual-layer media dock sheet starting with a live mini-player at Dock height, expanding
            to search, oversized channels, and creator studio footer.
          </p>
        </div>
      </main>

      <div className="p-3 bg-[#1B1628] border-t border-[#2D2640] shrink-0">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={sheetId}
          onClick={() => setOpen(true)}
          className="w-full min-h-[48px] px-4 rounded-2xl bg-[#EC4899] text-white text-sm font-bold flex items-center justify-between hover:bg-[#DB2777] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Disc3 className="w-4 h-4" />
            <span>Open Nightwave Deck</span>
          </span>
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close Nightwave backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
              onClick={() => setOpen(false)}
              className={`${contained ? 'absolute' : 'fixed'} inset-0 z-20 bg-black/70`}
            />

            <motion.div
              id={sheetId}
              role="dialog"
              aria-modal="true"
              aria-label="Nightwave media dock bottom sheet"
              initial={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
              animate={prefersReducedMotion ? { opacity: 1 } : { y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: `${heightPercent}%` }}
              className={`${
                contained ? 'absolute' : 'fixed'
              } bottom-0 inset-x-0 z-30 bg-[#1B1628] rounded-t-3xl border-t border-[#3B3154] shadow-2xl flex flex-col overflow-hidden ${
                dragHeight === null ? 'transition-[height] duration-200 ease-out' : ''
              }`}
            >
              <div className="px-4 pt-2 pb-3 border-b border-[#2D2640] shrink-0 space-y-2.5">
                <button
                  type="button"
                  aria-label="Drag handle to resize media dock sheet"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className="w-full py-2 flex items-center justify-center touch-none cursor-grab active:cursor-grabbing"
                >
                  <span className="w-10 h-1.5 rounded-full bg-[#EC4899]/70" />
                </button>

                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#272038]">
                    {SNAP_POINTS.map((point) => (
                      <button
                        key={point.id}
                        type="button"
                        onClick={() => setSnapId(point.id)}
                        className={`min-h-[30px] px-2.5 rounded-lg text-xs font-bold ${
                          snapId === point.id ? 'bg-[#A3E635] text-zinc-950' : 'text-purple-200'
                        }`}
                      >
                        {point.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    aria-label="Close Nightwave sheet"
                    onClick={() => setOpen(false)}
                    className="min-h-[40px] min-w-[40px] rounded-xl bg-[#272038] text-purple-100 flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="rounded-2xl bg-[#272038] px-3 py-2 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">Midnight Synth Session</p>
                    <p className="text-[11px] text-purple-300 truncate">DJ Kora · 124 BPM</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      aria-label={playing ? 'Pause session' : 'Play session'}
                      onClick={() => setPlaying((p) => !p)}
                      className="min-h-[36px] min-w-[36px] rounded-xl bg-[#EC4899] text-white flex items-center justify-center"
                    >
                      {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      aria-label="Open queue"
                      onClick={() => handleSelect('mixes', 'Saved Mixes')}
                      className="min-h-[36px] min-w-[36px] rounded-xl bg-[#342B4A] text-purple-100 flex items-center justify-center"
                    >
                      <ListMusic className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {(currentSnap.heightPercent >= 55 || query.trim()) && (
                  <div className="relative">
                    <Search className="w-4 h-4 text-purple-300 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="search"
                      aria-label="Search Nightwave channels"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search channels, sets..."
                      className="w-full min-h-[40px] pl-9 pr-3 rounded-xl bg-[#14111D] border border-[#3B3154] text-sm text-white placeholder:text-purple-300/60 focus-visible:outline-2 focus-visible:outline-[#EC4899]"
                    />
                  </div>
                )}
              </div>

              {(currentSnap.heightPercent >= 55 || query.trim()) && (
                <nav aria-label="Nightwave channels" className="flex-1 overflow-y-auto px-4 py-2.5">
                  <ul className="space-y-1.5">
                    {filteredNav.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => handleSelect(item.id, item.label)}
                          className={`w-full min-h-[50px] px-3 py-2 rounded-2xl flex items-center justify-between ${
                            activeId === item.id
                              ? 'bg-[#EC4899] text-white'
                              : 'bg-[#211C30] text-purple-50 hover:bg-[#2B243F]'
                          }`}
                        >
                          <span className="flex items-baseline gap-2.5">
                            <span className="font-display text-xl font-extrabold">{item.label}</span>
                            <span className="text-xs opacity-75">{item.description}</span>
                          </span>
                          <ArrowUpRight className="w-4 h-4 shrink-0" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}

              {currentSnap.heightPercent >= 80 && (
                <footer className="px-4 py-2.5 bg-[#14111D] border-t border-[#2D2640] flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#A3E635] text-zinc-950 font-bold text-xs flex items-center justify-center shrink-0">
                      DK
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">DJ Kora</p>
                      <p className="text-[11px] text-purple-300/75 truncate">Creator Studio</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelect('live', 'Live Sets')}
                    className="min-h-[38px] px-2.5 rounded-xl bg-[#272038] text-xs font-semibold text-[#A3E635] inline-flex items-center gap-1"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Go Live</span>
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
