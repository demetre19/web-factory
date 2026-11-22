interface Badge3Props {
  label?: string;
}

export function Badge3({ label = 'Save' }: Badge3Props) {
  return (
    <div className="relative w-full max-w-[236px] rounded-xl border border-slate-200 bg-white p-4 pt-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Bookmark corner ribbon with SVG swallowtail V-notch */}
      <div
        aria-label={`Bookmark ribbon: ${label}`}
        className="pointer-events-none absolute -top-1.5 right-4 flex flex-col items-center drop-shadow-sm"
      >
        <div className="relative flex w-10 flex-col items-center">
          {/* Top lip curl */}
          <svg
            aria-hidden="true"
            viewBox="0 0 46 6"
            className="h-1.5 w-[46px] text-rose-900 dark:text-rose-950"
          >
            <polygon points="3,0 43,0 46,6 0,6" fill="currentColor" />
          </svg>
          {/* Main vertical ribbon with swallowtail bottom */}
          <div className="relative -mt-0.5 flex h-12 w-10 flex-col items-center justify-start pt-1.5">
            <svg
              aria-hidden="true"
              viewBox="0 0 40 48"
              className="absolute inset-0 h-full w-full text-rose-600 dark:text-rose-500"
              preserveAspectRatio="none"
            >
              <path d="M0 0 H40 V48 L20 38 L0 48 Z" fill="currentColor" />
              <path
                d="M3 0 V42 M37 0 V42"
                stroke="rgba(255,255,255,0.28)"
                strokeWidth="1"
                strokeDasharray="2 2"
                fill="none"
              />
            </svg>
            <span className="relative z-10 text-[9px] font-bold tracking-wider text-white uppercase">
              {label}
            </span>
          </div>
        </div>
      </div>

      {/* Small card host element */}
      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
        Monograph · Ch. 04
      </p>
      <h4 className="mt-1 pr-11 text-sm font-semibold text-slate-900 dark:text-slate-100">
        Editorial Grid Systems
      </h4>
      <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
        Proportions, optical margins, and baseline rhythm.
      </p>
    </div>
  );
}
