'use client';

import React, { useEffect, useState } from 'react';

export interface DrawerMenu3Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  onNavigate?: (label: string) => void;
  onCtaClick?: (label: string) => void;
}

type DocScope = 'All' | 'Guides' | 'API';

interface DocSection {
  id: string;
  scope: 'Guides' | 'API';
  label: string;
  children: { label: string; href: string; shortcut: string }[];
}

const DOC_SECTIONS: DocSection[] = [
  {
    id: 'getting-started',
    scope: 'Guides',
    label: 'Getting Started',
    children: [
      { label: 'Installation', href: '#installation', shortcut: 'G I' },
      { label: 'Quickstart Guide', href: '#quickstart', shortcut: 'G Q' },
      { label: 'CLI Reference', href: '#cli-reference', shortcut: 'G C' },
    ],
  },
  {
    id: 'core-concepts',
    scope: 'Guides',
    label: 'Core Concepts',
    children: [
      { label: 'App Routing', href: '#app-routing', shortcut: 'C R' },
      { label: 'Middleware', href: '#middleware', shortcut: 'C M' },
      { label: 'Edge Caching', href: '#edge-caching', shortcut: 'C E' },
    ],
  },
  {
    id: 'api-reference',
    scope: 'API',
    label: 'API Reference',
    children: [
      { label: 'REST Endpoints', href: '#rest-endpoints', shortcut: 'A R' },
      { label: 'Webhooks', href: '#webhooks', shortcut: 'A W' },
      { label: 'Rate Limits', href: '#rate-limits', shortcut: 'A L' },
    ],
  },
];

export function DrawerMenu3({
  defaultOpen = false,
  triggerLabel = 'Open DrawerMenu3',
  onNavigate,
  onCtaClick,
}: DrawerMenu3Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<DocScope>('All');
  const [expandedIds, setExpandedIds] = useState<string[]>([
    'getting-started',
    'core-concepts',
  ]);
  const [activeItem, setActiveItem] = useState('Quickstart Guide');
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
  const visibleSections = DOC_SECTIONS.filter(
    (section) => scope === 'All' || section.scope === scope
  )
    .map((section) => {
      if (!normalizedQuery) return section;
      const sectionMatches = section.label.toLowerCase().includes(normalizedQuery);
      const matchingChildren = section.children.filter((child) =>
        child.label.toLowerCase().includes(normalizedQuery)
      );
      if (sectionMatches) return section;
      if (matchingChildren.length > 0) {
        return { ...section, children: matchingChildren };
      }
      return null;
    })
    .filter((section): section is DocSection => section !== null);

  const toggleSection = (id: string) => {
    setExpandedIds((prev) =>
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
    onCtaClick?.('Get API Key');
    window.setTimeout(() => setCtaConfirmed(false), 1800);
  };

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="drawer-menu-3"
        aria-label={triggerLabel}
        className="inline-flex items-center gap-2.5 rounded-lg border border-slate-800 bg-[#0B0F17] px-4 py-2.5 text-sm font-medium text-slate-100 shadow-xs transition-colors hover:bg-[#151B26] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 whitespace-nowrap"
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
          className={`fixed inset-0 bg-black/65 backdrop-blur-[2px] transition-opacity duration-200 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <aside
          id="drawer-menu-3"
          role="dialog"
          aria-modal="true"
          aria-label="Vektor Docs command palette navigation"
          className={`fixed inset-y-0 left-0 flex w-[380px] max-w-[88vw] flex-col border-r border-slate-800 bg-[#0B0F17] text-slate-100 shadow-2xl transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800/90 px-5 py-4">
            <a
              href="#docs-home"
              onClick={(e) => handleSelect(e, 'Vektor Docs')}
              className="inline-flex items-center gap-2.5 text-base font-semibold tracking-tight text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="text-sky-400">
                <polygon points="12 2 21 7 21 17 12 22 3 17 3 7 12 2" />
                <line x1="12" y1="22" x2="12" y2="12" />
                <line x1="21" y1="7" x2="12" y2="12" />
                <line x1="3" y1="7" x2="12" y2="12" />
              </svg>
              <span>Vektor Docs</span>
            </a>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close Vektor Docs navigation"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-[#151B26] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Spotlight Command Search + Scope Switcher */}
          <div className="border-b border-slate-800/80 bg-[#0F1520] px-5 py-4 space-y-3">
            <label htmlFor="dm3-search" className="sr-only">
              Search documentation
            </label>
            <div className="relative flex items-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" className="pointer-events-none absolute left-3 text-sky-400">
                <circle cx="11" cy="11" r="7" />
                <line x1="20" y1="20" x2="16" y2="16" />
              </svg>
              <input
                id="dm3-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search docs, CLI, webhooks..."
                className="w-full rounded-lg border border-slate-700 bg-[#151B26] py-2.5 pl-9 pr-12 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
              />
              <kbd className="pointer-events-none absolute right-2.5 rounded border border-slate-700 bg-[#0B0F17] px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
                ⌘K
              </kbd>
            </div>

            <div role="group" aria-label="Documentation scope" className="grid grid-cols-3 gap-1 rounded-lg bg-[#151B26] p-1">
              {(['All', 'Guides', 'API'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setScope(tab)}
                  aria-pressed={scope === tab}
                  className={`rounded-md py-1 text-xs font-medium transition-colors ${
                    scope === tab
                      ? 'bg-sky-500 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <nav aria-label="Documentation command sections" className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
            {visibleSections.length === 0 ? (
              <div className="rounded-lg border border-slate-800 bg-[#151B26] px-4 py-6 text-center">
                <p className="text-sm font-medium text-slate-300">
                  No pages match &ldquo;{query}&rdquo;
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setScope('All');
                  }}
                  className="mt-2 text-xs font-medium text-sky-400 hover:underline"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              visibleSections.map((section) => {
                const isExpanded =
                  normalizedQuery.length > 0 || expandedIds.includes(section.id);
                return (
                  <div key={section.id} className="rounded-lg">
                    <h2 className="text-sm font-semibold text-slate-200">
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        aria-expanded={isExpanded}
                        className="flex min-h-[40px] w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-[#151B26] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
                      >
                        <span>{section.label}</span>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                          <polyline points="9 6 15 12 9 18" />
                        </svg>
                      </button>
                    </h2>

                    {isExpanded && (
                      <ul className="mt-1 ml-3 space-y-0.5 border-l border-slate-800 pl-3">
                        {section.children.map((child) => {
                          const isActive = activeItem === child.label;
                          return (
                            <li key={child.label}>
                              <a
                                href={child.href}
                                onClick={(e) => handleSelect(e, child.label)}
                                aria-current={isActive ? 'page' : undefined}
                                className={`flex min-h-[38px] items-center justify-between rounded-md px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${
                                  isActive
                                    ? 'bg-sky-500/15 font-medium text-sky-300'
                                    : 'text-slate-400 hover:bg-[#151B26] hover:text-slate-100'
                                }`}
                              >
                                <span>{child.label}</span>
                                <kbd className="font-mono text-[10px] text-slate-500">
                                  {child.shortcut}
                                </kbd>
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })
            )}
          </nav>

          <div className="border-t border-slate-800 bg-[#0F1520] px-5 py-4 space-y-3.5">
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="w-full rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-sky-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
            >
              {ctaConfirmed ? 'API Key Generated' : 'Get API Key'}
            </button>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Community</span>
              <div className="flex items-center gap-3">
                <a href="#github" onClick={(e) => handleSelect(e, 'GitHub')} aria-label="Vektor on GitHub" className="p-1 text-slate-400 hover:text-white">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                    <path d="M9 19c-4.5 1.5-4.5-2.5-6-3m12 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 19 4.77 5.07 5.07 0 0 0 18.91 1S17.73.65 15 2.48a13.38 13.38 0 0 0-6 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                  </svg>
                </a>
                <a href="#discord" onClick={(e) => handleSelect(e, 'Discord')} aria-label="Vektor Discord" className="p-1 text-slate-400 hover:text-white">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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

export default DrawerMenu3;
