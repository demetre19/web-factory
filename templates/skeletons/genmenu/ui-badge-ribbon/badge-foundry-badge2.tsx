interface Badge2Props {
  label?: string;
}

export function Badge2({ label = 'Popular' }: Badge2Props) {
  return (
    <div className="relative w-full max-w-[232px] rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* 45-degree diagonal corner ribbon with flush SVG 3D wrap-around fold tabs */}
      <div
        aria-label={`Ribbon: ${label}`}
        className="pointer-events-none absolute -top-2 -right-2 h-24 w-24 overflow-hidden"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 96 96"
          className="h-full w-full drop-shadow-xs"
        >
          {/* Left & bottom 3D back-fold tabs tucked under the card edge */}
          <polygon
            points="16,0 24,8 8,8"
            className="fill-blue-900 dark:fill-blue-950"
          />
          <polygon
            points="96,80 88,72 88,88"
            className="fill-blue-900 dark:fill-blue-950"
          />
          {/* Seamless 45-degree diagonal ribbon band */}
          <polygon
            points="16,0 44,0 96,52 96,80"
            className="fill-blue-600 dark:fill-blue-500"
          />
        </svg>
        <span className="absolute top-[22px] -right-[14px] w-[104px] rotate-45 text-center text-[10px] font-bold tracking-wider text-white uppercase dark:text-slate-950">
          {label}
        </span>
      </div>

      {/* Small card host element */}
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Studio Plan</p>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="font-mono text-2xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-white">
          $29
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">/ month</span>
      </div>
      <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
        Unlimited exports and shared team tokens.
      </p>
    </div>
  );
}
