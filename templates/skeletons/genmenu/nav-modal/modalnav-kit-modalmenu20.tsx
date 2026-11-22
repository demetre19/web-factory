'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import {
  ArrowRight,
  Compass,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';

export interface ModalMenu20Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  triggerClassName?: string;
  onSelectRoute?: (href: string, label: string) => void;
}

type DockScope = 'All' | 'Pages' | 'Actions';

interface DockItem {
  label: string;
  scope: Exclude<DockScope, 'All'>;
  detail: string;
  href: string;
}

const DOCK_ITEMS: DockItem[] = [
  {
    label: 'Editorial Calendar',
    scope: 'Pages',
    detail: 'Scheduled essays and print runs',
    href: '#calendar',
  },
  {
    label: 'Specimen Library',
    scope: 'Pages',
    detail: 'Typefaces, grids, and layout studies',
    href: '#specimens',
  },
  {
    label: 'Studio Directory',
    scope: 'Pages',
    detail: 'Regional offices and workshop hours',
    href: '#studios',
  },
  {
    label: 'New Issue Draft',
    scope: 'Actions',
    detail: 'Create an editorial folio workspace',
    href: '#new-draft',
  },
  {
    label: 'Export Press PDF',
    scope: 'Actions',
    detail: 'Generate CMYK print-ready proof',
    href: '#export-pdf',
  },
  {
    label: 'Invite Reviewer',
    scope: 'Actions',
    detail: 'Share private proofing link',
    href: '#invite-reviewer',
  },
];

const SCOPES: DockScope[] = ['All', 'Pages', 'Actions'];

export function ModalMenu20({
  defaultOpen = false,
  triggerLabel = 'Open Bottom-Dock Menu',
  triggerClassName,
  onSelectRoute,
}: ModalMenu20Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [scope, setScope] = useState<DockScope>('All');
  const [query, setQuery] = useState('');
  const headingId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const q = query.trim().toLowerCase();
  const visibleItems = DOCK_ITEMS.filter((item) => {
    if (scope !== 'All' && item.scope !== scope) return false;
    if (!q) return true;
    return `${item.label} ${item.detail} ${item.scope}`
      .toLowerCase()
      .includes(q);
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
          'inline-flex items-center gap-2 rounded-lg bg-[#F5EFE6] px-4 py-2.5 text-sm font-medium text-[#292524] border border-[#D8CBB8] hover:border-[#9A3412]/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9A3412] whitespace-nowrap shrink-0'
        }
      >
        <SlidersHorizontal
          className="h-4 w-4 text-[#9A3412]"
          aria-hidden="true"
        />
        <span>{triggerLabel}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeMenu();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            className="w-full max-w-[540px] max-h-[85vh] flex flex-col overflow-hidden rounded-2xl bg-[#FAF6EF] text-[#1C1917] border border-[#DDD1BE] shadow-2xl"
          >
            {/* Header + Scope Tabs */}
            <div className="flex items-center justify-between gap-4 border-b border-[#E5DAC8] px-5 py-3.5">
              <div className="flex items-center gap-3">
                <h2
                  id={headingId}
                  className="font-serif text-base font-medium text-[#1C1917]"
                >
                  Thumb-First Command Dock
                </h2>
              </div>
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close bottom-dock menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#DDD1BE] text-[#44403C] hover:bg-[#EFE6D8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9A3412]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Upper Scrollable Destinations List */}
            <nav
              aria-label="Dock destinations and actions"
              className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
                  {scope} Results ({visibleItems.length})
                </h3>
                <div
                  role="group"
                  aria-label="Scope filter"
                  className="flex items-center gap-1 rounded-lg bg-[#EFE6D8] p-0.5"
                >
                  {SCOPES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setScope(s)}
                      aria-pressed={scope === s}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        scope === s
                          ? 'bg-white text-[#9A3412] shadow-xs'
                          : 'text-[#57534E] hover:text-[#1C1917]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {visibleItems.length === 0 ? (
                <div className="py-10 text-center text-sm text-[#57534E]">
                  No items matched &ldquo;{query}&rdquo;
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {visibleItems.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSelect(item.href, item.label);
                        }}
                        className="group flex min-h-[52px] items-center justify-between gap-3 rounded-xl border border-[#E5DAC8] bg-white px-4 py-2.5 hover:border-[#9A3412] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9A3412]"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {item.scope === 'Actions' ? (
                            <Plus
                              className="h-4 w-4 shrink-0 text-[#9A3412]"
                              aria-hidden="true"
                            />
                          ) : (
                            <Compass
                              className="h-4 w-4 shrink-0 text-[#78716C]"
                              aria-hidden="true"
                            />
                          )}
                          <div className="min-w-0">
                            <span className="block text-sm font-semibold text-[#1C1917] group-hover:text-[#9A3412]">
                              {item.label}
                            </span>
                            <span className="block text-xs text-[#57534E] truncate">
                              {item.detail}
                            </span>
                          </div>
                        </div>
                        <ArrowRight
                          className="h-4 w-4 shrink-0 text-[#A8A29E] group-hover:translate-x-0.5 group-hover:text-[#9A3412] transition-all"
                          aria-hidden="true"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </nav>

            {/* Bottom-Anchored Search Bar & Quick Action Dock */}
            <div className="border-t border-[#DDD1BE] bg-[#F2E9DB] p-4 space-y-2.5">
              <div className="flex items-center gap-2.5 rounded-xl border border-[#D4C5AE] bg-white px-3.5 py-2.5 focus-within:border-[#9A3412]">
                <Search
                  className="h-4 w-4 shrink-0 text-[#9A3412]"
                  aria-hidden="true"
                />
                <label htmlFor={`${headingId}-search`} className="sr-only">
                  Search pages and actions
                </label>
                <input
                  ref={inputRef}
                  id={`${headingId}-search`}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type to search pages or actions..."
                  className="w-full bg-transparent text-sm text-[#1C1917] placeholder:text-[#8C8377] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ModalMenu20;
