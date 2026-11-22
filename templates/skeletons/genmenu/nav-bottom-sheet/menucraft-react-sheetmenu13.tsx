'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeftRight,
  Landmark,
  Lock,
  KeyRound,
  Search,
  ChevronRight,
  ChevronUp,
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
  { id: 'cards', label: 'Cards', heightPercent: 42 },
  { id: 'menu', label: 'Menu', heightPercent: 70 },
  { id: 'full', label: 'Full', heightPercent: 92 },
];

const CAROUSEL_ACCOUNTS = [
  { id: 'checking', label: 'Checking', balance: '$48,210', accent: 'bg-sky-500/20 border-sky-400/50 text-sky-200' },
  { id: 'vault', label: 'Index Vault', balance: '$129,400', accent: 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200' },
  { id: 'credit', label: 'Corp Card', balance: '$4,190', accent: 'bg-amber-500/20 border-amber-400/50 text-amber-200' },
];

const ACTIONS_LIST = [
  { id: 'wire', label: 'Domestic Wire', category: 'Transfers', meta: 'Same-day', icon: ArrowLeftRight },
  { id: 'ach', label: 'Scheduled Payouts', category: 'Transfers', meta: '3 queued', icon: Landmark },
  { id: 'keys', label: 'Passkeys & 2FA', category: 'Security', meta: 'Hardware', icon: KeyRound },
  { id: 'limits', label: 'Card Controls', category: 'Security', meta: 'Active', icon: Lock },
];

export function SheetMenu13({
  open,
  defaultOpen = false,
  onOpenChange,
  contained = true,
  onSelectDestination,
}: SheetMenuProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [snapId, setSnapId] = useState('menu');
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const [activeId, setActiveId] = useState('checking');
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
  const filteredActions = filterMenuItems(ACTIONS_LIST, query);
  const activeLabel =
    [...CAROUSEL_ACCOUNTS, ...ACTIONS_LIST].find((i) => i.id === activeId)?.label ?? 'Checking';

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
      } bg-[#0F172A] text-slate-100 flex flex-col justify-between`}
    >
      <main className="p-4 space-y-3 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between">
          <span className="font-display text-base font-bold text-white">Ledger Pro</span>
          <span className="text-xs text-sky-300">{activeLabel}</span>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-1.5">
          <h3 className="font-display text-lg font-semibold text-white">{activeLabel}</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Horizontal account card carousel inside a dark bottom sheet, paired with search and
            progressive vertical transfer rows.
          </p>
        </div>
      </main>

      <div className="p-3 bg-slate-900 border-t border-slate-800 shrink-0">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={sheetId}
          onClick={() => setOpen(true)}
          className="w-full min-h-[48px] px-4 rounded-2xl bg-sky-500 text-slate-950 text-sm font-bold flex items-center justify-between hover:bg-sky-400 transition-colors"
        >
          <span>Open Ledger Carousel</span>
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close Ledger backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
              onClick={() => setOpen(false)}
              className={`${contained ? 'absolute' : 'fixed'} inset-0 z-20 bg-black/65`}
            />

            <motion.div
              id={sheetId}
              role="dialog"
              aria-modal="true"
              aria-label="Ledger Pro horizontal carousel sheet"
              initial={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
              animate={prefersReducedMotion ? { opacity: 1 } : { y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: `${heightPercent}%` }}
              className={`${
                contained ? 'absolute' : 'fixed'
              } bottom-0 inset-x-0 z-30 bg-[#0F172A] rounded-t-3xl border-t border-slate-700 shadow-2xl flex flex-col overflow-hidden ${
                dragHeight === null ? 'transition-[height] duration-200 ease-out' : ''
              }`}
            >
              <div className="px-4 pt-2 pb-3 border-b border-slate-800 shrink-0 space-y-2.5">
                <button
                  type="button"
                  aria-label="Drag handle to resize carousel sheet"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className="w-full py-2 flex items-center justify-center touch-none cursor-grab active:cursor-grabbing"
                >
                  <span className="w-10 h-1.5 rounded-full bg-slate-600" />
                </button>

                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-800">
                    {SNAP_POINTS.map((point) => (
                      <button
                        key={point.id}
                        type="button"
                        onClick={() => setSnapId(point.id)}
                        className={`min-h-[30px] px-2.5 rounded-lg text-xs font-medium ${
                          snapId === point.id ? 'bg-sky-500 text-slate-950 font-semibold' : 'text-slate-300'
                        }`}
                      >
                        {point.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    aria-label="Close Ledger sheet"
                    onClick={() => setOpen(false)}
                    className="min-h-[40px] min-w-[40px] rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    aria-label="Search accounts and transfers"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search wires, vaults, passkeys..."
                    className="w-full min-h-[40px] pl-9 pr-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-sky-400"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                <div className="flex items-stretch gap-2.5 overflow-x-auto pb-1">
                  {CAROUSEL_ACCOUNTS.map((acct) => (
                    <button
                      key={acct.id}
                      type="button"
                      onClick={() => handleSelect(acct.id, acct.label)}
                      className={`min-w-[132px] p-3 rounded-2xl border text-left shrink-0 space-y-1.5 ${acct.accent}`}
                    >
                      <span className="block text-xs font-medium opacity-85">{acct.label}</span>
                      <span className="block font-mono text-base font-bold tabular-nums">
                        {acct.balance}
                      </span>
                    </button>
                  ))}
                </div>

                {(currentSnap.heightPercent >= 60 || query.trim()) && (
                  <ul className="space-y-1.5">
                    {filteredActions.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => handleSelect(item.id, item.label)}
                            className="w-full min-h-[46px] px-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 flex items-center justify-between text-left"
                          >
                            <span className="flex items-center gap-2.5">
                              <Icon className="w-4 h-4 text-sky-400 shrink-0" />
                              <span className="text-sm font-medium">{item.label}</span>
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <span>{item.meta}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </button>
                        </li>
                      );
                    })}
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
