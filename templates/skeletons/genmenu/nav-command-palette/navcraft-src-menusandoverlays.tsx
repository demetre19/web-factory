import React, { useMemo, useState } from 'react';
import {
  Check,
  ChevronRight,
  Command,
  Copy,
  Download,
  Edit3,
  Eye,
  FileCode2,
  FolderPlus,
  History,
  Layers,
  LogOut,
  MoreHorizontal,
  Plus,
  Scissors,
  Search,
  Settings,
  Share2,
  Shield,
  SlidersHorizontal,
  Terminal,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react';
import { filterCommandGroups } from '../../utils/navHelpers';

/* -------------------------------------------------------------------------- */
/* Nav1: Rich Action Dropdown Menu (Open by default)                          */
/* -------------------------------------------------------------------------- */
export function Nav1() {
  const [open, setOpen] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [autoSave, setAutoSave] = useState(false);
  const [lastAction, setLastAction] = useState('Menu open — ready');

  const triggerAction = (label: string) => {
    setLastAction(`Selected "${label}"`);
  };

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex w-full items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-haspopup="menu"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-800 shadow-xs transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <MoreHorizontal className="h-4 w-4 text-slate-500" aria-hidden="true" />
          <span>Document Actions</span>
        </button>
        <span className="text-xs text-slate-500 truncate">{lastAction}</span>
      </div>

      {open && (
        <nav aria-label="Document actions">
          <menu
            role="menu"
            className="w-72 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg ring-1 ring-slate-900/5"
          >
            <li role="presentation" className="px-2.5 py-1.5 text-[11px] font-semibold tracking-wide text-slate-400">
              Edit &amp; Share
            </li>
            <li role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => triggerAction('Rename file')}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:bg-slate-100 focus-visible:outline-none"
              >
                <span className="flex items-center gap-2.5">
                  <Edit3 className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  <span>Rename file</span>
                </span>
                <kbd className="font-mono text-[11px] text-slate-400">⌘E</kbd>
              </button>
            </li>
            <li role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => triggerAction('Duplicate')}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:bg-slate-100 focus-visible:outline-none"
              >
                <span className="flex items-center gap-2.5">
                  <Copy className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  <span>Duplicate</span>
                </span>
                <kbd className="font-mono text-[11px] text-slate-400">⌘D</kbd>
              </button>
            </li>
            <li role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => triggerAction('Share link')}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:bg-slate-100 focus-visible:outline-none"
              >
                <span className="flex items-center gap-2.5">
                  <Share2 className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  <span>Share link</span>
                </span>
                <kbd className="font-mono text-[11px] text-slate-400">⌘⇧S</kbd>
              </button>
            </li>

            <li role="separator" className="my-1.5 border-t border-slate-100" />

            <li role="presentation" className="px-2.5 py-1.5 text-[11px] font-semibold tracking-wide text-slate-400">
              Preferences
            </li>
            <li role="none">
              <button
                type="button"
                role="menuitemcheckbox"
                aria-checked={showGrid}
                onClick={() => {
                  const next = !showGrid;
                  setShowGrid(next);
                  setLastAction(`Snap to grid ${next ? 'enabled' : 'disabled'}`);
                }}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:bg-slate-100 focus-visible:outline-none"
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded border ${
                      showGrid
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-300 bg-white text-transparent'
                    }`}
                  >
                    <Check className="h-3 w-3" aria-hidden="true" />
                  </span>
                  <span>Snap to grid</span>
                </span>
                <kbd className="font-mono text-[11px] text-slate-400">⌘&apos;</kbd>
              </button>
            </li>
            <li role="none">
              <button
                type="button"
                role="menuitemcheckbox"
                aria-checked={autoSave}
                onClick={() => {
                  const next = !autoSave;
                  setAutoSave(next);
                  setLastAction(`Auto-save ${next ? 'enabled' : 'disabled'}`);
                }}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:bg-slate-100 focus-visible:outline-none"
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded border ${
                      autoSave
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-300 bg-white text-transparent'
                    }`}
                  >
                    <Check className="h-3 w-3" aria-hidden="true" />
                  </span>
                  <span>Auto-save drafts</span>
                </span>
                <kbd className="font-mono text-[11px] text-slate-400">⌥S</kbd>
              </button>
            </li>

            <li role="separator" className="my-1.5 border-t border-slate-100" />

            <li role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => triggerAction('Delete document')}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus-visible:bg-red-50 focus-visible:outline-none"
              >
                <span className="flex items-center gap-2.5">
                  <Trash2 className="h-4 w-4 text-red-500" aria-hidden="true" />
                  <span>Delete document</span>
                </span>
                <kbd className="font-mono text-[11px] text-red-400">⌘⌫</kbd>
              </button>
            </li>
          </menu>
        </nav>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Nav2: Context Menu (Open by default inside target region)                  */
/* -------------------------------------------------------------------------- */
export function Nav2() {
  const [open, setOpen] = useState(true);
  const [lastCommand, setLastCommand] = useState('Right-click canvas or select item');

  const runItem = (label: string) => {
    setLastCommand(`Executed "${label}"`);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-slate-500 truncate">{lastCommand}</span>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600 whitespace-nowrap shrink-0"
        >
          {open ? 'Hide Menu' : 'Show Context Menu'}
        </button>
      </div>

      <div
        onContextMenu={(e) => {
          e.preventDefault();
          setOpen(true);
          setLastCommand('Context menu triggered');
        }}
        className="relative flex min-h-[300px] items-start justify-between gap-4 rounded-xl border border-dashed border-slate-300 bg-white p-4"
      >
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-800">schema-migration.sql</span>
          <span className="text-xs text-slate-500">Right-click anywhere in this frame</span>
        </div>

        {open && (
          <nav aria-label="Canvas context menu" className="shrink-0">
            <menu
              role="menu"
              className="w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5"
            >
              <li role="none">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => runItem('Open Preview')}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-100 focus-visible:bg-slate-100 focus-visible:outline-none"
                >
                  <span className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-slate-400" aria-hidden="true" />
                    <span>Open Preview</span>
                  </span>
                  <kbd className="font-mono text-[11px] text-slate-400">Space</kbd>
                </button>
              </li>
              <li role="none">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => runItem('Cut')}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-100 focus-visible:bg-slate-100 focus-visible:outline-none"
                >
                  <span className="flex items-center gap-2">
                    <Scissors className="h-4 w-4 text-slate-400" aria-hidden="true" />
                    <span>Cut</span>
                  </span>
                  <kbd className="font-mono text-[11px] text-slate-400">⌘X</kbd>
                </button>
              </li>
              <li role="none">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => runItem('Copy Path')}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-100 focus-visible:bg-slate-100 focus-visible:outline-none"
                >
                  <span className="flex items-center gap-2">
                    <Copy className="h-4 w-4 text-slate-400" aria-hidden="true" />
                    <span>Copy Path</span>
                  </span>
                  <kbd className="font-mono text-[11px] text-slate-400">⌥⌘C</kbd>
                </button>
              </li>

              <li role="separator" className="my-1.5 border-t border-slate-100" />

              <li role="none">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => runItem('Inspect Source')}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-100 focus-visible:bg-slate-100 focus-visible:outline-none"
                >
                  <span className="flex items-center gap-2">
                    <FileCode2 className="h-4 w-4 text-slate-400" aria-hidden="true" />
                    <span>Inspect Source</span>
                  </span>
                  <kbd className="font-mono text-[11px] text-slate-400">F12</kbd>
                </button>
              </li>
              <li role="none">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => runItem('View History')}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-100 focus-visible:bg-slate-100 focus-visible:outline-none"
                >
                  <span className="flex items-center gap-2">
                    <History className="h-4 w-4 text-slate-400" aria-hidden="true" />
                    <span>View History</span>
                  </span>
                  <kbd className="font-mono text-[11px] text-slate-400">⌘H</kbd>
                </button>
              </li>

              <li role="separator" className="my-1.5 border-t border-slate-100" />

              <li role="none">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => runItem('Move to Trash')}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 focus-visible:bg-red-50 focus-visible:outline-none"
                >
                  <span className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-red-500" aria-hidden="true" />
                    <span>Move to Trash</span>
                  </span>
                  <kbd className="font-mono text-[11px] text-red-400">⌫</kbd>
                </button>
              </li>
            </menu>
          </nav>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Nav3: Command Palette (Search input + grouped actions + shortcut hints)    */
/* -------------------------------------------------------------------------- */
const COMMAND_GROUPS = [
  {
    group: 'Navigation',
    items: [
      { id: 'deploy', label: 'Go to Deployments', hint: 'G D', keywords: 'release ship' },
      { id: 'logs', label: 'Open Runtime Logs', hint: 'G L', keywords: 'console trace' },
      { id: 'team', label: 'Manage Team Members', hint: 'G T', keywords: 'users roles' },
    ],
  },
  {
    group: 'Workspace Actions',
    items: [
      { id: 'new-folder', label: 'Create New Collection', hint: '⌘⇧N', keywords: 'add folder' },
      { id: 'export', label: 'Export Configuration JSON', hint: '⌘E', keywords: 'download backup' },
      { id: 'prefs', label: 'Open Keyboard Shortcuts', hint: '⌘/', keywords: 'settings hotkeys' },
    ],
  },
];

export function Nav3() {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('deploy');
  const [executed, setExecuted] = useState<string | null>(null);

  const filteredGroups = useMemo(
    () => filterCommandGroups(COMMAND_GROUPS, query),
    [query],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-xs hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          <Command className="h-4 w-4 text-slate-500" aria-hidden="true" />
          <span>{open ? 'Close Palette' : 'Open Command Palette'}</span>
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[11px] text-slate-500">
            ⌘K
          </kbd>
        </button>
        {executed && (
          <span className="text-xs font-medium text-blue-700">{executed}</span>
        )}
      </div>

      {open && (
        <nav aria-label="Command palette">
          <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-slate-900/5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 px-3.5 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              <label htmlFor="nav3-cmd-search" className="sr-only">
                Search commands
              </label>
              <input
                id="nav3-cmd-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search..."
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setQuery('')}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded border border-slate-200 px-1.5 py-0.5 font-mono text-[11px] text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              >
                ESC
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto p-2">
              {filteredGroups.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-slate-500">
                  No commands match &ldquo;{query}&rdquo;
                </div>
              ) : (
                filteredGroups.map((group, idx) => (
                  <div key={group.group} className={idx > 0 ? 'mt-2 border-t border-slate-100 pt-2' : ''}>
                    <div className="px-2.5 py-1 text-[11px] font-semibold tracking-wide text-slate-400">
                      {group.group}
                    </div>
                    <menu role="menu" className="mt-0.5 space-y-0.5">
                      {group.items.map((item) => {
                        const isActive = selectedId === item.id;
                        return (
                          <li key={item.id} role="none">
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setSelectedId(item.id);
                                setExecuted(`Ran: ${item.label}`);
                              }}
                              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                                isActive
                                  ? 'bg-blue-50 text-blue-900 font-medium'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span className="flex items-center gap-2.5">
                                <Terminal
                                  className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}
                                  aria-hidden="true"
                                />
                                <span>{item.label}</span>
                              </span>
                              {item.hint && (
                                <kbd className="font-mono text-[11px] text-slate-400">
                                  {item.hint}
                                </kbd>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </menu>
                  </div>
                ))
              )}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Nav18: Workspace & Account Switcher Dropdown (Open by default)             */
/* -------------------------------------------------------------------------- */
export function Nav18() {
  const [open, setOpen] = useState(true);
  const [workspace, setWorkspace] = useState('Northstar Core');
  const [compactMode, setCompactMode] = useState(true);
  const [status, setStatus] = useState('Signed in as Maya Lin');

  const workspaces = ['Northstar Core', 'Design Systems', 'Sandbox Staging'];

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex w-full items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-haspopup="menu"
          className="inline-flex items-center gap-2.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 shadow-xs hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-xs font-semibold text-white">
            ML
          </span>
          <span className="whitespace-nowrap">{workspace}</span>
        </button>
        <span className="text-xs text-slate-500 truncate">{status}</span>
      </div>

      {open && (
        <nav aria-label="Account and workspace switcher">
          <menu
            role="menu"
            className="w-72 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg ring-1 ring-slate-900/5"
          >
            <li role="presentation" className="px-2.5 py-2">
              <div className="text-sm font-semibold text-slate-900">Maya Lin</div>
              <div className="text-xs text-slate-500">maya.lin@northstar.io</div>
            </li>

            <li role="separator" className="my-1 border-t border-slate-100" />

            <li role="presentation" className="px-2.5 py-1 text-[11px] font-semibold tracking-wide text-slate-400">
              Switch Workspace
            </li>
            {workspaces.map((ws) => {
              const selected = workspace === ws;
              return (
                <li key={ws} role="none">
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={selected}
                    onClick={() => {
                      setWorkspace(ws);
                      setStatus(`Switched to ${ws}`);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-100 focus-visible:bg-slate-100 focus-visible:outline-none"
                  >
                    <span className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-slate-400" aria-hidden="true" />
                      <span>{ws}</span>
                    </span>
                    {selected && <Check className="h-4 w-4 text-blue-600" aria-hidden="true" />}
                  </button>
                </li>
              );
            })}

            <li role="separator" className="my-1.5 border-t border-slate-100" />

            <li role="none">
              <button
                type="button"
                role="menuitemcheckbox"
                aria-checked={compactMode}
                onClick={() => setCompactMode((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-100 focus-visible:bg-slate-100 focus-visible:outline-none"
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  <span>Compact density</span>
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {compactMode ? 'On' : 'Off'}
                </span>
              </button>
            </li>
            <li role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => setStatus('Opened Account Settings')}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-100 focus-visible:bg-slate-100 focus-visible:outline-none"
              >
                <span className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  <span>Account Settings</span>
                </span>
                <kbd className="font-mono text-[11px] text-slate-400">⌘,</kbd>
              </button>
            </li>

            <li role="separator" className="my-1.5 border-t border-slate-100" />

            <li role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => setStatus('Signed out of session')}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 focus-visible:bg-red-50 focus-visible:outline-none"
              >
                <span className="flex items-center gap-2">
                  <LogOut className="h-4 w-4 text-red-500" aria-hidden="true" />
                  <span>Sign out</span>
                </span>
                <kbd className="font-mono text-[11px] text-red-400">⇧⌘Q</kbd>
              </button>
            </li>
          </menu>
        </nav>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Nav20: Cascading Flyout Submenu (Open by default)                          */
/* -------------------------------------------------------------------------- */
export function Nav20() {
  const [open, setOpen] = useState(true);
  const [submenuOpen, setSubmenuOpen] = useState(true);
  const [selectedFormat, setSelectedFormat] = useState('SVG Vector');

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex w-full items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-haspopup="menu"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-800 shadow-xs hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          <Plus className="h-4 w-4 text-slate-500" aria-hidden="true" />
          <span>Asset Menu</span>
        </button>
        <span className="text-xs text-slate-500">Format: {selectedFormat}</span>
      </div>

      {open && (
        <nav aria-label="Cascading asset menu" className="flex flex-col items-start gap-2 sm:flex-row">
          <menu
            role="menu"
            className="w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg ring-1 ring-slate-900/5"
          >
            <li role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => setSelectedFormat('New Folder')}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
              >
                <span className="flex items-center gap-2">
                  <FolderPlus className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  <span>New Folder</span>
                </span>
                <kbd className="font-mono text-[11px] text-slate-400">⇧N</kbd>
              </button>
            </li>
            <li role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => setSelectedFormat('Permissions')}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
              >
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  <span>Permissions</span>
                </span>
                <kbd className="font-mono text-[11px] text-slate-400">⌘P</kbd>
              </button>
            </li>
            <li role="none">
              <button
                type="button"
                role="menuitem"
                aria-expanded={submenuOpen}
                aria-haspopup="menu"
                onClick={() => setSubmenuOpen((prev) => !prev)}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                  submenuOpen ? 'bg-blue-50 text-blue-900 font-medium' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-blue-600" aria-hidden="true" />
                  <span>Export As</span>
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
              </button>
            </li>
            <li role="separator" className="my-1.5 border-t border-slate-100" />
            <li role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => setSelectedFormat('Invited Collaborators')}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
              >
                <Users className="h-4 w-4 text-slate-400" aria-hidden="true" />
                <span>Invite Collaborators</span>
              </button>
            </li>
          </menu>

          {submenuOpen && (
            <menu
              role="menu"
              aria-label="Export format submenu"
              className="w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg ring-1 ring-slate-900/5"
            >
              <li role="presentation" className="px-2.5 py-1 text-[11px] font-semibold tracking-wide text-slate-400">
                Export Format
              </li>
              {['SVG Vector', 'PNG @2x', 'PDF Print', 'JSON Tokens'].map((fmt) => {
                const active = selectedFormat === fmt;
                return (
                  <li key={fmt} role="none">
                    <button
                      type="button"
                      role="menuitemradio"
                      aria-checked={active}
                      onClick={() => setSelectedFormat(fmt)}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <span>{fmt}</span>
                      {active && <Check className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />}
                    </button>
                  </li>
                );
              })}
            </menu>
          )}
        </nav>
      )}
    </div>
  );
}
