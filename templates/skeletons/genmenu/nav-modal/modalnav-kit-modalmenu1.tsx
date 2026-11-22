'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Command,
  CornerDownLeft,
  FolderGit2,
  KeyRound,
  Layers,
  LayoutDashboard,
  Rocket,
  Search,
  Server,
  Settings,
  Terminal,
  X,
} from 'lucide-react';

export interface ModalMenu1Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  triggerClassName?: string;
  onSelectRoute?: (href: string, label: string) => void;
}

interface CommandItem {
  id: string;
  label: string;
  path: string;
  href: string;
  shortcut: string[];
  icon: React.ComponentType<{ className?: string }>;
}

interface CommandGroup {
  heading: string;
  items: CommandItem[];
}

const COMMAND_GROUPS: CommandGroup[] = [
  {
    heading: 'Navigation',
    items: [
      {
        id: 'overview',
        label: 'Workspace Overview',
        path: '/overview',
        href: '#overview',
        shortcut: ['G', 'O'],
        icon: LayoutDashboard,
      },
      {
        id: 'deployments',
        label: 'Deployments',
        path: '/deployments',
        href: '#deployments',
        shortcut: ['G', 'D'],
        icon: Rocket,
      },
      {
        id: 'repositories',
        label: 'Repositories',
        path: '/repositories',
        href: '#repositories',
        shortcut: ['G', 'R'],
        icon: FolderGit2,
      },
    ],
  },
  {
    heading: 'Infrastructure',
    items: [
      {
        id: 'clusters',
        label: 'Compute Clusters',
        path: '/infra/clusters',
        href: '#clusters',
        shortcut: ['G', 'C'],
        icon: Server,
      },
      {
        id: 'logs',
        label: 'Runtime Console',
        path: '/infra/console',
        href: '#console',
        shortcut: ['G', 'L'],
        icon: Terminal,
      },
      {
        id: 'secrets',
        label: 'Environment Secrets',
        path: '/infra/secrets',
        href: '#secrets',
        shortcut: ['G', 'E'],
        icon: KeyRound,
      },
    ],
  },
  {
    heading: 'Documentation',
    items: [
      {
        id: 'guides',
        label: 'Architecture Guides',
        path: '/docs/architecture',
        href: '#architecture',
        shortcut: ['D', 'A'],
        icon: Layers,
      },
      {
        id: 'reference',
        label: 'CLI & API Reference',
        path: '/docs/reference',
        href: '#reference',
        shortcut: ['D', 'R'],
        icon: BookOpen,
      },
      {
        id: 'preferences',
        label: 'Workspace Preferences',
        path: '/settings',
        href: '#settings',
        shortcut: ['G', ','],
        icon: Settings,
      },
    ],
  },
];

export function ModalMenu1({
  defaultOpen = false,
  triggerLabel = 'Open Command Menu',
  triggerClassName,
  onSelectRoute,
}: ModalMenu1Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const headingId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredGroups = COMMAND_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (!normalizedQuery) return true;
      return `${item.label} ${item.path} ${group.heading}`
        .toLowerCase()
        .includes(normalizedQuery);
    }),
  })).filter((group) => group.items.length > 0);

  const flatItems = filteredGroups.flatMap((group) => group.items);

  const closeMenu = () => {
    setIsOpen(false);
    setQuery('');
    setActiveIndex(0);
    setTimeout(() => triggerRef.current?.focus(), 0);
  };

  const handleSelect = (item: CommandItem) => {
    onSelectRoute?.(item.href, item.label);
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

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (flatItems.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % flatItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = flatItems[activeIndex];
      if (target) handleSelect(target);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          triggerClassName ??
          'inline-flex items-center gap-2.5 rounded-lg bg-[#0B0D12] px-4 py-2.5 text-sm font-medium text-slate-100 border border-slate-800 hover:border-sky-500/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 whitespace-nowrap shrink-0'
        }
      >
        <Command className="h-4 w-4 text-sky-400" aria-hidden="true" />
        <span>{triggerLabel}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeMenu();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            className="w-full max-w-[580px] max-h-[85vh] flex flex-col overflow-hidden rounded-xl bg-[#0B0D12] text-slate-100 border border-[#232838] shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3 px-4 pt-3.5 pb-2 border-b border-[#1A1F2E]">
              <h2
                id={headingId}
                className="text-xs font-semibold tracking-wider uppercase text-slate-400"
              >
                Command Navigation
              </h2>
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close command menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-[#171C28] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1A1F2E]">
              <Search
                className="h-4 w-4 shrink-0 text-sky-400"
                aria-hidden="true"
              />
              <label htmlFor={`${headingId}-search`} className="sr-only">
                Search routes and commands
              </label>
              <input
                ref={inputRef}
                id={`${headingId}-search`}
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleInputKeyDown}
                placeholder="Jump to a route, cluster, or guide..."
                className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />
              <kbd className="hidden sm:inline-flex items-center rounded border border-slate-700 bg-[#141824] px-1.5 py-0.5 font-mono text-[11px] text-slate-400">
                ESC
              </kbd>
            </div>

            <nav
              aria-label="Command palette navigation"
              className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4"
            >
              {filteredGroups.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">
                  No routes matching &ldquo;{query}&rdquo;
                </div>
              ) : (
                filteredGroups.map((group) => (
                  <section key={group.heading} aria-label={group.heading}>
                    <h3 className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      {group.heading}
                    </h3>
                    <ul className="space-y-1">
                      {group.items.map((item) => {
                        const itemFlatIndex = flatItems.findIndex(
                          (f) => f.id === item.id
                        );
                        const isActive = itemFlatIndex === activeIndex;
                        const Icon = item.icon;
                        return (
                          <li key={item.id}>
                            <a
                              href={item.href}
                              onMouseEnter={() => setActiveIndex(itemFlatIndex)}
                              onClick={(e) => {
                                e.preventDefault();
                                handleSelect(item);
                              }}
                              className={`group flex min-h-[44px] items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                                isActive
                                  ? 'bg-[#171C28] text-white'
                                  : 'text-slate-300 hover:bg-[#141824] hover:text-white'
                              }`}
                            >
                              <span className="flex items-center gap-3 min-w-0">
                                <Icon
                                  className={`h-4 w-4 shrink-0 ${
                                    isActive ? 'text-sky-400' : 'text-slate-400'
                                  }`}
                                  aria-hidden="true"
                                />
                                <span className="font-medium truncate">
                                  {item.label}
                                </span>
                                <span className="hidden sm:inline font-mono text-xs text-slate-500 truncate">
                                  {item.path}
                                </span>
                              </span>
                              <span className="flex items-center gap-1.5 shrink-0">
                                {item.shortcut.map((key) => (
                                  <kbd
                                    key={key}
                                    className="inline-flex min-w-[22px] items-center justify-center rounded border border-[#2A3145] bg-[#0F131D] px-1.5 py-0.5 font-mono text-[11px] text-slate-400"
                                  >
                                    {key}
                                  </kbd>
                                ))}
                                <ArrowRight
                                  className={`h-3.5 w-3.5 transition-opacity ${
                                    isActive
                                      ? 'opacity-100 text-sky-400'
                                      : 'opacity-0'
                                  }`}
                                  aria-hidden="true"
                                />
                              </span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))
              )}
            </nav>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1A1F2E] bg-[#080A0E] px-4 py-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5">
                  <kbd className="rounded border border-slate-700 bg-[#141824] px-1.5 py-0.5 font-mono text-[10px]">
                    ↑↓
                  </kbd>
                  <span>Navigate</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <kbd className="inline-flex items-center rounded border border-slate-700 bg-[#141824] px-1.5 py-0.5 font-mono text-[10px]">
                    <CornerDownLeft className="h-3 w-3" aria-hidden="true" />
                  </kbd>
                  <span>Open</span>
                </span>
              </div>
              <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                {flatItems.length} routes available
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ModalMenu1;
