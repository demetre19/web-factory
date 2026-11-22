interface Badge18Props {
  outlet?: string;
}

export function Badge18({ outlet = 'Design Press' }: Badge18Props) {
  return (
    <div className="relative w-full max-w-[248px] rounded-xl border border-slate-200 bg-white p-4 pt-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* 'As seen in' mini-badge anchored cleanly on top card edge */}
      <div
        aria-label={`As seen in ${outlet}`}
        className="pointer-events-none absolute -top-3.5 left-4 inline-flex items-center gap-1.5 rounded-sm border border-slate-300 bg-slate-50 px-2.5 py-1 shadow-xs dark:border-slate-700 dark:bg-slate-800"
      >
        {/* SVG left editorial laurel bracket */}
        <svg aria-hidden="true" viewBox="0 0 12 18" className="h-3.5 w-2.5 text-slate-600 dark:text-slate-300">
          <path
            d="M9 2 C4 5, 4 13, 9 16 M6 4 L3 5 M5 9 L2 9 M6 14 L3 13"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        <span className="text-[9px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
          As seen in
        </span>
        <span aria-hidden="true" className="h-3 w-px bg-slate-300 dark:bg-slate-600" />
        {/* Geometric press masthead icon */}
        <svg aria-hidden="true" viewBox="0 0 14 14" className="h-3 w-3 text-slate-900 dark:text-white">
          <rect x="1.5" y="2" width="4.5" height="10" fill="currentColor" />
          <polygon points="8,2 12.5,2 12.5,12 8,7" fill="currentColor" opacity="0.7" />
        </svg>
        <span className="text-[11px] font-bold tracking-tight text-slate-900 dark:text-white">
          {outlet}
        </span>
      </div>

      {/* Small showcase host card */}
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Press Coverage</p>
      <h4 className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
        Spring System Issue
      </h4>
      <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
        Featured in the annual UI primitives roundup.
      </p>
    </div>
  );
}
