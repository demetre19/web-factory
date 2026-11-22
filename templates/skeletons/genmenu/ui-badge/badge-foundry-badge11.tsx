interface Badge11Props {
  label?: string;
}

export function Badge11({ label = 'Pinned' }: Badge11Props) {
  return (
    <div className="relative w-full max-w-[236px] rounded-xl border border-slate-200 bg-white p-4 pt-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Flag / label pushpin with SVG pinhead, needle & pennant tail */}
      <div
        aria-label={`Flag pin: ${label}`}
        className="pointer-events-none absolute -top-3.5 left-3.5 flex items-start drop-shadow-xs"
      >
        <svg viewBox="0 0 92 34" className="h-8.5 w-[92px] overflow-visible">
          {/* Metallic needle */}
          <line
            x1="10"
            y1="14"
            x2="10"
            y2="31"
            className="stroke-slate-400 dark:stroke-slate-300"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Contact shadow ellipse */}
          <ellipse cx="10" cy="31" rx="3.5" ry="1.3" fill="rgba(15,23,42,0.22)" />
          {/* Swallowtail pennant flag */}
          <path
            d="M11 6 H88 L79 14 L88 22 H11 Z"
            className="fill-rose-600 dark:fill-rose-500"
          />
          <path
            d="M11 6 H88 L85 9 H11 Z"
            fill="rgba(255,255,255,0.16)"
          />
          {/* Pushpin enamel dome */}
          <circle
            cx="10"
            cy="11"
            r="6.5"
            className="fill-slate-900 stroke-white dark:fill-slate-100 dark:stroke-slate-900"
            strokeWidth="1.8"
          />
          <circle
            cx="8.2"
            cy="9.2"
            r="1.8"
            className="fill-white/75 dark:fill-slate-900/50"
          />
        </svg>
        <span className="absolute top-[7px] left-[22px] text-[10px] font-bold tracking-wider text-white uppercase">
          {label}
        </span>
      </div>

      {/* Small location host card */}
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Studio Dispatch</p>
      <h4 className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
        Kyoto Print Lab
      </h4>
      <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
        35.0116° N, 135.7681° E · Active hub
      </p>
    </div>
  );
}
