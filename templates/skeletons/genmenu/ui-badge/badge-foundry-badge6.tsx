import { useState } from 'react';

interface Badge6Props {
  initialCount?: number;
}

export function Badge6({ initialCount = 4 }: Badge6Props) {
  const [count, setCount] = useState(initialCount);
  const display = count > 99 ? '99+' : String(Math.max(0, count));

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Small icon button hosts with offset SVG-contoured count badges */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setCount((c) => c + 1)}
          aria-label={`Notifications (${count} unread). Click to increment`}
          className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-xs transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>

          {count > 0 && (
            <span className="absolute -top-2 -right-2 inline-flex min-w-[22px] items-center justify-center px-1.5 py-0.5 font-mono text-[11px] leading-none font-bold text-white tabular-nums ring-2 ring-white dark:text-slate-950 dark:ring-slate-900">
              <svg
                aria-hidden="true"
                viewBox="0 0 32 20"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full text-rose-600 dark:text-rose-400"
              >
                <rect x="0" y="0" width="32" height="20" rx="8" fill="currentColor" />
              </svg>
              <span className="relative z-10">{display}</span>
            </span>
          )}
        </button>

        {/* Secondary static 99+ icon host for overflow comparison */}
        <div
          aria-label="Inbox with 99 plus messages"
          className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
            <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
          </svg>
          <span className="absolute -top-2 -right-2.5 inline-flex min-w-[28px] items-center justify-center px-1.5 py-0.5 font-mono text-[10px] leading-none font-bold text-white tabular-nums ring-2 ring-white dark:text-slate-950 dark:ring-slate-900">
            <svg
              aria-hidden="true"
              viewBox="0 0 36 20"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full text-blue-600 dark:text-blue-400"
            >
              <rect x="0" y="0" width="36" height="20" rx="8" fill="currentColor" />
            </svg>
            <span className="relative z-10">99+</span>
          </span>
        </div>
      </div>

      {/* Micro interactive controls */}
      <div className="flex items-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => setCount((c) => c + 1)}
          className="rounded-md border border-slate-200 bg-white px-2 py-1 font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          +1 Count
        </button>
        <button
          type="button"
          onClick={() => setCount(104)}
          className="rounded-md border border-slate-200 bg-white px-2 py-1 font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Test 99+
        </button>
        <button
          type="button"
          onClick={() => setCount(0)}
          className="rounded-md border border-slate-200 bg-white px-2 py-1 font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
