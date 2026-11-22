'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import {
  ArrowUpRight,
  BarChart3,
  Brush,
  Camera,
  Film,
  FolderOpen,
  Grid,
  Headphones,
  Megaphone,
  PenTool,
  Search,
  Share2,
  X,
} from 'lucide-react';

export interface ModalMenu5Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  triggerClassName?: string;
  onSelectRoute?: (href: string, label: string) => void;
}

interface BentoTile {
  label: string;
  caption: string;
  href: string;
  tileBg: string;
  featured?: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

const BENTO_PRIMARY: BentoTile[] = [
  {
    label: 'Vector Canvas',
    caption: 'Multi-artboard vector paths, boolean geometry, and live SVG export.',
    href: '#vector',
    tileBg: 'bg-[#2563EB]',
    featured: true,
    icon: PenTool,
  },
  {
    label: 'Motion Reel',
    caption: 'Timeline & keyframes',
    href: '#motion',
    tileBg: 'bg-[#F97316]',
    icon: Film,
  },
  {
    label: 'Color Lab',
    caption: 'Palettes & contrast',
    href: '#color-lab',
    tileBg: 'bg-[#E11D48]',
    icon: Brush,
  },
  {
    label: 'Photo Studio',
    caption: 'RAW toning & crops',
    href: '#photo',
    tileBg: 'bg-[#059669]',
    icon: Camera,
  },
  {
    label: 'Audio Desk',
    caption: 'Stems & mastering',
    href: '#audio',
    tileBg: 'bg-[#7C3AED]',
    icon: Headphones,
  },
  {
    label: 'Asset Vault',
    caption: 'Shared brand library',
    href: '#vault',
    tileBg: 'bg-[#D97706]',
    icon: FolderOpen,
  },
];

const PUBLISH_TOOLS: BentoTile[] = [
  {
    label: 'Campaigns',
    caption: 'Scheduled drops',
    href: '#campaigns',
    tileBg: 'bg-[#0284C7]',
    icon: Megaphone,
  },
  {
    label: 'Reach Metrics',
    caption: 'Audience analytics',
    href: '#reach',
    tileBg: 'bg-[#0D9488]',
    icon: BarChart3,
  },
  {
    label: 'Partner Share',
    caption: 'Client review links',
    href: '#share',
    tileBg: 'bg-[#DB2777]',
    icon: Share2,
  },
];

export function ModalMenu5({
  defaultOpen = false,
  triggerLabel = 'Open Bento Launcher',
  triggerClassName,
  onSelectRoute,
}: ModalMenu5Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const headingId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const q = query.trim().toLowerCase();
  const primaryFiltered = BENTO_PRIMARY.filter((t) =>
    !q ? true : `${t.label} ${t.caption}`.toLowerCase().includes(q)
  );
  const publishFiltered = PUBLISH_TOOLS.filter((t) =>
    !q ? true : `${t.label} ${t.caption}`.toLowerCase().includes(q)
  );

  const closeMenu = () => {
    setIsOpen(false);
    setQuery('');
    setTimeout(() => triggerRef.current?.focus(), 0);
  };

  const handleSelect = (href: string, label: string) => {
    onSelectRoute?.(href, label);
    closeMenu();
  };

  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add('overflow-hidden');
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 10);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.classList.remove('overflow-hidden');
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          triggerClassName ??
          'inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 whitespace-nowrap shrink-0'
        }
      >
        <Grid className="h-4 w-4" aria-hidden="true" />
        <span>{triggerLabel}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeMenu();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            className="w-full max-w-[640px] max-h-[85vh] flex flex-col overflow-hidden rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
              <div>
                <h2
                  id={headingId}
                  className="text-lg font-bold tracking-tight text-slate-900"
                >
                  Creative Suite Bento
                </h2>
                <p className="text-xs text-slate-500">
                  Asymmetric studio workspace launcher
                </p>
              </div>
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close bento launcher"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="border-b border-slate-100 px-6 py-3">
              <div className="flex items-center gap-2.5 rounded-xl bg-slate-100 px-3.5 py-2 focus-within:ring-2 focus-within:ring-[#2563EB]">
                <Search
                  className="h-4 w-4 shrink-0 text-slate-400"
                  aria-hidden="true"
                />
                <label htmlFor={`${headingId}-search`} className="sr-only">
                  Search creative tools
                </label>
                <input
                  ref={inputRef}
                  id={`${headingId}-search`}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search studio apps and channels..."
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <nav
              aria-label="Creative suite bento launcher"
              className="flex-1 overflow-y-auto p-6 space-y-6"
            >
              {primaryFiltered.length === 0 && publishFiltered.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  No creative tools matching &ldquo;{query}&rdquo;
                </div>
              ) : (
                <>
                  {primaryFiltered.length > 0 && (
                    <section aria-label="Create and Edit">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                        Create &amp; Edit
                      </h3>
                      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {primaryFiltered.map((app, index) => {
                          const Icon = app.icon;
                          const isHero = app.featured && !q;
                          const isTrailingMobile =
                            !q && index === primaryFiltered.length - 1;
                          return (
                            <li
                              key={app.label}
                              className={
                                isHero
                                  ? 'col-span-2 sm:row-span-2'
                                  : isTrailingMobile
                                    ? 'col-span-2 sm:col-span-1'
                                    : 'col-span-1'
                              }
                            >
                              <a
                                href={app.href}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleSelect(app.href, app.label);
                                }}
                                className={`group flex h-full flex-col justify-between rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                                  isHero
                                    ? 'border-[#1D4ED8]/20 bg-[#EFF6FF] p-5 hover:border-[#2563EB]'
                                    : 'border-slate-100 bg-slate-50/70 p-3.5 hover:bg-white hover:border-slate-300 hover:shadow-sm'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <span
                                    className={`flex items-center justify-center rounded-xl text-white shadow-xs transition-transform duration-150 group-hover:scale-105 ${app.tileBg} ${
                                      isHero ? 'h-12 w-12' : 'h-10 w-10'
                                    }`}
                                  >
                                    <Icon className="h-5 w-5" aria-hidden="true" />
                                  </span>
                                  {isHero && (
                                    <ArrowUpRight
                                      className="h-4 w-4 text-[#2563EB]"
                                      aria-hidden="true"
                                    />
                                  )}
                                </div>
                                <div className="mt-3">
                                  <span
                                    className={`block font-bold text-slate-900 leading-tight ${
                                      isHero ? 'text-base' : 'text-sm'
                                    }`}
                                  >
                                    {app.label}
                                  </span>
                                  <span className="mt-1 block text-xs text-slate-600 leading-snug">
                                    {app.caption}
                                  </span>
                                </div>
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  )}

                  {publishFiltered.length > 0 && (
                    <section
                      aria-label="Publish and Measure"
                      className="border-t border-slate-100 pt-5"
                    >
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                        Publish &amp; Measure
                      </h3>
                      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {publishFiltered.map((tool) => {
                          const Icon = tool.icon;
                          return (
                            <li key={tool.label}>
                              <a
                                href={tool.href}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleSelect(tool.href, tool.label);
                                }}
                                className="group flex min-h-[54px] items-center gap-3 rounded-xl border border-slate-100 bg-white px-3.5 py-2.5 hover:border-slate-300 hover:shadow-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                              >
                                <span
                                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white ${tool.tileBg}`}
                                >
                                  <Icon className="h-4 w-4" aria-hidden="true" />
                                </span>
                                <span className="min-w-0">
                                  <span className="block text-sm font-semibold text-slate-900 leading-tight">
                                    {tool.label}
                                  </span>
                                  <span className="block text-[11px] text-slate-500 leading-snug">
                                    {tool.caption}
                                  </span>
                                </span>
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
          </div>
        </div>
      )}
    </>
  );
}

export default ModalMenu5;
