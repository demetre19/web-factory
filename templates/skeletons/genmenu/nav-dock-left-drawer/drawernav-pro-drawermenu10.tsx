'use client';

import React, { useEffect, useState } from 'react';

export interface DrawerMenu10Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  onNavigate?: (label: string) => void;
  onCtaClick?: (label: string) => void;
}

const PROGRAM_GROUPS = [
  {
    id: 'workshops',
    label: 'Workshops',
    items: ['Type Design', 'Creative Coding', 'Spatial Audio'],
  },
  {
    id: 'archive',
    label: 'Archive',
    items: ['2026 Season', '2025 Season'],
  },
];

const COMMUNITY_LINKS = ['Manifesto', 'Residents', 'Open Studio Nights'];

export function DrawerMenu10({
  defaultOpen = false,
  triggerLabel = 'Open DrawerMenu10',
  onNavigate,
  onCtaClick,
}: DrawerMenu10Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string[]>(['workshops']);
  const [activeItem, setActiveItem] = useState('Type Design');
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
  const visibleGroups = PROGRAM_GROUPS.map((g) => ({
    ...g,
    items: normalized
      ? g.items.filter((i) => i.toLowerCase().includes(normalized))
      : g.items,
  })).filter((g) => g.items.length > 0);
  const visibleCommunity = normalized
    ? COMMUNITY_LINKS.filter((c) => c.toLowerCase().includes(normalized))
    : COMMUNITY_LINKS;

  const toggleGroup = (id: string) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelect = (event: React.MouseEvent<HTMLAnchorElement>, label: string) => {
    event.preventDefault();
    setActiveItem(label);
    onNavigate?.(label);
  };

  const handlePrimaryAction = () => {
    setCtaConfirmed(true);
    onCtaClick?.('Apply for Residency');
    window.setTimeout(() => setCtaConfirmed(false), 1800);
  };

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="drawer-menu-10"
        aria-label={triggerLabel}
        className="inline-flex items-center gap-2.5 rounded-lg border border-stone-800 bg-[#141115] px-4 py-2.5 text-sm font-medium text-stone-100 shadow-xs transition-colors hover:bg-[#201B22] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 whitespace-nowrap"
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
          className={`fixed inset-0 bg-black/70 backdrop-blur-[2px] transition-opacity duration-200 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Inset Modular Card Islands Layout */}
        <aside
          id="drawer-menu-10"
          role="dialog"
          aria-modal="true"
          aria-label="Nocturne Collective navigation"
          className={`fixed inset-y-0 left-0 flex w-[380px] max-w-[88vw] flex-col gap-3 border-r border-[#2C242E] bg-[#0E0B0F] p-3 text-[#F5F3FF] shadow-2xl transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Island 1: Brand + Search */}
          <div className="rounded-xl border border-[#2C242E] bg-[#18141A] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <a
                href="#nocturne-home"
                onClick={(e) => handleSelect(e, 'Nocturne Collective')}
                className="inline-flex items-center gap-2.5 text-sm font-semibold tracking-tight text-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" className="text-amber-400">
                  <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
                </svg>
                <span>Nocturne Collective</span>
              </a>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close Nocturne Collective navigation"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-[#262029] hover:text-white"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <label htmlFor="dm10-search" className="sr-only">
              Search workshops and archive
            </label>
            <div className="relative flex items-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" className="pointer-events-none absolute left-3 text-stone-500">
                <circle cx="11" cy="11" r="7" />
                <line x1="20" y1="20" x2="16" y2="16" />
              </svg>
              <input
                id="dm10-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search workshops, residents..."
                className="w-full rounded-lg border border-[#2E2631] bg-[#110E13] py-2 pl-9 pr-3 text-xs text-stone-100 placeholder:text-stone-500 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Island 2 & 3: Modular Navigation Cards */}
          <nav aria-label="Collective modular navigation" className="flex-1 overflow-y-auto space-y-3">
            {visibleGroups.length === 0 && visibleCommunity.length === 0 ? (
              <div className="rounded-xl border border-[#2C242E] bg-[#18141A] p-6 text-center">
                <p className="text-xs text-stone-400">No matches for &ldquo;{query}&rdquo;.</p>
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="mt-2 text-xs font-semibold text-amber-400 underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <>
                {visibleGroups.length > 0 && (
                  <div className="rounded-xl border border-[#2C242E] bg-[#18141A] p-3.5 space-y-2">
                    <h2 className="px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                      Program Trees
                    </h2>
                    {visibleGroups.map((group) => {
                      const isExpanded =
                        normalized.length > 0 || expanded.includes(group.id);
                      return (
                        <div key={group.id}>
                          <button
                            type="button"
                            onClick={() => toggleGroup(group.id)}
                            aria-expanded={isExpanded}
                            className="flex min-h-[38px] w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-sm font-medium text-stone-200 hover:bg-[#231D26]"
                          >
                            <span>{group.label}</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                              <polyline points="9 6 15 12 9 18" />
                            </svg>
                          </button>
                          {isExpanded && (
                            <ul className="mt-1 ml-3 space-y-0.5 border-l border-[#2C242E] pl-2.5">
                              {group.items.map((item) => {
                                const isActive = activeItem === item;
                                return (
                                  <li key={item}>
                                    <a
                                      href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                                      onClick={(e) => handleSelect(e, item)}
                                      aria-current={isActive ? 'page' : undefined}
                                      className={`flex min-h-[34px] items-center rounded-md px-2.5 py-1 text-xs transition-colors ${
                                        isActive
                                          ? 'bg-amber-500/15 font-semibold text-amber-300'
                                          : 'text-stone-400 hover:bg-[#231D26] hover:text-white'
                                      }`}
                                    >
                                      {item}
                                    </a>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {visibleCommunity.length > 0 && (
                  <div className="rounded-xl border border-[#2C242E] bg-[#18141A] p-3.5">
                    <h2 className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                      Community
                    </h2>
                    <ul className="space-y-1">
                      {visibleCommunity.map((link) => {
                        const isActive = activeItem === link;
                        return (
                          <li key={link}>
                            <a
                              href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                              onClick={(e) => handleSelect(e, link)}
                              aria-current={isActive ? 'page' : undefined}
                              className={`flex min-h-[38px] items-center rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
                                isActive
                                  ? 'bg-amber-500/15 font-semibold text-amber-300'
                                  : 'text-stone-300 hover:bg-[#231D26] hover:text-white'
                              }`}
                            >
                              {link}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </>
            )}
          </nav>

          {/* Island 4: Footer CTA + Social */}
          <div className="rounded-xl border border-[#2C242E] bg-[#18141A] p-4 space-y-3">
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-stone-950 transition-colors hover:bg-amber-400"
            >
              {ctaConfirmed ? 'Application Started' : 'Apply for Residency'}
            </button>

            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>Berlin · Cohort IX</span>
              <div className="flex items-center gap-3">
                <a href="#arena" onClick={(e) => handleSelect(e, 'Are.na')} aria-label="Nocturne on Are.na" className="p-1 hover:text-amber-400">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M8 15l4-8 4 8" />
                  </svg>
                </a>
                <a href="#newsletter" onClick={(e) => handleSelect(e, 'Newsletter')} aria-label="Nocturne Newsletter" className="p-1 hover:text-amber-400">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <polyline points="3 7 12 13 21 7" />
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

export default DrawerMenu10;
