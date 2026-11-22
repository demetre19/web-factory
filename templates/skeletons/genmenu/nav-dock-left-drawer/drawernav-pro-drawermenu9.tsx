'use client';

import React, { useEffect, useState } from 'react';

export interface DrawerMenu9Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  onNavigate?: (label: string) => void;
  onCtaClick?: (label: string) => void;
}

const PORTAL_TILES = [
  { label: 'Visits', sub: '2 upcoming', href: '#visits' },
  { label: 'Rx Refills', sub: '1 ready', href: '#rx' },
  { label: 'Messages', sub: 'Dr. Vance', href: '#messages' },
  { label: 'Lab Results', sub: 'Updated', href: '#labs' },
];

const RECORD_LINKS = [
  { label: 'Immunization History', href: '#immunizations' },
  { label: 'Allergies & Conditions', href: '#allergies' },
  { label: 'Insurance & Billing', href: '#insurance' },
];

export function DrawerMenu9({
  defaultOpen = false,
  triggerLabel = 'Open DrawerMenu9',
  onNavigate,
  onCtaClick,
}: DrawerMenu9Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const [activeItem, setActiveItem] = useState('Visits');
  const [ctaConfirmed, setCtaConfirmed] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const normalized = query.trim().toLowerCase();
  const visibleTiles = normalized
    ? PORTAL_TILES.filter((t) => t.label.toLowerCase().includes(normalized))
    : PORTAL_TILES;
  const visibleRecords = normalized
    ? RECORD_LINKS.filter((r) => r.label.toLowerCase().includes(normalized))
    : RECORD_LINKS;

  const handleSelect = (event: React.MouseEvent<HTMLAnchorElement>, label: string) => {
    event.preventDefault();
    setActiveItem(label);
    onNavigate?.(label);
  };

  const handlePrimaryAction = () => {
    setCtaConfirmed(true);
    onCtaClick?.('Book Appointment');
    window.setTimeout(() => setCtaConfirmed(false), 1800);
  };

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="drawer-menu-9"
        aria-label={triggerLabel}
        className="inline-flex items-center gap-2.5 rounded-lg border border-teal-200 bg-white px-4 py-2.5 text-sm font-medium text-teal-900 shadow-xs transition-colors hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 whitespace-nowrap"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
        <span>{triggerLabel}</span>
      </button>

      <div
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-50 ${
          isOpen
            ? 'pointer-events-auto visible'
            : 'pointer-events-none invisible transition-[visibility] duration-200'
        }`}
      >
        <div
          onClick={() => setIsOpen(false)}
          className={`fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-200 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <aside
          id="drawer-menu-9"
          role="dialog"
          aria-modal="true"
          aria-label="Harbor Health patient navigation"
          className={`fixed inset-y-0 left-0 flex w-[360px] max-w-[88vw] flex-col border-r border-slate-200 bg-white text-slate-900 shadow-2xl transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="border-b border-slate-200 px-5 pt-5 pb-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <a
                href="#harbor-home"
                onClick={(e) => handleSelect(e, 'Harbor Health')}
                className="inline-flex items-center gap-2.5 text-base font-semibold tracking-tight text-slate-900"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden="true">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
                <span>Harbor Health</span>
              </a>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close Harbor Health navigation"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-teal-50/80 p-3 ring-1 ring-teal-200/70">
              <div aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-700 text-xs font-semibold text-white">
                EL
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">Elena Lin</p>
                <p className="truncate text-xs text-teal-800">Member 48291 · Dr. Vance</p>
              </div>
            </div>

            <label htmlFor="dm9-search" className="sr-only">
              Search care records
            </label>
            <div className="relative flex items-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" className="pointer-events-none absolute left-3 text-slate-400">
                <circle cx="11" cy="11" r="7" />
                <line x1="20" y1="20" x2="16" y2="16" />
              </svg>
              <input
                id="dm9-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search doctors, labs, meds..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-700 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <nav aria-label="Patient portal sections" className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
            {visibleTiles.length === 0 && visibleRecords.length === 0 ? (
              <div className="rounded-lg border border-slate-200 p-5 text-center">
                <p className="text-xs text-slate-500">No care items match &ldquo;{query}&rdquo;.</p>
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="mt-2 text-xs font-semibold text-teal-700 underline"
                >
                  Clear filter
                </button>
              </div>
            ) : (
              <>
                {visibleTiles.length > 0 && (
                  <section aria-labelledby="dm9-portal-grid">
                    <h2 id="dm9-portal-grid" className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      My Care Hub
                    </h2>
                    <ul className="grid grid-cols-2 gap-2.5">
                      {visibleTiles.map((tile) => {
                        const isActive = activeItem === tile.label;
                        return (
                          <li key={tile.label}>
                            <a
                              href={tile.href}
                              onClick={(e) => handleSelect(e, tile.label)}
                              aria-current={isActive ? 'page' : undefined}
                              className={`flex flex-col justify-between rounded-xl border p-3.5 min-h-[76px] transition-colors ${
                                isActive
                                  ? 'border-teal-600 bg-teal-50 text-teal-950'
                                  : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              <span className="text-sm font-semibold">{tile.label}</span>
                              <span className="text-[11px] text-teal-700">{tile.sub}</span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                )}

                {visibleRecords.length > 0 && (
                  <section aria-labelledby="dm9-records">
                    <h2 id="dm9-records" className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Health Records
                    </h2>
                    <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                      {visibleRecords.map((item) => {
                        const isActive = activeItem === item.label;
                        return (
                          <li key={item.label}>
                            <a
                              href={item.href}
                              onClick={(e) => handleSelect(e, item.label)}
                              aria-current={isActive ? 'page' : undefined}
                              className={`flex min-h-[42px] items-center justify-between px-3.5 py-2 text-sm transition-colors ${
                                isActive
                                  ? 'bg-teal-50 font-semibold text-teal-900'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span>{item.label}</span>
                              <span aria-hidden="true" className="text-xs text-slate-400">→</span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                )}
              </>
            )}
          </nav>

          <div className="border-t border-slate-200 bg-slate-50 p-4 space-y-2.5">
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
            >
              {ctaConfirmed ? 'Scheduler Opened' : 'Book Appointment'}
            </button>
            <p className="text-center text-xs text-slate-500">
              24/7 Nurse Triage · (800) 555-0194
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default DrawerMenu9;
