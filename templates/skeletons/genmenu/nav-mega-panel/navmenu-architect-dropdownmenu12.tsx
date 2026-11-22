'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Building2,
  ChevronDown,
  CreditCard,
  Globe2,
  Landmark,
  Layers,
  Receipt,
  Repeat,
  Search,
  ShieldCheck,
  Wallet,
  X,
} from 'lucide-react';

export interface DropdownMenu12Props {
  onNavigate?: (label: string) => void;
  forceOpen?: boolean;
}

type AudienceMode = 'startups' | 'enterprise';

const AUDIENCE_COLUMNS: Record<
  AudienceMode,
  Array<{
    heading: string;
    items: Array<{ label: string; desc: string; icon: React.ComponentType<{ className?: string }>; href: string }>;
  }>
> = {
  startups: [
    {
      heading: 'Accept Payments',
      items: [
        { label: 'Hosted Checkout', desc: 'Drop-in conversion links', icon: CreditCard, href: '#checkout' },
        { label: 'Recurring Billing', desc: 'Usage & seat subscriptions', icon: Repeat, href: '#billing' },
      ],
    },
    {
      heading: 'Launch & Incorporate',
      items: [
        { label: 'Business Banking', desc: 'FDIC-insured founder accounts', icon: Landmark, href: '#banking' },
        { label: 'Automated Invoices', desc: 'Tax-ready PDF billing', icon: Receipt, href: '#invoices' },
      ],
    },
    {
      heading: 'Developer Stack',
      items: [
        { label: 'Webhooks SDK', desc: 'Typed event delivery', icon: Layers, href: '#webhooks' },
        { label: 'Sandbox Emulator', desc: 'Deterministic card tests', icon: ShieldCheck, href: '#sandbox' },
      ],
    },
  ],
  enterprise: [
    {
      heading: 'Global Treasury',
      items: [
        { label: 'Multi-Entity Ledger', desc: 'Automated FX reconciliation', icon: Globe2, href: '#ledger' },
        { label: 'Instant Payout Rails', desc: 'SEPA, FedNow & local clearing', icon: Wallet, href: '#payouts' },
      ],
    },
    {
      heading: 'Platform & Marketplaces',
      items: [
        { label: 'Split Settlements', desc: 'Escrow & vendor onboarding', icon: Building2, href: '#splits' },
        { label: 'Interchange Optimization', desc: 'Network token routing', icon: CreditCard, href: '#routing' },
      ],
    },
    {
      heading: 'Risk & Compliance',
      items: [
        { label: '3DS2 Orchestration', desc: 'Adaptive SCA exemptions', icon: ShieldCheck, href: '#3ds2' },
        { label: 'ERP Connectors', desc: 'NetSuite & SAP sync', icon: Layers, href: '#erp' },
      ],
    },
  ],
};

export function DropdownMenu12({ onNavigate, forceOpen }: DropdownMenu12Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [audience, setAudience] = useState<AudienceMode>('startups');
  const [query, setQuery] = useState('');
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  const openVisible = forceOpen ?? isOpen;
  const q = query.trim().toLowerCase();
  const activeCols = AUDIENCE_COLUMNS[audience].map((col) => ({
    ...col,
    items: col.items.filter(
      (item) => item.label.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q),
    ),
  }));

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
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

  const cancelClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  };

  const handleTriggerEnter = () => {
    cancelClose();
    setIsOpen(true);
  };

  const handleRegionLeave = () => {
    if (isPinned) return;
    if (headerRef.current?.contains(document.activeElement)) return;
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
    <header
      ref={headerRef}
      onMouseLeave={handleRegionLeave}
      className="relative z-20 w-full border-b border-slate-200 bg-white text-slate-900"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-6">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.('Helios Pay Home');
          }}
          className="font-display text-lg font-bold tracking-tight text-blue-700 whitespace-nowrap shrink-0"
        >
          Helios Pay
        </a>

        <nav aria-label="Primary Navigation" className="flex items-center gap-7">
          <ul className="flex items-center gap-7 text-sm font-medium text-slate-600">
            <li>
              <a
                href="#pricing"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Pricing');
                }}
                className="transition-colors hover:text-blue-700 whitespace-nowrap shrink-0"
              >
                Pricing
              </a>
            </li>
            <li>
              <a
                href="#developers"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Developers');
                }}
                className="transition-colors hover:text-blue-700 whitespace-nowrap shrink-0"
              >
                Developers
              </a>
            </li>
            <li>
              <div onMouseEnter={handleTriggerEnter}>
                <button
                  type="button"
                  aria-expanded={openVisible}
                  aria-haspopup="true"
                  onClick={handleTriggerClick}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                    openVisible
                      ? 'bg-blue-700 text-white'
                      : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                  }`}
                >
                  <span>Solutions</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-150 ${
                      openVisible ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>
            </li>
          </ul>
        </nav>
      </div>

      {openVisible && (
        <div
          onMouseEnter={cancelClose}
          className="absolute left-0 right-0 top-full z-30 w-full border-b border-slate-200 bg-white shadow-xl shadow-slate-900/5"
        >
          {/* Audience Switcher + Live Search Toolbar */}
          <div className="border-b border-slate-100 bg-slate-50/80">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-3">
              <div
                role="group"
                aria-label="Audience mode"
                className="inline-flex items-center gap-1 rounded-lg bg-slate-200/70 p-1"
              >
                <button
                  type="button"
                  onClick={() => setAudience('startups')}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                    audience === 'startups'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Startups
                </button>
                <button
                  type="button"
                  onClick={() => setAudience('enterprise')}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                    audience === 'enterprise'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Enterprise
                </button>
              </div>

              <div className="relative w-72">
                <label htmlFor="helios-search" className="sr-only">
                  Search payment solutions
                </label>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  id="helios-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${audience} tools...`}
                  className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-7 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none"
                />
                {query && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-12 gap-8 px-6 py-7">
            <div className="col-span-8 grid grid-cols-3 gap-6">
              {activeCols.map((col) => (
                <div key={col.heading}>
                  <h3 className="mb-3 text-xs font-semibold tracking-wide text-slate-500">
                    {col.heading}
                  </h3>
                  {col.items.length === 0 ? (
                    <p className="text-xs text-slate-400">No matches.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {col.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <li key={item.label}>
                            <a
                              href={item.href}
                              onClick={(e) => {
                                e.preventDefault();
                                onNavigate?.(item.label);
                                setIsOpen(false);
                                setIsPinned(false);
                              }}
                              className="group flex items-start gap-2.5 rounded-lg p-2 transition-colors hover:bg-blue-50/70"
                            >
                              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700 transition-colors group-hover:bg-blue-700 group-hover:text-white">
                                <Icon className="h-3.5 w-3.5" />
                              </span>
                              <span className="min-w-0">
                                <span className="block text-sm font-semibold text-slate-900">
                                  {item.label}
                                </span>
                                <span className="block text-xs text-slate-500">{item.desc}</span>
                              </span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            <div className="col-span-4">
              <h3 className="mb-3 text-xs font-semibold tracking-wide text-slate-500">
                Featured Integration
              </h3>
              <div className="flex h-[calc(100%-1.75rem)] flex-col justify-between rounded-xl bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 p-5 text-white">
                <div>
                  <p className="text-xs font-medium text-blue-200">
                    {audience === 'startups' ? 'Founder Bundle' : 'Treasury Suite'}
                  </p>
                  <p className="mt-1 font-display text-lg font-bold leading-snug">
                    {audience === 'startups'
                      ? 'Zero-Fee First $50k Processing'
                      : 'Sub-Second Cross-Border Clearing'}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-blue-100">
                    {audience === 'startups'
                      ? 'Launch billing, banking, and tax compliance with one SDK.'
                      : 'Direct settlement across 44 currencies with real-time ledgering.'}
                  </p>
                </div>
                <a
                  href="#featured"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate?.(
                      audience === 'startups' ? 'Claim Founder Bundle' : 'Request Treasury Demo',
                    );
                    setIsOpen(false);
                    setIsPinned(false);
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-white hover:underline"
                >
                  <span>{audience === 'startups' ? 'Activate Credit' : 'Speak with Treasury'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default DropdownMenu12;
