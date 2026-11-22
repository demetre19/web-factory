'use client';

import React, { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Menu, X, Search, FileText, Folder, Mail } from 'lucide-react';
import { filterMenuItems } from '@/lib/sheet-logic';
import type { SheetMenuProps } from './types';

type ScopeTab = 'workspace' | 'docs' | 'people';

const WORKSPACE_LIST = [
  { id: 'sprint', label: 'Sprint Board', category: 'Workspace', description: '18 open issues' },
  { id: 'roadmap', label: 'Q4 Roadmap', category: 'Workspace', description: '3 milestones' },
  { id: 'releases', label: 'Release Train', category: 'Workspace', description: 'Ready for QA' },
];

const DOC_CARDS = [
  { id: 'handbook', label: 'Team Handbook', category: 'Docs', description: 'Onboarding' },
  { id: 'design-spec', label: 'Design Tokens', category: 'Docs', description: 'Typography' },
  { id: 'api-v3', label: 'REST Endpoints', category: 'Docs', description: 'Schemas' },
  { id: 'sla', label: 'Incident Runbook', category: 'Docs', description: 'On-call' },
];

const PEOPLE_LIST = [
  { id: 'claire', label: 'Claire Dubois', category: 'People', description: 'Staff Engineer', initials: 'CD' },
  { id: 'kenji', label: 'Kenji Sato', category: 'People', description: 'Design Lead', initials: 'KS' },
  { id: 'nadia', label: 'Nadia Patel', category: 'People', description: 'Product Ops', initials: 'NP' },
];

export function SheetMenu6({
  open,
  defaultOpen = false,
  onOpenChange,
  contained = true,
  onSelectDestination,
}: SheetMenuProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [tab, setTab] = useState<ScopeTab>('workspace');
  const [activeId, setActiveId] = useState('sprint');
  const [query, setQuery] = useState('');
  const panelId = useId();
  const prefersReducedMotion = useReducedMotion();

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const allItems = [...WORKSPACE_LIST, ...DOC_CARDS, ...PEOPLE_LIST];
  const activeLabel = allItems.find((i) => i.id === activeId)?.label ?? 'Sprint Board';

  const handleSelect = (id: string, label: string) => {
    setActiveId(id);
    onSelectDestination?.(label);
    setOpen(false);
  };

  return (
    <div
      className={`${
        contained ? 'relative h-full w-full overflow-hidden' : 'min-h-screen w-full'
      } bg-slate-100 text-slate-900 flex flex-col`}
    >
      <header className="relative z-30 flex items-center justify-between h-14 px-4 bg-white border-b border-slate-200 shrink-0">
        <span className="font-display text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
          Linearis Hub
        </span>

        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          aria-label={isOpen ? 'Close Linearis tabbed menu' : 'Open Linearis tabbed menu'}
          onClick={() => setOpen(!isOpen)}
          className="min-h-[44px] min-w-[44px] -mr-2 px-3 inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
        >
          <span>{isOpen ? 'Done' : 'Explore'}</span>
          {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </header>

      <div className="relative flex-1 overflow-y-auto">
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.button
                type="button"
                aria-label="Close Linearis backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
                onClick={() => setOpen(false)}
                className={`${contained ? 'absolute' : 'fixed top-14'} inset-0 z-10 bg-slate-900/30`}
              />

              <motion.nav
                id={panelId}
                aria-label="Scoped tabbed navigation"
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -14 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
                className={`${
                  contained ? 'absolute top-0 inset-x-0' : 'fixed top-14 inset-x-0'
                } z-20 bg-white border-b border-slate-200 shadow-xl max-h-[calc(100%-0.5rem)] overflow-y-auto`}
              >
                <div className="p-3.5 space-y-3">
                  <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100">
                    {(
                      [
                        { id: 'workspace', label: 'Workspace' },
                        { id: 'docs', label: 'Docs' },
                        { id: 'people', label: 'People' },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTab(t.id)}
                        className={`min-h-[36px] rounded-lg text-xs font-semibold transition-colors ${
                          tab === t.id
                            ? 'bg-white text-slate-950 shadow-xs'
                            : 'text-slate-600 hover:text-slate-950'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="search"
                      aria-label={`Search ${tab}`}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={`Search ${tab}...`}
                      className="w-full min-h-[40px] pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-blue-600"
                    />
                  </div>

                  {tab === 'workspace' && (
                    <ul className="space-y-1">
                      {filterMenuItems(WORKSPACE_LIST, query).map((item) => (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => handleSelect(item.id, item.label)}
                            className={`w-full min-h-[46px] px-3 rounded-xl flex items-center justify-between text-left transition-colors ${
                              activeId === item.id
                                ? 'bg-blue-50 text-blue-700'
                                : 'hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <span className="flex items-center gap-2.5">
                              <Folder className="w-4 h-4 text-blue-600 shrink-0" />
                              <span className="text-sm font-medium">{item.label}</span>
                            </span>
                            <span className="text-xs text-slate-500">{item.description}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {tab === 'docs' && (
                    <div className="grid grid-cols-2 gap-2">
                      {filterMenuItems(DOC_CARDS, query).map((doc) => (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => handleSelect(doc.id, doc.label)}
                          className={`p-3 rounded-xl border text-left space-y-1 transition-colors ${
                            activeId === doc.id
                              ? 'border-blue-500 bg-blue-50/70'
                              : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100'
                          }`}
                        >
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="block text-xs font-semibold text-slate-900 truncate">
                            {doc.label}
                          </span>
                          <span className="block text-[11px] text-slate-500">{doc.description}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {tab === 'people' && (
                    <ul className="divide-y divide-slate-100">
                      {filterMenuItems(PEOPLE_LIST, query).map((person) => (
                        <li key={person.id}>
                          <button
                            type="button"
                            onClick={() => handleSelect(person.id, person.label)}
                            className="w-full min-h-[50px] px-2 py-1.5 flex items-center justify-between gap-2 hover:bg-slate-50 rounded-lg text-left"
                          >
                            <span className="flex items-center gap-2.5 min-w-0">
                              <span className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                                {person.initials}
                              </span>
                              <span className="min-w-0">
                                <span className="block text-sm font-medium text-slate-900 truncate">
                                  {person.label}
                                </span>
                                <span className="block text-xs text-slate-500 truncate">
                                  {person.description}
                                </span>
                              </span>
                            </span>
                            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.nav>
            </>
          )}
        </AnimatePresence>

        <main className="p-4 space-y-3">
          <div className="text-xs font-medium text-slate-500">Destination · {activeLabel}</div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1.5">
            <h3 className="font-display text-lg font-semibold text-slate-900">{activeLabel}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Tabbed-scope top drop-down switching geometry between Workspace list rows, 2-column
              Doc cards, and a People directory.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
