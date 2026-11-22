'use client';

import React, { useEffect, useState } from 'react';

export interface DrawerMenu15Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  onNavigate?: (label: string) => void;
  onCtaClick?: (label: string) => void;
}

const BIENNIAL_PROGRAM = [
  { index: '01', label: 'Keynotes', href: '#keynotes' },
  { index: '02', label: 'Installations', href: '#installations' },
  { index: '03', label: 'Open Critiques', href: '#critiques' },
  { index: '04', label: 'Print Fair', href: '#print-fair' },
];

const UTILITY_CELLS = ['Schedule', 'Venues', 'Speakers', 'Press'];

export function DrawerMenu15({
  defaultOpen = false,
  triggerLabel = 'Open DrawerMenu15',
  onNavigate,
  onCtaClick,
}: DrawerMenu15Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const [activeItem, setActiveItem] = useState('Keynotes');
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
  const visibleProgram = normalized
    ? BIENNIAL_PROGRAM.filter((item) => item.label.toLowerCase().includes(normalized))
    : BIENNIAL_PROGRAM;
  const visibleUtilities = normalized
    ? UTILITY_CELLS.filter((cell) => cell.toLowerCase().includes(normalized))
    : UTILITY_CELLS;

  const handleSelect = (event: React.MouseEvent<HTMLAnchorElement>, label: string) => {
    event.preventDefault();
    setActiveItem(label);
    onNavigate?.(label);
  };

  const handlePrimaryAction = () => {
    setCtaConfirmed(true);
    onCtaClick?.('Get Biennial Pass');
    window.setTimeout(() => setCtaConfirmed(false), 1800);
  };

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="drawer-menu-15"
        aria-label={triggerLabel}
        className="inline-flex items-center gap-2.5 border-2 border-zinc-950 bg-[#FACC15] px-4 py-2 text-sm font-bold text-zinc-950 transition-colors hover:bg-[#FDE047] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 whitespace-nowrap"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
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
          className={`fixed inset-0 bg-zinc-950/60 transition-opacity duration-200 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Neo-Brutalist Zero-Radius Exposed Grid Cells */}
        <aside
          id="drawer-menu-15"
          role="dialog"
          aria-modal="true"
          aria-label="GRIDLOCK biennial navigation"
          className={`fixed inset-y-0 left-0 flex w-[360px] max-w-[88vw] flex-col border-r-2 border-zinc-950 bg-[#FACC15] text-zinc-950 shadow-2xl transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b-2 border-zinc-950 px-5 py-4">
            <a
              href="#gridlock"
              onClick={(e) => handleSelect(e, 'GRIDLOCK')}
              className="text-lg font-black tracking-tight uppercase text-zinc-950"
            >
              Gridlock 26
            </a>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close GRIDLOCK navigation"
              className="inline-flex h-10 w-10 items-center justify-center border-2 border-zinc-950 bg-white text-zinc-950 transition-colors hover:bg-zinc-950 hover:text-white"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="border-b-2 border-zinc-950 bg-white">
            <label htmlFor="dm15-search" className="sr-only">
              Search biennial program
            </label>
            <div className="relative flex items-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true" className="pointer-events-none absolute left-4 text-zinc-950">
                <circle cx="11" cy="11" r="7" />
                <line x1="20" y1="20" x2="16" y2="16" />
              </svg>
              <input
                id="dm15-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SEARCH PROGRAM..."
                className="w-full bg-transparent py-3.5 pl-11 pr-4 font-mono text-xs font-bold text-zinc-950 placeholder:text-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          <nav aria-label="Biennial program grid" className="flex-1 overflow-y-auto">
            {visibleProgram.length === 0 && visibleUtilities.length === 0 ? (
              <div className="p-6 text-center">
                <p className="font-mono text-xs font-bold">NO MATCH FOR &ldquo;{query}&rdquo;</p>
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="mt-3 border-2 border-zinc-950 bg-white px-3 py-1.5 font-mono text-xs font-bold"
                >
                  RESET
                </button>
              </div>
            ) : (
              <>
                {visibleProgram.length > 0 && (
                  <section aria-labelledby="dm15-program">
                    <h2 id="dm15-program" className="border-b-2 border-zinc-950 bg-zinc-950 px-5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#FACC15]">
                      Program
                    </h2>
                    <ul className="divide-y-2 divide-zinc-950 border-b-2 border-zinc-950">
                      {visibleProgram.map((item) => {
                        const isActive = activeItem === item.label;
                        return (
                          <li key={item.label}>
                            <a
                              href={item.href}
                              onClick={(e) => handleSelect(e, item.label)}
                              aria-current={isActive ? 'page' : undefined}
                              className={`flex min-h-[54px] items-center justify-between px-5 py-3 text-base font-bold transition-colors ${
                                isActive
                                  ? 'bg-zinc-950 text-[#FACC15]'
                                  : 'bg-[#FACC15] text-zinc-950 hover:bg-white'
                              }`}
                            >
                              <span>{item.label}</span>
                              <span className="font-mono text-xs">{item.index}</span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                )}

                {visibleUtilities.length > 0 && (
                  <section aria-labelledby="dm15-utility">
                    <h2 id="dm15-utility" className="border-b-2 border-zinc-950 px-5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-950">
                      Directory
                    </h2>
                    <ul className="grid grid-cols-2 border-b-2 border-zinc-950">
                      {visibleUtilities.map((cell, idx) => {
                        const isActive = activeItem === cell;
                        return (
                          <li
                            key={cell}
                            className={`${idx % 2 === 0 ? 'border-r-2 border-zinc-950' : ''} ${
                              idx < 2 ? 'border-b-2 border-zinc-950' : ''
                            }`}
                          >
                            <a
                              href={`#${cell.toLowerCase()}`}
                              onClick={(e) => handleSelect(e, cell)}
                              aria-current={isActive ? 'page' : undefined}
                              className={`flex min-h-[52px] items-center justify-center px-3 py-2 font-mono text-xs font-bold uppercase transition-colors ${
                                isActive
                                  ? 'bg-zinc-950 text-white'
                                  : 'bg-white text-zinc-950 hover:bg-[#FEF08A]'
                              }`}
                            >
                              {cell}
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

          <div className="border-t-2 border-zinc-950 bg-white p-4">
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="w-full border-2 border-zinc-950 bg-zinc-950 px-4 py-3 text-sm font-black uppercase tracking-wide text-[#FACC15] transition-colors hover:bg-[#FACC15] hover:text-zinc-950"
            >
              {ctaConfirmed ? 'Pass Reserved' : 'Get Biennial Pass'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default DrawerMenu15;
