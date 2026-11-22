export interface StatBreakdownRow {
  label: string;
  value: string;
  sharePercent: number;
}

export interface Card12Props {
  title?: string;
  primaryValue?: string;
  unitLabel?: string;
  rows?: StatBreakdownRow[];
  bars?: number[];
}

const DEFAULT_ROWS: StatBreakdownRow[] = [
  { label: 'North America', value: '18.4 TB', sharePercent: 52 },
  { label: 'Europe West', value: '11.2 TB', sharePercent: 32 },
  { label: 'Asia Pacific', value: '5.8 TB', sharePercent: 16 },
];

export function Card12({
  title = 'Monthly Egress Volume',
  primaryValue = '35.4 TB',
  unitLabel = 'Rolling 30-day total',
  rows = DEFAULT_ROWS,
  bars = [42, 58, 51, 66, 74, 62, 81, 76, 89, 84, 92, 88],
}: Card12Props) {
  return (
    <article className="bg-[#121316] text-zinc-100 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between gap-5">
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-xs font-medium text-zinc-400">{title}</h3>
          <span className="text-xs text-zinc-500">{unitLabel}</span>
        </div>

        <p className="mt-2 text-3xl font-semibold tracking-tight font-mono tabular-nums text-white">
          {primaryValue}
        </p>

        <svg
          viewBox="0 0 240 36"
          className="w-full h-9 mt-4"
          role="img"
          aria-label={`Monthly bar cadence for ${title}`}
        >
          {bars.map((val, idx) => {
            const barHeight = Math.max(4, (val / 100) * 32);
            const x = idx * 20;
            const y = 36 - barHeight;
            return (
              <rect
                key={idx}
                x={x}
                y={y}
                width="12"
                height={barHeight}
                rx="2"
                fill={idx === bars.length - 1 ? '#F59E0B' : '#3F3F46'}
              />
            );
          })}
        </svg>
      </div>

      <dl className="space-y-2.5 pt-4 border-t border-zinc-800 text-xs">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4">
            <dt className="text-zinc-300">{row.label}</dt>
            <dd className="font-mono tabular-nums text-zinc-100">
              {row.value}{' '}
              <span className="text-zinc-400">({row.sharePercent}%)</span>
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
