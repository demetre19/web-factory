import { useEffect, useRef, useState } from 'react';
import {
  Archive,
  Bookmark,
  CalendarClock,
  ChevronDown,
  FilePlus2,
  ListTodo,
  Pencil,
  Plus,
  Rocket,
  Save,
  Share2,
  Trash2,
  Upload,
} from 'lucide-react';
import { SpecimenShell } from '../SpecimenShell';

export function Btn1() {
  const [disabled, setDisabled] = useState(false);
  const [lastAction, setLastAction] = useState('Ready for selection');
  const [actionCount, setActionCount] = useState(0);

  const trigger = (label: string) => {
    setLastAction(label);
    setActionCount((prev) => prev + 1);
  };

  return (
    <SpecimenShell
      index="01"
      id="Btn1"
      categoryLabel="Core Actions"
      title="Primary, Secondary, Ghost & Destructive Set"
      summary="Four-tier action hierarchy with hover transitions, keyboard focus-visible rings, and interactive disabled mode."
      ariaNote="Native <button>, disabled state, focus-visible ring"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
          <span className="text-xs font-medium text-slate-700">
            Context: Release v2.4.0 Draft
          </span>
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700 select-none">
            <input
              type="checkbox"
              checked={disabled}
              onChange={(e) => setDisabled(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-offset-1"
            />
            Disable controls
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={disabled}
            onClick={() => trigger('Published changes')}
            className="inline-flex min-h-[40px] items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium whitespace-nowrap shrink-0 text-white transition-all duration-150 hover:bg-blue-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Publish
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => trigger('Saved draft')}
            className="inline-flex min-h-[40px] items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium whitespace-nowrap shrink-0 text-slate-800 transition-all duration-150 hover:bg-slate-100 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Save Draft
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => trigger('Opened preview')}
            className="inline-flex min-h-[40px] items-center justify-center rounded-lg px-3.5 py-2 text-sm font-medium whitespace-nowrap shrink-0 text-slate-700 transition-colors duration-150 hover:bg-slate-200/70 hover:text-slate-900 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Preview
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => trigger('Discarded draft')}
            className="inline-flex min-h-[40px] items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium whitespace-nowrap shrink-0 text-white transition-all duration-150 hover:bg-red-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Discard
          </button>
        </div>

        <p aria-live="polite" className="text-xs text-slate-600 font-mono tabular-nums">
          Status: {disabled ? 'Controls locked' : `${lastAction} (${actionCount})`}
        </p>
      </div>
    </SpecimenShell>
  );
}

export function Btn2() {
  const [bookmarked, setBookmarked] = useState(false);
  const [archived, setArchived] = useState(false);
  const [editing, setEditing] = useState(false);
  const [lastFeedback, setLastFeedback] = useState('Hover or activate an icon tool');

  return (
    <SpecimenShell
      index="02"
      id="Btn2"
      categoryLabel="Core Actions"
      title="Icon-Only Toolbar Buttons"
      summary="Compact document action triggers with explicit ARIA names, hover tooltips, and persistent toggle indicators."
      ariaNote="Unique aria-label & aria-pressed on icon triggers"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3.5 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">
              {editing ? 'Editing: Q4 Interface Audit' : 'Q4 Interface Audit'}
            </p>
            <p className="text-xs text-slate-500">
              {archived ? 'Archived · Read-only' : 'Active Document'}
            </p>
          </div>

          <div className="flex items-center gap-1.5" role="toolbar" aria-label="Document actions">
            <button
              type="button"
              aria-label="Bookmark Q4 Interface Audit"
              aria-pressed={bookmarked}
              onClick={() => {
                const next = !bookmarked;
                setBookmarked(next);
                setLastFeedback(next ? 'Bookmarked document' : 'Removed bookmark');
              }}
              className={`group relative inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                bookmarked
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-slate-900 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                Bookmark
              </span>
            </button>

            <button
              type="button"
              aria-label="Share Q4 Interface Audit"
              onClick={() => setLastFeedback('Share link prepared')}
              className="group relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <Share2 className="h-4 w-4" />
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-slate-900 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                Share
              </span>
            </button>

            <button
              type="button"
              aria-label="Toggle edit mode for Q4 Interface Audit"
              aria-pressed={editing}
              onClick={() => {
                const next = !editing;
                setEditing(next);
                setLastFeedback(next ? 'Edit mode enabled' : 'Edit mode closed');
              }}
              className={`group relative inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                editing
                  ? 'border-slate-300 bg-slate-100 text-slate-900'
                  : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Pencil className="h-4 w-4" />
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-slate-900 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                Edit
              </span>
            </button>

            <button
              type="button"
              aria-label="Archive Q4 Interface Audit"
              aria-pressed={archived}
              onClick={() => {
                const next = !archived;
                setArchived(next);
                setLastFeedback(next ? 'Moved to archive' : 'Restored from archive');
              }}
              className={`group relative inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                archived
                  ? 'border-amber-200 bg-amber-50 text-amber-800'
                  : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Archive className="h-4 w-4" />
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-slate-900 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                Archive
              </span>
            </button>

            <button
              type="button"
              aria-label="Delete Q4 Interface Audit"
              onClick={() => {
                setBookmarked(false);
                setArchived(false);
                setEditing(false);
                setLastFeedback('Document reset to initial state');
              }}
              className="group relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-red-600 transition-colors duration-150 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
            >
              <Trash2 className="h-4 w-4" />
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-slate-900 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                Reset
              </span>
            </button>
          </div>
        </div>

        <p aria-live="polite" className="text-xs text-slate-600 font-mono">
          Toolbar feedback: {lastFeedback}
        </p>
      </div>
    </SpecimenShell>
  );
}

const WINDOW_METRICS = {
  day: { label: 'Day', requests: '1,420', p95: '38 ms', delta: '+4.2%' },
  week: { label: 'Week', requests: '9,840', p95: '42 ms', delta: '+11.8%' },
  month: { label: 'Month', requests: '41,200', p95: '45 ms', delta: '+18.4%' },
  quarter: { label: 'Quarter', requests: '128,450', p95: '44 ms', delta: '+24.1%' },
} as const;

type WindowKey = keyof typeof WINDOW_METRICS;

export function Btn3() {
  const [period, setPeriod] = useState<WindowKey>('week');
  const current = WINDOW_METRICS[period];

  return (
    <SpecimenShell
      index="03"
      id="Btn3"
      categoryLabel="Core Actions"
      title="Segmented Button Group"
      summary="Mutually exclusive reporting window selector updating live throughput telemetry with crisp active elevation."
      ariaNote='role="group" with aria-pressed active state'
    >
      <div className="space-y-4">
        <div
          role="group"
          aria-label="Reporting timeframe"
          className="inline-flex w-full rounded-lg bg-slate-200/75 p-1 sm:w-auto"
        >
          {(Object.keys(WINDOW_METRICS) as WindowKey[]).map((key) => {
            const active = period === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => setPeriod(key)}
                className={`flex-1 rounded-md px-3.5 py-2 text-xs font-medium whitespace-nowrap shrink-0 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 sm:flex-initial ${
                  active
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {WINDOW_METRICS[key].label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-3 border-t border-slate-200/80 pt-3">
          <div>
            <p className="text-xs text-slate-500">Throughput</p>
            <p className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-slate-900">
              {current.requests}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">P95 Latency</p>
            <p className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-slate-900">
              {current.p95}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Growth</p>
            <p className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-emerald-700">
              {current.delta}
            </p>
          </div>
        </div>
      </div>
    </SpecimenShell>
  );
}

const DEPLOY_MODES = [
  { id: 'now', label: 'Publish Now', detail: 'Immediate rollout to production', Icon: Rocket },
  { id: 'schedule', label: 'Schedule 09:00', detail: 'Queue for next morning window', Icon: CalendarClock },
  { id: 'draft', label: 'Save Snapshot', detail: 'Store without changing live traffic', Icon: Save },
] as const;

export function Btn4() {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<(typeof DEPLOY_MODES)[number]['id']>('now');
  const [executionLog, setExecutionLog] = useState('Awaiting publish command');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedMode = DEPLOY_MODES.find((m) => m.id === selectedId) ?? DEPLOY_MODES[0];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    const onPointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, []);

  return (
    <SpecimenShell
      index="04"
      id="Btn4"
      categoryLabel="Core Actions"
      title="Split Button with Dropdown"
      summary="Primary deployment action paired with a secondary chevron menu to switch execution behavior before running."
      ariaNote='aria-haspopup="menu" & aria-expanded on chevron'
    >
      <div className="space-y-4">
        <div ref={containerRef} className="relative inline-flex">
          <button
            type="button"
            onClick={() => setExecutionLog(`Executed: ${selectedMode.label}`)}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-l-lg bg-slate-900 px-4 py-2 text-sm font-medium whitespace-nowrap shrink-0 text-white transition-colors duration-150 hover:bg-slate-800 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <selectedMode.Icon className="h-4 w-4" />
            {selectedMode.label}
          </button>

          <button
            type="button"
            aria-label="Choose publish mode"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
            className="inline-flex min-h-[40px] items-center justify-center rounded-r-lg border-l border-slate-700 bg-slate-900 px-2.5 py-2 text-white transition-colors duration-150 hover:bg-slate-800 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
            />
          </button>

          {open && (
            <div
              role="menu"
              aria-label="Deployment options"
              className="absolute left-0 top-full z-20 mt-1.5 w-64 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg"
            >
              {DEPLOY_MODES.map((mode) => {
                const isSelected = mode.id === selectedId;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setSelectedId(mode.id);
                      setOpen(false);
                      setExecutionLog(`Mode set to: ${mode.label}`);
                    }}
                    className={`flex w-full items-start gap-2.5 rounded-md px-3 py-2 text-left transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-blue-900'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <mode.Icon className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold">{mode.label}</div>
                      <div className="text-[11px] text-slate-500">{mode.detail}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <p aria-live="polite" className="text-xs text-slate-600 font-mono">
          {executionLog}
        </p>
      </div>
    </SpecimenShell>
  );
}

const INITIAL_NOTES = [
  'Review typography scale on mobile',
  'Verify contrast ratio on slate borders',
];

export function Btn5() {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState<string[]>(INITIAL_NOTES);

  const addQuickItem = (label: string) => {
    setNotes((prev) => [`${label} #${prev.length + 1}`, ...prev].slice(0, 4));
    setExpanded(false);
  };

  return (
    <SpecimenShell
      index="05"
      id="Btn5"
      categoryLabel="Core Actions"
      title="Floating Action Button (FAB)"
      summary="Elevated corner quick-create button inside an app viewport with expandable speed-dial sub-actions."
      ariaNote="aria-expanded speed-dial menu with clear labels"
    >
      <div className="relative h-56 overflow-hidden rounded-lg border border-slate-200 bg-white p-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-semibold text-slate-800">Workspace Queue</span>
          <span className="font-mono text-xs tabular-nums text-slate-500">
            {notes.length} items
          </span>
        </div>

        <ul className="mt-2.5 space-y-2 pr-14">
          {notes.map((note, idx) => (
            <li
              key={`${note}-${idx}`}
              className="truncate rounded-md border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700"
            >
              {note}
            </li>
          ))}
        </ul>

        <div className="absolute bottom-3.5 right-3.5 flex flex-col items-end gap-2">
          {expanded && (
            <div className="flex flex-col items-end gap-1.5">
              <button
                type="button"
                onClick={() => addQuickItem('New Note')}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-xs font-medium whitespace-nowrap text-slate-800 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <FilePlus2 className="h-3.5 w-3.5 text-blue-600" />
                New Note
              </button>
              <button
                type="button"
                onClick={() => addQuickItem('Uploaded File')}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-xs font-medium whitespace-nowrap text-slate-800 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <Upload className="h-3.5 w-3.5 text-blue-600" />
                Upload File
              </button>
              <button
                type="button"
                onClick={() => addQuickItem('Task Added')}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-xs font-medium whitespace-nowrap text-slate-800 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <ListTodo className="h-3.5 w-3.5 text-blue-600" />
                Add Task
              </button>
            </div>
          )}

          <button
            type="button"
            aria-label={expanded ? 'Close quick actions' : 'Open quick actions'}
            aria-expanded={expanded}
            onClick={() => setExpanded((prev) => !prev)}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition-all duration-150 hover:bg-blue-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <Plus
              className={`h-5 w-5 transition-transform duration-200 ${
                expanded ? 'rotate-45' : ''
              }`}
            />
          </button>
        </div>
      </div>
    </SpecimenShell>
  );
}
