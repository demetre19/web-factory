'use client';

import React, { useEffect, useState } from 'react';

export interface DrawerMenu14Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  onNavigate?: (label: string) => void;
  onCtaClick?: (label: string) => void;
}

const VISIT_COLUMN = [
  { label: 'Glasshouses', href: '#glasshouses' },
  { label: 'Alpine Rockery', href: '#alpine' },
  { label: 'Seasonal Trail', href: '#trail' },
  { label: 'Café & Nursery', href: '#cafe' },
  { label: 'Guided Walks', href: '#walks' },
];

const COLLECTIONS_COLUMN = [
  { label: 'Orchid Archive', href: '#orchids' },
  { label: 'Medicinal Beds', href: '#medicinal' },
  { label: 'Seed Bank', href: '#seed-bank' },
  { label: 'Herbarium', href: '#herbarium' },
  { label: 'Research Papers', href: '#papers' },
];

export function DrawerMenu14({
  defaultOpen = false,
  triggerLabel = 'Open DrawerMenu14',
  onNavigate,
  onCtaClick,
}: DrawerMenu14Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const [activeItem, setActiveItem] = useState('Glasshouses');
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
  const visitFiltered = normalized
    ? VISIT_COLUMN.filter((i) => i.label.toLowerCase().includes(normalized))
    : VISIT_COLUMN;
  const collectionsFiltered = normalized
    ? COLLECTIONS_COLUMN.filter((i) => i.label.toLowerCase().includes(normalized))
    : COLLECTIONS_COLUMN;

  const handleSelect = (event: React.MouseEvent<HTMLAnchorElement>, label: string) => {
    event.preventDefault();
    setActiveItem(label);
    onNavigate?.(label);
  };

  const handlePrimaryAction = () => {
    setCtaConfirmed(true);
    onCtaClick?.('Plan Your Visit');
    window.setTimeout(() => setCtaConfirmed(false), 1800);
  };

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="drawer-menu-14"
        aria-label={triggerLabel}
        className="inline-flex items-center gap-2.5 rounded-lg border border-[#CED5C6] bg-[#F2F4EE] px-4 py-2.5 text-sm font-medium text-[#1A261B] shadow-xs transition-colors hover:bg-[#E7EBE0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 whitespace-nowrap"
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
          className={`fixed inset-0 bg-[#1A261B]/45 backdrop-blur-[2px] transition-opacity duration-200 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <aside
          id="drawer-menu-14"
          role="dialog"
          aria-modal="true"
          aria-label="Kew & Glass parallel directory navigation"
          className={`fixed inset-y-0 left-0 flex w-[390px] max-w-[88vw] flex-col border-r border-[#D5DCCB] bg-[#F2F4EE] text-[#1A261B] shadow-2xl transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="border-b border-[#D5DCCB] px-6 pt-5 pb-4 space-y-4">
            <div className="flex items-center justify-between">
              <a
                href="#kew-home"
                onClick={(e) => handleSelect(e, 'Kew & Glass')}
                className="inline-flex items-center gap-2.5 text-base font-semibold tracking-tight text-[#1A261B]"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" className="text-green-700">
                  <path d="M12 22V8" />
                  <path d="M12 14c-4 0-7-3-7-7 4 0 7 3 7 7z" />
                  <path d="M12 10c4 0 7-3 7-7-4 0-7 3-7 7z" />
                </svg>
                <span>Kew &amp; Glass</span>
              </a>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close Kew & Glass navigation"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#4D5E4E] hover:bg-[#E4E9DC] hover:text-[#1A261B]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <label htmlFor="dm14-search" className="sr-only">
              Search plants and glasshouses
            </label>
            <div className="relative flex items-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" className="pointer-events-none absolute left-3 text-[#5C6B5C]">
                <circle cx="11" cy="11" r="7" />
                <line x1="20" y1="20" x2="16" y2="16" />
              </svg>
              <input
                id="dm14-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search gardens, plants, events..."
                className="w-full rounded-lg border border-[#CBD4C1] bg-white py-2 pl-9 pr-3 text-sm text-[#1A261B] placeholder:text-[#6B7A6B] focus:border-green-700 focus:outline-none"
              />
            </div>
          </div>

          {/* Dual-Column Parallel Navigation */}
          <nav aria-label="Conservatory dual-column directory" className="flex-1 overflow-y-auto px-6 py-6">
            {visitFiltered.length === 0 && collectionsFiltered.length === 0 ? (
              <div className="rounded-lg border border-[#D5DCCB] bg-white/70 p-5 text-center">
                <p className="text-sm text-[#4D5E4E]">No matches for &ldquo;{query}&rdquo;.</p>
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="mt-2 text-xs font-semibold text-green-700 underline"
                >
                  Reset search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 divide-x divide-[#D5DCCB]">
                <section aria-labelledby="dm14-visit" className="pr-4">
                  <h2 id="dm14-visit" className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5C6B5C]">
                    Visit
                  </h2>
                  <ul className="space-y-1.5">
                    {visitFiltered.map((item) => {
                      const isActive = activeItem === item.label;
                      return (
                        <li key={item.label}>
                          <a
                            href={item.href}
                            onClick={(e) => handleSelect(e, item.label)}
                            aria-current={isActive ? 'page' : undefined}
                            className={`flex min-h-[38px] items-center rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                              isActive
                                ? 'bg-green-700/10 font-semibold text-green-800'
                                : 'text-[#2D3B2E] hover:bg-[#E6EAE0]'
                            }`}
                          >
                            {item.label}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </section>

                <section aria-labelledby="dm14-collections" className="pl-4">
                  <h2 id="dm14-collections" className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5C6B5C]">
                    Collections
                  </h2>
                  <ul className="space-y-1.5">
                    {collectionsFiltered.map((item) => {
                      const isActive = activeItem === item.label;
                      return (
                        <li key={item.label}>
                          <a
                            href={item.href}
                            onClick={(e) => handleSelect(e, item.label)}
                            aria-current={isActive ? 'page' : undefined}
                            className={`flex min-h-[38px] items-center rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                              isActive
                                ? 'bg-green-700/10 font-semibold text-green-800'
                                : 'text-[#2D3B2E] hover:bg-[#E6EAE0]'
                            }`}
                          >
                            {item.label}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              </div>
            )}
          </nav>

          <div className="border-t border-[#D5DCCB] bg-[#E8ECE2] px-6 py-4 space-y-2">
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="w-full rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-800"
            >
              {ctaConfirmed ? 'Visit Planner Opened' : 'Plan Your Visit'}
            </button>
            <p className="text-center text-xs text-[#4D5E4E]">
              Open Today · 09:00–17:30
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default DrawerMenu14;
