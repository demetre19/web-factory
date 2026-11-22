'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import {
  Activity,
  Boxes,
  Cloud,
  Cpu,
  Database,
  FileText,
  HelpCircle,
  Keyboard,
  LayoutGrid,
  Lock,
  Search,
  Shield,
  Users,
  X,
} from 'lucide-react';

export interface ModalMenu10Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  triggerClassName?: string;
  onSelectRoute?: (href: string, label: string) => void;
}

interface DarkModuleTile {
  label: string;
  subtitle: string;
  href: string;
  accentText: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DarkModuleGroup {
  heading: string;
  items: DarkModuleTile[];
}

const MODULE_GROUPS: DarkModuleGroup[] = [
  {
    heading: 'Core Modules',
    items: [
      {
        label: 'Compute',
        subtitle: 'Nodes & containers',
        href: '#compute',
        accentText: 'text-emerald-400',
        icon: Cpu,
      },
      {
        label: 'Datastores',
        subtitle: 'SQL & object storage',
        href: '#datastores',
        accentText: 'text-sky-400',
        icon: Database,
      },
      {
        label: 'Edge Mesh',
        subtitle: 'Global routing',
        href: '#edge-mesh',
        accentText: 'text-teal-400',
        icon: Cloud,
      },
      {
        label: 'Telemetry',
        subtitle: 'Traces & metrics',
        href: '#telemetry',
        accentText: 'text-amber-400',
        icon: Activity,
      },
    ],
  },
  {
    heading: 'Operations & Governance',
    items: [
      {
        label: 'Registries',
        subtitle: 'Container artifacts',
        href: '#registries',
        accentText: 'text-sky-400',
        icon: Boxes,
      },
      {
        label: 'IAM Roles',
        subtitle: 'Team permissions',
        href: '#iam',
        accentText: 'text-emerald-400',
        icon: Users,
      },
      {
        label: 'Vault KMS',
        subtitle: 'Encryption keys',
        href: '#vault-kms',
        accentText: 'text-teal-400',
        icon: Lock,
      },
      {
        label: 'Compliance',
        subtitle: 'Policy audits',
        href: '#compliance',
        accentText: 'text-amber-400',
        icon: Shield,
      },
    ],
  },
];

const UTILITY_LINKS = [
  { label: 'Documentation', href: '#docs', icon: FileText },
  { label: 'Help Center', href: '#help', icon: HelpCircle },
  { label: 'Shortcuts', href: '#shortcuts', icon: Keyboard },
];

export function ModalMenu10({
  defaultOpen = false,
  triggerLabel = 'Open Console Grid',
  triggerClassName,
  onSelectRoute,
}: ModalMenu10Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const headingId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const normalized = query.trim().toLowerCase();
  const filteredGroups = MODULE_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      !normalized
        ? true
        : `${item.label} ${item.subtitle} ${group.heading}`
            .toLowerCase()
            .includes(normalized)
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
          'inline-flex items-center gap-2 rounded-lg bg-[#090D16] px-4 py-2.5 text-sm font-medium text-slate-100 border border-slate-800 hover:border-emerald-500/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 whitespace-nowrap shrink-0'
        }
      >
        <LayoutGrid className="h-4 w-4 text-emerald-400" aria-hidden="true" />
        <span>{triggerLabel}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeMenu();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            className="w-full max-w-[620px] max-h-[85vh] flex flex-col overflow-hidden rounded-xl bg-[#090D16] text-slate-100 border border-slate-800 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 px-5 py-4">
              <h2
                id={headingId}
                className="text-base font-semibold tracking-tight text-white"
              >
                Console Module Launcher
              </h2>
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close console launcher"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="border-b border-slate-800/80 px-5 py-3">
              <div className="flex items-center gap-2.5 rounded-lg border border-slate-800 bg-[#111827] px-3 py-2 focus-within:border-emerald-500/60">
                <Search
                  className="h-4 w-4 shrink-0 text-slate-400"
                  aria-hidden="true"
                />
                <label htmlFor={`${headingId}-search`} className="sr-only">
                  Filter console modules
                </label>
                <input
                  ref={inputRef}
                  id={`${headingId}-search`}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter console modules..."
                  className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <nav
              aria-label="Console module launcher"
              className="flex-1 overflow-y-auto p-5 space-y-6"
            >
              {filteredGroups.length === 0 ? (
                <div className="rounded-lg border border-slate-800 bg-[#0F1623] py-10 text-center text-sm text-slate-400">
                  No console modules matching &ldquo;{query}&rdquo;
                </div>
              ) : (
                filteredGroups.map((group) => (
                  <section key={group.heading} aria-label={group.heading}>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                      {group.heading}
                    </h3>
                    <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                              className="group flex h-full flex-col justify-between rounded-lg border border-slate-800 bg-[#111827] p-3.5 hover:border-emerald-500/50 hover:bg-[#161F30] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                            >
                              <Icon
                                className={`h-5 w-5 ${item.accentText}`}
                                aria-hidden="true"
                              />
                              <div className="mt-3">
                                <span className="block text-sm font-semibold text-slate-100 group-hover:text-white">
                                  {item.label}
                                </span>
                                <span className="mt-0.5 block text-[11px] text-slate-400 leading-snug">
                                  {item.subtitle}
                                </span>
                              </div>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))
              )}

              <section
                aria-label="Console Utilities"
                className="border-t border-slate-800/80 pt-4"
              >
                <h3 className="sr-only">Console Utilities</h3>
                <ul className="flex flex-wrap items-center gap-4">
                  {UTILITY_LINKS.map((util) => {
                    const Icon = util.icon;
                    return (
                      <li key={util.label}>
                        <a
                          href={util.href}
                          onClick={(e) => {
                            e.preventDefault();
                            handleSelect(util.href, util.label);
                          }}
                          className="inline-flex min-h-[36px] items-center gap-2 text-xs font-medium text-slate-400 hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-md px-1"
                        >
                          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{util.label}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

export default ModalMenu10;
