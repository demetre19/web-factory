interface Badge13Props {
  label?: string;
}

export function Badge13({ label = 'Featured' }: Badge13Props) {
  return (
    <div className="relative w-full max-w-[236px] rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Faceted SVG featured star crest on card corner */}
      <div
        aria-label={`Badge: ${label}`}
        className="pointer-events-none absolute -top-3.5 right-3 inline-flex items-center gap-1.5 rounded-sm border border-amber-300 bg-amber-50 px-2 py-1 shadow-sm dark:border-amber-500/50 dark:bg-slate-950"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
          {/* Outer faceted 4-point sparkle + 5-point star hybrid */}
          <polygon
            points="12,1.5 14.9,8.3 22.2,9 16.7,13.9 18.3,21.1 12,17.3 5.7,21.1 7.3,13.9 1.8,9 9.1,8.3"
            className="fill-amber-400 stroke-amber-600 dark:fill-amber-400 dark:stroke-amber-300"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Left-half specular facet */}
          <polygon
            points="12,1.5 12,17.3 5.7,21.1 7.3,13.9 1.8,9 9.1,8.3"
            className="fill-amber-300/75 dark:fill-amber-200/45"
          />
        </svg>
        <span className="text-[10px] font-bold tracking-wider text-amber-950 uppercase dark:text-amber-300">
          {label}
        </span>
      </div>

      {/* Small showcase host card */}
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Curated Gallery</p>
      <h4 className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
        Bauhaus Poster Archive
      </h4>
      <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
        Selected for geometric clarity and print fidelity.
      </p>
    </div>
  );
}
