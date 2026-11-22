interface Badge8Props {
  username?: string;
  level?: number;
  tier?: string;
}

export function Badge8({
  username = 'Kaito Tanaka',
  level = 42,
  tier = 'Master',
}: Badge8Props) {
  return (
    <div className="flex w-full max-w-[288px] items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Inline user text host */}
      <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
        {username}
      </span>

      {/* Angled hexagonal-chevron SVG rank/level chip */}
      <span
        aria-label={`Level ${level} ${tier}`}
        className="relative inline-flex shrink-0 items-center gap-1 px-2.5 py-1 text-[10.5px] font-bold tracking-wide text-indigo-950 dark:text-indigo-100"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 116 26"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <polygon
            points="6,1 110,1 115,13 110,25 6,25 1,13"
            className="fill-indigo-50 stroke-indigo-300 dark:fill-indigo-950/90 dark:stroke-indigo-500/70"
            strokeWidth="1.5"
          />
        </svg>
        <svg aria-hidden="true" viewBox="0 0 16 16" className="relative z-10 h-3 w-3 shrink-0">
          <polygon
            points="8,1 14,8 8,15 2,8"
            className="fill-indigo-600 dark:fill-indigo-400"
          />
          <polygon
            points="8,4 11,8 8,12 5,8"
            className="fill-white/80 dark:fill-slate-950/80"
          />
        </svg>
        <span className="relative z-10 font-mono tabular-nums">LVL {level}</span>
        <span aria-hidden="true" className="relative z-10 text-indigo-400 dark:text-indigo-500">
          /
        </span>
        <span className="relative z-10 uppercase">{tier}</span>
      </span>
    </div>
  );
}
