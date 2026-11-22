'use client';

import React, { useEffect, useState } from 'react';

export interface DrawerMenu2Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  onNavigate?: (label: string) => void;
  onCtaClick?: (label: string) => void;
}

type RailId = 'workspace' | 'projects' | 'analytics' | 'settings';

const RAIL_SECTIONS: Record<
  RailId,
  { title: string; subtitle: string; links: { label: string; meta: string }[] }
> = {
  workspace: {
    title: 'Workspace',
    subtitle: 'Core hub & daily queues',
    links: [
      { label: 'Overview', meta: 'Summary' },
      { label: 'Inbox & Triage', meta: '12 items' },
      { label: 'Team Pulse', meta: '8 active' },
      { label: 'Roadmap', meta: 'Q4' },
    ],
  },
  projects: {
    title: 'Projects',
    subtitle: 'Active builds & sprints',
    links: [
      { label: 'Core Platform', meta: 'v2.4' },
      { label: 'Mobile Client', meta: 'iOS' },
      { label: 'Design System', meta: 'Tokens' },
      { label: 'API Gateway', meta: 'Edge' },
    ],
  },
  analytics: {
    title: 'Analytics',
    subtitle: 'Velocity & usage reports',
    links: [
      { label: 'Cycle Time', meta: '2.1d' },
      { label: 'Deployment Rate', meta: '99.4%' },
      { label: 'Audit Reports', meta: 'CSV' },
    ],
  },
  settings: {
    title: 'Settings',
    subtitle: 'Members & billing',
    links: [
      { label: 'Team Members', meta: '24 seats' },
      { label: 'Billing & Plan', meta: 'Pro' },
      { label: 'SSO & Keys', meta: 'SAML' },
    ],
  },
};

function RailIcon({ id }: { id: RailId }) {
  switch (id) {
    case 'workspace':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case 'projects':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
        </svg>
      );
    case 'analytics':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
          <line x1="6" y1="20" x2="6" y2="14" />
          <line x1="12" y1="20" x2="12" y2="8" />
          <line x1="18" y1="20" x2="18" y2="4" />
        </svg>
      );
    case 'settings':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
          <line x1="4" y1="7" x2="20" y2="7" />
          <circle cx="9" cy="7" r="2" fill="currentColor" />
          <line x1="4" y1="17" x2="20" y2="17" />
          <circle cx="15" cy="17" r="2" fill="currentColor" />
        </svg>
      );
  }
}

export function DrawerMenu2({
  defaultOpen = false,
  triggerLabel = 'Open DrawerMenu2',
  onNavigate,
  onCtaClick,
}: DrawerMenu2Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeRail, setActiveRail] = useState<RailId>('projects');
  const [query, setQuery] = useState('');
  const [activeItem, setActiveItem] = useState('Core Platform');
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
  const currentSection = RAIL_SECTIONS[activeRail];
  const allLinks = (Object.keys(RAIL_SECTIONS) as RailId[]).flatMap((rail) =>
    RAIL_SECTIONS[rail].links.map((l) => ({ ...l, group: RAIL_SECTIONS[rail].title }))
  );
  const visibleLinks = normalized
    ? allLinks.filter((item) => item.label.toLowerCase().includes(normalized))
    : currentSection.links.map((l) => ({ ...l, group: currentSection.title }));

  const handleSelect = (event: React.MouseEvent<HTMLAnchorElement>, label: string) => {
    event.preventDefault();
    setActiveItem(label);
    onNavigate?.(label);
  };

  const handlePrimaryAction = () => {
    setCtaConfirmed(true);
    onCtaClick?.('New Workspace');
    window.setTimeout(() => setCtaConfirmed(false), 1800);
  };

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="drawer-menu-2"
        aria-label={triggerLabel}
        className="inline-flex items-center gap-2.5 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 shadow-xs transition-colors hover:border-slate-400 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 whitespace-nowrap"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="16" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
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
          className={`fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-200 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <aside
          id="drawer-menu-2"
          role="dialog"
          aria-modal="true"
          aria-label="Linearity dual-rail workspace navigation"
          className={`fixed inset-y-0 left-0 flex w-[380px] max-w-[88vw] border-r border-slate-200 bg-slate-50 text-slate-900 shadow-2xl transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Left 64px Icon Rail */}
          <div className="flex w-16 shrink-0 flex-col items-center justify-between border-r border-slate-200 bg-slate-900 py-4 text-slate-300">
            <div className="flex flex-col items-center gap-4">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-950">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d="M4 17L10 7l4 6 6-8" />
                </svg>
              </span>

              <div className="flex flex-col gap-2 pt-2" role="tablist" aria-label="Workspace sections">
                {(Object.keys(RAIL_SECTIONS) as RailId[]).map((rail) => {
                  const selected = activeRail === rail;
                  return (
                    <button
                      key={rail}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      aria-label={RAIL_SECTIONS[rail].title}
                      onClick={() => {
                        setActiveRail(rail);
                        setQuery('');
                      }}
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                        selected
                          ? 'bg-white/15 text-white'
                          : 'text-slate-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <RailIcon id={rail} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              title="Maya Kapoor · Product Lead"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-[11px] font-semibold text-white ring-1 ring-white/20"
            >
              MK
            </div>
          </div>

          {/* Right Detail Pane */}
          <div className="flex flex-1 flex-col min-w-0">
            <div className="border-b border-slate-200 bg-white px-5 pt-4 pb-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    {normalized ? 'Search Results' : currentSection.title}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {normalized ? 'Filtering all sections' : currentSection.subtitle}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close Linearity navigation"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <label htmlFor="dm2-search" className="sr-only">
                Search Linearity workspace
              </label>
              <div className="relative flex items-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" className="pointer-events-none absolute left-3 text-slate-400">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="20" y1="20" x2="16" y2="16" />
                </svg>
                <input
                  id="dm2-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Jump to project, report..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <nav aria-label="Active workspace rail links" className="flex-1 overflow-y-auto px-4 py-4">
              <h2 className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {normalized ? 'Matches' : currentSection.title}
              </h2>

              {visibleLinks.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
                  <p className="text-xs text-slate-500">No matches for &ldquo;{query}&rdquo;.</p>
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="mt-2 text-xs font-semibold text-slate-900 underline"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <ul className="space-y-1">
                  {visibleLinks.map((item) => {
                    const isActive = activeItem === item.label;
                    return (
                      <li key={`${item.group}-${item.label}`}>
                        <a
                          href={`#${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                          onClick={(e) => handleSelect(e, item.label)}
                          aria-current={isActive ? 'page' : undefined}
                          className={`flex min-h-[42px] items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
                            isActive
                              ? 'bg-white font-semibold text-slate-950 shadow-xs ring-1 ring-slate-200'
                              : 'font-medium text-slate-600 hover:bg-slate-200/60 hover:text-slate-950'
                          }`}
                        >
                          <span className="truncate">{item.label}</span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {normalized ? item.group : item.meta}
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </nav>

            <div className="border-t border-slate-200 bg-white p-4 space-y-2.5">
              <p className="text-[11px] text-slate-500 truncate">
                Maya Kapoor · maya@linearity.io
              </p>
              <button
                type="button"
                onClick={handlePrimaryAction}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
              >
                <span>{ctaConfirmed ? 'Workspace Created' : 'New Workspace'}</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default DrawerMenu2;
