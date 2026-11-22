import { useState } from 'react';
import {
  AlertTriangle,
  Check,
  Download,
  KeyRound,
  RefreshCw,
  RotateCcw,
  ServerCrash,
} from 'lucide-react';

export function Feedback18() {
  const [animKey, setAnimKey] = useState(1);
  const [downloaded, setDownloaded] = useState(false);

  const handleReplay = () => {
    setDownloaded(false);
    setAnimKey((prev) => prev + 1);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 text-center"
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50">
        <svg
          key={animKey}
          className="h-6 w-6 text-emerald-600"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5 12.5l4.2 4.2L19 7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-check-draw"
          />
        </svg>
      </div>

      <h4 className="mt-3 text-sm font-semibold text-slate-900">Transfer Confirmed</h4>
      <p className="mt-1 text-xs text-slate-600">
        Settlement of <span className="font-mono font-semibold tabular-nums">$240.00</span>{' '}
        completed cleanly.
      </p>

      <div className="mt-3.5 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
        <span>Reference</span>
        <span className="font-mono font-medium tabular-nums text-slate-900">TXN-89412</span>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setDownloaded(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
        >
          {downloaded ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
              Receipt Saved
            </>
          ) : (
            <>
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Receipt PDF
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleReplay}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Replay
        </button>
      </div>
    </div>
  );
}

const METRIC_BARS = [
  { day: 'Mon', heightPct: 48, ms: '34ms' },
  { day: 'Tue', heightPct: 62, ms: '39ms' },
  { day: 'Wed', heightPct: 54, ms: '36ms' },
  { day: 'Thu', heightPct: 78, ms: '44ms' },
  { day: 'Fri', heightPct: 51, ms: '35ms' },
];

export function Feedback19() {
  const [state, setState] = useState<'error' | 'retrying' | 'loaded'>('error');
  const [showTrace, setShowTrace] = useState(false);

  const handleRetry = () => {
    setState('retrying');
    window.setTimeout(() => setState('loaded'), 750);
  };

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h4 className="text-xs font-semibold text-slate-900">API Latency Summary</h4>
          <p className="text-[11px] text-slate-500">Rolling 5-day edge percentile</p>
        </div>
        {state === 'loaded' && (
          <button
            type="button"
            onClick={() => setState('error')}
            className="text-xs font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900 whitespace-nowrap shrink-0"
          >
            Simulate Error
          </button>
        )}
      </div>

      {state === 'loaded' ? (
        <div role="status" aria-live="polite" className="mt-4">
          <div className="flex h-24 items-end gap-3 px-2">
            {METRIC_BARS.map((bar) => (
              <div key={bar.day} className="flex flex-1 flex-col items-center gap-1">
                <span className="font-mono text-[10px] tabular-nums text-slate-500">{bar.ms}</span>
                <div
                  className="w-full rounded-t-md bg-slate-900"
                  style={{ height: `${bar.heightPct}%` }}
                />
                <span className="text-[11px] text-slate-600">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          role="alert"
          aria-live="assertive"
          className="mt-3 rounded-lg border border-red-200 bg-red-50/70 p-4"
        >
          <div className="flex items-start gap-3">
            <ServerCrash className="mt-0.5 h-4.5 w-4.5 shrink-0 text-red-700" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-red-950">
                Unable to load Q4 latency metrics
              </p>
              <p className="mt-0.5 text-xs text-red-800">
                Telemetry service returned <span className="font-mono">503 Service Unavailable</span>.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={state === 'retrying'}
                  className="inline-flex items-center gap-1.5 rounded-md bg-red-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-800 disabled:opacity-65 whitespace-nowrap shrink-0"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${state === 'retrying' ? 'animate-spin' : ''}`}
                    aria-hidden="true"
                  />
                  {state === 'retrying' ? 'Retrying...' : 'Retry Fetch'}
                </button>
                <button
                  type="button"
                  aria-expanded={showTrace}
                  onClick={() => setShowTrace((prev) => !prev)}
                  className="rounded-md border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-900 hover:bg-red-100 whitespace-nowrap shrink-0"
                >
                  {showTrace ? 'Hide Details' : 'Diagnostics'}
                </button>
              </div>
              {showTrace && (
                <pre className="mt-2.5 overflow-x-auto rounded-md bg-red-950/90 p-2 font-mono text-[11px] text-red-100">
                  GET /v2/metrics/p95 → 503 (trace_id: tr_9481a0c)
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Feedback20() {
  const [authState, setAuthState] = useState<'expired' | 'connecting' | 'connected'>('expired');

  const handleReconnect = () => {
    setAuthState('connecting');
    window.setTimeout(() => setAuthState('connected'), 750);
  };

  if (authState === 'connected') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="w-full max-w-sm rounded-xl border border-emerald-200 bg-emerald-50/80 p-5 text-center"
      >
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <Check className="h-5 w-5" aria-hidden="true" />
        </div>
        <h4 className="mt-3 text-sm font-semibold text-emerald-950">GitHub Sync Connected</h4>
        <p className="mt-1 text-xs text-emerald-800">
          OAuth token refreshed cleanly for organization <span className="font-mono">northstar-hq</span>.
        </p>
        <button
          type="button"
          onClick={() => setAuthState('expired')}
          className="mt-3.5 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-900 hover:bg-emerald-100 whitespace-nowrap shrink-0"
        >
          Simulate Token Expiry
        </button>
      </div>
    );
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 text-center"
    >
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-700">
        {authState === 'connecting' ? (
          <RefreshCw className="h-5 w-5 animate-spin" aria-hidden="true" />
        ) : (
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        )}
      </div>
      <h4 className="mt-3 text-sm font-semibold text-slate-900">
        Repository sync paused — token expired
      </h4>
      <p className="mt-1 text-xs leading-relaxed text-slate-600">
        Your read-only GitHub installation token expired 14 minutes ago. Re-authorize to resume deploy hooks.
      </p>
      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={handleReconnect}
          disabled={authState === 'connecting'}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-65 whitespace-nowrap shrink-0"
        >
          <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
          {authState === 'connecting' ? 'Reconnecting...' : 'Reconnect Account'}
        </button>
      </div>
    </div>
  );
}
