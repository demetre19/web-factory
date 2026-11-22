import React, { useState } from 'react';
import { RefreshCw, ExternalLink } from 'lucide-react';

export function Error2() {
  const [retrying, setRetrying] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleRetry = () => {
    setRetrying(true);
    setStatusMessage('Re-sending request to upstream cluster...');
    setTimeout(() => {
      setRetrying(false);
      setStatusMessage('Upstream returned 500 again. Incident INC-8492-B remains under investigation.');
    }, 600);
  };

  return (
    <main className="min-h-[680px] w-full bg-slate-50 text-slate-900 flex items-center justify-center p-6">
      <section
        aria-label="Internal server error"
        className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
      >
        <div className="md:col-span-5 flex justify-center">
          <svg
            aria-hidden="true"
            viewBox="0 0 200 180"
            className="w-44 h-40 text-slate-800"
            fill="none"
          >
            <rect x="28" y="22" width="144" height="36" rx="6" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
            <circle cx="46" cy="40" r="4" fill="#64748B" />
            <rect x="62" y="37" width="60" height="6" rx="3" fill="#CBD5E1" />

            <rect x="28" y="70" width="144" height="36" rx="6" fill="#FEF2F2" stroke="#EF4444" strokeWidth="2" />
            <circle cx="46" cy="88" r="4" fill="#DC2626" />
            <rect x="62" y="85" width="48" height="6" rx="3" fill="#FCA5A5" />
            <path d="M144 82L156 94M156 82L144 94" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" />

            <rect x="28" y="118" width="144" height="36" rx="6" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
            <circle cx="46" cy="136" r="4" fill="#64748B" />
            <rect x="62" y="133" width="76" height="6" rx="3" fill="#CBD5E1" />

            <path d="M100 58V70M100 106V118" stroke="#94A3B8" strokeWidth="2" strokeDasharray="3 3" />
          </svg>
        </div>

        <div className="md:col-span-7 space-y-4">
          <p className="text-xs font-mono tabular-nums text-red-700 font-medium">
            HTTP 500 · Incident INC-8492-B
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
            Internal server error
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Our application server encountered an unexpected fault while processing your request. Engineering has been automatically alerted.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRetry}
              disabled={retrying}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span>{retrying ? 'Retrying...' : 'Retry request'}</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusMessage('All other regional API clusters report operational status.')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
            >
              <span>System status</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          {statusMessage && (
            <p role="status" className="text-xs text-slate-600 bg-slate-100 rounded-lg px-3 py-2">
              {statusMessage}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
