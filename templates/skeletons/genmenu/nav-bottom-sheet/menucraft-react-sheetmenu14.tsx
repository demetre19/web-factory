'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Search,
  SunMedium,
  Leaf,
  CalendarDays,
  ChevronRight,
  ChevronUp,
  UserCheck,
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
  { id: 'compact', label: 'Toggles', heightPercent: 48 },
  { id: 'expanded', label: 'All Rituals', heightPercent: 88 },
];

const QUICK_TOGGLES = [
  { id: 'quiet', label: 'Quiet Mode', defaultOn: true },
  { id: 'morning', label: '07:30 Chime', defaultOn: true },
  { id: 'offline', label: 'Offline Sync', defaultOn: false },
  { id: 'digest', label: 'Weekly Log', defaultOn: true },
];

const RITUAL_LINKS = [
  { id: 'morning', label: 'Morning Check-In', meta: '5 min', icon: SunMedium },
  { id: 'breath', label: 'Focus Session', meta: '20 min', icon: Leaf },
  { id: 'calendar', label: 'Habit Calendar', meta: '18d streak', icon: CalendarDays },
];

export function SheetMenu14({
  open,
  defaultOpen = false,
  onOpenChange,
  contained = true,
  onSelectDestination,
}: SheetMenuProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [snapId, setSnapId] = useState('compact');
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const [activeId, setActiveId] = useState('morning');
  const [query, setQuery] = useState('');
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    quiet: true,
    morning: true,
    offline: false,
    digest: true,
  });

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
  const filteredRituals = filterMenuItems(RITUAL_LINKS, query);
  const activeLabel = RITUAL_LINKS.find((r) => r.id === activeId)?.label ?? 'Morning Check-In';

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
      } bg-[#F5F1EA] text-[#292524] flex flex-col justify-between`}
    >
      <main className="p-4 space-y-3 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between">
          <span className="font-display text-base font-bold">Komorebi</span>
          <span className="text-xs text-[#0F766E]">{activeLabel}</span>
        </div>
        <div className="rounded-2xl border border-[#E6DFD3] bg-[#FBF9F6] p-4 space-y-1.5">
          <h3 className="font-display text-lg font-semibold">{activeLabel}</h3>
          <p className="text-sm text-[#57534E] leading-relaxed">
            Interactive 2×2 quick-toggle switch matrix combined with a search bar, ritual links, and
            anchored habit profile footer.
          </p>
        </div>
      </main>

      <div className="p-3 bg-[#FBF9F6] border-t border-[#E6DFD3] shrink-0">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={sheetId}
          onClick={() => setOpen(true)}
          className="w-full min-h-[48px] px-4 rounded-2xl bg-[#0D9488] text-white text-sm font-semibold flex items-center justify-between hover:bg-[#0F766E] transition-colors"
        >
          <span>Open Toggles &amp; Rituals</span>
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close Komorebi backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
              onClick={() => setOpen(false)}
              className={`${contained ? 'absolute' : 'fixed'} inset-0 z-20 bg-[#292524]/35`}
            />

            <motion.div
              id={sheetId}
              role="dialog"
              aria-modal="true"
              aria-label="Komorebi switch matrix bottom sheet"
              initial={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
              animate={prefersReducedMotion ? { opacity: 1 } : { y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: `${heightPercent}%` }}
              className={`${
                contained ? 'absolute' : 'fixed'
              } bottom-0 inset-x-0 z-30 bg-[#FBF9F6] rounded-t-3xl border-t border-[#E6DFD3] shadow-2xl flex flex-col overflow-hidden ${
                dragHeight === null ? 'transition-[height] duration-200 ease-out' : ''
              }`}
            >
              <div className="px-4 pt-2 pb-2.5 border-b border-[#EAE3D7] shrink-0 space-y-2.5">
                <button
                  type="button"
                  aria-label="Drag handle to resize toggle sheet"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className="w-full py-2 flex items-center justify-center touch-none cursor-grab active:cursor-grabbing"
                >
                  <span className="w-10 h-1.5 rounded-full bg-[#D6CEC2]" />
                </button>

                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#EFEAE2]">
                    {SNAP_POINTS.map((point) => (
                      <button
                        key={point.id}
                        type="button"
                        onClick={() => setSnapId(point.id)}
                        className={`min-h-[30px] px-2.5 rounded-lg text-xs font-medium ${
                          snapId === point.id ? 'bg-[#FBF9F6] text-[#292524] shadow-xs' : 'text-[#57534E]'
                        }`}
                      >
                        {point.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    aria-label="Close Komorebi sheet"
                    onClick={() => setOpen(false)}
                    className="min-h-[40px] min-w-[40px] rounded-full text-[#57534E] hover:bg-[#EFEAE2] flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    aria-label="Search daily rituals"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search rituals or notes..."
                    className="w-full min-h-[40px] pl-9 pr-3 rounded-xl bg-white border border-[#E6DFD3] text-sm text-[#292524] placeholder:text-[#A8A29E] focus-visible:outline-2 focus-visible:outline-[#0D9488]"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5">
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_TOGGLES.map((item) => {
                    const enabled = Boolean(toggles[item.id]);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="switch"
                        aria-checked={enabled}
                        onClick={() =>
                          setToggles((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                        }
                        className={`min-h-[52px] px-3 py-2 rounded-xl border text-left flex items-center justify-between transition-colors ${
                          enabled
                            ? 'bg-[#0D9488]/10 border-[#0D9488]/40 text-[#0F766E]'
                            : 'bg-white border-[#E6DFD3] text-[#57534E]'
                        }`}
                      >
                        <span className="text-xs font-semibold">{item.label}</span>
                        <span
                          className={`w-7 h-4 rounded-full p-0.5 transition-colors flex items-center ${
                            enabled ? 'bg-[#0D9488] justify-end' : 'bg-[#D6CEC2] justify-start'
                          }`}
                        >
                          <span className="w-3 h-3 rounded-full bg-white" />
                        </span>
                      </button>
                    );
                  })}
                </div>

                <ul className="space-y-1">
                  {filteredRituals.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => handleSelect(item.id, item.label)}
                          className="w-full min-h-[46px] px-3 rounded-xl hover:bg-[#F3EFE8] flex items-center justify-between text-left"
                        >
                          <span className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 text-[#0D9488]" />
                            <span className="text-sm font-medium">{item.label}</span>
                          </span>
                          <span className="text-xs text-[#78716C] flex items-center gap-1">
                            <span>{item.meta}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <footer className="px-4 py-2.5 bg-[#F3EFE8] border-t border-[#E6DFD3] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#0D9488] text-white flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Sora Takahashi</p>
                    <p className="text-[11px] text-[#57534E]">18-day streak</p>
                  </div>
                </div>
              </footer>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
