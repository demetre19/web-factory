'use client';

import React, { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Menu,
  X,
  Search,
  Compass,
  Layers,
  ShieldCheck,
  Radio,
  Map,
  HelpCircle,
  ArrowUpRight,
} from 'lucide-react';
import { filterMenuItems } from '@/lib/sheet-logic';
import type { SheetMenuProps } from './types';

const BENTO_TILES = [
  { id: 'feed', label: 'Dispatch Feed', description: 'Live trail alerts & weather', span: 'col-span-2', tone: 'bg-amber-500 text-zinc-950', icon: Radio },
  { id: 'routes', label: 'Saved Routes', description: '14 GPX', span: 'col-span-1', tone: 'bg-zinc-800 text-white', icon: Compass },
  { id: 'packs', label: 'Offline Maps', description: '3.2 GB', span: 'col-span-1', tone: 'bg-zinc-800 text-white', icon: Layers },
  { id: 'topo', label: 'Elevation Topo', description: 'Contour view', span: 'col-span-1', tone: 'bg-zinc-800 text-white', icon: Map },
  { id: 'beacon', label: 'SOS Beacon', description: 'Armed', span: 'col-span-1', tone: 'bg-zinc-800 text-amber-300', icon: ShieldCheck },
];

export function SheetMenu5({
  open,
  defaultOpen = false,
  onOpenChange,
  contained = true,
  onSelectDestination,
}: SheetMenuProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [activeId, setActiveId] = useState('feed');
  const [query, setQuery] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);
  const panelId = useId();
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

  const filtered = filterMenuItems(BENTO_TILES, query);
  const activeLabel = BENTO_TILES.find((t) => t.id === activeId)?.label ?? 'Dispatch Feed';

  const handleSelect = (id: string, label: string) => {
    setActiveId(id);
    onSelectDestination?.(label);
    setOpen(false);
  };

  return (
    <div
      className={`${
        contained ? 'relative h-full w-full overflow-hidden' : 'min-h-screen w-full'
      } bg-[#111111] text-zinc-100 flex flex-col`}
    >
      <header className="relative z-30 flex items-center justify-between h-14 px-4 bg-[#111111] border-b border-zinc-800 shrink-0">
        <span className="font-display text-base font-bold tracking-tight text-white whitespace-nowrap">
          Summit GPS
        </span>

        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          aria-label={isOpen ? 'Close Summit bento menu' : 'Open Summit bento menu'}
          onClick={() => setOpen(!isOpen)}
          className="min-h-[44px] min-w-[44px] -mr-2 px-3 inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium text-amber-400 hover:bg-zinc-800 transition-colors"
        >
          <span>{isOpen ? 'Close' : 'Mosaic'}</span>
          {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </header>

      <div className="relative flex-1 overflow-y-auto">
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.button
                type="button"
                aria-label="Close Summit GPS backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
                onClick={() => setOpen(false)}
                className={`${contained ? 'absolute' : 'fixed top-14'} inset-0 z-10 bg-black/65`}
              />

              <motion.nav
                id={panelId}
                aria-label="Asymmetric bento mosaic navigation"
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -14 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
                className={`${
                  contained ? 'absolute top-0 inset-x-0' : 'fixed top-14 inset-x-0'
                } z-20 bg-[#171717] border-b border-zinc-800 shadow-2xl max-h-[calc(100%-0.5rem)] overflow-y-auto`}
              >
                <div className="p-3.5 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="search"
                        aria-label="Filter bento tiles"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search map modules..."
                        className="w-full min-h-[40px] pl-9 pr-3 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-white placeholder:text-zinc-400 focus-visible:outline-2 focus-visible:outline-amber-400"
                      />
                    </div>
                    <button
                      type="button"
                      aria-label="Toggle field help"
                      onClick={() => setHelpOpen((p) => !p)}
                      className="min-h-[40px] min-w-[40px] rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 flex items-center justify-center hover:bg-zinc-800"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </div>

                  {helpOpen && (
                    <p className="rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-zinc-300">
                      Bento layout surfaces live dispatch first alongside 1×1 offline map tools.
                    </p>
                  )}

                  {filtered.length === 0 ? (
                    <p className="py-6 text-center text-xs text-zinc-400">
                      No tiles match &ldquo;{query}&rdquo;
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5">
                      {filtered.map((tile) => {
                        const Icon = tile.icon;
                        const active = tile.id === activeId;
                        return (
                          <button
                            key={tile.id}
                            type="button"
                            onClick={() => handleSelect(tile.id, tile.label)}
                            className={`${tile.span} ${tile.tone} p-3.5 rounded-2xl text-left flex flex-col justify-between min-h-[82px] transition-transform active:scale-[0.98] ${
                              active ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[#171717]' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <Icon className="w-4 h-4" />
                              <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
                            </div>
                            <div className="mt-2">
                              <span className="block text-sm font-bold leading-tight">
                                {tile.label}
                              </span>
                              <span className="block text-[11px] opacity-80 mt-0.5">
                                {tile.description}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.nav>
            </>
          )}
        </AnimatePresence>

        <main className="p-4 space-y-3">
          <div className="text-xs font-medium text-amber-400">Module · {activeLabel}</div>
          <div className="rounded-xl border border-zinc-800 bg-[#181818] p-4 space-y-1.5">
            <h3 className="font-display text-lg font-semibold text-white">{activeLabel}</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Asymmetric CSS Bento Mosaic drop-down with a full-span hero tile, square utility
              tiles, and inline search bar.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
