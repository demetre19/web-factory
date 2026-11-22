'use client';

import React, { useEffect, useState } from 'react';

export interface DrawerMenu20Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  onNavigate?: (label: string) => void;
  onCtaClick?: (label: string) => void;
}

const SHOW_CHANNELS = [
  { label: 'Channel 1 · Live Mix', href: '#channel-1' },
  { label: 'Channel 2 · Ambient', href: '#channel-2' },
  { label: 'Interview Archive', href: '#interviews' },
];

const FEATURED_EPISODES = [
  'Ep 42 · Spatial Typography',
  'Ep 41 · Tape Loops in Kyoto',
  'Ep 40 · Modular Synth Craft',
];

export function DrawerMenu20({
  defaultOpen = false,
  triggerLabel = 'Open DrawerMenu20',
  onNavigate,
  onCtaClick,
}: DrawerMenu20Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const [episodesOpen, setEpisodesOpen] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeItem, setActiveItem] = useState('Channel 1 · Live Mix');
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
  const visibleChannels = normalized
    ? SHOW_CHANNELS.filter((c) => c.label.toLowerCase().includes(normalized))
    : SHOW_CHANNELS;
  const visibleEpisodes = normalized
    ? FEATURED_EPISODES.filter((ep) => ep.toLowerCase().includes(normalized))
    : FEATURED_EPISODES;

  const handleSelect = (event: React.MouseEvent<HTMLAnchorElement>, label: string) => {
    event.preventDefault();
    setActiveItem(label);
    onNavigate?.(label);
  };

  const handlePrimaryAction = () => {
    setCtaConfirmed(true);
    setIsPlaying(true);
    onCtaClick?.('Listen Live');
    window.setTimeout(() => setCtaConfirmed(false), 1800);
  };

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="drawer-menu-20"
        aria-label={triggerLabel}
        className="inline-flex items-center gap-2.5 rounded-lg bg-[#311042] px-4 py-2.5 text-sm font-semibold text-[#FAF5FF] shadow-xs transition-colors hover:bg-[#43185A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FB7185] whitespace-nowrap"
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
          className={`fixed inset-0 bg-[#14071C]/65 backdrop-blur-[2px] transition-opacity duration-200 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <aside
          id="drawer-menu-20"
          role="dialog"
          aria-modal="true"
          aria-label="Subwave FM radio navigation"
          className={`fixed inset-y-0 left-0 flex w-[380px] max-w-[88vw] flex-col border-r border-white/15 bg-[#311042] text-[#FAF5FF] shadow-2xl transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="border-b border-white/15 px-5 pt-5 pb-4 space-y-4">
            <div className="flex items-center justify-between">
              <a
                href="#subwave"
                onClick={(e) => handleSelect(e, 'Subwave FM')}
                className="inline-flex items-center gap-2.5 text-base font-bold tracking-tight text-white"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="text-[#FB7185]">
                  <path d="M2 12h3l2-6 4 12 3-8 2 2h6" />
                </svg>
                <span>Subwave FM</span>
              </a>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close Subwave FM navigation"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <label htmlFor="dm20-search" className="sr-only">
              Search shows and episodes
            </label>
            <div className="relative flex items-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" className="pointer-events-none absolute left-3 text-purple-200">
                <circle cx="11" cy="11" r="7" />
                <line x1="20" y1="20" x2="16" y2="16" />
              </svg>
              <input
                id="dm20-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search shows, episodes, DJs..."
                className="w-full rounded-lg border border-white/15 bg-black/25 py-2 pl-9 pr-3 text-sm text-white placeholder:text-purple-200/70 focus:border-[#FB7185] focus:outline-none"
              />
            </div>
          </div>

          <nav aria-label="Radio channels and episodes" className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
            {visibleChannels.length === 0 && visibleEpisodes.length === 0 ? (
              <div className="rounded-lg bg-black/20 p-5 text-center">
                <p className="text-sm text-purple-200">No shows match &ldquo;{query}&rdquo;.</p>
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="mt-2 text-xs font-semibold text-[#FB7185] underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <>
                {visibleChannels.length > 0 && (
                  <section aria-labelledby="dm20-channels">
                    <h2 id="dm20-channels" className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-purple-200/70">
                      Broadcast
                    </h2>
                    <ul className="space-y-1">
                      {visibleChannels.map((channel) => {
                        const isActive = activeItem === channel.label;
                        return (
                          <li key={channel.label}>
                            <a
                              href={channel.href}
                              onClick={(e) => handleSelect(e, channel.label)}
                              aria-current={isActive ? 'page' : undefined}
                              className={`flex min-h-[42px] items-center rounded-lg px-3 py-2 text-sm transition-colors ${
                                isActive
                                  ? 'bg-[#FB7185] font-semibold text-slate-950'
                                  : 'text-purple-100 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              {channel.label}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                )}

                {visibleEpisodes.length > 0 && (
                  <section aria-labelledby="dm20-episodes">
                    <h2 id="dm20-episodes" className="sr-only">
                      Recent Episodes
                    </h2>
                    <button
                      type="button"
                      onClick={() => setEpisodesOpen((p) => !p)}
                      aria-expanded={normalized.length > 0 || episodesOpen}
                      className="flex min-h-[38px] w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-purple-200/80 hover:bg-white/10"
                    >
                      <span>Recent Episodes</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={`transition-transform ${normalized.length > 0 || episodesOpen ? 'rotate-90' : ''}`}>
                        <polyline points="9 6 15 12 9 18" />
                      </svg>
                    </button>

                    {(normalized.length > 0 || episodesOpen) && (
                      <ul className="mt-1.5 ml-3 space-y-1 border-l border-white/15 pl-3">
                        {visibleEpisodes.map((ep) => {
                          const isActive = activeItem === ep;
                          return (
                            <li key={ep}>
                              <a
                                href={`#${ep.toLowerCase().replace(/\s+/g, '-')}`}
                                onClick={(e) => handleSelect(e, ep)}
                                aria-current={isActive ? 'page' : undefined}
                                className={`flex min-h-[36px] items-center rounded-md px-2.5 py-1 text-sm transition-colors ${
                                  isActive
                                    ? 'bg-white/15 font-semibold text-[#FDA4AF]'
                                    : 'text-purple-200 hover:bg-white/10 hover:text-white'
                                }`}
                              >
                                {ep}
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

          {/* Mini Audio Player Strip + Primary CTA + Social */}
          <div className="border-t border-white/15 bg-[#240B31] px-5 py-4 space-y-3.5">
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/25 px-3 py-2.5">
              <div className="min-w-0 pr-3">
                <p className="truncate text-xs font-semibold text-white">
                  Ep 42 · Spatial Typography
                </p>
                <p className="text-[11px] text-purple-200/75">
                  {isPlaying ? 'Playing stream' : 'Paused · 48:12'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                aria-label={isPlaying ? 'Pause episode stream' : 'Play episode stream'}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FB7185] text-slate-950 transition-colors hover:bg-[#FDA4AF]"
              >
                {isPlaying ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <rect x="6" y="5" width="4" height="14" />
                    <rect x="14" y="5" width="4" height="14" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <polygon points="6 4 20 12 6 20 6 4" />
                  </svg>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrimaryAction}
              className="w-full rounded-lg bg-[#FB7185] px-4 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-[#FDA4AF]"
            >
              {ctaConfirmed ? 'Stream Connected' : 'Listen Live'}
            </button>

            <div className="flex items-center justify-between text-xs text-purple-200/80">
              <span>24h Independent Broadcast</span>
              <div className="flex items-center gap-3">
                <a href="#rss" onClick={(e) => handleSelect(e, 'Podcast RSS')} aria-label="Subwave Podcast RSS" className="p-1 hover:text-white">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                    <path d="M4 11a9 9 0 0 1 9 9" />
                    <path d="M4 4a16 16 0 0 1 16 16" />
                    <circle cx="5" cy="19" r="1" fill="currentColor" />
                  </svg>
                </a>
                <a href="#community" onClick={(e) => handleSelect(e, 'Listener Chat')} aria-label="Subwave Listener Chat" className="p-1 hover:text-white">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
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

export default DrawerMenu20;
