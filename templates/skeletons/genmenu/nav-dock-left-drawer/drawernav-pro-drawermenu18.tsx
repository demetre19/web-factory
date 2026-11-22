'use client';

import React, { useEffect, useState } from 'react';

export interface DrawerMenu18Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  onNavigate?: (label: string) => void;
  onCtaClick?: (label: string) => void;
}

const CHAPTERS = [
  {
    key: 'B',
    title: 'Breakfast',
    recipes: ['Buckwheat Crepes', 'Baked Eggs & Herb Oil'],
  },
  {
    key: 'S',
    title: 'Sourdough',
    recipes: ['Country Boule', 'Seeded Rye Tin'],
  },
  {
    key: 'F',
    title: 'Ferments',
    recipes: ['Preserved Lemons', 'Quick Kimchi'],
  },
  {
    key: 'D',
    title: 'Desserts',
    recipes: ['Olive Oil Cake', 'Roasted Plum Tart'],
  },
];

export function DrawerMenu18({
  defaultOpen = false,
  triggerLabel = 'Open DrawerMenu18',
  onNavigate,
  onCtaClick,
}: DrawerMenu18Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const [activeKey, setActiveKey] = useState('B');
  const [activeItem, setActiveItem] = useState('Buckwheat Crepes');
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
  const visibleChapters = CHAPTERS.map((chap) => ({
    ...chap,
    recipes: normalized
      ? chap.recipes.filter(
          (r) =>
            r.toLowerCase().includes(normalized) ||
            chap.title.toLowerCase().includes(normalized)
        )
      : chap.recipes,
  })).filter((chap) => chap.recipes.length > 0);

  const handleSelect = (event: React.MouseEvent<HTMLAnchorElement>, label: string) => {
    event.preventDefault();
    setActiveItem(label);
    onNavigate?.(label);
  };

  const handleJump = (key: string) => {
    setActiveKey(key);
    const el = document.getElementById(`dm18-chapter-${key}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePrimaryAction = () => {
    setCtaConfirmed(true);
    onCtaClick?.('Save Recipe Box');
    window.setTimeout(() => setCtaConfirmed(false), 1800);
  };

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="drawer-menu-18"
        aria-label={triggerLabel}
        className="inline-flex items-center gap-2.5 rounded-lg border border-[#E6D9CE] bg-[#FDF8F3] px-4 py-2.5 text-sm font-medium text-[#271C19] shadow-xs transition-colors hover:bg-[#F7ECE2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9F1239] whitespace-nowrap"
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
          className={`fixed inset-0 bg-[#271C19]/45 backdrop-blur-[2px] transition-opacity duration-200 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <aside
          id="drawer-menu-18"
          role="dialog"
          aria-modal="true"
          aria-label="Larder & Loaf recipe index navigation"
          className={`fixed inset-y-0 left-0 flex w-[380px] max-w-[88vw] flex-col border-r border-[#E6D9CE] bg-[#FDF8F3] text-[#271C19] shadow-2xl transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="border-b border-[#E6D9CE] px-5 pt-5 pb-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <a
                href="#larder"
                onClick={(e) => handleSelect(e, 'Larder & Loaf')}
                className="text-base font-semibold tracking-tight text-[#271C19]"
              >
                Larder &amp; Loaf
              </a>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close Larder & Loaf navigation"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#7A665E] hover:bg-[#F3E7DC] hover:text-[#271C19]"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <label htmlFor="dm18-search" className="sr-only">
              Search recipes and ingredients
            </label>
            <div className="relative flex items-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" className="pointer-events-none absolute left-3 text-[#8C756C]">
                <circle cx="11" cy="11" r="7" />
                <line x1="20" y1="20" x2="16" y2="16" />
              </svg>
              <input
                id="dm18-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search recipes, ingredients..."
                className="w-full rounded-lg border border-[#E0CFC1] bg-white py-2 pl-9 pr-3 text-sm text-[#271C19] placeholder:text-[#8C756C] focus:border-[#9F1239] focus:outline-none"
              />
            </div>
          </div>

          {/* Main Directory + Right Vertical Quick-Jump Index Rail */}
          <div className="flex flex-1 min-h-0">
            <nav aria-label="Cookbook chapters" className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
              {visibleChapters.length === 0 ? (
                <div className="rounded-lg border border-[#E6D9CE] bg-white p-5 text-center">
                  <p className="text-xs text-[#6B574F]">No recipes match &ldquo;{query}&rdquo;.</p>
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="mt-2 text-xs font-semibold text-[#9F1239] underline"
                  >
                    Clear filter
                  </button>
                </div>
              ) : (
                visibleChapters.map((chap) => (
                  <section
                    key={chap.key}
                    id={`dm18-chapter-${chap.key}`}
                    aria-labelledby={`dm18-title-${chap.key}`}
                  >
                    <h2
                      id={`dm18-title-${chap.key}`}
                      className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                        activeKey === chap.key ? 'text-[#9F1239]' : 'text-[#8C756C]'
                      }`}
                    >
                      {chap.title}
                    </h2>
                    <ul className="space-y-1">
                      {chap.recipes.map((recipe) => {
                        const isActive = activeItem === recipe;
                        return (
                          <li key={recipe}>
                            <a
                              href={`#${recipe.toLowerCase().replace(/\s+/g, '-')}`}
                              onClick={(e) => {
                                handleSelect(e, recipe);
                                setActiveKey(chap.key);
                              }}
                              aria-current={isActive ? 'page' : undefined}
                              className={`flex min-h-[40px] items-center rounded-lg px-3 py-2 text-sm transition-colors ${
                                isActive
                                  ? 'bg-[#9F1239]/10 font-semibold text-[#9F1239]'
                                  : 'text-[#3B2C27] hover:bg-[#F5EADF]'
                              }`}
                            >
                              {recipe}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))
              )}
            </nav>

            {/* Right Quick-Jump Index Rail */}
            <div
              aria-label="Chapter quick jump"
              className="flex w-10 shrink-0 flex-col items-center justify-center gap-1.5 border-l border-[#E6D9CE] bg-[#F8EFE6] py-3"
            >
              {CHAPTERS.map((chap) => (
                <button
                  key={chap.key}
                  type="button"
                  onClick={() => handleJump(chap.key)}
                  aria-label={`Jump to ${chap.title}`}
                  className={`flex h-7 w-7 items-center justify-center rounded-md font-mono text-xs font-bold transition-colors ${
                    activeKey === chap.key
                      ? 'bg-[#9F1239] text-white'
                      : 'text-[#7A665E] hover:bg-[#EADACA] hover:text-[#271C19]'
                  }`}
                >
                  {chap.key}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-[#E6D9CE] bg-[#F8EFE6] p-4">
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="w-full rounded-lg bg-[#9F1239] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#881337]"
            >
              {ctaConfirmed ? 'Box Saved' : 'Save Recipe Box'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default DrawerMenu18;
