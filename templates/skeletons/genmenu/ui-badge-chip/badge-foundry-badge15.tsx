import { useState } from 'react';

interface Badge15Props {
  outlinedLabel?: string;
  filledLabel?: string;
  removableLabel?: string;
}

export function Badge15({
  outlinedLabel = 'Typography',
  filledLabel = 'Systems',
  removableLabel = 'SVG',
}: Badge15Props) {
  const [removed, setRemoved] = useState(false);

  return (
    <div className="w-full max-w-[270px] rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
        Collection Taxonomy
      </p>
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        {/* 1. Outlined chip with SVG chamfered top-right edge */}
        <span className="relative inline-flex items-center px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200">
          <svg
            aria-hidden="true"
            viewBox="0 0 100 28"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            <polygon
              points="1,1 91,1 99,9 99,27 1,27"
              className="fill-transparent stroke-slate-300 dark:stroke-slate-600"
              strokeWidth="1.5"
            />
          </svg>
          <span className="relative z-10">{outlinedLabel}</span>
        </span>

        {/* 2. Filled chip with matching chamfered corner */}
        <span className="relative inline-flex items-center px-2.5 py-1 text-xs font-semibold text-white dark:text-slate-950">
          <svg
            aria-hidden="true"
            viewBox="0 0 100 28"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            <polygon
              points="0,0 91,0 100,9 100,28 0,28"
              className="fill-slate-900 dark:fill-slate-100"
            />
          </svg>
          <span className="relative z-10">{filledLabel}</span>
        </span>

        {/* 3. Removable interactive chip */}
        {!removed ? (
          <span className="inline-flex items-center gap-1 rounded-sm border border-blue-200 bg-blue-50 py-1 pr-1.5 pl-2.5 text-xs font-medium text-blue-800 dark:border-blue-500/40 dark:bg-blue-950/70 dark:text-blue-200">
            <span>{removableLabel}</span>
            <button
              type="button"
              onClick={() => setRemoved(true)}
              aria-label={`Remove ${removableLabel} chip`}
              className="inline-flex h-4 w-4 items-center justify-center rounded-xs text-blue-700 transition-colors hover:bg-blue-200/70 focus-visible:outline-2 focus-visible:outline-blue-600 dark:text-blue-200 dark:hover:bg-blue-800/70"
            >
              <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3">
                <path
                  d="M3 3l6 6M9 3l-6 6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setRemoved(false)}
            className="rounded-sm border border-dashed border-slate-300 px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:border-slate-400 hover:text-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:text-slate-200"
          >
            + Restore {removableLabel}
          </button>
        )}
      </div>
    </div>
  );
}
