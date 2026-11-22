import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Bell,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';

export function Feedback4() {
  const [dismissed, setDismissed] = useState(false);
  const [renewed, setRenewed] = useState(false);

  if (dismissed) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs text-slate-600">
        <span>Page-level top alert banner dismissed.</span>
        <button
          type="button"
          onClick={() => {
            setDismissed(false);
            setRenewed(false);
          }}
          className="inline-flex items-center gap-1.5 font-medium text-slate-900 underline underline-offset-2 whitespace-nowrap shrink-0"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Restore Page Banner
        </button>
      </div>
    );
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`w-full border px-4 py-3 transition-colors ${
        renewed
          ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
          : 'border-amber-200 bg-amber-50 text-amber-950'
      }`}
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {renewed ? (
            <Check className="h-4.5 w-4.5 shrink-0 text-emerald-700" aria-hidden="true" />
          ) : (
            <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-amber-700" aria-hidden="true" />
          )}
          <p className="text-xs sm:text-sm font-medium leading-snug">
            {renewed
              ? 'TLS certificate renewed for api.northstar.io — valid through November 2027.'
              : 'Your custom domain TLS certificate for api.northstar.io expires in 3 days.'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!renewed && (
            <button
              type="button"
              onClick={() => setRenewed(true)}
              className="rounded-md bg-amber-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-800 whitespace-nowrap shrink-0"
            >
              Renew Certificate
            </button>
          )}
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss TLS expiration page alert"
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-black/5 hover:text-slate-900"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Feedback5() {
  const [visible, setVisible] = useState(true);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <p className="text-sm font-semibold text-slate-900">Billing Members &amp; Roles</p>
          <p className="text-xs text-slate-500">Section context inside Organization Settings</p>
        </div>
        {!visible && (
          <button
            type="button"
            onClick={() => setVisible(true)}
            className="text-xs font-medium text-sky-700 underline underline-offset-2 whitespace-nowrap shrink-0"
          >
            Show Section Alert
          </button>
        )}
      </div>

      {visible && (
        <div
          role="status"
          aria-live="polite"
          className="mt-3 rounded-lg border border-sky-200 bg-sky-50/80 p-3.5 text-sky-950"
        >
          <div className="flex items-start gap-2.5">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold text-sky-950">
                  Role edits are temporarily locked for this billing cycle
                </p>
                <button
                  type="button"
                  onClick={() => setVisible(false)}
                  aria-label="Dismiss section billing lock notice"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-sky-700 hover:bg-sky-200/60"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-sky-900">
                Seat assignments freeze 24 hours before invoice generation on the 1st of each month.
              </p>
              <div className="mt-2">
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setExpanded((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-sky-800 hover:text-sky-950 whitespace-nowrap shrink-0"
                >
                  {expanded ? 'Hide freeze schedule' : 'View freeze schedule'}
                  {expanded ? (
                    <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {expanded && (
                <p className="mt-2 border-t border-sky-200/80 pt-2 text-xs text-sky-900">
                  Scheduled edits resume automatically on Dec 1 at 00:15 UTC. Urgent owner transfers can be requested through Support.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>3 active billing administrators</span>
        <span className="font-mono tabular-nums">$120 / month</span>
      </div>
    </div>
  );
}

export function Feedback6() {
  const [dismissed, setDismissed] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);

  if (dismissed) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-xs text-slate-600">
        <span>Release announcement bar dismissed.</span>
        <button
          type="button"
          onClick={() => setDismissed(false)}
          className="font-medium text-slate-900 underline underline-offset-2 whitespace-nowrap shrink-0"
        >
          Show Announcement
        </button>
      </div>
    );
  }

  return (
    <div role="status" aria-live="polite" className="w-full overflow-hidden rounded-lg bg-slate-950 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <Sparkles className="h-4 w-4 shrink-0 text-blue-400" aria-hidden="true" />
          <p className="text-xs sm:text-sm font-medium text-slate-100">
            <span className="font-semibold text-white">2026.4 Release</span>
            <span className="mx-2 text-slate-500" aria-hidden="true">
              ·
            </span>
            Batch exports now stream directly to Parquet and Apache Arrow.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            aria-expanded={showChangelog}
            onClick={() => setShowChangelog((prev) => !prev)}
            className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-white/20 whitespace-nowrap shrink-0"
          >
            {showChangelog ? 'Hide Notes' : 'Release Notes'}
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss release announcement bar"
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      {showChangelog && (
        <div className="border-t border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-slate-300">
          Includes zero-copy Arrow buffers, automatic Zstd compression, and CLI support via{' '}
          <span className="font-mono text-slate-100">atlas export --format=parquet</span>.
        </div>
      )}
    </div>
  );
}

export function Feedback11() {
  const [visible, setVisible] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(542);
  const [reminded, setReminded] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 542));
    }, 1000);
    return () => window.clearInterval(id);
  }, [visible]);

  if (!visible) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-xs text-slate-600">
        <span>Event announcement strip closed.</span>
        <button
          type="button"
          onClick={() => setVisible(true)}
          className="font-medium text-slate-900 underline underline-offset-2 whitespace-nowrap shrink-0"
        >
          Reopen Strip
        </button>
      </div>
    );
  }

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-indigo-950"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <CalendarClock className="h-4 w-4 shrink-0 text-indigo-700" aria-hidden="true" />
        <p className="text-xs sm:text-sm font-medium">
          EU-Central schema migration starts in{' '}
          <span className="font-mono font-semibold tabular-nums text-indigo-900">
            00:{mins}:{secs}
          </span>
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setReminded((prev) => !prev)}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
            reminded
              ? 'bg-emerald-700 text-white hover:bg-emerald-800'
              : 'bg-indigo-700 text-white hover:bg-indigo-800'
          }`}
        >
          {reminded ? (
            <>
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Reminder Set
            </>
          ) : (
            <>
              <Bell className="h-3.5 w-3.5" aria-hidden="true" />
              Notify Me
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Dismiss migration countdown announcement"
          className="flex h-7 w-7 items-center justify-center rounded-md text-indigo-700 hover:bg-indigo-200/60"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
