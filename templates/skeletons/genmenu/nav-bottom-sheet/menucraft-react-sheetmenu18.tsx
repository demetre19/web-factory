'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Search, Activity, Cpu, Shield, HardDrive, ChevronUp, X } from 'lucide-react';
import {
  computeLiveDragHeightPercent,
  filterMenuItems,
  getNextSnapPoint,
  resolveSnapAfterDrag,
  type SnapPoint,
} from '@/lib/sheet-logic';
import type { SheetMenuProps } from './types';

const SNAP_POINTS: SnapPoint[] = [
  { id: 'compact', label: 'Tiles', heightPercent: 46 },
  { id: 'expanded', label: 'Full', heightPercent: 80 },
];

const KPI_TILES = [
  { id: 'cpu', label: 'Compute Load', metric: '34%', icon: Cpu },
  { id: 'net', label: 'Edge Latency', metric: '18 ms', icon: Activity },
  { id: 'disk', label: 'Block Volumes', metric: '1.8 TB', icon: HardDrive },
  { id: 'sec', label: 'Firewall Rules', metric: '99 active', icon: Shield },
];

export function SheetMenu18({
  open,
  defaultOpen = false,
  onOpenChange,
  contained = true,
  onSelectDestination,
}: SheetMenuProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [snapId, setSnapId] = useState('compact');
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const [activeId, setActiveId] = useState('cpu');
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
  const filtered = filterMenuItems(KPI_TILES, query);
  const activeLabel = KPI_TILES.find((k) => k.id === activeId)?.label ?? 'Compute Load';

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
      } bg-[#141414] text-stone-100 flex flex-col justify-between`}
    >
      <main className="p-4 space-y-3 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between">
          <span className="font-display text-base font-bold text-white">Foundry Telemetry</span>
          <span className="text-xs text-orange-300">{activeLabel}</span>
        </div>
        <div className="rounded-2xl border border-stone-800 bg-[#1D1C1B] p-4 space-y-1.5">
          <h3 className="font-display text-lg font-semibold text-white">{activeLabel}</h3>
          <p className="text-sm text-stone-400 leading-relaxed">
            Detached floating bottom card inset from viewport margins with rounded corners, KPI nav
            grid, and search bar.
          </p>
        </div>
      </main>

      <div className="p-3 bg-[#1D1C1B] border-t border-stone-800 shrink-0">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={sheetId}
          onClick={() => setOpen(true)}
          className="w-full min-h-[48px] px-4 rounded-2xl bg-orange-500 text-stone-950 text-sm font-bold flex items-center justify-between hover:bg-orange-400 transition-colors"
        >
          <span>Open Floating Card Sheet</span>
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close Foundry backdrop"
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
              aria-label="Foundry detached floating bottom sheet"
              initial={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
              animate={prefersReducedMotion ? { opacity: 1 } : { y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: `${heightPercent}%` }}
              className={`${
                contained ? 'absolute' : 'fixed'
              } bottom-3 inset-x-3 z-30 bg-[#201E1D] rounded-3xl border border-stone-700 shadow-2xl flex flex-col overflow-hidden ${
                dragHeight === null ? 'transition-[height] duration-200 ease-out' : ''
              }`}
            >
              <div className="px-4 pt-2 pb-3 border-b border-stone-800 shrink-0 space-y-2.5">
                <button
                  type="button"
                  aria-label="Drag handle for floating card sheet"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className="w-full py-2 flex items-center justify-center touch-none cursor-grab active:cursor-grabbing"
                >
                  <span className="w-10 h-1.5 rounded-full bg-orange-400/60" />
                </button>

                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-stone-800">
                    {SNAP_POINTS.map((point) => (
                      <button
                        key={point.id}
                        type="button"
                        onClick={() => setSnapId(point.id)}
                        className={`min-h-[30px] px-2.5 rounded-lg text-xs font-semibold ${
                          snapId === point.id ? 'bg-orange-500 text-stone-950' : 'text-stone-300'
                        }`}
                      >
                        {point.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    aria-label="Close floating sheet"
                    onClick={() => setOpen(false)}
                    className="min-h-[40px] min-w-[40px] rounded-xl bg-stone-800 text-stone-200 flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    aria-label="Search telemetry modules"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Filter telemetry nodes..."
                    className="w-full min-h-[40px] pl-9 pr-3 rounded-xl bg-stone-900 border border-stone-700 text-sm text-white placeholder:text-stone-400 focus-visible:outline-2 focus-visible:outline-orange-400"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2 content-start">
                {filtered.map((tile) => {
                  const Icon = tile.icon;
                  const active = tile.id === activeId;
                  return (
                    <button
                      key={tile.id}
                      type="button"
                      onClick={() => handleSelect(tile.id, tile.label)}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between min-h-[84px] ${
                        active
                          ? 'bg-orange-500/20 border-orange-400 text-orange-100'
                          : 'bg-stone-900 border-stone-800 text-stone-200 hover:bg-stone-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-orange-400" />
                      <div>
                        <span className="block font-mono text-sm font-bold tabular-nums">
                          {tile.metric}
                        </span>
                        <span className="block text-xs opacity-80">{tile.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
