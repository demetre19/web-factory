'use client';

import React, { useEffect, useState } from 'react';

export interface DrawerMenu12Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  onNavigate?: (label: string) => void;
  onCtaClick?: (label: string) => void;
}

const LEAD_SECTIONS = [
  { label: 'Front Page', href: '#front-page', note: 'Morning Edition' },
  { label: 'World Desk', href: '#world', note: '14 dispatches' },
  { label: 'Science & Climate', href: '#science', note: 'Longreads' },
  { label: 'Culture & Print', href: '#culture', note: 'Weekend' },
];

const QUICK_TOPICS = ['Economy', 'Energy', 'Architecture', 'Book Review'];

export function DrawerMenu12({
  defaultOpen = false,
  triggerLabel = 'Open DrawerMenu12',
  onNavigate,
  onCtaClick,
}: DrawerMenu12Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const [activeItem, setActiveItem] = useState('Front Page');
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
  const visibleSections = normalized
    ? LEAD_SECTIONS.filter((s) => s.label.toLowerCase().includes(normalized))
    : LEAD_SECTIONS;
  const visibleTopics = normalized
    ? QUICK_TOPICS.filter((t) => t.toLowerCase().includes(normalized))
    : QUICK_TOPICS;

  const handleSelect = (event: React.MouseEvent<HTMLAnchorElement>, label: string) => {
    event.preventDefault();
    setActiveItem(label);
    onNavigate?.(label);
  };

  const handlePrimaryAction = () => {
    setCtaConfirmed(true);
    onCtaClick?.('Subscribe Today');
    window.setTimeout(() => setCtaConfirmed(false), 1800);
  };

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="drawer-menu-12"
        aria-label={triggerLabel}
        className="inline-flex items-center gap-2.5 rounded-lg border border-[#D7CFC2] bg-[#F7F3EB] px-4 py-2.5 text-sm font-medium text-[#1C1917] shadow-xs transition-colors hover:bg-[#EDE6DA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B91C1C] whitespace-nowrap"
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
          className={`fixed inset-0 bg-stone-950/45 backdrop-blur-[2px] transition-opacity duration-200 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Inverted Thumb-Zone Layout: Masthead top, Navigation + Search anchored at bottom */}
        <aside
          id="drawer-menu-12"
          role="dialog"
          aria-modal="true"
          aria-label="Morning Dispatch thumb-zone navigation"
          className={`fixed inset-y-0 left-0 flex w-[340px] max-w-[88vw] flex-col justify-between border-r border-[#DFD7CA] bg-[#F7F3EB] text-[#1C1917] shadow-2xl transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Quiet Top Masthead */}
          <div className="flex items-start justify-between border-b border-[#DFD7CA] px-6 py-5">
            <div>
              <p className="text-lg font-bold tracking-tight text-[#1C1917]">
                Morning Dispatch
              </p>
              <p className="text-xs text-[#78716C]">Saturday Edition · No. 418</p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close Morning Dispatch navigation"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[#78716C] transition-colors hover:bg-[#EAE2D6] hover:text-[#1C1917]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Bottom-Anchored Thumb Zone (Nav + Search + CTA) */}
          <div className="flex flex-1 flex-col justify-end overflow-y-auto">
            <nav aria-label="Newspaper sections" className="px-6 py-5 space-y-5">
              {visibleSections.length === 0 && visibleTopics.length === 0 ? (
                <div className="rounded-lg border border-[#DFD7CA] bg-white/70 p-4 text-center">
                  <p className="text-xs text-[#57534E]">No sections match &ldquo;{query}&rdquo;.</p>
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="mt-2 text-xs font-semibold text-[#B91C1C] underline"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <>
                  {visibleTopics.length > 0 && (
                    <section aria-labelledby="dm12-topics">
                      <h2 id="dm12-topics" className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#78716C]">
                        Quick Desks
                      </h2>
                      <ul className="grid grid-cols-2 gap-1.5">
                        {visibleTopics.map((topic) => {
                          const isActive = activeItem === topic;
                          return (
                            <li key={topic}>
                              <a
                                href={`#${topic.toLowerCase().replace(/\s+/g, '-')}`}
                                onClick={(e) => handleSelect(e, topic)}
                                aria-current={isActive ? 'page' : undefined}
                                className={`flex min-h-[38px] items-center rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                                  isActive
                                    ? 'border-[#B91C1C] bg-[#B91C1C]/10 text-[#991B1B]'
                                    : 'border-[#DFD7CA] bg-white/60 text-[#44403C] hover:bg-white'
                                }`}
                              >
                                {topic}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  )}

                  {visibleSections.length > 0 && (
                    <section aria-labelledby="dm12-sections">
                      <h2 id="dm12-sections" className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#78716C]">
                        Main Sections
                      </h2>
                      <ul className="divide-y divide-[#DFD7CA] border-y border-[#DFD7CA]">
                        {visibleSections.map((section) => {
                          const isActive = activeItem === section.label;
                          return (
                            <li key={section.label}>
                              <a
                                href={section.href}
                                onClick={(e) => handleSelect(e, section.label)}
                                aria-current={isActive ? 'page' : undefined}
                                className={`flex min-h-[44px] items-center justify-between py-2 text-sm transition-colors ${
                                  isActive
                                    ? 'font-bold text-[#B91C1C]'
                                    : 'font-medium text-[#1C1917] hover:text-[#B91C1C]'
                                }`}
                              >
                                <span>{section.label}</span>
                                <span className="text-xs text-[#78716C]">{section.note}</span>
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

            {/* Bottom-Docked Search + Subscribe CTA */}
            <div className="border-t border-[#DFD7CA] bg-[#EFE8DC] px-6 py-4 space-y-3">
              <label htmlFor="dm12-search" className="sr-only">
                Search articles and desks
              </label>
              <div className="relative flex items-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" className="pointer-events-none absolute left-3 text-[#78716C]">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="20" y1="20" x2="16" y2="16" />
                </svg>
                <input
                  id="dm12-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search archive, reporters..."
                  className="w-full rounded-md border border-[#D4CBBF] bg-white py-2.5 pl-9 pr-3 text-sm text-[#1C1917] placeholder:text-[#78716C] focus:border-[#B91C1C] focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handlePrimaryAction}
                className="w-full rounded-md bg-[#B91C1C] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#991B1B]"
              >
                {ctaConfirmed ? 'Subscription Selected' : 'Subscribe Today'}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default DrawerMenu12;
