interface Badge7Props {
  name?: string;
  handle?: string;
}

function buildRosettePath(cx: number, cy: number, innerR: number, outerR: number, points: number): string {
  const step = Math.PI / points;
  const coords: string[] = [];
  for (let i = 0; i < points * 2; i += 1) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    const x = (cx + r * Math.cos(angle)).toFixed(2);
    const y = (cy + r * Math.sin(angle)).toFixed(2);
    coords.push(`${x},${y}`);
  }
  return coords.join(' ');
}

const ROSETTE_POINTS = buildRosettePath(12, 12, 8.2, 10.6, 10);

export function Badge7({ name = 'Elena Rostova', handle = '@erostova' }: Badge7Props) {
  return (
    <div className="w-full max-w-[260px] space-y-2.5">
      {/* Inline text host 1: Verified creator rosette */}
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
              {name}
            </span>
            <span
              role="img"
              aria-label="Verified account"
              title="Verified account"
              className="inline-flex shrink-0 items-center"
            >
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]">
                <polygon
                  points={ROSETTE_POINTS}
                  className="fill-blue-600 dark:fill-sky-400"
                />
                <path
                  d="M8.5 12.2 10.8 14.5 15.8 9.5"
                  fill="none"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="stroke-white dark:stroke-slate-950"
                />
              </svg>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{handle}</p>
        </div>

        {/* Inline Pro Checkmark emblem */}
        <span
          aria-label="Pro verified member"
          className="inline-flex shrink-0 items-center gap-1 rounded-sm border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-amber-900 uppercase dark:border-amber-500/40 dark:bg-amber-950/70 dark:text-amber-300"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3 w-3 shrink-0">
            <path
              d="M8 1.2 14 4.2v4.3c0 3.2-2.6 5.5-6 6.3-3.4-.8-6-3.1-6-6.3V4.2L8 1.2z"
              className="fill-amber-500 dark:fill-amber-400"
            />
            <path
              d="M5.4 8.2 7.2 10l3.5-3.6"
              fill="none"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-white dark:stroke-slate-950"
            />
          </svg>
          <span>Pro</span>
        </span>
      </div>
    </div>
  );
}
