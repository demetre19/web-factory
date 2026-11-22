'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, Search, X } from 'lucide-react';

export interface DropdownMenu4Props {
  onNavigate?: (label: string) => void;
  forceOpen?: boolean;
}

const RESOURCE_GROUPS = [
  {
    heading: 'Documentation',
    links: [
      { label: 'Quickstart Handbook', href: '#quickstart' },
      { label: 'Schema Migration Guide', href: '#migrations' },
      { label: 'SDK Reference', href: '#sdk' },
    ],
  },
  {
    heading: 'Community & Casebooks',
    links: [
      { label: 'Customer Benchmarks', href: '#benchmarks' },
      { label: 'Design Engineering Notes', href: '#notes' },
      { label: 'Quarterly Town Hall', href: '#town-hall' },
    ],
  },
];

export function DropdownMenu4({ onNavigate, forceOpen }: DropdownMenu4Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [query, setQuery] = useState('');
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerWrapRef = useRef<HTMLDivElement>(null);

  const openVisible = forceOpen ?? isOpen;
  const q = query.trim().toLowerCase();
  const filteredGroups = RESOURCE_GROUPS.map((group) => ({
    ...group,
    links: group.links.filter((link) => link.label.toLowerCase().includes(q)),
  })).filter((group) => group.links.length > 0);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (triggerWrapRef.current && !triggerWrapRef.current.contains(event.target as Node)) {
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
    if (triggerWrapRef.current?.contains(document.activeElement)) return;
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
    <header className="relative z-20 w-full bg-[#1E1B4B] text-white">
      {/* Tier 1: Slim Utility Bar */}
      <div className="border-b border-indigo-900/80 bg-[#141136]">
        <div className="mx-auto flex h-8 max-w-6xl items-center justify-between px-6 text-[11px] font-medium text-indigo-200">
          <span>Winter Release Cohort Applications Open</span>
          <div className="flex items-center gap-4">
            <a
              href="#status"
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.('Release Calendar');
              }}
              className="hover:text-amber-300"
            >
              Release Calendar
            </a>
            <a
              href="#support"
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.('Support Desk');
              }}
              className="hover:text-amber-300"
            >
              Support Desk
            </a>
          </div>
        </div>
      </div>

      {/* Tier 2: Main Navigation */}
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-8 px-6">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.('Marigold Labs Home');
          }}
          className="font-display text-lg font-bold tracking-tight text-amber-300 whitespace-nowrap shrink-0"
        >
          Marigold Labs
        </a>

        <nav aria-label="Primary Navigation" className="flex items-center gap-6">
          <ul className="flex items-center gap-6 text-sm font-semibold text-indigo-100">
            <li>
              <a
                href="#customers"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Customers');
                }}
                className="transition-colors hover:text-amber-300 whitespace-nowrap shrink-0"
              >
                Customers
              </a>
            </li>
            <li>
              <a
                href="#enterprise"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('Enterprise');
                }}
                className="transition-colors hover:text-amber-300 whitespace-nowrap shrink-0"
              >
                Enterprise
              </a>
            </li>
            <li className="relative">
              <div
                ref={triggerWrapRef}
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  aria-expanded={openVisible}
                  aria-haspopup="true"
                  onClick={handleTriggerClick}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 ${
                    openVisible
                      ? 'bg-amber-400 text-indigo-950'
                      : 'bg-indigo-800/80 text-white hover:bg-indigo-700'
                  }`}
                >
                  <span>Resources</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-150 ${
                      openVisible ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openVisible && (
                  <div className="absolute right-0 top-full z-30 mt-2.5 w-[320px] overflow-hidden rounded-xl border-2 border-indigo-950 bg-white text-indigo-950 shadow-[6px_6px_0_0_#1e1b4b]">
                    <div className="border-b-2 border-indigo-950 bg-indigo-50 p-3">
                      <label htmlFor="marigold-search" className="sr-only">
                        Search resources
                      </label>
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-indigo-600" />
                        <input
                          id="marigold-search"
                          type="search"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Search guides & notes..."
                          className="w-full rounded-md border-2 border-indigo-950 bg-white py-1.5 pl-8 pr-7 text-xs font-medium text-indigo-950 placeholder:text-indigo-400 focus:outline-none"
                        />
                        {query && (
                          <button
                            type="button"
                            aria-label="Clear search"
                            onClick={() => setQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-950"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 p-4">
                      {filteredGroups.length === 0 ? (
                        <p className="py-2 text-xs font-medium text-indigo-700">
                          No resources match &ldquo;{query}&rdquo;.
                        </p>
                      ) : (
                        filteredGroups.map((group) => (
                          <div key={group.heading}>
                            <h3 className="mb-1.5 text-xs font-bold tracking-wide text-indigo-600">
                              {group.heading}
                            </h3>
                            <ul className="space-y-1">
                              {group.links.map((link) => (
                                <li key={link.label}>
                                  <a
                                    href={link.href}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      onNavigate?.(link.label);
                                      setIsOpen(false);
                                      setIsPinned(false);
                                    }}
                                    className="block rounded-md px-2.5 py-1.5 text-sm font-medium text-indigo-950 transition-colors hover:bg-amber-100 hover:text-indigo-950"
                                  >
                                    {link.label}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="border-t-2 border-indigo-950 bg-amber-300 px-4 py-3">
                      <a
                        href="#workshop"
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate?.('Register for Live Workshop');
                          setIsOpen(false);
                          setIsPinned(false);
                        }}
                        className="group flex items-center justify-between text-xs font-bold text-indigo-950"
                      >
                        <span>Join Thursday Engineering Workshop</span>
                        <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                      </a>
                    </div>
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

export default DropdownMenu4;
