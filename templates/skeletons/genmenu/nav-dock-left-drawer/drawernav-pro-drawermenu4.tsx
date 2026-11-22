'use client';

import React, { useEffect, useState } from 'react';

export interface DrawerMenu4Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  onNavigate?: (label: string) => void;
  onCtaClick?: (label: string) => void;
}

const BENTO_TILES = [
  { label: 'Bread Schedule', sub: '07:00 Loaves', href: '#bread', icon: 'wheat' as const },
  { label: 'Coffee Bar', sub: 'Single-Origin', href: '#coffee', icon: 'cup' as const },
  { label: 'Pastries', sub: 'Seasonal', href: '#pastries', icon: 'sun' as const },
  { label: 'Locations', sub: '3 Bakeries', href: '#locations', icon: 'pin' as const },
];

const SECONDARY_LINKS = [
  { label: 'Regional Millers', href: '#millers' },
  { label: 'Wholesale Program', href: '#wholesale' },
  { label: 'Sourdough Classes', href: '#classes' },
];

function TileIcon({ name }: { name: (typeof BENTO_TILES)[number]['icon'] }) {
  switch (name) {
    case 'wheat':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
          <path d="M12 21V3" />
          <path d="M12 13c-3 0-5-2-5-5 3 0 5 2 5 5z" />
          <path d="M12 13c3 0 5-2 5-5-3 0-5 2-5 5z" />
        </svg>
      );
    case 'cup':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
          <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
        </svg>
      );
    case 'sun':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="3" x2="12" y2="5" />
          <line x1="12" y1="19" x2="12" y2="21" />
          <line x1="4.2" y1="12" x2="5.8" y2="12" />
          <line x1="18.2" y1="12" x2="19.8" y2="12" />
        </svg>
      );
    case 'pin':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path d="M12 21s-6-5.4-6-10a6 6 0 1 1 12 0c0 4.6-6 10-6 10z" />
          <circle cx="12" cy="11" r="2" />
        </svg>
      );
  }
}

export function DrawerMenu4({
  defaultOpen = false,
  triggerLabel = 'Open DrawerMenu4',
  onNavigate,
  onCtaClick,
}: DrawerMenu4Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const [activeItem, setActiveItem] = useState('Bread Schedule');
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
    ? BENTO_TILES.filter(
        (t) =>
          t.label.toLowerCase().includes(normalized) ||
          t.sub.toLowerCase().includes(normalized)
      )
    : BENTO_TILES;
  const visibleSecondary = normalized
    ? SECONDARY_LINKS.filter((l) => l.label.toLowerCase().includes(normalized))
    : SECONDARY_LINKS;

  const handleSelect = (event: React.MouseEvent<HTMLAnchorElement>, label: string) => {
    event.preventDefault();
    setActiveItem(label);
    onNavigate?.(label);
  };

  const handlePrimaryAction = () => {
    setCtaConfirmed(true);
    onCtaClick?.('Order Morning Box');
    window.setTimeout(() => setCtaConfirmed(false), 1800);
  };

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="drawer-menu-4"
        aria-label={triggerLabel}
        className="inline-flex items-center gap-2.5 rounded-lg border border-[#D8CEBE] bg-[#FAF6F0] px-4 py-2.5 text-sm font-medium text-[#2C221E] shadow-xs transition-colors hover:bg-[#F2EAE0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B45309] whitespace-nowrap"
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
          className={`fixed inset-0 bg-[#2C221E]/45 backdrop-blur-[2px] transition-opacity duration-200 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <aside
          id="drawer-menu-4"
          role="dialog"
          aria-modal="true"
          aria-label="Hearth & Mill navigation"
          className={`fixed inset-y-0 left-0 flex w-[360px] max-w-[88vw] flex-col border-r border-[#E7DEC8] bg-[#FAF6F0] text-[#2C221E] shadow-2xl transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="border-b border-[#E7DEC8] px-5 pt-5 pb-4 space-y-4">
            <div className="flex items-center justify-between">
              <a
                href="#bakery-home"
                onClick={(e) => handleSelect(e, 'Hearth & Mill')}
                className="inline-flex items-center gap-2.5 text-lg font-semibold tracking-tight text-[#2C221E]"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#D8CEBE] bg-[#F2EAE0] text-[#B45309]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                    <path d="M5 18h14a3 3 0 0 0 0-6h-1a6 6 0 0 0-12 0H5a3 3 0 0 0 0 6z" />
                  </svg>
                </span>
                <span>Hearth &amp; Mill</span>
              </a>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close Hearth & Mill navigation"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#6B5A50] transition-colors hover:bg-[#EFE6D8] hover:text-[#2C221E]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <label htmlFor="dm4-search" className="sr-only">
              Search loaves, coffee, locations
            </label>
            <div className="relative flex items-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" className="pointer-events-none absolute left-3 text-[#8C7A6B]">
                <circle cx="11" cy="11" r="7" />
                <line x1="20" y1="20" x2="16" y2="16" />
              </svg>
              <input
                id="dm4-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search loaves, beans, bakeries..."
                className="w-full rounded-lg border border-[#DDD2C0] bg-white py-2 pl-9 pr-3 text-sm text-[#2C221E] placeholder:text-[#8C7A6B] focus:border-[#B45309] focus:outline-none"
              />
            </div>
          </div>

          <nav aria-label="Bakery navigation" className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
            {visibleTiles.length === 0 && visibleSecondary.length === 0 ? (
              <div className="rounded-xl border border-[#E7DEC8] bg-[#F4EDE2] p-6 text-center">
                <p className="text-sm text-[#5A4B43]">Nothing matches &ldquo;{query}&rdquo;.</p>
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="mt-2 text-xs font-semibold text-[#B45309] underline"
                >
                  Clear filter
                </button>
              </div>
            ) : (
              <>
                {visibleTiles.length > 0 && (
                  <section aria-labelledby="dm4-tiles">
                    <h2 id="dm4-tiles" className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8C7A6B]">
                      Daily Highlights
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
                              className={`flex flex-col justify-between rounded-xl border p-3.5 min-h-[92px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B45309] ${
                                isActive
                                  ? 'border-[#B45309] bg-[#EFE3D1] text-[#78350F]'
                                  : 'border-[#E7DEC8] bg-white/80 text-[#2C221E] hover:border-[#D8CEBE] hover:bg-white'
                              }`}
                            >
                              <span className={isActive ? 'text-[#B45309]' : 'text-[#8C7A6B]'}>
                                <TileIcon name={tile.icon} />
                              </span>
                              <div className="pt-2">
                                <p className="text-xs font-semibold leading-snug">{tile.label}</p>
                                <p className="text-[11px] text-[#7C6B60]">{tile.sub}</p>
                              </div>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                )}

                {visibleSecondary.length > 0 && (
                  <section aria-labelledby="dm4-bakery">
                    <h2 id="dm4-bakery" className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8C7A6B]">
                      Our Craft
                    </h2>
                    <ul className="divide-y divide-[#E7DEC8] rounded-xl border border-[#E7DEC8] bg-white/60">
                      {visibleSecondary.map((link) => {
                        const isActive = activeItem === link.label;
                        return (
                          <li key={link.label}>
                            <a
                              href={link.href}
                              onClick={(e) => handleSelect(e, link.label)}
                              aria-current={isActive ? 'page' : undefined}
                              className={`flex min-h-[42px] items-center justify-between px-3.5 py-2 text-sm transition-colors ${
                                isActive
                                  ? 'font-semibold text-[#B45309]'
                                  : 'text-[#3F322B] hover:text-[#2C221E]'
                              }`}
                            >
                              <span>{link.label}</span>
                              <span aria-hidden="true" className="text-xs text-[#8C7A6B]">→</span>
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

          <div className="border-t border-[#E7DEC8] bg-[#F4EDE2] px-5 py-4 space-y-3.5">
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="w-full rounded-lg bg-[#B45309] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#92400E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B45309]"
            >
              {ctaConfirmed ? 'Morning Box Reserved' : 'Order Morning Box'}
            </button>

            <div className="flex items-center justify-between text-xs text-[#6B5A50]">
              <span>Daily 06:30–16:00</span>
              <div className="flex items-center gap-3">
                <a href="#instagram" onClick={(e) => handleSelect(e, 'Instagram')} aria-label="Hearth & Mill Instagram" className="p-1 hover:text-[#2C221E]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                  </svg>
                </a>
                <a href="#journal" onClick={(e) => handleSelect(e, 'Baking Journal')} aria-label="Hearth & Mill Baking Journal" className="p-1 hover:text-[#2C221E]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
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

export default DrawerMenu4;
