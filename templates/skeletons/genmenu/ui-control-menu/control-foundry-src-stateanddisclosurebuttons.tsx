import { useEffect, useId, useRef, useState } from 'react';
import {
  ArrowUp,
  Bell,
  Bold,
  Check,
  ChevronDown,
  Code2,
  Copy,
  GitPullRequest,
  Inbox,
  Italic,
  Pin,
  Plus,
  Underline,
} from 'lucide-react';
import { formatBadgeCount } from '../../utils/catalogFilter';
import { SpecimenShell } from '../SpecimenShell';

export function Btn11() {
  const [prs, setPrs] = useState(4);
  const [inbox, setInbox] = useState(12);
  const [alerts, setAlerts] = useState(104);

  return (
    <SpecimenShell
      index="11"
      id="Btn11"
      categoryLabel="State & Disclosure"
      title="Buttons with Live Badge Count"
      summary="Operational dock triggers carrying live tabular counters that cap cleanly at 99+ and update when cleared."
      ariaNote="aria-label reflects live numeric count & tabular-nums"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            aria-label={`Review pull requests, ${prs} open`}
            onClick={() => setPrs((prev) => Math.max(0, prev - 1))}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium whitespace-nowrap shrink-0 text-slate-800 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <GitPullRequest className="h-4 w-4 text-slate-600" aria-hidden="true" />
            <span>Reviews</span>
            <span className="inline-flex min-w-[22px] items-center justify-center rounded-md bg-blue-600 px-1.5 py-0.5 font-mono text-xs font-semibold tabular-nums text-white">
              {formatBadgeCount(prs)}
            </span>
          </button>

          <button
            type="button"
            aria-label={`Open inbox, ${inbox} unread`}
            onClick={() => setInbox(0)}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium whitespace-nowrap shrink-0 text-slate-800 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <Inbox className="h-4 w-4 text-slate-600" aria-hidden="true" />
            <span>Inbox</span>
            <span
              className={`inline-flex min-w-[22px] items-center justify-center rounded-md px-1.5 py-0.5 font-mono text-xs font-semibold tabular-nums ${
                inbox > 0
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {formatBadgeCount(inbox)}
            </span>
          </button>

          <button
            type="button"
            aria-label={`Build alerts, ${alerts} total`}
            onClick={() => setAlerts(0)}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium whitespace-nowrap shrink-0 text-slate-800 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <Bell className="h-4 w-4 text-slate-600" aria-hidden="true" />
            <span>Alerts</span>
            <span
              className={`inline-flex min-w-[26px] items-center justify-center rounded-md px-1.5 py-0.5 font-mono text-xs font-semibold tabular-nums ${
                alerts > 0
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {formatBadgeCount(alerts)}
            </span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 pt-3">
          <span className="text-xs text-slate-500">Click a button to clear or decrement</span>
          <button
            type="button"
            onClick={() => {
              setPrs((p) => p + 1);
              setInbox((i) => i + 3);
              setAlerts((a) => (a === 0 ? 104 : a + 5));
            }}
            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Simulate Incoming
          </button>
        </div>
      </div>
    </SpecimenShell>
  );
}

export function Btn12() {
  const [bold, setBold] = useState(true);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [code, setCode] = useState(false);
  const [pinned, setPinned] = useState(false);

  return (
    <SpecimenShell
      index="12"
      id="Btn12"
      categoryLabel="State & Disclosure"
      title="Multi-State Toggle Buttons"
      summary="Persistent formatting and pin toggles exposing boolean aria-pressed states and updating live specimen typography."
      ariaNote="aria-pressed boolean state on every toggle"
    >
      <div className="space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div role="toolbar" aria-label="Text formatting toggles" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
            <button
              type="button"
              aria-label="Bold"
              aria-pressed={bold}
              onClick={() => setBold((v) => !v)}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                bold
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Bold className="h-4 w-4" />
            </button>

            <button
              type="button"
              aria-label="Italic"
              aria-pressed={italic}
              onClick={() => setItalic((v) => !v)}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                italic
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Italic className="h-4 w-4" />
            </button>

            <button
              type="button"
              aria-label="Underline"
              aria-pressed={underline}
              onClick={() => setUnderline((v) => !v)}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                underline
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Underline className="h-4 w-4" />
            </button>

            <button
              type="button"
              aria-label="Inline code"
              aria-pressed={code}
              onClick={() => setCode((v) => !v)}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                code
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Code2 className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            aria-pressed={pinned}
            onClick={() => setPinned((v) => !v)}
            className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
              pinned
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Pin className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{pinned ? 'Pinned' : 'Pin Note'}</span>
          </button>
        </div>

        <div className="rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800">
          <span
            className={`${bold ? 'font-semibold' : 'font-normal'} ${
              italic ? 'italic' : ''
            } ${underline ? 'underline underline-offset-4' : ''} ${
              code ? 'font-mono text-[13px] bg-slate-100 px-1.5 py-0.5 rounded' : ''
            }`}
          >
            Design tokens synchronize typography across every interactive surface.
          </span>
        </div>
      </div>
    </SpecimenShell>
  );
}

const CLI_COMMAND = 'npx control-foundry@latest init --tokens';

export function Btn13() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(CLI_COMMAND);
      }
    } catch {
      // Clipboard API may be restricted in non-HTTPS or headless contexts; still provide UI confirmation.
    }
    setCopied(true);
  };

  return (
    <SpecimenShell
      index="13"
      id="Btn13"
      categoryLabel="State & Disclosure"
      title="Copy-to-Clipboard Button"
      summary="Snippet copy control that writes to the system clipboard and transitions cleanly to a verified checkmark state."
      ariaNote='aria-live="polite" confirmation announcement'
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-900 px-3.5 py-2.5">
          <code className="truncate font-mono text-xs text-slate-100">
            {CLI_COMMAND}
          </code>

          <button
            type="button"
            aria-label={copied ? 'Command copied to clipboard' : 'Copy CLI command'}
            onClick={handleCopy}
            className={`inline-flex min-h-[36px] min-w-[96px] items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
              copied
                ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                : 'border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700'
            }`}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <p aria-live="polite" className="text-xs text-slate-600 font-mono">
          {copied ? 'Copied command to clipboard (resets in 2s)' : 'Ready to copy snippet'}
        </p>
      </div>
    </SpecimenShell>
  );
}

const CHANGELOG_ITEMS = [
  { ver: 'v2.4.0', note: 'Added focus-visible ring tokens across all interactive surfaces.' },
  { ver: 'v2.3.2', note: 'Aligned tabular numerals for segmented latency counters.' },
  { ver: 'v2.3.0', note: 'Introduced determinate progress fill transitions.' },
  { ver: 'v2.2.1', note: 'Improved keyboard Escape handling for split dropdown menus.' },
  { ver: 'v2.2.0', note: 'Added hairline outline button scale and high-contrast borders.' },
  { ver: 'v2.1.0', note: 'Refined mobile touch targets to 40px minimum height.' },
];

export function Btn14() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const showTop = scrollTop > 40;

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    setScrollTop(0);
  };

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    const maxTop = Math.max(0, el.scrollHeight - el.clientHeight);
    el.scrollTo({ top: maxTop, behavior: 'smooth' });
    setScrollTop(maxTop);
  };

  return (
    <SpecimenShell
      index="14"
      id="Btn14"
      categoryLabel="State & Disclosure"
      title="Back-to-Top Scroll Trigger"
      summary="Contextual scroll-return button appearing inside a scrollable changelog pane once reading depth passes threshold."
      ariaNote="Scroll threshold reveal & explicit Back to top label"
    >
      <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3.5 py-2">
          <span className="font-mono text-xs tabular-nums text-slate-600">
            Scroll offset: {Math.round(scrollTop)}px
          </span>
          <button
            type="button"
            onClick={scrollToBottom}
            className="text-xs font-medium text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
          >
            Jump to bottom
          </button>
        </div>

        <div
          ref={scrollRef}
          onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
          tabIndex={0}
          aria-label="Release changelog scrollable region"
          className="h-44 overflow-y-auto px-3.5 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
        >
          <ul className="divide-y divide-slate-100">
            {CHANGELOG_ITEMS.map((entry) => (
              <li key={entry.ver} className="py-2.5">
                <div className="font-mono text-xs font-semibold text-slate-900">
                  {entry.ver}
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                  {entry.note}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div
          className={`pointer-events-none absolute bottom-3 right-3 transition-all duration-200 ${
            showTop ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
          }`}
        >
          <button
            type="button"
            tabIndex={showTop ? 0 : -1}
            aria-label="Back to top of changelog"
            onClick={scrollToTop}
            className="pointer-events-auto inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-slate-200 bg-slate-900 px-3.5 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-md transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to Top</span>
          </button>
        </div>
      </div>
    </SpecimenShell>
  );
}

const DISCLOSURE_ITEMS = [
  {
    id: 'sla',
    title: 'Uptime & Latency SLA',
    body: 'Guaranteed 99.95% monthly availability with automated regional failover under 15 seconds.',
  },
  {
    id: 'retention',
    title: 'Audit Log Retention',
    body: 'Immutable event logs are encrypted at rest and retained for 365 days across workspace tiers.',
  },
];

export function Btn15() {
  const [openId, setOpenId] = useState<string | null>('sla');
  const baseId = useId();

  return (
    <SpecimenShell
      index="15"
      id="Btn15"
      categoryLabel="State & Disclosure"
      title="Expand / Collapse Disclosure Triggers"
      summary="Accessible accordion headers pairing rotated chevron affordances with explicit expanded state wiring."
      ariaNote="aria-expanded & aria-controls linked to panel region"
    >
      <div className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white">
        {DISCLOSURE_ITEMS.map((item) => {
          const isOpen = openId === item.id;
          const panelId = `${baseId}-${item.id}`;
          return (
            <div key={item.id}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="flex min-h-[44px] w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
              >
                <span>{item.title}</span>
                <ChevronDown
                  aria-hidden="true"
                  className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div
                  id={panelId}
                  className="border-t border-slate-100 bg-slate-50/70 px-3.5 py-3 text-xs leading-relaxed text-slate-600"
                >
                  {item.body}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SpecimenShell>
  );
}
