'use client';

import React, { useEffect, useState } from 'react';

export interface DrawerMenu16Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  onNavigate?: (label: string) => void;
  onCtaClick?: (label: string) => void;
}

type RoleMode = 'Student' | 'Instructor';

const ROLE_TRACKS: Record<
  RoleMode,
  { step: string; label: string; status: string }[]
> = {
  Student: [
    { step: '1', label: 'Foundations of Typography', status: 'Completed' },
    { step: '2', label: 'Grid & Spatial Rhythm', status: 'In Progress' },
    { step: '3', label: 'Interactive Prototyping', status: 'Up Next' },
    { step: '4', label: 'Capstone Critique', status: 'Locked' },
  ],
  Instructor: [
    { step: '1', label: 'Cohort Roster & Attendance', status: '28 students' },
    { step: '2', label: 'Assignment Grading Queue', status: '6 pending' },
    { step: '3', label: 'Syllabus & Readings', status: 'Week 4' },
    { step: '4', label: 'Office Hours Schedule', status: 'Thu 16:00' },
  ],
};

export function DrawerMenu16({
  defaultOpen = false,
  triggerLabel = 'Open DrawerMenu16',
  onNavigate,
  onCtaClick,
}: DrawerMenu16Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [role, setRole] = useState<RoleMode>('Student');
  const [query, setQuery] = useState('');
  const [activeItem, setActiveItem] = useState('Grid & Spatial Rhythm');
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
  const visibleSteps = normalized
    ? ROLE_TRACKS[role].filter((s) => s.label.toLowerCase().includes(normalized))
    : ROLE_TRACKS[role];

  const handleSelect = (event: React.MouseEvent<HTMLAnchorElement>, label: string) => {
    event.preventDefault();
    setActiveItem(label);
    onNavigate?.(label);
  };

  const handlePrimaryAction = () => {
    setCtaConfirmed(true);
    onCtaClick?.(role === 'Student' ? 'Continue Lesson' : 'Review Submissions');
    window.setTimeout(() => setCtaConfirmed(false), 1800);
  };

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="drawer-menu-16"
        aria-label={triggerLabel}
        className="inline-flex items-center gap-2.5 rounded-lg border border-indigo-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-xs transition-colors hover:bg-indigo-50/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 whitespace-nowrap"
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
          className={`fixed inset-0 bg-slate-950/45 backdrop-blur-[2px] transition-opacity duration-200 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <aside
          id="drawer-menu-16"
          role="dialog"
          aria-modal="true"
          aria-label="Cadence Learn role-switched navigation"
          className={`fixed inset-y-0 left-0 flex w-[350px] max-w-[88vw] flex-col border-r border-slate-200 bg-white text-slate-900 shadow-2xl transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="border-b border-slate-200 px-5 pt-5 pb-4 space-y-4">
            <div className="flex items-center justify-between">
              <a
                href="#cadence"
                onClick={(e) => handleSelect(e, 'Cadence Learn')}
                className="inline-flex items-center gap-2 text-base font-semibold tracking-tight text-slate-950"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold text-white">
                  C
                </span>
                <span>Cadence Learn</span>
              </a>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close Cadence Learn navigation"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Segmented Role Switcher */}
            <div role="tablist" aria-label="Portal role" className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
              {(['Student', 'Instructor'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={role === tab}
                  onClick={() => {
                    setRole(tab);
                    setQuery('');
                  }}
                  className={`rounded-md py-1.5 text-xs font-semibold transition-colors ${
                    role === tab
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <label htmlFor="dm16-search" className="sr-only">
              Search course modules
            </label>
            <div className="relative flex items-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" className="pointer-events-none absolute left-3 text-slate-400">
                <circle cx="11" cy="11" r="7" />
                <line x1="20" y1="20" x2="16" y2="16" />
              </svg>
              <input
                id="dm16-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${role.toLowerCase()} modules...`}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <nav aria-label="Numbered curriculum track" className="flex-1 overflow-y-auto px-5 py-5">
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              {role} Track
            </h2>

            {visibleSteps.length === 0 ? (
              <div className="rounded-lg border border-slate-200 p-5 text-center">
                <p className="text-xs text-slate-500">No modules match &ldquo;{query}&rdquo;.</p>
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="mt-2 text-xs font-semibold text-indigo-600 underline"
                >
                  Reset search
                </button>
              </div>
            ) : (
              <ul className="space-y-2">
                {visibleSteps.map((item) => {
                  const isActive = activeItem === item.label;
                  return (
                    <li key={item.label}>
                      <a
                        href={`#step-${item.step}`}
                        onClick={(e) => handleSelect(e, item.label)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${
                          isActive
                            ? 'border-indigo-600 bg-indigo-50/70'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold ${
                            isActive
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.step}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900">{item.label}</p>
                          <p className="text-[11px] text-slate-500">{item.status}</p>
                        </div>
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </nav>

          <div className="border-t border-slate-200 bg-slate-50 p-4">
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              {ctaConfirmed
                ? 'Module Opened'
                : role === 'Student'
                  ? 'Continue Lesson'
                  : 'Review Submissions'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default DrawerMenu16;
