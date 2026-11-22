interface Badge5Props {
  label?: string;
}

export function Badge5({ label = 'Staff Pick' }: Badge5Props) {
  return (
    <div className="relative w-full max-w-[236px] rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Taped paper sticker tag with SVG serrated masking tape strips */}
      <div
        aria-label={`Taped tag: ${label}`}
        className="pointer-events-none absolute -top-3.5 -right-2 rotate-3"
      >
        <div className="relative border border-amber-300/80 bg-amber-50 px-3 py-1.5 shadow-sm dark:border-amber-500/40 dark:bg-amber-950/90">
          {/* Left serrated masking tape SVG */}
          <svg
            aria-hidden="true"
            viewBox="0 0 26 12"
            className="absolute -top-2 -left-2.5 h-3 w-6.5 -rotate-[28deg] text-slate-300/80 dark:text-slate-500/55"
          >
            <polygon
              points="0,2 2,0 2,2 24,2 24,0 26,2 24,4 26,6 24,8 26,10 24,12 2,12 0,10 2,8 0,6 2,4"
              fill="currentColor"
            />
          </svg>
          {/* Right serrated masking tape SVG */}
          <svg
            aria-hidden="true"
            viewBox="0 0 26 12"
            className="absolute -top-2 -right-2.5 h-3 w-6.5 rotate-[24deg] text-slate-300/80 dark:text-slate-500/55"
          >
            <polygon
              points="0,2 2,0 2,2 24,2 24,0 26,2 24,4 26,6 24,8 26,10 24,12 2,12 0,10 2,8 0,6 2,4"
              fill="currentColor"
            />
          </svg>
          <span className="block font-mono text-[10px] font-bold tracking-wider text-amber-950 uppercase dark:text-amber-200">
            {label}
          </span>
        </div>
      </div>

      {/* Small card host element */}
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Curated Note</p>
      <h4 className="mt-1 pr-14 text-sm font-semibold text-slate-900 dark:text-slate-100">
        Kraft Paper Specimens
      </h4>
      <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
        Hand-assembled print proof with adhesive strip corners.
      </p>
    </div>
  );
}
