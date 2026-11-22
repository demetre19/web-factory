'use client';

import React, { useEffect, useState } from 'react';

export interface DrawerMenu11Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  onNavigate?: (label: string) => void;
  onCtaClick?: (label: string) => void;
}

type Dept = 'Women' | 'Men' | 'Home';

const DEPT_CATEGORIES: Record<Dept, { label: string; count: string }[]> = {
  Women: [
    { label: 'Outerwear', count: '18' },
    { label: 'Knitwear', count: '24' },
    { label: 'Tailoring', count: '14' },
    { label: 'Footwear', count: '11' },
  ],
  Men: [
    { label: 'Work Jackets', count: '12' },
    { label: 'Overshirts', count: '16' },
    { label: 'Trousers', count: '19' },
    { label: 'Leather Goods', count: '9' },
  ],
  Home: [
    { label: 'Stoneware', count: '22' },
    { label: 'Linen Bedding', count: '15' },
    { label: 'Oak Objects', count: '8' },
    { label: 'Lighting', count: '10' },
  ],
};

const MATERIALS = [
  { name: 'Raw Linen', hex: '#E5DEC9' },
  { name: 'Charcoal Wool', hex: '#3F3F46' },
  { name: 'Saddle Tan', hex: '#92400E' },
  { name: 'Moss', hex: '#3F6212' },
];

export function DrawerMenu11({
  defaultOpen = false,
  triggerLabel = 'Open DrawerMenu11',
  onNavigate,
  onCtaClick,
}: DrawerMenu11Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [dept, setDept] = useState<Dept>('Women');
  const [query, setQuery] = useState('');
  const [activeItem, setActiveItem] = useState('Outerwear');
  const [activeMaterial, setActiveMaterial] = useState('Raw Linen');
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
  const baseCats = DEPT_CATEGORIES[dept];
  const allCats = (Object.keys(DEPT_CATEGORIES) as Dept[]).flatMap((d) =>
    DEPT_CATEGORIES[d].map((c) => ({ ...c, dept: d }))
  );
  const visibleCats = normalized
    ? allCats.filter((c) => c.label.toLowerCase().includes(normalized))
    : baseCats.map((c) => ({ ...c, dept }));

  const handleSelect = (event: React.MouseEvent<HTMLAnchorElement>, label: string) => {
    event.preventDefault();
    setActiveItem(label);
    onNavigate?.(label);
  };

  const handlePrimaryAction = () => {
    setCtaConfirmed(true);
    onCtaClick?.('Shop Seasonal Edit');
    window.setTimeout(() => setCtaConfirmed(false), 1800);
  };

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="drawer-menu-11"
        aria-label={triggerLabel}
        className="inline-flex items-center gap-2.5 rounded-lg border border-zinc-300 bg-[#FAFAF9] px-4 py-2.5 text-sm font-medium text-zinc-900 shadow-xs transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 whitespace-nowrap"
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
          className={`fixed inset-0 bg-zinc-950/45 backdrop-blur-[2px] transition-opacity duration-200 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <aside
          id="drawer-menu-11"
          role="dialog"
          aria-modal="true"
          aria-label="Atelier Nord retail navigation"
          className={`fixed inset-y-0 left-0 flex w-[400px] max-w-[88vw] flex-col border-r border-zinc-200 bg-[#FAFAF9] text-zinc-900 shadow-2xl transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="border-b border-zinc-200 bg-white px-6 pt-5 pb-4 space-y-4">
            <div className="flex items-center justify-between">
              <a
                href="#atelier-home"
                onClick={(e) => handleSelect(e, 'Atelier Nord')}
                className="text-base font-semibold tracking-[0.08em] uppercase text-zinc-950"
              >
                Atelier Nord
              </a>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close Atelier Nord navigation"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <label htmlFor="dm11-search" className="sr-only">
              Search store catalog
            </label>
            <div className="relative flex items-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" className="pointer-events-none absolute left-3 text-zinc-400">
                <circle cx="11" cy="11" r="7" />
                <line x1="20" y1="20" x2="16" y2="16" />
              </svg>
              <input
                id="dm11-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search coats, ceramics, linen..."
                className="w-full rounded-md border border-zinc-200 bg-[#FAFAF9] py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div role="tablist" aria-label="Departments" className="grid grid-cols-3 border-b border-zinc-200 -mb-4">
              {(['Women', 'Men', 'Home'] as const).map((tab) => {
                const selected = dept === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => {
                      setDept(tab);
                      setQuery('');
                    }}
                    className={`border-b-2 py-2.5 text-xs font-semibold transition-colors ${
                      selected
                        ? 'border-[#78350F] text-zinc-950'
                        : 'border-transparent text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          <nav aria-label="Store categories and materials" className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            <section aria-labelledby="dm11-categories">
              <h2 id="dm11-categories" className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                {normalized ? 'Catalog Matches' : `${dept} Categories`}
              </h2>
              {visibleCats.length === 0 ? (
                <div className="rounded-lg border border-zinc-200 bg-white p-5 text-center">
                  <p className="text-xs text-zinc-500">No categories match &ldquo;{query}&rdquo;.</p>
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="mt-2 text-xs font-semibold text-zinc-900 underline"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <ul className="grid grid-cols-2 gap-2.5">
                  {visibleCats.map((cat) => {
                    const isActive = activeItem === cat.label;
                    return (
                      <li key={`${cat.dept}-${cat.label}`}>
                        <a
                          href={`#${cat.label.toLowerCase().replace(/\s+/g, '-')}`}
                          onClick={(e) => handleSelect(e, cat.label)}
                          aria-current={isActive ? 'page' : undefined}
                          className={`flex flex-col justify-between rounded-lg border p-3.5 min-h-[72px] transition-colors ${
                            isActive
                              ? 'border-[#78350F] bg-white text-zinc-950 shadow-xs'
                              : 'border-zinc-200 bg-white/70 text-zinc-700 hover:border-zinc-300 hover:bg-white'
                          }`}
                        >
                          <span className="text-sm font-medium">{cat.label}</span>
                          <span className="font-mono text-[11px] tabular-nums text-zinc-400">
                            {normalized ? `${cat.dept} · ${cat.count}` : `${cat.count} pieces`}
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section aria-labelledby="dm11-materials">
              <h2 id="dm11-materials" className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Shop by Material
              </h2>
              <ul className="grid grid-cols-2 gap-2">
                {MATERIALS.map((mat) => {
                  const selected = activeMaterial === mat.name;
                  return (
                    <li key={mat.name}>
                      <a
                        href={`#${mat.name.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveMaterial(mat.name);
                          onNavigate?.(`Material: ${mat.name}`);
                        }}
                        className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-xs transition-colors ${
                          selected
                            ? 'border-zinc-900 bg-white font-semibold text-zinc-950'
                            : 'border-zinc-200 bg-white/50 text-zinc-700 hover:bg-white'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          style={{ backgroundColor: mat.hex }}
                          className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/15"
                        />
                        <span className="truncate">{mat.name}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          </nav>

          <div className="border-t border-zinc-200 bg-white px-6 py-4">
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="w-full rounded-md bg-[#78350F] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#5C280B]"
            >
              {ctaConfirmed ? 'Seasonal Edit Opened' : 'Shop Seasonal Edit'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default DrawerMenu11;
