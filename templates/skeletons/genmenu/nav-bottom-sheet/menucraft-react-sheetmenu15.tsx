'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  ChevronRight,
  ChevronUp,
  Search,
  Hash,
  Users,
  Sliders,
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
  { id: 'compact', label: 'Compact', heightPercent: 46 },
  { id: 'expanded', label: 'Full', heightPercent: 88 },
];

interface SheetNode {
  id: string;
  label: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: SheetNode[];
}

const SHEET_TREE: SheetNode[] = [
  {
    id: 'channels',
    label: 'Audio Channels',
    description: '4 active rooms',
    icon: Hash,
    children: [
      { id: 'design-crit', label: '#design-critique', description: '12 listeners' },
      { id: 'ship-room', label: '#ship-room', description: '6 listeners' },
      { id: 'lofi', label: '#focus-stream', description: '28 listeners' },
    ],
  },
  {
    id: 'members',
    label: 'Workspace Members',
    description: 'Directory & roles',
    icon: Users,
    children: [
      { id: 'admins', label: 'Moderators', description: '3 active' },
      { id: 'guests', label: 'Guest Speakers', description: '5 invited' },
    ],
  },
  {
    id: 'prefs',
    label: 'Audio Preferences',
    description: 'Mic & spatial output',
    icon: Sliders,
  },
];

export function SheetMenu15({
  open,
  defaultOpen = false,
  onOpenChange,
  contained = true,
  onSelectDestination,
}: SheetMenuProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [snapId, setSnapId] = useState('compact');
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState('design-crit');
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
  const allNodes = SHEET_TREE.flatMap((n) => (n.children ? [n, ...n.children] : [n]));
  const activeParent = SHEET_TREE.find((n) => n.id === parentId) ?? null;
  const visibleNodes = query.trim()
    ? filterMenuItems(allNodes, query)
    : activeParent?.children ?? SHEET_TREE;
  const activeLabel = allNodes.find((n) => n.id === activeId)?.label ?? '#design-critique';

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

  const handleSelect = (node: SheetNode) => {
    if (!query.trim() && node.children && node.children.length > 0) {
      setParentId(node.id);
      return;
    }
    setActiveId(node.id);
    onSelectDestination?.(node.label);
    setOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`${
        contained ? 'relative h-full w-full overflow-hidden' : 'min-h-screen w-full'
      } bg-[#131126] text-indigo-50 flex flex-col justify-between`}
    >
      <main className="p-4 space-y-3 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between">
          <span className="font-display text-base font-bold text-white">Nexus Room</span>
          <span className="text-xs font-mono text-indigo-300">{activeLabel}</span>
        </div>
        <div className="rounded-2xl border border-indigo-900 bg-[#1B1836] p-4 space-y-1.5">
          <h3 className="font-display text-lg font-semibold text-white">{activeLabel}</h3>
          <p className="text-sm text-indigo-200/80 leading-relaxed">
            Nested drill-down bottom sheet with stack breadcrumbs, search bypass, and Compact/Full
            snap heights.
          </p>
        </div>
      </main>

      <div className="p-3 bg-[#1B1836] border-t border-indigo-900 shrink-0">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={sheetId}
          onClick={() => setOpen(true)}
          className="w-full min-h-[48px] px-4 rounded-2xl bg-indigo-500 text-white text-sm font-bold flex items-center justify-between hover:bg-indigo-400 transition-colors"
        >
          <span>Open Drill-Down Sheet</span>
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close Nexus backdrop"
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
              aria-label="Nexus nested drill-down bottom sheet"
              initial={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
              animate={prefersReducedMotion ? { opacity: 1 } : { y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: `${heightPercent}%` }}
              className={`${
                contained ? 'absolute' : 'fixed'
              } bottom-0 inset-x-0 z-30 bg-[#1B1836] rounded-t-3xl border-t border-indigo-800 shadow-2xl flex flex-col overflow-hidden ${
                dragHeight === null ? 'transition-[height] duration-200 ease-out' : ''
              }`}
            >
              <div className="px-4 pt-2 pb-3 border-b border-indigo-900 shrink-0 space-y-2.5">
                <button
                  type="button"
                  aria-label="Drag handle to resize nested sheet"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className="w-full py-2 flex items-center justify-center touch-none cursor-grab active:cursor-grabbing"
                >
                  <span className="w-10 h-1.5 rounded-full bg-indigo-500/50" />
                </button>

                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#27224C]">
                    {SNAP_POINTS.map((point) => (
                      <button
                        key={point.id}
                        type="button"
                        onClick={() => setSnapId(point.id)}
                        className={`min-h-[30px] px-2.5 rounded-lg text-xs font-medium ${
                          snapId === point.id ? 'bg-indigo-500 text-white' : 'text-indigo-200'
                        }`}
                      >
                        {point.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    aria-label="Close Nexus sheet"
                    onClick={() => setOpen(false)}
                    className="min-h-[40px] min-w-[40px] rounded-xl bg-[#27224C] text-indigo-100 flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-indigo-300 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    aria-label="Search nested rooms"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Jump to any room or role..."
                    className="w-full min-h-[40px] pl-9 pr-3 rounded-xl bg-[#131126] border border-indigo-800 text-sm text-white placeholder:text-indigo-400 focus-visible:outline-2 focus-visible:outline-indigo-400"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {!query.trim() && activeParent && (
                  <button
                    type="button"
                    onClick={() => setParentId(null)}
                    className="w-full min-h-[40px] px-3 rounded-xl bg-[#27224C] text-xs font-semibold text-indigo-200 flex items-center gap-2"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back / {activeParent.label}</span>
                  </button>
                )}

                <ul className="space-y-1.5">
                  {visibleNodes.map((node) => {
                    const Icon = node.icon;
                    const hasKids = !query.trim() && Boolean(node.children?.length);
                    return (
                      <li key={node.id}>
                        <button
                          type="button"
                          onClick={() => handleSelect(node)}
                          className="w-full min-h-[50px] px-3 py-2 rounded-xl bg-[#231F44] hover:bg-[#2E2958] flex items-center justify-between text-left"
                        >
                          <span className="flex items-center gap-2.5">
                            {Icon && <Icon className="w-4 h-4 text-indigo-300 shrink-0" />}
                            <span>
                              <span className="block text-sm font-medium text-white">
                                {node.label}
                              </span>
                              <span className="block text-xs text-indigo-300/80">
                                {node.description}
                              </span>
                            </span>
                          </span>
                          {hasKids && <ChevronRight className="w-4 h-4 text-indigo-300 shrink-0" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
