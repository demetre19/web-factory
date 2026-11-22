import { useState } from 'react';
import { Check, Cookie, Lock, RotateCcw, SlidersHorizontal, X } from 'lucide-react';

export function Feedback9() {
  const [savedChoice, setSavedChoice] = useState<string | null>(null);
  const [manageOpen, setManageOpen] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [functional, setFunctional] = useState(true);

  if (savedChoice) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-700"
      >
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          <span>{savedChoice}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setSavedChoice(null);
            setManageOpen(false);
          }}
          className="inline-flex items-center gap-1.5 font-medium text-slate-900 underline underline-offset-2 whitespace-nowrap shrink-0"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reopen Cookie Bar
        </button>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Cookie consent notice"
      className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5 min-w-0">
          <Cookie className="mt-0.5 h-4.5 w-4.5 shrink-0 text-slate-700" aria-hidden="true" />
          <p className="text-xs leading-relaxed text-slate-600">
            We use essential cookies to keep your session secure and optional analytics cookies to
            measure page reliability.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            aria-expanded={manageOpen}
            onClick={() => setManageOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            Preferences
          </button>
          <button
            type="button"
            onClick={() => setSavedChoice('Consent saved: Essential cookies only.')}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            Essential Only
          </button>
          <button
            type="button"
            onClick={() => setSavedChoice('Consent saved: All cookies accepted.')}
            className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            Accept All
          </button>
        </div>
      </div>

      {manageOpen && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-3">
          <div className="flex flex-wrap items-center gap-5 text-xs text-slate-700">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-slate-900"
              />
              <span>Analytics</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={functional}
                onChange={(e) => setFunctional(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-slate-900"
              />
              <span>Preferences</span>
            </label>
          </div>
          <button
            type="button"
            onClick={() =>
              setSavedChoice(
                `Saved custom consent (Analytics: ${analytics ? 'On' : 'Off'}, Preferences: ${
                  functional ? 'On' : 'Off'
                }).`
              )
            }
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 whitespace-nowrap shrink-0"
          >
            Save Preferences
          </button>
        </div>
      )}
    </div>
  );
}

export function Feedback10() {
  const [open, setOpen] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!open) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center gap-2.5 py-4 text-center"
      >
        <p className="text-xs font-medium text-slate-700">
          {statusMessage ?? 'Privacy preferences dialog closed.'}
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 shadow-xs hover:bg-slate-50 whitespace-nowrap shrink-0"
        >
          Open Privacy Modal
        </button>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="fb10-title"
      className="animate-feedback-enter w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 id="fb10-title" className="text-sm font-semibold text-slate-900">
            Privacy &amp; Cookie Settings
          </h4>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Choose which optional storage categories you allow for this workspace.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setStatusMessage('Modal dismissed without changing previous preferences.');
            setOpen(false);
          }}
          aria-label="Close privacy preferences dialog"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-4 divide-y divide-slate-100 border-y border-slate-100">
        <div className="flex items-center justify-between gap-3 py-2.5">
          <div>
            <p className="text-xs font-semibold text-slate-900">Strictly Necessary</p>
            <p className="text-[11px] text-slate-500">Authentication and CSRF protection</p>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 whitespace-nowrap shrink-0">
            <Lock className="h-3 w-3" aria-hidden="true" />
            Always Active
          </span>
        </div>

        <label className="flex cursor-pointer items-center justify-between gap-3 py-2.5">
          <div>
            <p className="text-xs font-semibold text-slate-900">Performance Analytics</p>
            <p className="text-[11px] text-slate-500">Anonymized latency and error diagnostics</p>
          </div>
          <input
            type="checkbox"
            checked={analytics}
            onChange={(e) => setAnalytics(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-slate-900"
          />
        </label>

        <label className="flex cursor-pointer items-center justify-between gap-3 py-2.5">
          <div>
            <p className="text-xs font-semibold text-slate-900">Product Personalization</p>
            <p className="text-[11px] text-slate-500">Remembers preferred dashboard filters</p>
          </div>
          <input
            type="checkbox"
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-slate-900"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setAnalytics(false);
            setMarketing(false);
            setStatusMessage('Rejected all optional cookies.');
            setOpen(false);
          }}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
        >
          Reject Optional
        </button>
        <button
          type="button"
          onClick={() => {
            setStatusMessage(
              `Saved preferences (Analytics: ${analytics ? 'On' : 'Off'}, Personalization: ${
                marketing ? 'On' : 'Off'
              }).`
            );
            setOpen(false);
          }}
          className="rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
}
