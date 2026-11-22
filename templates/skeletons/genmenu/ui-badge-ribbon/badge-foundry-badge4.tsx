interface Badge4Props {
  topText?: string;
  mainText?: string;
}

function buildScallopPath(cx: number, cy: number, innerR: number, outerR: number, lobes: number): string {
  const step = (Math.PI * 2) / lobes;
  const parts: string[] = [];
  for (let i = 0; i < lobes; i += 1) {
    const a1 = i * step;
    const mid = a1 + step / 2;
    const a2 = (i + 1) * step;
    const x1 = (cx + innerR * Math.cos(a1)).toFixed(2);
    const y1 = (cy + innerR * Math.sin(a1)).toFixed(2);
    const mx = (cx + outerR * Math.cos(mid)).toFixed(2);
    const my = (cy + outerR * Math.sin(mid)).toFixed(2);
    const x2 = (cx + innerR * Math.cos(a2)).toFixed(2);
    const y2 = (cy + innerR * Math.sin(a2)).toFixed(2);
    if (i === 0) {
      parts.push(`M ${x1} ${y1}`);
    }
    parts.push(`Q ${mx} ${my} ${x2} ${y2}`);
  }
  parts.push('Z');
  return parts.join(' ');
}

const SCALLOP_PATH = buildScallopPath(48, 48, 37, 46, 16);

export function Badge4({ topText = 'Limited', mainText = 'DROP' }: Badge4Props) {
  return (
    <div className="relative w-full max-w-[232px] rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Rotated scalloped-edge SVG sticker tag */}
      <div
        aria-label={`Sticker: ${topText} ${mainText}`}
        className="pointer-events-none absolute -top-5 -right-4 h-[74px] w-[74px] -rotate-12 drop-shadow-md"
      >
        <svg viewBox="0 0 96 96" className="h-full w-full">
          {/* Outer die-cut paper edge */}
          <path
            d={SCALLOP_PATH}
            className="fill-amber-400 stroke-white dark:fill-amber-400 dark:stroke-slate-900"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Inner hairline stitch ring */}
          <circle
            cx="48"
            cy="48"
            r="30"
            fill="none"
            className="stroke-slate-900/35"
            strokeWidth="1.25"
            strokeDasharray="3 2.5"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
          <span className="text-[9px] font-bold tracking-wider text-slate-900 uppercase">
            {topText}
          </span>
          <span className="mt-0.5 text-xs font-extrabold tracking-tight text-slate-950 uppercase">
            {mainText}
          </span>
        </div>
      </div>

      {/* Small card host element */}
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Archival Print</p>
      <h4 className="mt-1 pr-10 text-sm font-semibold text-slate-900 dark:text-slate-100">
        Risograph Folio #08
      </h4>
      <p className="mt-2 font-mono text-xs font-medium text-slate-700 tabular-nums dark:text-slate-300">
        Edition of 150
      </p>
    </div>
  );
}
