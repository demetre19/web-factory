interface Badge19Props {
  packageName?: string;
  version?: string;
}

export function Badge19({ packageName = 'Core Primitives', version = 'v2.4.0' }: Badge19Props) {
  return (
    <div className="flex w-full max-w-[264px] items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Inline software release heading host */}
      <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
        {packageName}
      </span>

      {/* Pointed SVG git/luggage version tag */}
      <span
        aria-label={`Version ${version}`}
        className="relative inline-flex shrink-0 items-center py-1 pr-2.5 pl-4 font-mono text-[11px] font-semibold text-slate-800 tabular-nums dark:text-slate-100"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 92 26"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <path
            d="M11 1 H89 A2 2 0 0 1 91 3 V23 A2 2 0 0 1 89 25 H11 L1 13 Z"
            className="fill-slate-100 stroke-slate-300 dark:fill-slate-800 dark:stroke-slate-600"
            strokeWidth="1.4"
          />
          {/* Punched tag hole */}
          <circle
            cx="10.5"
            cy="13"
            r="2.2"
            className="fill-white stroke-slate-400 dark:fill-slate-900 dark:stroke-slate-500"
            strokeWidth="1.1"
          />
        </svg>
        <span className="relative z-10">{version}</span>
      </span>
    </div>
  );
}
