interface Badge17Props {
  standard?: string;
  caption?: string;
}

export function Badge17({ standard = 'ISO 27001', caption = 'Certified' }: Badge17Props) {
  return (
    <div className="relative w-full max-w-[238px] rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Double-ring technical SVG certification stamp */}
      <div
        aria-label={`Certification mark: ${standard} ${caption}`}
        className="pointer-events-none absolute -top-4 -right-3 flex h-[70px] w-[70px] -rotate-6 items-center justify-center rounded-full bg-white/95 shadow-xs dark:bg-slate-900/95"
      >
        <svg viewBox="0 0 76 76" className="h-full w-full">
          {/* Outer solid ring */}
          <circle
            cx="38"
            cy="38"
            r="34"
            fill="none"
            className="stroke-emerald-700 dark:stroke-emerald-400"
            strokeWidth="2"
          />
          {/* Inner dashed calibration ring */}
          <circle
            cx="38"
            cy="38"
            r="28"
            fill="none"
            className="stroke-emerald-600/70 dark:stroke-emerald-400/65"
            strokeWidth="1.2"
            strokeDasharray="3 2.5"
          />
          {/* Horizontal center rule lines */}
          <line
            x1="14"
            y1="27"
            x2="62"
            y2="27"
            className="stroke-emerald-700/45 dark:stroke-emerald-400/45"
            strokeWidth="1"
          />
          <line
            x1="14"
            y1="49"
            x2="62"
            y2="49"
            className="stroke-emerald-700/45 dark:stroke-emerald-400/45"
            strokeWidth="1"
          />
          {/* Top & bottom micro stars */}
          <circle cx="38" cy="18" r="1.8" className="fill-emerald-700 dark:fill-emerald-400" />
          <circle cx="38" cy="58" r="1.8" className="fill-emerald-700 dark:fill-emerald-400" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
          <span className="font-mono text-[8.5px] font-extrabold tracking-tight text-emerald-800 tabular-nums dark:text-emerald-300">
            {standard}
          </span>
          <span className="mt-0.5 text-[6.5px] font-bold tracking-widest text-emerald-700 uppercase dark:text-emerald-400">
            {caption}
          </span>
        </div>
      </div>

      {/* Small compliance host card */}
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Security Spec</p>
      <h4 className="mt-1 pr-12 text-sm font-semibold text-slate-900 dark:text-slate-100">
        Zero-Trust Key Vault
      </h4>
      <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
        Audited encryption and annual compliance log.
      </p>
    </div>
  );
}
