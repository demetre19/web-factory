'use client';

import React, { useEffect, useState } from 'react';

export interface DrawerMenu17Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  onNavigate?: (label: string) => void;
  onCtaClick?: (label: string) => void;
}

const STUDIO_ITEMS = [
  { label: 'Viewport', shortcut: 'V' },
  { label: 'Scene Graph', shortcut: 'S' },
  { label: 'Materials', shortcut: 'M' },
  { label: 'Lighting Rig', shortcut: 'L' },
];

const SHADER_PRESETS = ['PBR Glass', 'Anisotropic Metal', 'Subsurface Clay'];

export function DrawerMenu17({
  defaultOpen = false,
  triggerLabel = 'Open DrawerMenu17',
  onNavigate,
  onCtaClick,
}: DrawerMenu17Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const [shadersOpen, setShadersOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('Viewport');
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
  const visibleItems = normalized
    ? STUDIO_ITEMS.filter((i) => i.label.toLowerCase().includes(normalized))
    : STUDIO_ITEMS;
  const visibleShaders = normalized
    ? SHADER_PRESETS.filter((s) => s.toLowerCase().includes(normalized))
    : SHADER_PRESETS;

  const handleSelect = (event: React.MouseEvent<HTMLAnchorElement>, label: string) => {
    event.preventDefault();
    setActiveItem(label);
    onNavigate?.(label);
  };

  const handlePrimaryAction = () => {
    setCtaConfirmed(true);
    onCtaClick?.('Enter Studio');
    window.setTimeout(() => setCtaConfirmed(false), 1800);
  };

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="drawer-menu-17"
        aria-label={triggerLabel}
        className="inline-flex items-center gap-2.5 rounded-lg border border-slate-700 bg-[#111318] px-4 py-2.5 text-sm font-medium text-slate-100 shadow-xs transition-colors hover:bg-[#1C2029] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 whitespace-nowrap"
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
          className={`fixed inset-0 bg-black/65 backdrop-blur-[3px] transition-opacity duration-200 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Floating Inset Rounded Container (detached 12px from edges) */}
        <aside
          id="drawer-menu-17"
          role="dialog"
          aria-modal="true"
          aria-label="Aperture 3D floating studio navigation"
          className={`fixed inset-y-3 left-3 flex w-[348px] max-w-[calc(88vw-12px)] flex-col rounded-2xl border border-white/15 bg-[#111318]/92 text-slate-100 backdrop-blur-xl shadow-2xl transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen ? 'translate-x-0' : '-translate-x-[calc(100%+24px)]'
          }`}
        >
          <div className="border-b border-white/10 px-5 pt-5 pb-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <a
                href="#aperture"
                onClick={(e) => handleSelect(e, 'Aperture 3D')}
                className="inline-flex items-center gap-2.5 text-sm font-semibold tracking-tight text-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" className="text-sky-400">
                  <path d="M12 2l9 5v10l-9 5-9-5V7l9-5z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span>Aperture 3D</span>
              </a>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close Aperture 3D navigation"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <label htmlFor="dm17-search" className="sr-only">
              Search panels and shaders
            </label>
            <div className="relative flex items-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" className="pointer-events-none absolute left-3 text-slate-400">
                <circle cx="11" cy="11" r="7" />
                <line x1="20" y1="20" x2="16" y2="16" />
              </svg>
              <input
                id="dm17-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search panels, shaders..."
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none"
              />
            </div>
          </div>

          <nav aria-label="3D workspace panels" className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
            {visibleItems.length === 0 && visibleShaders.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
                <p className="text-xs text-slate-400">No tools match &ldquo;{query}&rdquo;.</p>
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="mt-2 text-xs font-semibold text-sky-400 underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <>
                {visibleItems.length > 0 && (
                  <section aria-labelledby="dm17-panels">
                    <h2 id="dm17-panels" className="px-2.5 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Workspace
                    </h2>
                    <ul className="space-y-1">
                      {visibleItems.map((item) => {
                        const isActive = activeItem === item.label;
                        return (
                          <li key={item.label}>
                            <a
                              href={`#${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                              onClick={(e) => handleSelect(e, item.label)}
                              aria-current={isActive ? 'page' : undefined}
                              className={`flex min-h-[40px] items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors ${
                                isActive
                                  ? 'bg-sky-500/20 font-semibold text-sky-300'
                                  : 'text-slate-300 hover:bg-white/8 hover:text-white'
                              }`}
                            >
                              <span>{item.label}</span>
                              <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
                                {item.shortcut}
                              </kbd>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                )}

                {visibleShaders.length > 0 && (
                  <section aria-labelledby="dm17-shaders">
                    <h2 id="dm17-shaders" className="px-2.5 mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Library
                    </h2>
                    <button
                      type="button"
                      onClick={() => setShadersOpen((p) => !p)}
                      aria-expanded={normalized.length > 0 || shadersOpen}
                      className="flex min-h-[38px] w-full items-center justify-between rounded-xl px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-white/8"
                    >
                      <span>Shaders &amp; Scenes</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={`transition-transform ${normalized.length > 0 || shadersOpen ? 'rotate-90' : ''}`}>
                        <polyline points="9 6 15 12 9 18" />
                      </svg>
                    </button>
                    {(normalized.length > 0 || shadersOpen) && (
                      <ul className="mt-1 ml-3 space-y-0.5 border-l border-white/10 pl-3">
                        {visibleShaders.map((preset) => {
                          const isActive = activeItem === preset;
                          return (
                            <li key={preset}>
                              <a
                                href={`#${preset.toLowerCase().replace(/\s+/g, '-')}`}
                                onClick={(e) => handleSelect(e, preset)}
                                aria-current={isActive ? 'page' : undefined}
                                className={`flex min-h-[34px] items-center rounded-lg px-2.5 py-1 text-xs transition-colors ${
                                  isActive
                                    ? 'bg-sky-500/20 font-medium text-sky-300'
                                    : 'text-slate-400 hover:bg-white/8 hover:text-white'
                                }`}
                              >
                                {preset}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </section>
                )}
              </>
            )}
          </nav>

          <div className="border-t border-white/10 p-4 space-y-3">
            <div className="flex items-center gap-2.5 px-1">
              <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/20 text-xs font-semibold text-sky-300 ring-1 ring-sky-400/30">
                JD
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">Jules Dai</p>
                <p className="truncate text-[11px] text-slate-400">Lookdev Artist</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="w-full rounded-xl bg-sky-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-sky-300"
            >
              {ctaConfirmed ? 'Launching Viewport' : 'Enter Studio'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default DrawerMenu17;
