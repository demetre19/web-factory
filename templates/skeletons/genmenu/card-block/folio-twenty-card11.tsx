import { TrendingUp, TrendingDown } from 'lucide-react';

export interface Card11Props {
  label?: string;
  value?: string;
  deltaText?: string;
  trend?: 'up' | 'down';
  periodNote?: string;
  points?: number[];
}

export function Card11({
  label = 'Median First Response',
  value = '14.2 min',
  deltaText = '18.4% faster vs Oct',
  trend = 'up',
  periodNote = 'Across 1,420 support threads',
  points = [34, 30, 32, 26, 24, 21, 18, 16, 14],
}: Card11Props) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const svgPoints = points
    .map((pt, idx) => {
      const x = (idx / Math.max(1, points.length - 1)) * 180;
      const y = 36 - ((pt - min) / range) * 28;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <article className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col justify-between gap-4">
      <dl>
        <dt className="text-xs font-medium text-zinc-500">{label}</dt>
        <dd className="mt-2 text-3xl font-semibold tracking-tight font-mono tabular-nums text-zinc-900">
          {value}
        </dd>
      </dl>

      <div className="pt-2">
        <svg
          viewBox="0 0 180 40"
          className="w-full h-10 overflow-visible"
          role="img"
          aria-label={`Trend sparkline for ${label}`}
        >
          <polyline
            fill="none"
            stroke="#1E40AF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={svgPoints}
          />
        </svg>
      </div>

      <footer className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2 text-xs">
        <span
          className={`inline-flex items-center gap-1 font-medium ${
            trend === 'up' ? 'text-emerald-700' : 'text-rose-700'
          }`}
        >
          {trend === 'up' ? (
            <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          <span className="font-mono tabular-nums">{deltaText}</span>
        </span>
        <span className="text-zinc-500 truncate">{periodNote}</span>
      </footer>
    </article>
  );
}
