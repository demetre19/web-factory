import React, { useState } from 'react';
import { BellOff, RefreshCw, SlidersHorizontal } from 'lucide-react';

export function Error5() {
  const [showPrefs, setShowPrefs] = useState(false);
  const [mentionsOnly, setMentionsOnly] = useState(true);
  const [checkedAt, setCheckedAt] = useState('Just now');

  return (
    <main className="min-h-[680px] w-full bg-slate-50 text-slate-900 flex items-center justify-center p-6">
      <section
        aria-label="No notifications"
        className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 text-center"
      >
        <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
          <BellOff className="w-5 h-5" aria-hidden="true" />
        </div>

        <h1 className="mt-5 text-xl font-semibold tracking-tight text-slate-900">
          You&apos;re all caught up
        </h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          New mentions, review requests, and billing alerts will appear here when they arrive.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setCheckedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            aria-expanded={showPrefs}
            onClick={() => setShowPrefs((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Preferences</span>
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-500 tabular-nums" role="status">
          Last checked: {checkedAt}
        </p>

        {showPrefs && (
          <div className="mt-6 pt-5 border-t border-slate-200 text-left space-y-3">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="error5-mentions" className="text-xs font-medium text-slate-800">
                Notify only on direct @mentions
              </label>
              <input
                id="error5-mentions"
                type="checkbox"
                checked={mentionsOnly}
                onChange={(e) => setMentionsOnly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900/20"
              />
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
