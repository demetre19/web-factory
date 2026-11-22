'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Search, X } from 'lucide-react';

export interface ModalMenu3Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  triggerClassName?: string;
  onSelectRoute?: (href: string, label: string) => void;
}

interface BroadsheetLead {
  num: string;
  label: string;
  deck: string;
  href: string;
}

interface BroadsheetDept {
  heading: string;
  links: { label: string; href: string }[];
}

const LEAD_STORIES: BroadsheetLead[] = [
  {
    num: '01.',
    label: 'Autumn Monograph',
    deck: 'Essays on regional craft, material permanence, and slow architecture.',
    href: '#monograph',
  },
  {
    num: '02.',
    label: 'Print Editions',
    deck: 'Numbered broadsheets and linen-bound volumes from our studio press.',
    href: '#editions',
  },
  {
    num: '03.',
    label: 'Exhibition Calendar',
    deck: 'Seasonal lectures, gallery viewings, and touring archival shows.',
    href: '#calendar',
  },
];

const DEPARTMENTS: BroadsheetDept[] = [
  {
    heading: 'Archives',
    links: [
      { label: 'Reading Room', href: '#reading-room' },
      { label: 'Subscriber Backlist', href: '#archive' },
      { label: 'Digitized Folio', href: '#folio' },
    ],
  },
  {
    heading: 'Conversations',
    links: [
      { label: 'Studio Interviews', href: '#conversations' },
      { label: 'Typographer Notes', href: '#type-notes' },
      { label: 'Field Recordings', href: '#recordings' },
    ],
  },
  {
    heading: 'Colophon',
    links: [
      { label: 'Editorial Masthead', href: '#masthead' },
      { label: 'Press Inquiries', href: '#press' },
      { label: 'Bookshop Stockists', href: '#stockists' },
    ],
  },
];

export function ModalMenu3({
  defaultOpen = false,
  triggerLabel = 'Open Broadsheet Index',
  triggerClassName,
  onSelectRoute,
}: ModalMenu3Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const headingId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const q = query.trim().toLowerCase();
  const filteredLeads = LEAD_STORIES.filter((item) =>
    !q ? true : `${item.label} ${item.deck}`.toLowerCase().includes(q)
  );
  const filteredDepts = DEPARTMENTS.map((dept) => ({
    ...dept,
    links: dept.links.filter((link) =>
      !q ? true : `${link.label} ${dept.heading}`.toLowerCase().includes(q)
    ),
  })).filter((dept) => dept.links.length > 0);

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
          'inline-flex items-center gap-2 rounded-lg bg-[#FAF7F2] px-4 py-2.5 text-sm font-serif font-medium text-[#1C1917] border border-[#DFD7C8] hover:border-[#9A3412]/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9A3412] whitespace-nowrap shrink-0'
        }
      >
        <BookOpen className="h-4 w-4 text-[#9A3412]" aria-hidden="true" />
        <span>{triggerLabel}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 backdrop-blur-xs p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeMenu();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            className="w-full max-w-[680px] max-h-[85vh] flex flex-col overflow-hidden rounded-xl bg-[#FAF7F2] text-[#1C1917] border border-[#DDD4C4] shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#E5DEC9] px-6 sm:px-8 pt-5 pb-4">
              <div>
                <p className="text-xs font-medium tracking-widest uppercase text-[#78716C]">
                  Volume XIV · Broadsheet Edition
                </p>
                <h2
                  id={headingId}
                  className="mt-1 font-serif text-xl font-medium tracking-tight text-[#1C1917]"
                >
                  Contents &amp; Departments
                </h2>
              </div>
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close broadsheet index"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#DDD4C4] text-[#44403C] hover:bg-[#EFE9DC] hover:text-[#1C1917] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9A3412]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center gap-3 border-b border-[#E5DEC9] bg-[#F4EFE6] px-6 sm:px-8 py-2.5">
              <Search
                className="h-4 w-4 shrink-0 text-[#9A3412]"
                aria-hidden="true"
              />
              <label htmlFor={`${headingId}-search`} className="sr-only">
                Search broadsheet index
              </label>
              <input
                ref={inputRef}
                id={`${headingId}-search`}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search essays, archives, colophon..."
                className="w-full bg-transparent text-sm text-[#1C1917] placeholder:text-[#8C8377] focus:outline-none"
              />
            </div>

            <nav
              aria-label="Broadsheet editorial index"
              className="flex-1 overflow-y-auto px-6 sm:px-8 py-5 space-y-6"
            >
              {filteredLeads.length === 0 && filteredDepts.length === 0 ? (
                <div className="py-10 text-center text-sm text-[#57534E]">
                  No broadsheet entries matched &ldquo;{query}&rdquo;
                </div>
              ) : (
                <>
                  {filteredLeads.length > 0 && (
                    <section aria-label="Lead Features">
                      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#78716C] mb-2">
                        Lead Features
                      </h3>
                      <ul className="divide-y divide-[#EAE2D3]">
                        {filteredLeads.map((item) => (
                          <li key={item.num}>
                            <a
                              href={item.href}
                              onClick={(e) => {
                                e.preventDefault();
                                handleSelect(item.href, item.label);
                              }}
                              className="group flex items-baseline justify-between gap-4 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9A3412] rounded-sm"
                            >
                              <div className="flex items-baseline gap-4 min-w-0">
                                <span className="font-mono text-xs text-[#9A3412] tabular-nums shrink-0">
                                  {item.num}
                                </span>
                                <div className="min-w-0">
                                  <span className="block font-serif text-2xl leading-tight tracking-tight text-[#1C1917] group-hover:text-[#9A3412] transition-colors">
                                    {item.label}
                                  </span>
                                  <span className="mt-0.5 block text-xs sm:text-sm text-[#57534E]">
                                    {item.deck}
                                  </span>
                                </div>
                              </div>
                              <ArrowRight
                                className="h-4 w-4 shrink-0 self-center text-[#A8A29E] group-hover:translate-x-0.5 group-hover:text-[#9A3412] transition-all"
                                aria-hidden="true"
                              />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {filteredDepts.length > 0 && (
                    <div className="border-t border-[#DDD4C4] pt-5 grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {filteredDepts.map((dept) => (
                        <section key={dept.heading} aria-label={dept.heading}>
                          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#78716C] mb-2.5">
                            {dept.heading}
                          </h3>
                          <ul className="space-y-1.5">
                            {dept.links.map((link) => (
                              <li key={link.label}>
                                <a
                                  href={link.href}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleSelect(link.href, link.label);
                                  }}
                                  className="inline-flex min-h-[34px] items-center text-sm font-medium text-[#292524] hover:text-[#9A3412] underline decoration-[#D6CEBE] underline-offset-4 hover:decoration-[#9A3412] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9A3412] rounded-sm"
                                >
                                  {link.label}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </section>
                      ))}
                    </div>
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

export default ModalMenu3;
