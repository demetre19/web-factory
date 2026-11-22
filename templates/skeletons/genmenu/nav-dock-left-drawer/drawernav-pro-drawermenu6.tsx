'use client';

import React, { useEffect, useState } from 'react';

export interface DrawerMenu6Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  onNavigate?: (label: string) => void;
  onCtaClick?: (label: string) => void;
}

const MUSEUM_CATEGORIES = [
  {
    id: 'exhibitions',
    label: 'Exhibitions',
    count: '4 current',
    items: [
      { label: 'Concrete & Light', meta: 'Gallery A' },
      { label: 'Nordic Ceramics 1970–2026', meta: 'Gallery B' },
      { label: 'Sound Installations', meta: 'Atrium' },
      { label: 'Upcoming Fall 2027', meta: 'Preview' },
    ],
  },
  {
    id: 'visitor-info',
    label: 'Visitor Info',
    count: 'Daily 10–18',
    items: [
      { label: 'Hours & Admission', meta: 'Free Tue' },
      { label: 'Guided Architecture Tours', meta: '14:00' },
      { label: 'Accessibility & Map', meta: 'Step-free' },
    ],
  },
  {
    id: 'collection',
    label: 'Permanent Collection',
    count: '1,400 works',
    items: [
      { label: 'Modern Sculpture', meta: 'Wing 1' },
      { label: 'Works on Paper', meta: 'Study Room' },
      { label: 'Curatorial Essays', meta: 'Journal' },
    ],
  },
];

export function DrawerMenu6({
  defaultOpen = false,
  triggerLabel = 'Open DrawerMenu6',
  onNavigate,
  onCtaClick,
}: DrawerMenu6Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const [level2Id, setLevel2Id] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState('Concrete & Light');
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
  const searchResults = normalized
    ? MUSEUM_CATEGORIES.flatMap((cat) =>
        cat.items
          .filter(
            (item) =>
              item.label.toLowerCase().includes(normalized) ||
              cat.label.toLowerCase().includes(normalized)
          )
          .map((item) => ({ ...item, category: cat.label }))
      )
    : [];

  const activeCategory = MUSEUM_CATEGORIES.find((c) => c.id === level2Id);

  const handleSelect = (event: React.MouseEvent<HTMLAnchorElement>, label: string) => {
    event.preventDefault();
    setActiveItem(label);
    onNavigate?.(label);
  };

  const handlePrimaryAction = () => {
    setCtaConfirmed(true);
    onCtaClick?.('Reserve Timed Entry');
    window.setTimeout(() => setCtaConfirmed(false), 1800);
  };

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="drawer-menu-6"
        aria-label={triggerLabel}
        className="inline-flex items-center gap-2.5 rounded-lg border border-[#D6CEC2] bg-[#F4EFE6] px-4 py-2.5 text-sm font-medium text-[#1C1917] shadow-xs transition-colors hover:bg-[#EAE2D6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#292524] whitespace-nowrap"
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
          className={`fixed inset-0 bg-[#1C1917]/50 backdrop-blur-[2px] transition-opacity duration-200 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <aside
          id="drawer-menu-6"
          role="dialog"
          aria-modal="true"
          aria-label="Kunsthalle North drill-down navigation"
          className={`fixed inset-y-0 left-0 flex w-[400px] max-w-[88vw] flex-col border-r border-[#DDD4C7] bg-[#F4EFE6] text-[#1C1917] shadow-2xl transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="px-7 pt-6 pb-5 border-b border-[#DDD4C7] space-y-4">
            <div className="flex items-center justify-between">
              <a
                href="#museum-home"
                onClick={(e) => {
                  handleSelect(e, 'Kunsthalle North');
                  setLevel2Id(null);
                }}
                className="inline-flex items-center gap-3 text-lg font-semibold tracking-tight text-[#1C1917]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                  <path d="M4 20h16" />
                  <path d="M6 20V8l6-4 6 4v12" />
                  <line x1="12" y1="4" x2="12" y2="20" />
                </svg>
                <span>Kunsthalle North</span>
              </a>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close Kunsthalle North navigation"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[#78716C] transition-colors hover:bg-[#E7DFD2] hover:text-[#1C1917]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <label htmlFor="dm6-search" className="sr-only">
              Search exhibitions, tours, works
            </label>
            <div className="relative flex items-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" className="pointer-events-none absolute left-3 text-[#78716C]">
                <circle cx="11" cy="11" r="7" />
                <line x1="20" y1="20" x2="16" y2="16" />
              </svg>
              <input
                id="dm6-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search all levels..."
                className="w-full rounded-md border border-[#D4CBBF] bg-[#FAF7F2] py-2 pl-9 pr-3 text-sm text-[#1C1917] placeholder:text-[#78716C] focus:border-[#292524] focus:outline-none"
              />
            </div>
          </div>

          <nav aria-label="Museum drill-down menu" className="flex-1 overflow-y-auto px-7 py-6">
            {normalized ? (
              <div>
                <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#78716C]">
                  Search Matches ({searchResults.length})
                </h2>
                {searchResults.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-[#57534E]">No matches for &ldquo;{query}&rdquo;.</p>
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="mt-2 text-xs font-semibold text-[#1C1917] underline"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <ul className="divide-y divide-[#DDD4C7]">
                    {searchResults.map((item) => (
                      <li key={item.label}>
                        <a
                          href={`#${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                          onClick={(e) => handleSelect(e, item.label)}
                          className="flex min-h-[46px] items-center justify-between py-2.5 text-sm text-[#1C1917] hover:underline"
                        >
                          <span className="font-medium">{item.label}</span>
                          <span className="text-xs text-[#78716C]">{item.category}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : activeCategory ? (
              <div className="space-y-5">
                <button
                  type="button"
                  onClick={() => setLevel2Id(null)}
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#57534E] hover:text-[#1C1917]"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  <span>Back to Menu</span>
                </button>

                <div>
                  <h2 className="mb-3 border-b border-[#DDD4C7] pb-2 text-lg font-semibold text-[#1C1917]">
                    {activeCategory.label}
                  </h2>
                  <ul className="space-y-1">
                    {activeCategory.items.map((item) => {
                      const isActive = activeItem === item.label;
                      return (
                        <li key={item.label}>
                          <a
                            href={`#${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                            onClick={(e) => handleSelect(e, item.label)}
                            aria-current={isActive ? 'page' : undefined}
                            className={`flex min-h-[44px] items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                              isActive
                                ? 'bg-[#E7DFD2] font-semibold text-[#1C1917]'
                                : 'text-[#44403C] hover:bg-[#ECE5DA] hover:text-[#1C1917]'
                            }`}
                          >
                            <span>{item.label}</span>
                            <span className="text-xs text-[#78716C]">{item.meta}</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#78716C]">
                  Departments
                </h2>
                <ul className="divide-y divide-[#DDD4C7] border-y border-[#DDD4C7]">
                  {MUSEUM_CATEGORIES.map((cat) => (
                    <li key={cat.id}>
                      <button
                        type="button"
                        onClick={() => setLevel2Id(cat.id)}
                        className="group flex min-h-[58px] w-full items-center justify-between py-3 text-left transition-colors hover:text-[#1C1917]"
                      >
                        <div>
                          <p className="text-base font-semibold text-[#1C1917]">{cat.label}</p>
                          <p className="text-xs text-[#78716C]">{cat.count}</p>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" className="text-[#78716C] transition-transform group-hover:translate-x-1 group-hover:text-[#1C1917]">
                          <polyline points="9 6 15 12 9 18" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </nav>

          <div className="border-t border-[#DDD4C7] bg-[#EDE6DA] px-7 py-5">
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="w-full rounded-md bg-[#292524] px-4 py-3 text-sm font-semibold text-[#FAF7F2] transition-colors hover:bg-[#1C1917]"
            >
              {ctaConfirmed ? 'Entry Pass Selected' : 'Reserve Timed Entry'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default DrawerMenu6;
