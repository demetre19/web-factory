'use client';

import React, { useEffect, useState } from 'react';

export interface DrawerMenu7Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  onNavigate?: (label: string) => void;
  onCtaClick?: (label: string) => void;
}

const ENTITIES = [
  { id: 'global', name: 'Global Holdings', balance: '$14.8M', initials: 'GH' },
  { id: 'eu', name: 'Europe Treasury', balance: '€6.2M', initials: 'ET' },
];

const LEDGER_LINKS = [
  { group: 'Accounts', label: 'Cash Flow', figure: '$4.2M' },
  { group: 'Accounts', label: 'Treasury Bills', figure: '5.12%' },
  { group: 'Operations', label: 'Domestic ACH', figure: '14' },
  { group: 'Operations', label: 'SWIFT International', figure: '3' },
  { group: 'Operations', label: 'Card Controls', figure: '28 cards' },
  { group: 'Operations', label: 'Audit Log', figure: 'Live' },
];

export function DrawerMenu7({
  defaultOpen = false,
  triggerLabel = 'Open DrawerMenu7',
  onNavigate,
  onCtaClick,
}: DrawerMenu7Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [entityIndex, setEntityIndex] = useState(0);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeItem, setActiveItem] = useState('Cash Flow');
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

  const currentEntity = ENTITIES[entityIndex];
  const normalized = query.trim().toLowerCase();
  const visibleLinks = normalized
    ? LEDGER_LINKS.filter((item) => item.label.toLowerCase().includes(normalized))
    : LEDGER_LINKS;

  const handleSelect = (event: React.MouseEvent<HTMLAnchorElement>, label: string) => {
    event.preventDefault();
    setActiveItem(label);
    onNavigate?.(label);
  };

  const handlePrimaryAction = () => {
    setCtaConfirmed(true);
    onCtaClick?.('Initiate Transfer');
    window.setTimeout(() => setCtaConfirmed(false), 1800);
  };

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="drawer-menu-7"
        aria-label={triggerLabel}
        className="inline-flex items-center gap-2.5 rounded-lg border border-emerald-950 bg-[#090D0B] px-4 py-2.5 text-sm font-medium text-emerald-50 shadow-xs transition-colors hover:bg-[#131A16] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 whitespace-nowrap"
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

        <aside
          id="drawer-menu-7"
          role="dialog"
          aria-modal="true"
          aria-label="Meridian Vault treasury navigation"
          className={`fixed inset-y-0 left-0 flex w-[360px] max-w-[88vw] flex-col border-r border-emerald-950/80 bg-[#090D0B] text-emerald-50 shadow-2xl transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="border-b border-[#1A241E] px-5 pt-5 pb-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <a
                href="#vault-home"
                onClick={(e) => handleSelect(e, 'Meridian Vault')}
                className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-white"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-400">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M12 2L3 7v6c0 5 3.8 9.2 9 10 5.2-.8 9-5 9-10V7l-9-5z" />
                  </svg>
                </span>
                <span>Meridian Vault</span>
              </a>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close Meridian Vault navigation"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-emerald-200/70 transition-colors hover:bg-[#131A16] hover:text-white"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Interactive Entity Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSwitcherOpen((prev) => !prev)}
                aria-expanded={switcherOpen}
                className="flex w-full items-center gap-3 rounded-xl border border-[#1E2A23] bg-[#131A16] p-2.5 text-left transition-colors hover:border-emerald-700/60"
              >
                <div aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-xs font-bold text-slate-950">
                  AR
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-white">
                    {currentEntity.name}
                  </p>
                  <p className="truncate font-mono text-[11px] tabular-nums text-emerald-300">
                    {currentEntity.balance} · Alex Rivera
                  </p>
                </div>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="text-emerald-200/60">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {switcherOpen && (
                <div className="mt-1.5 rounded-lg border border-[#1E2A23] bg-[#131A16] p-1 space-y-1">
                  {ENTITIES.map((ent, idx) => (
                    <button
                      key={ent.id}
                      type="button"
                      onClick={() => {
                        setEntityIndex(idx);
                        setSwitcherOpen(false);
                        onNavigate?.(`Switched to ${ent.name}`);
                      }}
                      className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-xs ${
                        idx === entityIndex
                          ? 'bg-emerald-500/15 font-semibold text-emerald-300'
                          : 'text-emerald-100/80 hover:bg-[#1B241F]'
                      }`}
                    >
                      <span>{ent.name}</span>
                      <span className="font-mono tabular-nums">{ent.balance}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3-Action Quick Strip */}
            <div className="grid grid-cols-3 gap-1.5">
              {['Send', 'Convert', 'Statements'].map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => {
                    setActiveItem(action);
                    onNavigate?.(action);
                  }}
                  className="rounded-lg border border-[#1E2A23] bg-[#131A16] py-2 text-xs font-medium text-emerald-100 transition-colors hover:border-emerald-600/50 hover:text-white"
                >
                  {action}
                </button>
              ))}
            </div>

            <label htmlFor="dm7-search" className="sr-only">
              Search accounts and rails
            </label>
            <div className="relative flex items-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" className="pointer-events-none absolute left-3 text-emerald-200/50">
                <circle cx="11" cy="11" r="7" />
                <line x1="20" y1="20" x2="16" y2="16" />
              </svg>
              <input
                id="dm7-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search accounts, wires, logs..."
                className="w-full rounded-lg border border-[#1E2A23] bg-[#131A16] py-2 pl-9 pr-3 text-xs text-white placeholder:text-emerald-200/45 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <nav aria-label="Treasury ledger navigation" className="flex-1 overflow-y-auto px-4 py-4">
            <h2 className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-200/50">
              Ledger &amp; Rails
            </h2>
            {visibleLinks.length === 0 ? (
              <div className="px-3 py-6 text-center">
                <p className="text-xs text-emerald-200/70">No matches for &ldquo;{query}&rdquo;.</p>
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="mt-2 text-xs font-semibold text-emerald-400 underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <ul className="space-y-1">
                {visibleLinks.map((item) => {
                  const isActive = activeItem === item.label;
                  return (
                    <li key={item.label}>
                      <a
                        href={`#${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={(e) => handleSelect(e, item.label)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`flex min-h-[40px] items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                          isActive
                            ? 'bg-emerald-500/15 font-semibold text-emerald-300'
                            : 'text-emerald-100/80 hover:bg-[#131A16] hover:text-white'
                        }`}
                      >
                        <span>{item.label}</span>
                        <span className="font-mono text-[11px] tabular-nums text-emerald-200/55">
                          {item.figure}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </nav>

          <div className="border-t border-[#1A241E] bg-[#0D1310] p-4">
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
            >
              {ctaConfirmed ? 'Transfer Window Opened' : 'Initiate Transfer'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default DrawerMenu7;
