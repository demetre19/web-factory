'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import {
  CreditCard,
  FileCode2,
  Home,
  Key,
  LifeBuoy,
  Search,
  Settings,
  ShieldAlert,
  UserCheck,
  Users,
  X,
} from 'lucide-react';

export interface ModalMenu9Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  triggerClassName?: string;
  onSelectRoute?: (href: string, label: string) => void;
}

interface QuickJumpTile {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MatrixLink {
  label: string;
  href: string;
  kbd: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MatrixGroup {
  heading: string;
  items: MatrixLink[];
}

const QUICK_JUMP: QuickJumpTile[] = [
  { label: 'Home', href: '#home', icon: Home },
  { label: 'Docs', href: '#docs', icon: FileCode2 },
  { label: 'Billing', href: '#billing', icon: CreditCard },
  { label: 'Support', href: '#support', icon: LifeBuoy },
];

const MATRIX_GROUPS: MatrixGroup[] = [
  {
    heading: 'Workspace Areas',
    items: [
      { label: 'Team Members', href: '#members', kbd: '1', icon: Users },
      { label: 'Role Permissions', href: '#roles', kbd: '2', icon: UserCheck },
      { label: 'General Settings', href: '#general', kbd: '3', icon: Settings },
    ],
  },
  {
    heading: 'Security & Keys',
    items: [
      { label: 'API Credentials', href: '#api-keys', kbd: '4', icon: Key },
      {
        label: 'Incident Alerts',
        href: '#alerts',
        kbd: '5',
        icon: ShieldAlert,
      },
      {
        label: 'Invoices & Tax IDs',
        href: '#invoices',
        kbd: '6',
        icon: CreditCard,
      },
    ],
  },
];

export function ModalMenu9({
  defaultOpen = false,
  triggerLabel = 'Open Quick Matrix',
  triggerClassName,
  onSelectRoute,
}: ModalMenu9Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const headingId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const normalized = query.trim().toLowerCase();
  const filteredGroups = MATRIX_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      !normalized
        ? true
        : `${item.label} ${group.heading}`.toLowerCase().includes(normalized)
    ),
  })).filter((group) => group.items.length > 0);

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
          'inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 border border-neutral-200 hover:bg-neutral-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 whitespace-nowrap shrink-0'
        }
      >
        <Search className="h-4 w-4 text-neutral-500" aria-hidden="true" />
        <span>{triggerLabel}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/45 backdrop-blur-xs p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeMenu();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            className="w-full max-w-[540px] max-h-[85vh] flex flex-col overflow-hidden rounded-xl bg-white text-neutral-900 border border-neutral-200 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-neutral-100 px-5 py-3.5">
              <h2
                id={headingId}
                className="text-sm font-semibold text-neutral-900"
              >
                Quick Jump Matrix
              </h2>
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close quick matrix"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center gap-2.5 border-b border-neutral-200 bg-neutral-50/60 px-5 py-3">
              <Search
                className="h-4 w-4 shrink-0 text-neutral-400"
                aria-hidden="true"
              />
              <label htmlFor={`${headingId}-filter`} className="sr-only">
                Filter workspace destinations
              </label>
              <input
                ref={inputRef}
                id={`${headingId}-filter`}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter workspace destinations..."
                className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
              />
            </div>

            <nav
              aria-label="Workspace quick jump"
              className="flex-1 overflow-y-auto p-5 space-y-5"
            >
              <section aria-label="Pinned Shortcuts">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2.5">
                  Pinned Shortcuts
                </h3>
                <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {QUICK_JUMP.map((tile) => {
                    const Icon = tile.icon;
                    return (
                      <li key={tile.label}>
                        <a
                          href={tile.href}
                          onClick={(e) => {
                            e.preventDefault();
                            handleSelect(tile.href, tile.label);
                          }}
                          className="flex min-h-[60px] flex-col items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50/50 px-2 py-2.5 text-xs font-medium text-neutral-700 hover:border-neutral-400 hover:bg-white hover:text-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                        >
                          <Icon
                            className="h-4 w-4 text-neutral-600"
                            aria-hidden="true"
                          />
                          <span>{tile.label}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </section>

              {filteredGroups.length === 0 ? (
                <div className="rounded-lg border border-dashed border-neutral-200 py-8 text-center text-sm text-neutral-500">
                  No workspace pages matched &ldquo;{query}&rdquo;
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
                  {filteredGroups.map((group) => (
                    <section key={group.heading} aria-label={group.heading}>
                      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                        {group.heading}
                      </h3>
                      <ul className="space-y-1">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          return (
                            <li key={item.label}>
                              <a
                                href={item.href}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleSelect(item.href, item.label);
                                }}
                                className="flex min-h-[40px] items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                              >
                                <span className="flex items-center gap-2.5 truncate">
                                  <Icon
                                    className="h-4 w-4 shrink-0 text-neutral-400"
                                    aria-hidden="true"
                                  />
                                  <span className="truncate font-medium">
                                    {item.label}
                                  </span>
                                </span>
                                <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-[10px] text-neutral-500">
                                  {item.kbd}
                                </kbd>
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  ))}
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

export default ModalMenu9;
