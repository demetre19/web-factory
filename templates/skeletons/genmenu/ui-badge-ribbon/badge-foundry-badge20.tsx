interface Badge20Props {
  label?: string;
}

export function Badge20({ label = 'Top Rated' }: Badge20Props) {
  return (
    <div className="relative w-full max-w-[234px] rounded-xl border border-slate-200 bg-white p-4 pt-9 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Wrap-around horizontal flag ribbon protruding past left border with SVG 3D fold */}
      <div
        aria-label={`Flag ribbon: ${label}`}
        className="pointer-events-none absolute top-3 -left-2.5 flex items-start drop-shadow-xs"
      >
        <div className="relative flex h-6 items-center pr-4 pl-3">
          {/* Underside 3D fold triangle */}
          <svg
            aria-hidden="true"
            viewBox="0 0 10 8"
            className="absolute -bottom-2 left-0 h-2 w-2.5 text-slate-950 dark:text-blue-950"
          >
            <polygon points="0,0 10,0 10,8" fill="currentColor" />
          </svg>
          {/* Forked horizontal flag banner SVG */}
          <svg
            aria-hidden="true"
            viewBox="0 0 120 26"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full text-slate-900 dark:text-blue-500"
          >
            <polygon points="0,0 120,0 112,13 120,26 0,26" fill="currentColor" />
          </svg>
          <span className="relative z-10 text-[10px] font-bold tracking-wider text-white uppercase dark:text-slate-950">
            {label}
          </span>
        </div>
      </div>

      {/* Small workshop host card */}
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Workshop Series</p>
      <h4 className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
        Spatial Typography
      </h4>
      <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
        4.9 average across 320 studio reviews.
      </p>
    </div>
  );
}
