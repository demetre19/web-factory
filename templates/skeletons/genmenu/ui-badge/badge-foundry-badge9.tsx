interface Badge9Props {
  rankLabel?: string;
}

export function Badge9({ rankLabel = '100d' }: Badge9Props) {
  return (
    <div className="relative w-full max-w-[238px] rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* SVG heraldic achievement shield medal on card corner */}
      <div
        aria-label={`Achievement medal: ${rankLabel} streak`}
        className="pointer-events-none absolute -top-4 -right-3 flex h-14 w-12 items-center justify-center drop-shadow-sm"
      >
        <svg viewBox="0 0 48 56" className="h-full w-full">
          {/* Outer metallic shield */}
          <path
            d="M24 3 L43 10 V27 C43 39 34 48 24 53 C14 48 5 39 5 27 V10 L24 3 Z"
            className="fill-amber-500 stroke-white dark:fill-amber-400 dark:stroke-slate-900"
            strokeWidth="2.5"
          />
          {/* Engraved inner bevel */}
          <path
            d="M24 7.5 L39 13 V26.5 C39 36.2 31.8 43.4 24 47.6 C16.2 43.4 9 36.2 9 26.5 V13 L24 7.5 Z"
            fill="none"
            className="stroke-amber-900/35 dark:stroke-amber-950/45"
            strokeWidth="1.2"
          />
          {/* Laurel side arcs */}
          <path
            d="M13 24c0 6 3.5 11 8 13.5M35 24c0 6-3.5 11-8 13.5"
            fill="none"
            className="stroke-amber-950/60"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Star crest */}
          <polygon
            points="24,11 25.6,14.4 29.3,14.9 26.6,17.5 27.3,21.2 24,19.4 20.7,21.2 21.4,17.5 18.7,14.9 22.4,14.4"
            className="fill-amber-950"
          />
        </svg>
        <span className="absolute bottom-2.5 font-mono text-[9px] font-extrabold tracking-tight text-amber-950 tabular-nums uppercase">
          {rankLabel}
        </span>
      </div>

      {/* Small milestone host card */}
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Milestone Unlocked</p>
      <h4 className="mt-1 pr-9 text-sm font-semibold text-slate-900 dark:text-slate-100">
        Consistent Shipper
      </h4>
      <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
        100 consecutive days of verified commits.
      </p>
    </div>
  );
}
