'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import {
  ArrowUpRight,
  LayoutTemplate,
  Search,
  X,
} from 'lucide-react';

export interface ModalMenu19Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  triggerClassName?: string;
  onSelectRoute?: (href: string, label: string) => void;
}

interface MagazineCard {
  id: string;
  kicker: string;
  title: string;
  deck: string;
  href: string;
  slotClass: string;
  surfaceClass: string;
}

const FEATURE_BLOCKS: MagazineCard[] = [
  {
    id: 'lead',
    kicker: 'Issue 09 · Lead Dossier',
    title: 'Designing Civic Wayfinding Systems',
    deck: 'How municipal transit maps, typographic signage, and accessible contrasts guide millions of daily trips.',
    href: '#wayfinding',
    slotClass: 'md:col-span-5 md:row-span-2',
    surfaceClass: 'bg-[#064E3B] text-emerald-50 border-[#064E3B]',
  },
  {
    id: 'stack-1',
    kicker: 'Practice Notes',
    title: 'Modular Grid Proportions',
    deck: 'Ratio-driven layouts that adapt smoothly from widescreen monitors to pocket viewports.',
    href: '#proportions',
    slotClass: 'md:col-span-7',
    surfaceClass: 'bg-[#FFEDD5] text-[#431407] border-[#FDBA74]',
  },
  {
    id: 'stack-2',
    kicker: 'Field Report',
    title: 'Tactile Ink & Paper Stock',
    deck: 'Evaluating recycled cotton fibers and soy-based pigments for annual monographs.',
    href: '#paper-stock',
    slotClass: 'md:col-span-7',
    surfaceClass: 'bg-[#E0F2FE] text-[#0C4A6E] border-[#7DD3FC]',
  },
];

const FOOTER_DEPARTMENTS = [
  { label: 'Contributors', href: '#contributors' },
  { label: 'Print Archive', href: '#print-archive' },
  { label: 'Symposium 2027', href: '#symposium' },
];

export function ModalMenu19({
  defaultOpen = false,
  triggerLabel = 'Open Magazine Grid',
  triggerClassName,
  onSelectRoute,
}: ModalMenu19Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const headingId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const q = query.trim().toLowerCase();
  const filteredBlocks = FEATURE_BLOCKS.filter((b) =>
    !q
      ? true
      : `${b.title} ${b.kicker} ${b.deck}`.toLowerCase().includes(q)
  );
  const filteredFooter = FOOTER_DEPARTMENTS.filter((d) =>
    !q ? true : d.label.toLowerCase().includes(q)
  );

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
          'inline-flex items-center gap-2 rounded-lg bg-[#064E3B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#065F46] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#064E3B] whitespace-nowrap shrink-0'
        }
      >
        <LayoutTemplate className="h-4 w-4 text-emerald-300" aria-hidden="true" />
        <span>{triggerLabel}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeMenu();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            className="w-full max-w-[700px] max-h-[85vh] flex flex-col overflow-hidden rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
              <h2
                id={headingId}
                className="font-serif text-lg font-semibold text-slate-900"
              >
                Editorial Magazine Grid
              </h2>
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close magazine grid"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#064E3B]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center gap-2.5 border-b border-slate-200 bg-slate-50 px-6 py-2.5">
              <Search
                className="h-4 w-4 shrink-0 text-slate-500"
                aria-hidden="true"
              />
              <label htmlFor={`${headingId}-search`} className="sr-only">
                Search magazine features and departments
              </label>
              <input
                ref={inputRef}
                id={`${headingId}-search`}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dossiers, reports, departments..."
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            <nav
              aria-label="Magazine feature navigation"
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              {filteredBlocks.length === 0 && filteredFooter.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  No magazine features matched &ldquo;{query}&rdquo;
                </div>
              ) : (
                <>
                  {filteredBlocks.length > 0 && (
                    <section aria-label="Featured Dossiers">
                      <h3 className="sr-only">Featured Dossiers</h3>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                        {filteredBlocks.map((block) => (
                          <a
                            key={block.id}
                            href={block.href}
                            onClick={(e) => {
                              e.preventDefault();
                              handleSelect(block.href, block.title);
                            }}
                            className={`group flex flex-col justify-between rounded-xl border p-5 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${block.slotClass} ${block.surfaceClass}`}
                          >
                            <div>
                              <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                                {block.kicker}
                              </span>
                              <h4 className="mt-1.5 font-serif text-xl font-medium leading-snug">
                                {block.title}
                              </h4>
                              <p className="mt-2 text-xs leading-relaxed opacity-85">
                                {block.deck}
                              </p>
                            </div>
                            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold">
                              <span>Read Section</span>
                              <ArrowUpRight
                                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                aria-hidden="true"
                              />
                            </span>
                          </a>
                        ))}
                      </div>
                    </section>
                  )}

                  {filteredFooter.length > 0 && (
                    <section
                      aria-label="Magazine Departments"
                      className="border-t border-slate-200 pt-4"
                    >
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                        Departments
                      </h3>
                      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {filteredFooter.map((dept) => (
                          <li key={dept.label}>
                            <a
                              href={dept.href}
                              onClick={(e) => {
                                e.preventDefault();
                                handleSelect(dept.href, dept.label);
                              }}
                              className="flex min-h-[42px] items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-semibold text-slate-800 hover:border-slate-900 hover:bg-white transition-colors"
                            >
                              <span>{dept.label}</span>
                              <ArrowUpRight
                                className="h-3.5 w-3.5 text-slate-400"
                                aria-hidden="true"
                              />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

export default ModalMenu19;
