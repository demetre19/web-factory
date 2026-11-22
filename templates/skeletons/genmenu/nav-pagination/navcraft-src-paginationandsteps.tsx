import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { getBoundedPage, getPaginationRange } from '../../utils/navHelpers';

/* -------------------------------------------------------------------------- */
/* Nav8: Numbered Pagination Controls                                         */
/* -------------------------------------------------------------------------- */
export function Nav8() {
  const totalPages = 12;
  const pageSize = 10;
  const [page, setPage] = useState(5);
  const tokens = getPaginationRange(page, totalPages, 1);

  const startItem = (page - 1) * pageSize + 1;
  const endItem = page * pageSize;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 tabular-nums">
        <span>
          Showing {startItem}–{endItem} of {totalPages * pageSize} records
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage(1)}
            className="text-blue-600 hover:underline"
          >
            First
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => setPage(totalPages)}
            className="text-blue-600 hover:underline"
          >
            Last
          </button>
        </div>
      </div>

      <nav aria-label="Numbered pagination">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => getBoundedPage(p, -1, totalPages))}
              aria-label="Previous page"
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              <span>Prev</span>
            </button>
          </li>

          {tokens.map((token) => {
            if (typeof token !== 'number') {
              return (
                <li key={token} aria-hidden="true" className="px-1.5 text-sm text-slate-400">
                  …
                </li>
              );
            }
            const isCurrent = token === page;
            return (
              <li key={token}>
                <button
                  type="button"
                  onClick={() => setPage(token)}
                  aria-current={isCurrent ? 'page' : undefined}
                  aria-label={`Page ${token}`}
                  className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-medium tabular-nums transition-colors ${
                    isCurrent
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {token}
                </button>
              </li>
            );
          })}

          <li>
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((p) => getBoundedPage(p, 1, totalPages))}
              aria-label="Next page"
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </li>
        </ol>
      </nav>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Nav9: Compact Pagination Controls                                          */
/* -------------------------------------------------------------------------- */
export function Nav9() {
  const totalPages = 14;
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  return (
    <nav
      aria-label="Compact pagination"
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5"
    >
      <div className="flex items-center gap-2 text-xs text-slate-600">
        <label htmlFor="nav9-rows" className="whitespace-nowrap">
          Rows per page
        </label>
        <select
          id="nav9-rows"
          value={rowsPerPage}
          onChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setPage(1);
          }}
          className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-800 focus:outline-2 focus:outline-blue-600"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <span className="mr-1 text-xs font-medium text-slate-700 tabular-nums">
          Page {page} of {totalPages}
        </span>

        <button
          type="button"
          disabled={page === 1}
          onClick={() => setPage(1)}
          aria-label="First page"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          disabled={page === 1}
          onClick={() => setPage((p) => getBoundedPage(p, -1, totalPages))}
          aria-label="Previous page"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => setPage((p) => getBoundedPage(p, 1, totalPages))}
          aria-label="Next page"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => setPage(totalPages)}
          aria-label="Last page"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ChevronsRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/* Nav10: Sequential Prev / Next Article Pagination                           */
/* -------------------------------------------------------------------------- */
const CHAPTERS = [
  '01. Getting Started',
  '02. Authentication Flows',
  '03. Webhook Signatures',
  '04. Rate Limiting',
  '05. Production Checklist',
];

export function Nav10() {
  const [index, setIndex] = useState(1);
  const hasPrev = index > 0;
  const hasNext = index < CHAPTERS.length - 1;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Current: {CHAPTERS[index]}</span>
        <span className="tabular-nums">
          {index + 1} / {CHAPTERS.length}
        </span>
      </div>

      <nav aria-label="Chapter navigation" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={!hasPrev}
          onClick={() => hasPrev && setIndex((i) => i - 1)}
          className="flex flex-col items-start gap-1 rounded-xl border border-slate-200 bg-white p-3.5 text-left transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Previous</span>
          </span>
          <span className="text-sm font-semibold text-slate-900">
            {hasPrev ? CHAPTERS[index - 1] : 'Start of guide'}
          </span>
        </button>

        <button
          type="button"
          disabled={!hasNext}
          onClick={() => hasNext && setIndex((i) => i + 1)}
          className="flex flex-col items-end gap-1 rounded-xl border border-slate-200 bg-white p-3.5 text-right transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span>Next</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold text-slate-900">
            {hasNext ? CHAPTERS[index + 1] : 'End of guide'}
          </span>
        </button>
      </nav>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Nav19: Multi-Step Progress Rail                                            */
/* -------------------------------------------------------------------------- */
const STEPS = ['Workspace', 'Repository', 'Environment', 'Review'];

export function Nav19() {
  const [step, setStep] = useState(1);

  return (
    <div className="flex flex-col gap-4">
      <nav aria-label="Setup steps">
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {STEPS.map((label, idx) => {
            const isComplete = idx < step;
            const isCurrent = idx === step;
            return (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => setStep(idx)}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    isCurrent
                      ? 'border-blue-600 bg-blue-50/70 text-blue-950'
                      : isComplete
                        ? 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                        : 'border-slate-200 bg-slate-50/70 text-slate-500 hover:bg-white'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : isComplete
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isComplete ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : idx + 1}
                  </span>
                  <span className="truncate text-xs font-medium">{label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs">
        <span className="font-medium text-slate-700">
          Step {step + 1} of {STEPS.length}: {STEPS[step]}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="rounded-md border border-slate-200 px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            disabled={step === STEPS.length - 1}
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            className="rounded-md bg-slate-900 px-2.5 py-1 font-medium text-white hover:bg-slate-800 disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
