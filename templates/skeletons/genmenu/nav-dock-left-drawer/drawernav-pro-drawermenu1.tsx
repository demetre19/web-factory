'use client';

import React, { useEffect, useState } from 'react';

export interface DrawerMenu1Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  onNavigate?: (label: string) => void;
  onCtaClick?: (label: string) => void;
}

const LEFT_COLUMN_LINKS = [
  { label: 'Selected Works', href: '#selected-works' },
  { label: 'Residential', href: '#residential' },
  { label: 'Civic & Cultural', href: '#civic-cultural' },
  { label: 'Monographs', href: '#monographs' },
];

const RIGHT_COLUMN_LINKS = [
  { label: 'Architecture', href: '#architecture' },
  { label: 'Material Lab', href: '#material-lab' },
  { label: 'Leadership', href: '#leadership' },
  { label: 'Press Archive', href: '#press-archive' },
];

export function DrawerMenu1({
  defaultOpen = false,
  triggerLabel = 'Open DrawerMenu1',
  onNavigate,
  onCtaClick,
}: DrawerMenu1Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const [activeItem, setActiveItem] = useState('Selected Works');
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
  const leftFiltered = normalized
    ? LEFT_COLUMN_LINKS.filter((l) => l.label.toLowerCase().includes(normalized))
    : LEFT_COLUMN_LINKS;
  const rightFiltered = normalized
    ? RIGHT_COLUMN_LINKS.filter((l) => l.label.toLowerCase().includes(normalized))
    : RIGHT_COLUMN_LINKS;

  const handleSelect = (event: React.MouseEvent<HTMLAnchorElement>, label: string) => {
    event.preventDefault();
    setActiveItem(label);
    onNavigate?.(label);
  };

  const handlePrimaryAction = () => {
    setCtaConfirmed(true);
    onCtaClick?.('Book a Studio Call');
    window.setTimeout(() => setCtaConfirmed(false), 1800);
  };

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="drawer-menu-1"
        aria-label={triggerLabel}
        className="inline-flex items-center gap-2.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-xs transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 whitespace-nowrap"
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
          id="drawer-menu-1"
          role="dialog"
          aria-modal="true"
          aria-label="Kanso Studio navigation"
          className={`fixed inset-y-0 left-0 flex w-[340px] max-w-[88vw] border-r border-slate-200 bg-white text-slate-900 shadow-2xl transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* 48px Vertical Spine */}
          <div className="flex w-12 shrink-0 flex-col items-center justify-between border-r border-slate-200 bg-slate-50 py-5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" className="text-blue-700">
              <rect x="3" y="3" width="8" height="18" />
              <rect x="14" y="3" width="7" height="8" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>

            <span
              aria-hidden="true"
              className="text-[11px] font-semibold tracking-[0.28em] uppercase text-slate-400 [writing-mode:vertical-rl] rotate-180"
            >
              Kanso Studio
            </span>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close Kanso Studio navigation"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Right Content Column */}
          <div className="flex flex-1 flex-col justify-between min-w-0">
            <div className="border-b border-slate-200 p-5 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-base font-semibold tracking-tight text-slate-950">
                  Index
                </span>
                <span className="text-xs text-slate-500">Zurich · Tokyo</span>
              </div>

              <label htmlFor="dm1-search" className="sr-only">
                Search studio index
              </label>
              <div className="relative flex items-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" className="pointer-events-none absolute left-3 text-slate-400">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="20" y1="20" x2="16" y2="16" />
                </svg>
                <input
                  id="dm1-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search works, disciplines..."
                  className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <nav aria-label="Studio 2-column index" className="flex-1 overflow-y-auto p-5">
              {leftFiltered.length === 0 && rightFiltered.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs text-slate-500">No entries match &ldquo;{query}&rdquo;.</p>
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="mt-2 text-xs font-semibold text-blue-700 hover:underline"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <section aria-labelledby="dm1-practice">
                    <h2 id="dm1-practice" className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Practice
                    </h2>
                    <ul className="space-y-1">
                      {leftFiltered.map((link) => {
                        const isActive = activeItem === link.label;
                        return (
                          <li key={link.label}>
                            <a
                              href={link.href}
                              onClick={(e) => handleSelect(e, link.label)}
                              aria-current={isActive ? 'page' : undefined}
                              className={`flex min-h-[38px] items-center rounded px-2 py-1.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                                isActive
                                  ? 'bg-blue-50 font-semibold text-blue-700'
                                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                              }`}
                            >
                              {link.label}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </section>

                  <section aria-labelledby="dm1-disciplines">
                    <h2 id="dm1-disciplines" className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Disciplines
                    </h2>
                    <ul className="space-y-1">
                      {rightFiltered.map((link) => {
                        const isActive = activeItem === link.label;
                        return (
                          <li key={link.label}>
                            <a
                              href={link.href}
                              onClick={(e) => handleSelect(e, link.label)}
                              aria-current={isActive ? 'page' : undefined}
                              className={`flex min-h-[38px] items-center rounded px-2 py-1.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                                isActive
                                  ? 'bg-blue-50 font-semibold text-blue-700'
                                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                              }`}
                            >
                              {link.label}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                </div>
              )}
            </nav>

            <div className="border-t border-slate-200 bg-slate-50/80 p-5">
              <button
                type="button"
                onClick={handlePrimaryAction}
                className="w-full rounded-lg bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                {ctaConfirmed ? 'Call Request Noted' : 'Book a Studio Call'}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default DrawerMenu1;
