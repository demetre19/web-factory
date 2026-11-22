interface Badge16Props {
  year?: string;
  label?: string;
}

function buildStarSeal(cx: number, cy: number, outerR: number, innerR: number, teeth: number): string {
  const step = Math.PI / teeth;
  const pts: string[] = [];
  for (let i = 0; i < teeth * 2; i += 1) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`);
  }
  return pts.join(' ');
}

const SEAL_POINTS = buildStarSeal(36, 36, 31, 26.5, 24);

export function Badge16({ year = '2026', label = 'Award' }: Badge16Props) {
  return (
    <div className="relative w-full max-w-[238px] rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* 22-tooth SVG award seal with twin swallowtail ribbon streamers */}
      <div
        aria-label={`${year} ${label} Seal`}
        className="pointer-events-none absolute -top-5 -right-3 flex h-[86px] w-[72px] flex-col items-center drop-shadow-sm"
      >
        <svg viewBox="0 0 72 88" className="h-full w-full">
          {/* Twin hanging ribbon tails */}
          <polygon
            points="22,52 34,52 30,84 23,76 16,84"
            className="fill-amber-700 dark:fill-amber-600"
          />
          <polygon
            points="38,52 50,52 56,84 49,76 42,84"
            className="fill-amber-600 dark:fill-amber-500"
          />
          {/* Guilloché serrated rosette */}
          <polygon
            points={SEAL_POINTS}
            className="fill-amber-400 stroke-white dark:fill-amber-400 dark:stroke-slate-900"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Concentric engraved inner ring */}
          <circle
            cx="36"
            cy="36"
            r="21"
            fill="none"
            className="stroke-amber-900/45"
            strokeWidth="1.2"
            strokeDasharray="2 2"
          />
          <circle cx="36" cy="36" r="18" className="fill-amber-300/60" />
        </svg>
        <div className="absolute top-[18px] flex flex-col items-center leading-none">
          <span className="text-[8px] font-bold tracking-widest text-amber-950 uppercase">
            {label}
          </span>
          <span className="mt-0.5 font-mono text-[11px] font-extrabold text-amber-950 tabular-nums">
            {year}
          </span>
        </div>
      </div>

      {/* Small portfolio card host */}
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Honored Work</p>
      <h4 className="mt-1 pr-12 text-sm font-semibold text-slate-900 dark:text-slate-100">
        Nordic Type Atlas
      </h4>
      <p className="mt-1.5 pr-10 text-xs text-slate-600 dark:text-slate-400">
        Jury distinction for typographic craft.
      </p>
    </div>
  );
}
