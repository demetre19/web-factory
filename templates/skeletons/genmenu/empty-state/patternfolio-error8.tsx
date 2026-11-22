import React, { useState } from 'react';
import { ShieldAlert, ArrowLeft, CheckCircle2 } from 'lucide-react';

export function Error8() {
  const [requested, setRequested] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  return (
    <main className="min-h-[680px] w-full bg-slate-50 text-slate-900 flex items-center justify-center p-6">
      <section aria-label="Access denied" className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 space-y-6">
        <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
          <ShieldAlert className="w-5 h-5" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-mono tabular-nums text-slate-500">HTTP 403 · Forbidden</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            You don&apos;t have permission to view billing settings
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Your current workspace role does not include administrative access to invoices and payment methods.
          </p>
        </div>

        <dl className="border-t border-b border-slate-200 py-4 grid grid-cols-2 gap-4 text-xs">
          <div>
            <dt className="text-slate-500">Current role</dt>
            <dd className="mt-1 font-semibold text-slate-900">Contributor</dd>
          </div>
          <div>
            <dt className="text-slate-500">Required role</dt>
            <dd className="mt-1 font-semibold text-slate-900">Workspace Admin</dd>
          </div>
        </dl>

        {requested ? (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-2.5 text-sm text-emerald-900" role="status">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
            <span>Access request sent to your workspace administrators.</span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => {
                setRequested(true);
                setNote(null);
              }}
              className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              Request admin access
            </button>
            <button
              type="button"
              onClick={() => setNote('Returned to workspace overview.')}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Go back</span>
            </button>
          </div>
        )}

        {note && (
          <p role="status" className="text-xs text-slate-600">
            {note}
          </p>
        )}
      </section>
    </main>
  );
}
