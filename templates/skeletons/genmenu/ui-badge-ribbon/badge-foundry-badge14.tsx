interface Badge14Props {
  percent?: number;
}

export function Badge14({ percent = 40 }: Badge14Props) {
  return (
    <div className="relative w-full max-w-[236px] rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Sawtooth serrated SVG percentage-off hang tag */}
      <div
        aria-label={`${percent}% off`}
        className="pointer-events-none absolute -top-3.5 -right-2.5 rotate-6 drop-shadow-sm"
      >
        <div className="relative flex h-11 w-20 items-center justify-center">
          <svg viewBox="0 0 88 46" className="h-full w-full">
            {/* Hang cord loop */}
            <path
              d="M12 14 C6 4, 18 1, 22 9"
              fill="none"
              className="stroke-slate-400 dark:stroke-slate-500"
              strokeWidth="1.5"
            />
            {/* Serrated zig-zag tag body */}
            <polygon
              points="18,6 84,6 80,12 84,18 80,24 84,30 80,36 84,41 18,41 6,23.5"
              className="fill-rose-600 stroke-white dark:fill-rose-500 dark:stroke-slate-900"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Punched eyelet */}
            <circle
              cx="16"
              cy="23.5"
              r="2.8"
              className="fill-white dark:fill-slate-900"
            />
          </svg>
          <span className="absolute top-1/2 right-3 -translate-y-1/2 font-mono text-xs leading-none font-extrabold tracking-tight text-white tabular-nums">
            -{percent}%
          </span>
        </div>
      </div>

      {/* Small product tile host */}
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Tableware</p>
      <h4 className="mt-1 pr-12 text-sm font-semibold text-slate-900 dark:text-slate-100">
        Stoneware Dripper
      </h4>
      <div className="mt-2 flex items-baseline gap-2 font-mono text-xs tabular-nums">
        <span className="font-bold text-slate-900 dark:text-white">$24</span>
        <span className="text-slate-400 line-through">$40</span>
      </div>
    </div>
  );
}
