import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArchiveRestore,
  CheckCircle2,
  Info,
  RefreshCw,
  RotateCcw,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';

export function Feedback1() {
  const DURATION_MS = 5000;
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const [remainingMs, setRemainingMs] = useState(DURATION_MS);
  const [invoiceOpened, setInvoiceOpened] = useState(false);

  useEffect(() => {
    if (!visible || paused) return;
    const interval = window.setInterval(() => {
      setRemainingMs((prev) => {
        if (prev <= 100) {
          setVisible(false);
          return 0;
        }
        return prev - 100;
      });
    }, 100);
    return () => window.clearInterval(interval);
  }, [visible, paused]);

  const handleReplay = () => {
    setInvoiceOpened(false);
    setRemainingMs(DURATION_MS);
    setVisible(true);
  };

  if (!visible) {
    return (
      <div className="flex flex-col items-end justify-center gap-2 py-4">
        <p className="text-xs text-slate-500">Toast dismissed automatically or manually.</p>
        <button
          type="button"
          onClick={handleReplay}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 shadow-xs transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 whitespace-nowrap shrink-0"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Replay Success Toast
        </button>
      </div>
    );
  }

  const progressPct = Math.max(0, Math.min(100, (remainingMs / DURATION_MS) * 100));

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="animate-feedback-enter w-full max-w-sm overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md"
    >
      <div className="flex items-start gap-3 p-4">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-4.5 w-4.5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">Payment processed</p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
            Invoice <span className="font-mono tabular-nums text-slate-800">#INV-2048</span> for{' '}
            <span className="font-mono tabular-nums text-slate-800">$480.00</span> settled cleanly.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setInvoiceOpened(true)}
              className="text-xs font-semibold text-emerald-700 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 whitespace-nowrap shrink-0"
            >
              {invoiceOpened ? 'Invoice preview opened' : 'View invoice'}
            </button>
            <span className="text-slate-300" aria-hidden="true">
              ·
            </span>
            <span className="font-mono text-[11px] tabular-nums text-slate-500">
              {paused ? 'Paused' : `${(remainingMs / 1000).toFixed(1)}s`}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Dismiss payment processed notification"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-slate-900"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="h-1 w-full bg-slate-100" aria-hidden="true">
        <div
          className="h-full bg-emerald-600 transition-[width] duration-100 ease-linear"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}

export function Feedback2() {
  const [status, setStatus] = useState<'error' | 'retrying' | 'resolved' | 'dismissed'>('error');

  const handleRetry = () => {
    setStatus('retrying');
    window.setTimeout(() => {
      setStatus('resolved');
    }, 800);
  };

  if (status === 'dismissed') {
    return (
      <div className="flex flex-col items-end justify-center gap-2 py-4">
        <p className="text-xs text-slate-500">Error notification dismissed.</p>
        <button
          type="button"
          onClick={() => setStatus('error')}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 shadow-xs transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Trigger Error Toast
        </button>
      </div>
    );
  }

  if (status === 'resolved') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="animate-feedback-enter flex w-full max-w-sm items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950"
      >
        <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-700" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Replica sync restored</p>
          <p className="mt-0.5 text-xs text-emerald-800">
            All 42 pending events were flushed to <span className="font-mono">us-east-1</span>.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setStatus('error')}
          className="rounded-md border border-emerald-300 bg-white px-2.5 py-1 text-xs font-medium text-emerald-900 hover:bg-emerald-100 whitespace-nowrap shrink-0"
        >
          Reset
        </button>
      </div>
    );
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="animate-feedback-enter w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-4 text-white shadow-lg"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/15 text-red-400">
          <XCircle className="h-4.5 w-4.5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-white">Sync failed</p>
            <span className="font-mono text-[11px] tabular-nums text-red-300">HTTP 502</span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-300">
            Upstream warehouse rejected batch write. Persistent until resolved or closed.
          </p>
          <div className="mt-3 flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleRetry}
              disabled={status === 'retrying'}
              className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${status === 'retrying' ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              {status === 'retrying' ? 'Retrying...' : 'Retry Sync'}
            </button>
            <button
              type="button"
              onClick={() => setStatus('dismissed')}
              className="rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white whitespace-nowrap shrink-0"
            >
              Dismiss
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setStatus('dismissed')}
          aria-label="Dismiss sync failed alert"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

interface SimpleToastItem {
  id: string;
  tone: 'warning' | 'info';
  title: string;
  detail: string;
}

const INITIAL_STACK: SimpleToastItem[] = [
  {
    id: 'warn-storage',
    tone: 'warning',
    title: 'Storage approaching quota',
    detail: '88% of your 50 GB workspace archive is currently allocated.',
  },
  {
    id: 'info-window',
    tone: 'info',
    title: 'Scheduled maintenance window',
    detail: 'Read replicas undergo a 4-minute upgrade Sunday at 02:00 UTC.',
  },
];

export function Feedback3() {
  const [items, setItems] = useState<SimpleToastItem[]>(INITIAL_STACK);

  const dismissItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-end justify-center gap-2 py-4">
        <p className="text-xs text-slate-500">All stacked notifications cleared.</p>
        <button
          type="button"
          onClick={() => setItems(INITIAL_STACK)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 shadow-xs transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Restore Toast Stack
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-2.5" aria-label="Notification stack">
      {items.map((item) => {
        const isWarning = item.tone === 'warning';
        return (
          <div
            key={item.id}
            role={isWarning ? 'alert' : 'status'}
            aria-live={isWarning ? 'assertive' : 'polite'}
            className={`animate-feedback-enter flex items-start gap-3 rounded-xl border p-3.5 shadow-sm ${
              isWarning
                ? 'border-amber-200 bg-amber-50/90 text-amber-950'
                : 'border-sky-200 bg-sky-50/90 text-sky-950'
            }`}
          >
            {isWarning ? (
              <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-amber-700" aria-hidden="true" />
            ) : (
              <Info className="mt-0.5 h-4.5 w-4.5 shrink-0 text-sky-700" aria-hidden="true" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{item.title}</p>
              <p
                className={`mt-0.5 text-xs leading-relaxed ${
                  isWarning ? 'text-amber-800' : 'text-sky-800'
                }`}
              >
                {item.detail}
              </p>
            </div>
            <button
              type="button"
              onClick={() => dismissItem(item.id)}
              aria-label={`Dismiss ${item.title}`}
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors ${
                isWarning
                  ? 'text-amber-700 hover:bg-amber-200/60'
                  : 'text-sky-700 hover:bg-sky-200/60'
              }`}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

const INITIAL_LOGS = [
  { id: 'log-1', name: 'prod-api-014.log' },
  { id: 'log-2', name: 'worker-eu-009.log' },
  { id: 'log-3', name: 'edge-proxy-102.log' },
];

export function Feedback8() {
  const [logs, setLogs] = useState(INITIAL_LOGS.slice(0, 1));
  const [archivedLogs, setArchivedLogs] = useState(INITIAL_LOGS.slice(1));
  const [snackbarOpen, setSnackbarOpen] = useState(true);
  const [countdown, setCountdown] = useState(6);

  useEffect(() => {
    if (!snackbarOpen) return;
    const timer = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setSnackbarOpen(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [snackbarOpen]);

  const handleArchiveTwo = () => {
    setLogs(INITIAL_LOGS.slice(0, 1));
    setArchivedLogs(INITIAL_LOGS.slice(1));
    setCountdown(6);
    setSnackbarOpen(true);
  };

  const handleUndo = () => {
    setLogs(INITIAL_LOGS);
    setArchivedLogs([]);
    setSnackbarOpen(false);
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <span className="text-xs font-medium text-slate-600">
            Active log files ({logs.length} of {INITIAL_LOGS.length})
          </span>
          <button
            type="button"
            onClick={handleArchiveTwo}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            <Trash2 className="h-3 w-3" aria-hidden="true" />
            Archive 2 Logs
          </button>
        </div>
        <ul className="mt-2 space-y-1 text-xs text-slate-700 font-mono">
          {logs.map((log) => (
            <li key={log.id} className="flex items-center justify-between py-0.5">
              <span>{log.name}</span>
              <span className="text-slate-400">active</span>
            </li>
          ))}
        </ul>
      </div>

      {snackbarOpen ? (
        <div
          role="status"
          aria-live="polite"
          className="animate-feedback-enter flex items-center justify-between gap-3 rounded-lg bg-slate-900 px-4 py-2.5 text-white shadow-lg"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <ArchiveRestore className="h-4 w-4 shrink-0 text-slate-300" aria-hidden="true" />
            <span className="truncate text-xs font-medium">
              Archived {archivedLogs.length} deployment logs
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono text-[11px] tabular-nums text-slate-400">{countdown}s</span>
            <button
              type="button"
              onClick={handleUndo}
              className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-semibold text-amber-300 transition-colors hover:bg-white/20 whitespace-nowrap shrink-0"
            >
              Undo
            </button>
            <button
              type="button"
              onClick={() => setSnackbarOpen(false)}
              aria-label="Close confirmation snackbar"
              className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            {archivedLogs.length === 0
              ? 'All 3 logs restored via Undo.'
              : 'Snackbar dismissed. 2 logs remain archived.'}
          </span>
          <button
            type="button"
            onClick={handleArchiveTwo}
            className="font-medium text-slate-800 underline underline-offset-2 hover:text-slate-950 whitespace-nowrap shrink-0"
          >
            Trigger Snackbar
          </button>
        </div>
      )}
    </div>
  );
}
