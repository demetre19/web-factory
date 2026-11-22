import React, { useState } from 'react';
import {
  Bell,
  Bookmark,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Compass,
  FolderGit2,
  Home,
  MessageSquare,
  Search,
  Settings,
  Terminal,
  User,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* Nav15: Dock-Style Icon Bar                                                 */
/* -------------------------------------------------------------------------- */
const DOCK_APPS = [
  { id: 'finder', label: 'Explorer', icon: Compass, color: 'bg-sky-600 text-white' },
  { id: 'repos', label: 'Repositories', icon: FolderGit2, color: 'bg-slate-800 text-white' },
  { id: 'terminal', label: 'Terminal', icon: Terminal, color: 'bg-zinc-900 text-emerald-400' },
  { id: 'messages', label: 'Messages', icon: MessageSquare, color: 'bg-emerald-600 text-white' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, color: 'bg-rose-600 text-white' },
  { id: 'settings', label: 'Preferences', icon: Settings, color: 'bg-slate-600 text-white' },
];

export function Nav15() {
  const [activeApp, setActiveApp] = useState('repos');
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);

  const focused = DOCK_APPS.find((a) => a.id === activeApp) ?? DOCK_APPS[0];

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="text-xs text-slate-500">
        Active app: <span className="font-medium text-slate-800">{focused.label}</span>
      </div>

      <nav
        aria-label="Application dock"
        className="inline-flex items-end gap-2 rounded-2xl border border-slate-200 bg-white/95 px-3 py-2.5 shadow-md"
      >
        {DOCK_APPS.map((app) => {
          const Icon = app.icon;
          const isActive = app.id === activeApp;
          const isHovered = hoveredApp === app.id;
          return (
            <div key={app.id} className="relative flex flex-col items-center">
              {isHovered && (
                <span
                  role="tooltip"
                  className="pointer-events-none absolute -top-8 rounded-md bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-white whitespace-nowrap shadow-sm"
                >
                  {app.label}
                </span>
              )}
              <button
                type="button"
                aria-label={app.label}
                aria-pressed={isActive}
                onMouseEnter={() => setHoveredApp(app.id)}
                onMouseLeave={() => setHoveredApp(null)}
                onFocus={() => setHoveredApp(app.id)}
                onBlur={() => setHoveredApp(null)}
                onClick={() => setActiveApp(app.id)}
                className={`flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                  app.color
                } ${isHovered ? '-translate-y-1 scale-110' : ''} ${
                  isActive ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </button>
              <span
                aria-hidden="true"
                className={`mt-1 h-1 w-3 rounded-full transition-opacity ${
                  isActive ? 'bg-slate-800 opacity-100' : 'opacity-0'
                }`}
              />
            </div>
          );
        })}
      </nav>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Nav16: Mobile Bottom Tab Bar                                               */
/* -------------------------------------------------------------------------- */
const MOBILE_TABS = [
  { id: 'home', label: 'Home', icon: Home, summary: 'Home feed showing 6 recent updates.' },
  { id: 'search', label: 'Search', icon: Search, summary: 'Explore repositories, components, and authors.' },
  { id: 'inbox', label: 'Inbox', icon: Bell, count: 3, summary: '3 unread review notifications.' },
  { id: 'saved', label: 'Saved', icon: Bookmark, summary: '12 bookmarked templates synced.' },
  { id: 'profile', label: 'Profile', icon: User, summary: 'Account preferences and offline cache.' },
];

export function Nav16() {
  const [active, setActive] = useState('home');
  const current = MOBILE_TABS.find((t) => t.id === active) ?? MOBILE_TABS[0];

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex min-h-[76px] items-center justify-between bg-slate-50 px-4 py-3 text-xs text-slate-600">
        <div>
          <div className="font-semibold text-slate-900">{current.label}</div>
          <div className="mt-0.5">{current.summary}</div>
        </div>
      </div>

      <nav aria-label="Mobile bottom navigation" className="border-t border-slate-200 bg-white px-1 py-1.5">
        <div className="grid grid-cols-5">
          {MOBILE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setActive(tab.id)}
                className={`relative flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-[11px] font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {tab.count && (
                    <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 font-mono text-[10px] text-white tabular-nums">
                      {tab.count}
                    </span>
                  )}
                </span>
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Nav17: Breadcrumb with Dropdown (Open by default)                          */
/* -------------------------------------------------------------------------- */
const ENVIRONMENTS = [
  'Production US-East',
  'Staging Preview',
  'EU Central Cluster',
  'Local Sandbox',
];

export function Nav17() {
  const [dropdownOpen, setDropdownOpen] = useState(true);
  const [environment, setEnvironment] = useState('Production US-East');
  const [section, setSection] = useState('API Gateways');

  return (
    <div className="min-h-[240px] rounded-xl border border-slate-200 bg-white p-4">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm">
          <li>
            <button
              type="button"
              onClick={() => setSection('Organization')}
              className="rounded px-1.5 py-0.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              Northstar
            </button>
          </li>
          <li aria-hidden="true" className="text-slate-300">
            <ChevronRight className="h-4 w-4" />
          </li>

          <li className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-expanded={dropdownOpen}
              aria-haspopup="menu"
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-sm font-medium text-slate-800 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              <span>{environment}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
            </button>

            {dropdownOpen && (
              <menu
                role="menu"
                aria-label="Switch environment"
                className="absolute top-full left-0 z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg ring-1 ring-slate-900/5"
              >
                <li role="presentation" className="px-2.5 py-1 text-[11px] font-semibold tracking-wide text-slate-400">
                  Environments
                </li>
                {ENVIRONMENTS.map((env) => {
                  const selected = env === environment;
                  return (
                    <li key={env} role="none">
                      <button
                        type="button"
                        role="menuitemradio"
                        aria-checked={selected}
                        onClick={() => {
                          setEnvironment(env);
                          setDropdownOpen(false);
                        }}
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        <span>{env}</span>
                        {selected && <Check className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />}
                      </button>
                    </li>
                  );
                })}
              </menu>
            )}
          </li>

          <li aria-hidden="true" className="text-slate-300">
            <ChevronRight className="h-4 w-4" />
          </li>
          <li>
            <button
              type="button"
              onClick={() => setSection('Networking')}
              className="rounded px-1.5 py-0.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              Networking
            </button>
          </li>
          <li aria-hidden="true" className="text-slate-300">
            <ChevronRight className="h-4 w-4" />
          </li>
          <li>
            <span aria-current="page" className="px-1.5 py-0.5 font-semibold text-slate-900">
              {section}
            </span>
          </li>
        </ol>
      </nav>
    </div>
  );
}
