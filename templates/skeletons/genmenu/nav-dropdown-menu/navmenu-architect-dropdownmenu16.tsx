'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Diamond, Gem, Lamp, Search, Sparkles, X } from 'lucide-react';

export interface DropdownMenu16Props {
  onNavigate?: (label: string) => void;
  forceOpen?: boolean;
}

const BENTO_TILES = [
  { label: 'Blown Vessels', sub: 'Hand-spun borosilicate', icon: Lamp, href: '#vessels' },
  { label: 'Prism Lenses', sub: 'Dichroic optical glass', icon: Diamond, href: '#lenses' },
  { label: 'Pendant Shades', sub: 'Architectural lighting', icon: Sparkles, href: '#pendants' },
  { label: 'Cast Sculpture', sub: 'Kiln-formed editions', icon: Gem, href: '#sculpture' },
];

const SECONDARY_LINKS = [
  { label: 'Custom Architectural Commissions', href: '#commissions' },
  { label: 'Material Sample Box', href: '#samples' },
  { label: 'Care & Cleaning Guide', href: '#care' },
];

export function DropdownMenu16({ onNavigate, forceOpen }: DropdownMenu16Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [query, setQuery] = useState('');
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerWrapRef = useRef<HTMLDivElement>(null);

  const openVisible = forceOpen ?? isOpen;
  const q = query.trim().toLowerCase();
  const filteredTiles = BENTO_TILES.filter(
    (t) => t.label.toLowerCase().includes(q) || t.sub.toLowerCase().includes(q),
  );
  const filteredLinks = SECONDARY_LINKS.filter((l) => l.label.toLowerCase().includes(q));

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (headerWrapRef.current && !headerWrapRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsPinned(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setIsPinned(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (isPinned) return;
    if (headerWrapRef.current?.contains(document.activeElement)) return;
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 130);
  };

  const handleTriggerClick = () => {
    if (!isOpen || !isPinned) {
      setIsOpen(true);
      setIsPinned(true);
    } else {
      setIsOpen(false);
      setIsPinned(false);
    }
  };

  return (
    <header className="relative z-20 px-6 pt-4">
      <div
        ref={headerWrapRef}
        className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 rounded-full border border-white/70 bg-white/55 px-6 text-slate-900 shadow-lg shadow-rose-950/5 backdrop-blur-2xl"
      >
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.('Lumen Glassworks Home');
          }}
          className="font-display text-base font-bold tracking-tight text-slate-950 whitespace-nowrap shrink-0"
        >
          Lumen Glassworks
        </a>

        {/* Capsule Header Search */}
        <div className="relative hidden max-w-[210px] flex-1 md:block">
          <label htmlFor="lumen-search" className="sr-only">
            Search glassworks catalog
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <input
            id="lumen-search"
            type="search"
            value={query}
            onFocus={() => {
              setIsOpen(true);
              setIsPinned(true);
            }}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setIsPinned(true);
            }}
            placeholder="Search pieces..."
            className="w-full rounded-full border border-white/80 bg-white/60 py-1.5 pl-8 pr-7 text-xs text-slate-900 placeholder:text-slate-500 focus:bg-white focus:outline-none"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <nav aria-label="Primary Navigation" className="flex items-center gap-5">
          <ul className="flex items-center gap-5 text-sm font-medium text-slate-800">
            <li>
              <a
                href="#kiln"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('The Kiln');
                }}
                className="transition-colors hover:text-slate-950 whitespace-nowrap shrink-0"
              >
                The Kiln
              </a>
            </li>
            <li>
              <a
                href="#trade"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Trade Program');
                }}
                className="transition-colors hover:text-slate-950 whitespace-nowrap shrink-0"
              >
                Trade
              </a>
            </li>
            <li className="relative">
              <div
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  aria-expanded={openVisible}
                  aria-haspopup="true"
                  onClick={handleTriggerClick}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-all whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
                    openVisible
                      ? 'bg-slate-900 text-white'
                      : 'bg-white/75 text-slate-900 hover:bg-white'
                  }`}
                >
                  <span>Catalog</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-150 ${
                      openVisible ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openVisible && (
                  <div className="absolute right-0 top-full z-30 mt-3 w-[320px] rounded-3xl border border-white/75 bg-white/75 p-3 shadow-2xl shadow-rose-950/10 backdrop-blur-2xl">
                    {filteredTiles.length === 0 && filteredLinks.length === 0 ? (
                      <p className="py-4 text-center text-xs text-slate-600">
                        No pieces match &ldquo;{query}&rdquo;.
                      </p>
                    ) : (
                      <>
                        {filteredTiles.length > 0 && (
                          <div>
                            <h3 className="px-1 pb-2 text-[11px] font-semibold tracking-wide text-slate-500">
                              Collections
                            </h3>
                            <ul className="grid grid-cols-2 gap-2">
                              {filteredTiles.map((tile) => {
                                const Icon = tile.icon;
                                return (
                                  <li key={tile.label}>
                                    <a
                                      href={tile.href}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        onNavigate?.(tile.label);
                                        setIsOpen(false);
                                        setIsPinned(false);
                                      }}
                                      className="flex flex-col gap-2 rounded-2xl border border-white/70 bg-white/60 p-3 transition-colors hover:bg-white"
                                    >
                                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                                        <Icon className="h-3.5 w-3.5" />
                                      </span>
                                      <span>
                                        <span className="block text-xs font-bold text-slate-900">
                                          {tile.label}
                                        </span>
                                        <span className="block text-[11px] text-slate-600">
                                          {tile.sub}
                                        </span>
                                      </span>
                                    </a>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}

                        {filteredLinks.length > 0 && (
                          <div className="mt-2.5 border-t border-white/60 pt-2">
                            <h3 className="px-1 pb-1 text-[11px] font-semibold tracking-wide text-slate-500">
                              Trade Services
                            </h3>
                            <ul className="space-y-0.5">
                              {filteredLinks.map((link) => (
                                <li key={link.label}>
                                  <a
                                    href={link.href}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      onNavigate?.(link.label);
                                      setIsOpen(false);
                                      setIsPinned(false);
                                    }}
                                    className="block rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-800 transition-colors hover:bg-white/80"
                                  >
                                    {link.label}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default DropdownMenu16;
