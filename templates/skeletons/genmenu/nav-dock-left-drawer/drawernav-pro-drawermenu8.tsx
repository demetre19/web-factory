'use client';

import React, { useEffect, useState } from 'react';

export interface DrawerMenu8Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  onNavigate?: (label: string) => void;
  onCtaClick?: (label: string) => void;
}

const VINYL_ITEMS = [
  { label: 'New Arrivals', href: '#new-arrivals', icon: 'disc' as const },
  { label: 'Staff Picks', href: '#staff-picks', icon: 'star' as const },
  { label: 'Pre-Orders', href: '#pre-orders', icon: 'clock' as const },
  { label: 'Listening Room', href: '#listening-room', icon: 'headphones' as const },
];

const GENRE_MATRIX = ['Ambient', 'Jazz', 'Soul', 'Techno', 'Dub', 'Post-Punk'];

function VinylIcon({ name }: { name: 'disc' | 'star' | 'clock' | 'headphones' }) {
  switch (name) {
    case 'disc':
      return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
    case 'star':
      return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <polygon points="12 2 15 8.5 22 9.5 17 14.5 18 21.5 12 18 6 21.5 7 14.5 2 9.5 9 8.5 12 2" />
        </svg>
      );
    case 'clock':
      return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 7 12 12 15 14" />
        </svg>
      );
    case 'headphones':
      return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
          <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
      );
  }
}

export function DrawerMenu8({
  defaultOpen = false,
  triggerLabel = 'Open DrawerMenu8',
  onNavigate,
  onCtaClick,
}: DrawerMenu8Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const [activeItem, setActiveItem] = useState('New Arrivals');
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

  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = normalizedQuery
    ? VINYL_ITEMS.filter((item) => item.label.toLowerCase().includes(normalizedQuery))
    : VINYL_ITEMS;
  const filteredGenres = normalizedQuery
    ? GENRE_MATRIX.filter((genre) => genre.toLowerCase().includes(normalizedQuery))
    : GENRE_MATRIX;

  const handleSelect = (event: React.MouseEvent<HTMLAnchorElement>, label: string) => {
    event.preventDefault();
    setActiveItem(label);
    onNavigate?.(label);
  };

  const handlePrimaryAction = () => {
    setCtaConfirmed(true);
    onCtaClick?.('Join Vinyl Club');
    window.setTimeout(() => setCtaConfirmed(false), 1800);
  };

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="drawer-menu-8"
        aria-label={triggerLabel}
        className="inline-flex items-center gap-2.5 rounded-lg bg-[#C2410C] px-4 py-2.5 text-sm font-semibold text-[#FFF7ED] shadow-xs transition-colors hover:bg-[#9A3412] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2410C] whitespace-nowrap"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
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
          className={`fixed inset-0 bg-[#1C1917]/60 backdrop-blur-[2px] transition-opacity duration-200 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <aside
          id="drawer-menu-8"
          role="dialog"
          aria-modal="true"
          aria-label="Wax & Needle vinyl catalog navigation"
          className={`fixed inset-y-0 left-0 flex w-[370px] max-w-[88vw] flex-col bg-[#C2410C] text-[#FFF7ED] shadow-2xl transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="px-5 pt-5 pb-4 border-b border-white/15 space-y-4">
            <div className="flex items-center justify-between">
              <a
                href="#wax-home"
                onClick={(e) => handleSelect(e, 'Wax & Needle')}
                className="inline-flex items-center gap-2.5 text-base font-bold tracking-tight text-[#FFF7ED]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                </svg>
                <span>Wax &amp; Needle</span>
              </a>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close Wax & Needle navigation"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-black/15 text-[#FFF7ED] transition-colors hover:bg-black/30"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <label htmlFor="dm8-search" className="sr-only">
              Filter crates and genres
            </label>
            <div className="relative flex items-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="pointer-events-none absolute left-3 text-orange-200">
                <circle cx="11" cy="11" r="7" />
                <line x1="20" y1="20" x2="16" y2="16" />
              </svg>
              <input
                id="dm8-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter crates, genres..."
                className="w-full rounded-lg border border-white/20 bg-black/20 py-2 pl-9 pr-3 text-sm text-[#FFF7ED] placeholder:text-orange-200/75 focus:border-white focus:outline-none"
              />
            </div>
          </div>

          <nav aria-label="Vinyl catalog" className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
            {filteredItems.length === 0 && filteredGenres.length === 0 ? (
              <div className="rounded-lg bg-black/15 px-4 py-6 text-center">
                <p className="text-sm text-orange-100">No releases match &ldquo;{query}&rdquo;.</p>
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="mt-2 text-xs font-semibold text-white underline"
                >
                  Show all crates
                </button>
              </div>
            ) : (
              <>
                {filteredGenres.length > 0 && (
                  <section aria-labelledby="dm8-genres">
                    <h2 id="dm8-genres" className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-200">
                      Genre Matrix
                    </h2>
                    <ul className="grid grid-cols-3 gap-2">
                      {filteredGenres.map((genre) => {
                        const isActive = activeItem === genre;
                        return (
                          <li key={genre}>
                            <a
                              href={`#${genre.toLowerCase().replace(/\s+/g, '-')}`}
                              onClick={(e) => handleSelect(e, genre)}
                              aria-current={isActive ? 'page' : undefined}
                              className={`flex min-h-[42px] items-center justify-center rounded-md border px-2 py-2 text-center text-xs font-semibold transition-colors ${
                                isActive
                                  ? 'border-[#1C1917] bg-[#1C1917] text-white'
                                  : 'border-white/20 bg-black/15 text-[#FFF7ED] hover:bg-black/30'
                              }`}
                            >
                              {genre}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                )}

                {filteredItems.length > 0 && (
                  <section aria-labelledby="dm8-crates">
                    <h2 id="dm8-crates" className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-200">
                      Record Crates
                    </h2>
                    <ul className="space-y-1">
                      {filteredItems.map((item) => {
                        const isActive = activeItem === item.label;
                        return (
                          <li key={item.label}>
                            <a
                              href={item.href}
                              onClick={(e) => handleSelect(e, item.label)}
                              aria-current={isActive ? 'page' : undefined}
                              className={`flex min-h-[42px] items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                isActive
                                  ? 'bg-[#1C1917] text-[#FFF7ED]'
                                  : 'text-[#FFF7ED]/90 hover:bg-black/15 hover:text-white'
                              }`}
                            >
                              <VinylIcon name={item.icon} />
                              <span>{item.label}</span>
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

          <div className="border-t border-white/15 bg-[#9A3412] px-5 py-4 space-y-3.5">
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="w-full rounded-lg bg-[#1C1917] px-4 py-2.5 text-sm font-semibold text-[#FFF7ED] transition-colors hover:bg-black"
            >
              {ctaConfirmed ? 'Club Pass Added' : 'Join Vinyl Club'}
            </button>

            <div className="flex items-center justify-between text-xs text-orange-100">
              <span>Listening Bar · Thu–Sun</span>
              <div className="flex items-center gap-3">
                <a href="#bandcamp" onClick={(e) => handleSelect(e, 'Bandcamp')} aria-label="Wax & Needle on Bandcamp" className="p-1 hover:text-white">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <polygon points="3 18 9 6 21 6 15 18 3 18" />
                  </svg>
                </a>
                <a href="#radio" onClick={(e) => handleSelect(e, 'Live Radio')} aria-label="Wax & Needle Radio Stream" className="p-1 hover:text-white">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                    <circle cx="12" cy="12" r="2" />
                    <path d="M16.2 7.8a6 6 0 0 1 0 8.4" />
                    <path d="M7.8 16.2a6 6 0 0 1 0-8.4" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default DrawerMenu8;
