'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { ArrowUpRight, Search, Sparkles, X } from 'lucide-react';

export interface ModalMenu8Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  triggerClassName?: string;
  onSelectRoute?: (href: string, label: string) => void;
}

type PosterCategory = 'All' | 'Work' | 'Studio' | 'Notes';

interface PosterRoute {
  index: string;
  label: string;
  category: Exclude<PosterCategory, 'All'>;
  href: string;
  accentBg: string;
}

const POSTER_ROUTES: PosterRoute[] = [
  {
    index: '01',
    label: 'Selected Case Studies',
    category: 'Work',
    href: '#case-studies',
    accentBg: 'hover:bg-[#DC2626] hover:text-white',
  },
  {
    index: '02',
    label: 'Brand Identity Systems',
    category: 'Work',
    href: '#identities',
    accentBg: 'hover:bg-[#1D4ED8] hover:text-white',
  },
  {
    index: '03',
    label: 'Interactive Installations',
    category: 'Work',
    href: '#installations',
    accentBg: 'hover:bg-[#D97706] hover:text-white',
  },
  {
    index: '04',
    label: 'Design Practice & Ethos',
    category: 'Studio',
    href: '#practice',
    accentBg: 'hover:bg-[#059669] hover:text-white',
  },
  {
    index: '05',
    label: 'Disciplines & Capabilities',
    category: 'Studio',
    href: '#disciplines',
    accentBg: 'hover:bg-[#18181B] hover:text-[#FACC15]',
  },
  {
    index: '06',
    label: 'Open Roles in Berlin',
    category: 'Studio',
    href: '#careers',
    accentBg: 'hover:bg-[#7C3AED] hover:text-white',
  },
  {
    index: '07',
    label: 'Type Foundry Releases',
    category: 'Notes',
    href: '#foundry',
    accentBg: 'hover:bg-[#DC2626] hover:text-white',
  },
  {
    index: '08',
    label: 'Lectures & Workshops',
    category: 'Notes',
    href: '#lectures',
    accentBg: 'hover:bg-[#1D4ED8] hover:text-white',
  },
];

const CATEGORIES: PosterCategory[] = ['All', 'Work', 'Studio', 'Notes'];

export function ModalMenu8({
  defaultOpen = false,
  triggerLabel = 'Open Poster Index',
  triggerClassName,
  onSelectRoute,
}: ModalMenu8Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [filter, setFilter] = useState<PosterCategory>('All');
  const [query, setQuery] = useState('');
  const headingId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const q = query.trim().toLowerCase();
  const visibleRoutes = POSTER_ROUTES.filter((r) => {
    if (filter !== 'All' && r.category !== filter) return false;
    if (!q) return true;
    return `${r.label} ${r.category} ${r.index}`.toLowerCase().includes(q);
  });

  const closeMenu = () => {
    setIsOpen(false);
    setQuery('');
    setTimeout(() => triggerRef.current?.focus(), 0);
  };

  const handleSelect = (href: string, label: string) => {
    onSelectRoute?.(href, label);
    closeMenu();
  };

  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add('overflow-hidden');
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 10);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.classList.remove('overflow-hidden');
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          triggerClassName ??
          'inline-flex items-center gap-2 rounded-none bg-[#FACC15] px-4 py-2.5 text-sm font-bold text-[#18181B] border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] whitespace-nowrap shrink-0'
        }
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        <span>{triggerLabel}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/65 backdrop-blur-xs p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeMenu();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            className="w-full max-w-[600px] max-h-[85vh] flex flex-col overflow-hidden bg-[#FAFAF9] text-[#18181B] border-2 border-[#18181B] shadow-[8px_8px_0px_#18181B]"
          >
            <div className="flex items-center justify-between gap-4 bg-[#FACC15] border-b-2 border-[#18181B] px-5 sm:px-6 py-4">
              <h2
                id={headingId}
                className="text-lg font-extrabold tracking-tight uppercase text-[#18181B]"
              >
                Klang Studio Index
              </h2>
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close studio index"
                className="inline-flex h-10 w-10 items-center justify-center bg-white border-2 border-[#18181B] text-[#18181B] hover:bg-[#18181B] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center gap-3 border-b-2 border-[#18181B] bg-white px-5 sm:px-6 py-2.5">
              <Search
                className="h-4 w-4 shrink-0 text-[#18181B]"
                aria-hidden="true"
              />
              <label htmlFor={`${headingId}-search`} className="sr-only">
                Search studio index
              </label>
              <input
                ref={inputRef}
                id={`${headingId}-search`}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SEARCH INDEX..."
                className="w-full bg-transparent text-sm font-bold uppercase tracking-wide text-[#18181B] placeholder:text-zinc-400 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#18181B] bg-white px-5 sm:px-6 py-3">
              <div
                role="group"
                aria-label="Filter index by section"
                className="flex flex-wrap items-center gap-1.5"
              >
                {CATEGORIES.map((category) => {
                  const active = filter === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setFilter(category)}
                      aria-pressed={active}
                      className={`min-h-[36px] px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] ${
                        active
                          ? 'bg-[#18181B] text-white border-[#18181B]'
                          : 'bg-white text-[#18181B] border-[#18181B] hover:bg-zinc-100'
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
              <span className="font-mono text-xs font-semibold text-zinc-600 tabular-nums">
                {visibleRoutes.length} entries
              </span>
            </div>

            <nav
              aria-label="Studio poster navigation"
              className="flex-1 overflow-y-auto"
            >
              <h3 className="sr-only">{filter} Destinations</h3>
              {visibleRoutes.length === 0 ? (
                <div className="p-10 text-center text-sm font-bold uppercase text-zinc-600">
                  No index entries matched &ldquo;{query}&rdquo;
                </div>
              ) : (
                <ul className="divide-y-2 divide-[#18181B]">
                  {visibleRoutes.map((route) => (
                    <li key={route.index}>
                      <a
                        href={route.href}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSelect(route.href, route.label);
                        }}
                        className={`group flex min-h-[60px] items-center justify-between gap-4 px-5 sm:px-6 py-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1D4ED8] ${route.accentBg}`}
                      >
                        <span className="flex items-baseline gap-4 min-w-0">
                          <span className="font-mono text-xs font-bold tabular-nums opacity-70 shrink-0">
                            {route.index}
                          </span>
                          <span className="text-xl sm:text-2xl font-extrabold tracking-tight truncate">
                            {route.label}
                          </span>
                        </span>
                        <span className="flex items-center gap-3 shrink-0">
                          <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider opacity-75">
                            {route.category}
                          </span>
                          <ArrowUpRight
                            className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            aria-hidden="true"
                          />
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

export default ModalMenu8;
