'use client';

import React, { useEffect, useState } from 'react';

export interface DrawerMenu19Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  onNavigate?: (label: string) => void;
  onCtaClick?: (label: string) => void;
}

const DOSSIER_ITEMS = [
  { roman: 'I.', label: 'Mergers & Acquisitions', href: '#ma' },
  { roman: 'II.', label: 'Regulatory Strategy', href: '#regulatory' },
  { roman: 'III.', label: 'Cross-Border Tax', href: '#tax' },
  { roman: 'IV.', label: 'Arbitration & Disputes', href: '#arbitration' },
];

const OFFICES = ['New York', 'London', 'Zurich', 'Singapore'];

export function DrawerMenu19({
  defaultOpen = false,
  triggerLabel = 'Open DrawerMenu19',
  onNavigate,
  onCtaClick,
}: DrawerMenu19Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const [officesOpen, setOfficesOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('Mergers & Acquisitions');
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
  const visiblePractice = normalized
    ? DOSSIER_ITEMS.filter((i) => i.label.toLowerCase().includes(normalized))
    : DOSSIER_ITEMS;
  const visibleOffices = normalized
    ? OFFICES.filter((o) => o.toLowerCase().includes(normalized))
    : OFFICES;

  const handleSelect = (event: React.MouseEvent<HTMLAnchorElement>, label: string) => {
    event.preventDefault();
    setActiveItem(label);
    onNavigate?.(label);
  };

  const handlePrimaryAction = () => {
    setCtaConfirmed(true);
    onCtaClick?.('Schedule Consultation');
    window.setTimeout(() => setCtaConfirmed(false), 1800);
  };

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="drawer-menu-19"
        aria-label={triggerLabel}
        className="inline-flex items-center gap-2.5 rounded-lg border border-slate-300 bg-[#F8FAFC] px-4 py-2.5 text-sm font-medium text-slate-900 shadow-xs transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 whitespace-nowrap"
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
          className={`fixed inset-0 bg-slate-950/45 backdrop-blur-[2px] transition-opacity duration-200 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <aside
          id="drawer-menu-19"
          role="dialog"
          aria-modal="true"
          aria-label="Vance Advisory dossier navigation"
          className={`fixed inset-y-0 left-0 flex w-[370px] max-w-[88vw] flex-col border-r border-slate-200 bg-[#F8FAFC] text-slate-900 shadow-2xl transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="border-b border-slate-200 bg-white px-6 pt-5 pb-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  aria-hidden="true"
                  className="flex h-9 w-9 items-center justify-center rounded border border-slate-300 bg-slate-900 text-xs font-semibold tracking-wider text-white"
                >
                  VC
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">Vance Advisory</p>
                  <p className="text-[11px] text-slate-500">Counsel &amp; Strategy</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close Vance Advisory navigation"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-950"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <label htmlFor="dm19-search" className="sr-only">
              Search practices and offices
            </label>
            <div className="relative flex items-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" className="pointer-events-none absolute left-3 text-slate-400">
                <circle cx="11" cy="11" r="7" />
                <line x1="20" y1="20" x2="16" y2="16" />
              </svg>
              <input
                id="dm19-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search practice areas, offices..."
                className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <nav aria-label="Advisory dossier" className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {visiblePractice.length === 0 && visibleOffices.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white p-5 text-center">
                <p className="text-xs text-slate-500">No entries match &ldquo;{query}&rdquo;.</p>
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="mt-2 text-xs font-semibold text-slate-900 underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <>
                {visiblePractice.length > 0 && (
                  <section aria-labelledby="dm19-practice">
                    <h2 id="dm19-practice" className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Practice Areas
                    </h2>
                    <ul className="divide-y divide-slate-200 border-y border-slate-200 bg-white">
                      {visiblePractice.map((item) => {
                        const isActive = activeItem === item.label;
                        return (
                          <li key={item.label}>
                            <a
                              href={item.href}
                              onClick={(e) => handleSelect(e, item.label)}
                              aria-current={isActive ? 'page' : undefined}
                              className={`flex min-h-[46px] items-center gap-3.5 px-3.5 py-2.5 text-sm transition-colors ${
                                isActive
                                  ? 'bg-slate-900 font-semibold text-white'
                                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                              }`}
                            >
                              <span className={`w-6 font-mono text-xs ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                                {item.roman}
                              </span>
                              <span>{item.label}</span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                )}

                {visibleOffices.length > 0 && (
                  <section aria-labelledby="dm19-offices">
                    <h2 id="dm19-offices" className="sr-only">
                      Global Offices
                    </h2>
                    <button
                      type="button"
                      onClick={() => setOfficesOpen((p) => !p)}
                      aria-expanded={normalized.length > 0 || officesOpen}
                      className="flex min-h-[42px] w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700 hover:bg-slate-50"
                    >
                      <span>Global Offices ({visibleOffices.length})</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={`transition-transform ${normalized.length > 0 || officesOpen ? 'rotate-180' : ''}`}>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    {(normalized.length > 0 || officesOpen) && (
                      <ul className="mt-2 grid grid-cols-2 gap-1.5">
                        {visibleOffices.map((city) => {
                          const isActive = activeItem === city;
                          return (
                            <li key={city}>
                              <a
                                href={`#${city.toLowerCase().replace(/\s+/g, '-')}`}
                                onClick={(e) => handleSelect(e, city)}
                                aria-current={isActive ? 'page' : undefined}
                                className={`flex min-h-[36px] items-center rounded border px-3 py-1.5 text-xs transition-colors ${
                                  isActive
                                    ? 'border-slate-900 bg-slate-900 font-semibold text-white'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                }`}
                              >
                                {city}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </section>
                )}
              </>
            )}
          </nav>

          <div className="border-t border-slate-200 bg-white px-6 py-4">
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              {ctaConfirmed ? 'Consultation Requested' : 'Schedule Consultation'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default DrawerMenu19;
