import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  X,
} from 'lucide-react';
import { formatTransferStats } from '../../utils/feedbackCatalog';

export function Feedback13() {
  const [percent, setPercent] = useState(64);
  const [running, setRunning] = useState(true);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (!running || cancelled || percent >= 100) return;
    const id = window.setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) return 100;
        return Math.min(100, prev + 3);
      });
    }, 650);
    return () => window.clearInterval(id);
  }, [running, cancelled, percent]);

  const stats = formatTransferStats(percent, 24.0);

  if (cancelled) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex w-full max-w-md items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4"
      >
        <div>
          <p className="text-xs font-semibold text-slate-900">Export cancelled</p>
          <p className="text-[11px] text-slate-500">Partial archive discarded safely.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCancelled(false);
            setPercent(12);
            setRunning(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Restart Export
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-900">
            dataset_q4_ledger.parquet
          </p>
          <p role="status" aria-live="polite" className="mt-0.5 text-[11px] text-slate-500">
            {stats.phaseLabel}
          </p>
        </div>
        <span className="font-mono text-xs font-semibold tabular-nums text-slate-900 shrink-0">
          {stats.clampedPercent}%
        </span>
      </div>

      <div
        role="progressbar"
        aria-label="Dataset export progress"
        aria-valuenow={stats.clampedPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ease-out ${
            stats.clampedPercent === 100 ? 'bg-emerald-600' : 'bg-blue-600'
          }`}
          style={{ width: `${stats.clampedPercent}%` }}
        />
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] tabular-nums text-slate-500">
          {stats.transferredMb} / {stats.totalMbFormatted} MB · {stats.etaText}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {stats.clampedPercent < 100 ? (
            <>
              <button
                type="button"
                onClick={() => setRunning((prev) => !prev)}
                aria-label={running ? 'Pause export' : 'Resume export'}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
              >
                {running ? (
                  <>
                    <Pause className="h-3 w-3" aria-hidden="true" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3" aria-hidden="true" />
                    Resume
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setCancelled(true)}
                aria-label="Cancel export"
                className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setPercent(0);
                setRunning(true);
              }}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              Run Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function Feedback14() {
  const [phase, setPhase] = useState<'validating' | 'indexing' | 'done'>('validating');
  const [buttonBusy, setButtonBusy] = useState(false);

  const runSequence = () => {
    setPhase('validating');
    window.setTimeout(() => setPhase('indexing'), 900);
    window.setTimeout(() => setPhase('done'), 1800);
  };

  const triggerButton = () => {
    setButtonBusy(true);
    window.setTimeout(() => setButtonBusy(false), 1100);
  };

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <div
        role="status"
        aria-live="polite"
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5"
      >
        <div className="flex items-center gap-3 min-w-0">
          {phase === 'done' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
          ) : (
            <svg
              className="h-5 w-5 shrink-0 animate-spin text-blue-600"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
              <path
                d="M21 12a9 9 0 0 0-9-9"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-900">
              {phase === 'validating' && 'Validating schema definitions...'}
              {phase === 'indexing' && 'Indexing 1,420 ledger entries...'}
              {phase === 'done' && 'Workspace index synchronized'}
            </p>
            <p className="text-[11px] text-slate-500">
              {phase === 'done' ? 'Ready for query execution' : 'Usually finishes in under 2 seconds'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={runSequence}
          className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
        >
          <RefreshCw className="h-3 w-3" aria-hidden="true" />
          Cycle
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={triggerButton}
          disabled={buttonBusy}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-75 whitespace-nowrap shrink-0"
        >
          {buttonBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
          {buttonBusy ? 'Deploying Snapshot...' : 'Test Button Spinner'}
        </button>
        <span role="status" className="inline-flex items-center gap-1.5 text-xs text-slate-600">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" aria-hidden="true" />
          Background sync active
        </span>
      </div>
    </div>
  );
}

export function Feedback15() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="w-full max-w-sm space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">
          State: {loading ? 'Skeleton Loading' : 'Loaded Card'}
        </span>
        <button
          type="button"
          onClick={() => setLoading((prev) => !prev)}
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0"
        >
          {loading ? 'Show Loaded Card' : 'Show Skeleton'}
        </button>
      </div>

      <div
        role="status"
        aria-busy={loading}
        aria-label={loading ? 'Loading workspace card' : 'Workspace card ready'}
        className="rounded-xl border border-slate-200 bg-white p-4"
      >
        {loading ? (
          <div className="animate-pulse">
            <div className="h-24 w-full rounded-lg bg-slate-200" />
            <div className="mt-3.5 h-4 w-2/3 rounded bg-slate-200" />
            <div className="mt-2 h-3 w-full rounded bg-slate-100" />
            <div className="mt-1.5 h-3 w-4/5 rounded bg-slate-100" />
            <div className="mt-4 flex items-center justify-between">
              <div className="h-3 w-20 rounded bg-slate-200" />
              <div className="h-7 w-20 rounded-md bg-slate-200" />
            </div>
          </div>
        ) : (
          <div>
            <div className="flex h-24 w-full items-end rounded-lg bg-slate-900 p-3 text-white">
              <span className="font-mono text-xs text-slate-300">Q4 TELEMETRY SNAPSHOT</span>
            </div>
            <h4 className="mt-3.5 text-sm font-semibold text-slate-900">
              Edge Latency &amp; Region Routing
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Median p95 response held at 38 ms across 14 edge PoPs during peak load.
            </p>
            <div className="mt-3.5 flex items-center justify-between">
              <span className="font-mono text-[11px] tabular-nums text-slate-500">Updated 2m ago</span>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-800">
                Open Report
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const FEED_ITEMS = [
  { id: '1', initials: 'AK', actor: 'Ananya Kapoor rotated API key', time: '09:42 UTC' },
  { id: '2', initials: 'MR', actor: 'Marcus Reed updated webhook rules', time: '09:18 UTC' },
  { id: '3', initials: 'SL', actor: 'Sora Lin exported Q4 audit log', time: '08:55 UTC' },
  { id: '4', initials: 'JT', actor: 'Jonas Thiel verified domain DNS', time: '08:12 UTC' },
];

export function Feedback16() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="w-full max-w-md space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">
          Feed: {loading ? 'Skeleton Rows (4)' : 'Populated Audit List'}
        </span>
        <button
          type="button"
          onClick={() => setLoading((prev) => !prev)}
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0"
        >
          {loading ? 'Load Feed' : 'Reset Skeleton'}
        </button>
      </div>

      <div
        role="status"
        aria-busy={loading}
        aria-label={loading ? 'Loading activity feed' : 'Activity feed loaded'}
        className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white"
      >
        {loading
          ? [0, 1, 2, 3].map((idx) => (
              <div key={idx} className="flex animate-pulse items-center gap-3 px-4 py-3">
                <div className="h-8 w-8 shrink-0 rounded-full bg-slate-200" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="h-3 w-3/4 rounded bg-slate-200" />
                  <div className="h-2.5 w-1/3 rounded bg-slate-100" />
                </div>
                <div className="h-3 w-14 shrink-0 rounded bg-slate-200" />
              </div>
            ))
          : FEED_ITEMS.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                  {entry.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-900">{entry.actor}</p>
                  <p className="text-[11px] text-slate-500">Security &amp; Audit</p>
                </div>
                <span className="font-mono text-[11px] tabular-nums text-slate-500 shrink-0">
                  {entry.time}
                </span>
              </div>
            ))}
      </div>
    </div>
  );
}

const TABLE_ROWS = [
  { id: 'INV-401', client: 'Northstar Labs', amount: '$1,240.00', status: 'Paid' },
  { id: 'INV-402', client: 'Kestrel Bio', amount: '$890.00', status: 'Paid' },
  { id: 'INV-403', client: 'Helios Freight', amount: '$2,150.00', status: 'Pending' },
  { id: 'INV-404', client: 'Verve Studio', amount: '$640.00', status: 'Paid' },
];

export function Feedback17() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="w-full space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">
          Table: {loading ? 'Loading Rows' : 'Populated Ledger'}
        </span>
        <button
          type="button"
          onClick={() => setLoading((prev) => !prev)}
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0"
        >
          {loading ? 'Populate Table' : 'Show Table Skeleton'}
        </button>
      </div>

      <div
        role="status"
        aria-busy={loading}
        aria-label={loading ? 'Loading billing invoices table' : 'Billing invoices loaded'}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
      >
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600">
              <th className="px-3.5 py-2.5">Invoice</th>
              <th className="px-3.5 py-2.5">Account</th>
              <th className="px-3.5 py-2.5 text-right">Amount</th>
              <th className="px-3.5 py-2.5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading
              ? [0, 1, 2, 3].map((idx) => (
                  <tr key={idx} className="h-10 animate-pulse">
                    <td className="px-3.5 py-2">
                      <div className="h-3 w-16 rounded bg-slate-200" />
                    </td>
                    <td className="px-3.5 py-2">
                      <div className="h-3 w-28 rounded bg-slate-200" />
                    </td>
                    <td className="px-3.5 py-2">
                      <div className="ml-auto h-3 w-16 rounded bg-slate-200" />
                    </td>
                    <td className="px-3.5 py-2">
                      <div className="ml-auto h-3 w-12 rounded bg-slate-100" />
                    </td>
                  </tr>
                ))
              : TABLE_ROWS.map((row) => (
                  <tr key={row.id} className="h-10 text-slate-800 hover:bg-slate-50/70">
                    <td className="px-3.5 py-2 font-mono tabular-nums text-slate-600">{row.id}</td>
                    <td className="px-3.5 py-2 font-medium text-slate-900">{row.client}</td>
                    <td className="px-3.5 py-2 text-right font-mono tabular-nums">{row.amount}</td>
                    <td className="px-3.5 py-2 text-right font-medium text-emerald-700">
                      {row.status}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
