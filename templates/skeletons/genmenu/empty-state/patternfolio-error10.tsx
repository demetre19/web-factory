import React, { useState } from 'react';
import { RotateCw, X } from 'lucide-react';

export function Error10() {
  const [retrying, setRetrying] = useState(false);
  const [outcome, setOutcome] = useState<string | null>(null);

  const handleRetry = () => {
    setRetrying(true);
    setOutcome('Waiting for upstream gateway response...');
    setTimeout(() => {
      setRetrying(false);
      setOutcome('Gateway responded after retry attempt — report export ready.');
    }, 650);
  };

  return (
    <main className="min-h-[680px] w-full bg-slate-50 text-slate-900 flex items-center justify-center p-6">
      <section aria-label="Request timeout" className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 text-center space-y-6">
        <div className="mx-auto flex justify-center">
          <svg aria-hidden="true" width="112" height="112" viewBox="0 0 112 112" fill="none">
            <circle cx="56" cy="56" r="46" stroke="#E2E8F0" strokeWidth="4" />
            <path
              d="M56 10A46 46 0 0 1 102 56"
              stroke="#D97706"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path d="M40 34H72" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M40 78H72" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
            <path
              d="M44 34C44 46 56 50 56 56C56 62 44 66 44 78H68C68 66 56 62 56 56C56 50 68 46 68 34H44Z"
              fill="#FEF3C7"
              stroke="#334155"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-mono tabular-nums text-amber-700 font-medium">
            HTTP 504 · Gateway Timeout (30s)
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            The request timed out
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            The reporting server took longer than expected to compile this dataset. None of your saved changes were lost.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={handleRetry}
            disabled={retrying}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            <RotateCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>{retrying ? 'Retrying...' : 'Retry now'}</span>
          </button>
          <button
            type="button"
            onClick={() => setOutcome('Request cancelled. Returned to dashboard.')}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            <X className="w-4 h-4" aria-hidden="true" />
            <span>Cancel</span>
          </button>
        </div>

        {outcome && (
          <p role="status" className="text-xs text-slate-700 bg-slate-100 rounded-lg px-3.5 py-2.5">
            {outcome}
          </p>
        )}
      </section>
    </main>
  );
}
