import { useId, useState, type MouseEvent } from 'react';
import {
  Archive,
  Check,
  ChevronDown,
  Copy,
  FileText,
  FolderKanban,
  Highlighter,
  History,
  Layers,
  ListFilter,
  MessageSquarePlus,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
  UserPlus,
} from 'lucide-react';
import {
  filterCommandActions,
  toggleCheckboxItem,
  type CheckboxMenuItem,
  type CommandActionItem,
} from '../../utils/microCatalog';

/**
 * Micro8: Icon + Label Dropdown Menu · Professional
 */
export function Micro8() {
  const [open, setOpen] = useState(true);
  const [lastAction, setLastAction] = useState<string>('Ready');
  const menuId = useId();

  const items = [
    { id: 'duplicate', label: 'Duplicate File', icon: Copy },
    { id: 'rename', label: 'Rename Document', icon: Pencil },
    { id: 'pdf', label: 'Export as PDF', icon: FileText },
    { id: 'history', label: 'Version History', icon: History },
  ];

  return (
    <div className="pt-2 pb-44 flex items-start justify-center">
      <div className="relative inline-flex">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-800 shadow-xs hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 transition-colors whitespace-nowrap"
        >
          <span>Document ({lastAction})</span>
          <ChevronDown className="w-4 h-4 text-slate-500" aria-hidden="true" />
        </button>

        {open && (
          <div
            id={menuId}
            role="menu"
            aria-label="Document actions"
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-20 w-56 p-1.5 rounded-xl bg-white border border-slate-200 shadow-lg text-left"
          >
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  onClick={() => setLastAction(item.label.split(' ')[0])}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:bg-slate-100 transition-colors"
                >
                  <Icon className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Micro9: Sectioned Dropdown Menu with Dividers & Danger Item · Minimal
 */
export function Micro9() {
  const [open, setOpen] = useState(true);
  const [archived, setArchived] = useState(false);
  const menuId = useId();

  return (
    <div className="pt-2 pb-52 flex items-start justify-center">
      <div className="relative inline-flex">
        <button
          type="button"
          aria-label="Project options"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white border border-neutral-200 text-neutral-800 text-sm font-medium hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 transition-colors"
        >
          <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
          <span className="text-xs">{archived ? 'Archived' : 'Project Menu'}</span>
        </button>

        {open && (
          <div
            id={menuId}
            role="menu"
            aria-label="Project options menu"
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-20 w-56 py-1.5 rounded-xl bg-white border border-neutral-200 shadow-lg text-left"
          >
            <div className="px-3 py-1 text-[11px] font-medium text-neutral-400">
              Manage
            </div>
            <button
              type="button"
              role="menuitem"
              onClick={() => setArchived(false)}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 focus-visible:outline-none focus-visible:bg-neutral-100"
            >
              <FolderKanban className="w-3.5 h-3.5 text-neutral-500" aria-hidden="true" />
              <span>Move to Workspace</span>
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => setArchived(false)}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 focus-visible:outline-none focus-visible:bg-neutral-100"
            >
              <UserPlus className="w-3.5 h-3.5 text-neutral-500" aria-hidden="true" />
              <span>Transfer Ownership</span>
            </button>

            <div className="my-1.5 border-t border-neutral-100" role="separator" />

            <div className="px-3 py-1 text-[11px] font-medium text-neutral-400">
              Danger Zone
            </div>
            <button
              type="button"
              role="menuitem"
              onClick={() => setArchived((prev) => !prev)}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 focus-visible:outline-none focus-visible:bg-neutral-100"
            >
              <Archive className="w-3.5 h-3.5 text-neutral-500" aria-hidden="true" />
              <span>{archived ? 'Restore Project' : 'Archive Project'}</span>
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => setArchived(true)}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 focus-visible:outline-none focus-visible:bg-rose-50"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Delete Permanently</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Micro10: Checkbox Filter Dropdown Menu · Dark
 */
export function Micro10() {
  const [open, setOpen] = useState(true);
  const [columns, setColumns] = useState<CheckboxMenuItem[]>([
    { id: 'assignee', label: 'Assignee', checked: true },
    { id: 'priority', label: 'Priority', checked: true },
    { id: 'estimate', label: 'Estimate (pts)', checked: true },
    { id: 'updated', label: 'Last Updated', checked: false },
  ]);
  const menuId = useId();
  const checkedCount = columns.filter((c) => c.checked).length;

  return (
    <div className="pt-2 pb-44 flex items-start justify-center">
      <div className="relative inline-flex">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm font-medium text-slate-100 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 transition-colors whitespace-nowrap"
        >
          <ListFilter className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          <span className="tabular-nums">Columns ({checkedCount})</span>
        </button>

        {open && (
          <div
            id={menuId}
            role="menu"
            aria-label="Toggle visible columns"
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-20 w-56 p-1.5 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-left"
          >
            <div className="px-2.5 py-1 text-[11px] font-medium text-slate-400">
              Visible Fields
            </div>
            {columns.map((col) => (
              <button
                key={col.id}
                type="button"
                role="menuitemcheckbox"
                aria-checked={col.checked}
                onClick={() => setColumns((prev) => toggleCheckboxItem(prev, col.id))}
                className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:bg-slate-800 transition-colors"
              >
                <span>{col.label}</span>
                <span
                  aria-hidden="true"
                  className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                    col.checked
                      ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                      : 'border-slate-600 bg-slate-800'
                  }`}
                >
                  {col.checked && <Check className="w-3 h-3 stroke-[3]" />}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Micro11: Canvas Layer Context Menu · Dark
 */
export function Micro11() {
  const [open, setOpen] = useState(true);
  const [layerState, setLayerState] = useState('Frame 04');
  const menuId = useId();

  const handleContextMenu = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setOpen(true);
  };

  return (
    <div className="pt-2 pb-44 flex items-start justify-center">
      <div className="relative inline-flex">
        <button
          type="button"
          onContextMenu={handleContextMenu}
          onClick={() => setOpen((prev) => !prev)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          className="w-64 px-4 py-3 rounded-xl bg-slate-800/90 border border-dashed border-slate-600 text-left hover:border-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-100">
              <Layers className="w-4 h-4 text-indigo-400" aria-hidden="true" />
              <span>{layerState}</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Right-click</span>
          </div>
        </button>

        {open && (
          <div
            id={menuId}
            role="menu"
            aria-label="Layer context menu"
            className="absolute top-10 left-1/2 -translate-x-1/3 z-20 w-56 p-1.5 rounded-xl bg-slate-950 border border-slate-700/90 shadow-2xl text-left"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => setLayerState('Frame 04 · Copied')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:bg-slate-800"
            >
              <span>Copy Properties</span>
              <kbd className="text-[11px] font-mono text-slate-400">⌥⌘C</kbd>
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => setLayerState('Frame 05 (Dup)')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:bg-slate-800"
            >
              <span>Duplicate Layer</span>
              <kbd className="text-[11px] font-mono text-slate-400">⌘D</kbd>
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => setLayerState('Frame 04 · Front')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:bg-slate-800"
            >
              <span>Bring to Front</span>
              <kbd className="text-[11px] font-mono text-slate-400">⌘]</kbd>
            </button>
            <div className="my-1 border-t border-slate-800" role="separator" />
            <button
              type="button"
              role="menuitem"
              onClick={() => setLayerState('Layer Hidden')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/50 focus-visible:outline-none focus-visible:bg-rose-950/50"
            >
              <span>Remove Layer</span>
              <kbd className="text-[11px] font-mono text-rose-400/80">⌫</kbd>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Micro12: Text Selection Context Menu · Colourful
 */
export function Micro12() {
  const [open, setOpen] = useState(true);
  const [highlighted, setHighlighted] = useState(true);
  const [noteAdded, setNoteAdded] = useState(false);
  const menuId = useId();

  return (
    <div className="pt-2 pb-44 flex items-start justify-center">
      <div className="relative inline-flex flex-col items-center">
        <div className="w-64 p-3 rounded-xl bg-white border border-indigo-100 text-xs text-slate-700 leading-relaxed text-left shadow-xs">
          <span>Review the </span>
          <button
            type="button"
            onContextMenu={(e) => {
              e.preventDefault();
              setOpen(true);
            }}
            onClick={() => setOpen((prev) => !prev)}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={menuId}
            className={`px-1 py-0.5 rounded font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              highlighted
                ? 'bg-amber-200/80 text-amber-950'
                : 'bg-indigo-50 text-indigo-700'
            }`}
          >
            quarterly revenue forecast
          </button>
          <span> before Friday.</span>
          {noteAdded && (
            <span className="ml-1.5 text-[11px] font-semibold text-indigo-600">
              (Commented)
            </span>
          )}
        </div>

        {open && (
          <div
            id={menuId}
            role="menu"
            aria-label="Selection context actions"
            className="absolute top-full left-1/2 -translate-x-1/2 -mt-2 z-20 w-56 p-1.5 rounded-xl bg-indigo-950 text-white shadow-xl text-left border border-indigo-800"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => setHighlighted((h) => !h)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-indigo-50 hover:bg-indigo-800/80 focus-visible:outline-none focus-visible:bg-indigo-800/80"
            >
              <Highlighter className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
              <span>{highlighted ? 'Clear Highlight' : 'Highlight Yellow'}</span>
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => setNoteAdded((n) => !n)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-indigo-50 hover:bg-indigo-800/80 focus-visible:outline-none focus-visible:bg-indigo-800/80"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-sky-300" aria-hidden="true" />
              <span>{noteAdded ? 'Remove Comment' : 'Add Comment'}</span>
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-indigo-50 hover:bg-indigo-800/80 focus-visible:outline-none focus-visible:bg-indigo-800/80"
            >
              <Send className="w-3.5 h-3.5 text-emerald-300" aria-hidden="true" />
              <span>Send to Task</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Micro17: Command-Palette-Style Quick Actions · Dark
 */
const COMMAND_ACTIONS: CommandActionItem[] = [
  { id: 'sprint', label: 'Create New Sprint', group: 'Workspace', shortcut: 'C' },
  { id: 'invite', label: 'Invite Team Member', group: 'Members', shortcut: 'I' },
  { id: 'audit', label: 'Export Audit CSV', group: 'Reports', shortcut: 'E' },
  { id: 'docs', label: 'Open API Reference', group: 'Help', shortcut: '?' },
];

export function Micro17() {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('sprint');
  const paletteId = useId();
  const inputId = useId();

  const filtered = filterCommandActions(COMMAND_ACTIONS, query);

  return (
    <div className="pt-2 pb-64 flex items-start justify-center">
      <div className="relative inline-flex">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={paletteId}
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-100 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition-colors whitespace-nowrap"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          <span>Quick Actions</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-900 text-slate-300 rounded border border-slate-700">
            ⌘K
          </kbd>
        </button>

        {open && (
          <div
            id={paletteId}
            role="dialog"
            aria-label="Command palette quick actions"
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 z-20 w-72 rounded-xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden text-left"
          >
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-800">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              <label htmlFor={inputId} className="sr-only">
                Filter quick actions
              </label>
              <input
                id={inputId}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command..."
                className="w-full bg-transparent text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            <div role="listbox" aria-label="Available commands" className="p-1.5 space-y-0.5 max-h-48 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-slate-500">
                  No matching commands
                </div>
              ) : (
                filtered.map((action) => {
                  const active = selectedId === action.id;
                  return (
                    <button
                      key={action.id}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => setSelectedId(action.id)}
                      className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                        active
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Plus className="w-3.5 h-3.5 shrink-0 opacity-75" aria-hidden="true" />
                        <span className="truncate font-medium">{action.label}</span>
                      </div>
                      <kbd
                        className={`px-1.5 py-0.5 text-[10px] font-mono rounded shrink-0 ${
                          active
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {action.shortcut}
                      </kbd>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
