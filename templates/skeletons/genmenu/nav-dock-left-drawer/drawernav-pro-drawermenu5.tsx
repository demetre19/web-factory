'use client';

import React, { useEffect, useState } from 'react';

export interface DrawerMenu5Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  onNavigate?: (label: string) => void;
  onCtaClick?: (label: string) => void;
}

const STUDIO_LINKS = [
  { num: '01', label: 'Selected Work', href: '#work' },
  { num: '02', label: 'Case Studies', href: '#case-studies' },
  { num: '03', label: 'Leadership', href: '#leadership' },
  { num: '04', label: 'Careers', href: '#careers' },
];

const DISCIPLINE_LINKS = [
  { num: '01', label: 'Brand Systems', href: '#brand-systems' },
  { num: '02', label: 'Web Engineering', href: '#web-engineering' },
  { num: '03', label: 'Motion Direction', href: '#motion-direction' },
  { num: '04', label: 'Design Ops', href: '#design-ops' },
];

export function DrawerMenu5({
  defaultOpen = false,
  triggerLabel = 'Open DrawerMenu5',
  onNavigate,
  onCtaClick,
}: DrawerMenu5Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [mode, setMode] = useState<'Studio' | 'Disciplines'>('Studio');
  const [query, setQuery] = useState('');
  const [activeItem, setActiveItem] = useState('Selected Work');
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
  const baseList = mode === 'Studio' ? STUDIO_LINKS : DISCIPLINE_LINKS;
  const visibleLinks = normalized
    ? [...STUDIO_LINKS, ...DISCIPLINE_LINKS].filter((item) =>
        item.label.toLowerCase().includes(normalized)
      )
    : baseList;

  const handleSelect = (event: React.MouseEvent<HTMLAnchorElement>, label: string) => {
    event.preventDefault();
    setActiveItem(label);
    onNavigate?.(label);
  };

  const handlePrimaryAction = () => {
    setCtaConfirmed(true);
    onCtaClick?.('Start a Project');
    window.setTimeout(() => setCtaConfirmed(false), 1800);
  };

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="drawer-menu-5"
        aria-label={triggerLabel}
        className="inline-flex items-center gap-2.5 rounded-lg bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#1E40AF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] whitespace-nowrap"
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
          className={`fixed inset-0 bg-slate-950/55 backdrop-blur-[2px] transition-opacity duration-200 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <aside
          id="drawer-menu-5"
          role="dialog"
          aria-modal="true"
          aria-label="MONOLITH Agency navigation"
          className={`fixed inset-y-0 left-0 flex w-[390px] max-w-[88vw] flex-col bg-[#1D4ED8] text-white shadow-2xl transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="border-b border-white/15 px-6 pt-5 pb-4 space-y-4">
            <div className="flex items-center justify-between">
              <a
                href="#monolith"
                onClick={(e) => handleSelect(e, 'MONOLITH')}
                className="inline-flex items-center gap-2.5 text-base font-bold tracking-[0.12em] uppercase text-white"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="text-[#FACC15]">
                  <rect x="3" y="3" width="8" height="18" />
                  <rect x="14" y="3" width="7" height="18" fillOpacity="0.65" />
                </svg>
                <span>Monolith</span>
              </a>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close MONOLITH navigation"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <label htmlFor="dm5-search" className="sr-only">
              Search agency pages
            </label>
            <div className="relative flex items-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="pointer-events-none absolute left-3 text-blue-200">
                <circle cx="11" cy="11" r="7" />
                <line x1="20" y1="20" x2="16" y2="16" />
              </svg>
              <input
                id="dm5-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search case studies, skills..."
                className="w-full rounded-lg border border-white/20 bg-white/10 py-2 pl-9 pr-3 text-sm text-white placeholder:text-blue-200 focus:border-[#FACC15] focus:outline-none"
              />
            </div>

            <div role="tablist" aria-label="Agency sections" className="grid grid-cols-2 gap-1 rounded-lg bg-[#1E40AF] p-1">
              {(['Studio', 'Disciplines'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={mode === tab}
                  onClick={() => {
                    setMode(tab);
                    setQuery('');
                  }}
                  className={`rounded-md py-1.5 text-xs font-semibold transition-colors ${
                    mode === tab
                      ? 'bg-[#FACC15] text-slate-950'
                      : 'text-blue-100 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <nav aria-label="Agency directory" className="flex-1 overflow-y-auto px-6 py-6">
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-200">
              {normalized ? 'Matching Pages' : mode}
            </h2>
            {visibleLinks.length === 0 ? (
              <div className="rounded-lg bg-white/10 p-5 text-center">
                <p className="text-sm text-blue-100">No matches for &ldquo;{query}&rdquo;.</p>
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="mt-2 text-xs font-semibold text-[#FACC15] underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <ul className="space-y-1">
                {visibleLinks.map((item) => {
                  const isActive = activeItem === item.label;
                  return (
                    <li key={`${item.num}-${item.label}`} className="border-b border-white/10">
                      <a
                        href={item.href}
                        onClick={(e) => handleSelect(e, item.label)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`flex min-h-[52px] items-baseline gap-3.5 py-2.5 text-2xl font-bold tracking-tight transition-colors ${
                          isActive ? 'text-[#FACC15]' : 'text-white hover:text-blue-100'
                        }`}
                      >
                        <span className="text-xs font-mono font-medium text-blue-200">
                          {item.num}
                        </span>
                        <span>{item.label}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </nav>

          <div className="border-t border-white/15 bg-[#1E40AF] px-6 py-5 space-y-4">
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="w-full rounded-lg bg-[#FACC15] px-4 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-[#FDE047]"
            >
              {ctaConfirmed ? 'Inquiry Drafted' : 'Start a Project'}
            </button>

            <div className="flex items-center justify-between text-xs text-blue-100">
              <span>hello@monolith.agency</span>
              <div className="flex items-center gap-3">
                <a href="#x" onClick={(e) => handleSelect(e, 'X / Twitter')} aria-label="Monolith on X" className="p-1 hover:text-[#FACC15]">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M4 4l16 16M20 4L4 20" />
                  </svg>
                </a>
                <a href="#linkedin" onClick={(e) => handleSelect(e, 'LinkedIn')} aria-label="Monolith on LinkedIn" className="p-1 hover:text-[#FACC15]">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <line x1="8" y1="11" x2="8" y2="16" />
                    <line x1="12" y1="16" x2="12" y2="11" />
                    <path d="M12 13a2 2 0 0 1 4 0v3" />
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

export default DrawerMenu5;
