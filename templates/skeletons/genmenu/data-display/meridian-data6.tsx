import React, { useState } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

type WindowRange = '14d' | '30d';

interface FunnelRow {
  id: string;
  title: string;
  subtitle: string;
  figures: Record<WindowRange, { value: string; delta: string; positive: boolean; series: number[]; unit: string }>;
}

const FUNNEL_ROWS: FunnelRow[] = [
  {
    id: 'signups',
    title: 'Activated Workspaces',
    subtitle: 'Teams completing first data source sync',
    figures: {
      '14d': { value: '2,840', delta: '+14.6%', positive: true, series: [182, 195, 190, 208, 215, 224, 219, 238, 252, 261], unit: 'workspaces' },
      '30d': { value: '6,190', delta: '+18.2%', positive: true, series: [164, 178, 189, 196, 202, 214, 228, 240, 249, 261], unit: 'workspaces' },
    },
  },
  {
    id: 'retention',
    title: 'Day-14 Team Retention',
    subtitle: 'Returning weekly active editors',
    figures: {
      '14d': { value: '64.8%', delta: '+2.3 pts', positive: true, series: [60.2, 61.1, 61.8, 62.0, 62.9, 63.4, 63.1, 64.0, 64.4, 64.8], unit: 'retention' },
      '30d': { value: '63.1%', delta: '+1.4 pts', positive: true, series: [59.8, 60.4, 61.2, 61.9, 62.1, 62.5, 62.8, 63.0, 63.2, 63.1], unit: 'retention' },
    },
  },
  {
    id: 'latency',
    title: 'Median Time to First Query',
    subtitle: 'From signup to initial schema execution',
    figures: {
      '14d': { value: '4m 12s', delta: '-18.0%', positive: true, series: [340, 325, 318, 304, 295, 286, 274, 268, 259, 252], unit: 'seconds' },
      '30d': { value: '4m 38s', delta: '-12.4%', positive: true, series: [365, 352, 344, 336, 321, 310, 298, 290, 282, 278], unit: 'seconds' },
    },
  },
  {
    id: 'drop',
    title: 'Checkout Abandonment',
    subtitle: 'Self-serve billing step exit rate',
    figures: {
      '14d': { value: '19.4%', delta: '+1.8 pts', positive: false, series: [16.2, 16.5, 17.0, 17.4, 17.8, 18.1, 18.6, 18.9, 19.2, 19.4], unit: 'exit rate' },
      '30d': { value: '18.1%', delta: '+0.9 pts', positive: false, series: [16.0, 16.4, 16.8, 17.1, 17.2, 17.5, 17.7, 17.9, 18.0, 18.1], unit: 'exit rate' },
    },
  },
];

function buildSvgPoints(series: number[], width = 128, height = 38, pad = 4) {
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  return series
    .map((val, idx) => {
      const x = pad + (idx / (series.length - 1)) * (width - pad * 2);
      const y = pad + (height - pad * 2) - ((val - min) / span) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

export function Data6() {
  const [range, setRange] = useState<WindowRange>('14d');
  const [selectedRowId, setSelectedRowId] = useState<string>('signups');

  return (
    <section
      aria-label="Product funnel sparkline dashboard rows"
      className="rounded-xl border border-slate-200 bg-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Product Funnel Velocity</h3>
          <p className="text-xs text-slate-500">Big number, trend sparkline, and period delta per metric row</p>
        </div>
        <div role="group" aria-label="Sparkline range" className="inline-flex rounded-lg bg-slate-100 p-1">
          {(['14d', '30d'] as WindowRange[]).map((opt) => (
            <button
              key={opt}
              type="button"
              aria-pressed={range === opt}
              onClick={() => setRange(opt)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                range === opt ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last {opt}
            </button>
          ))}
        </div>
      </div>

      <ul className="divide-y divide-slate-100">
        {FUNNEL_ROWS.map((row) => {
          const data = row.figures[range];
          const isSelected = selectedRowId === row.id;
          const strokeColor = data.positive ? '#059669' : '#DC2626';
          const points = buildSvgPoints(data.series);

          return (
            <li key={row.id}>
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedRowId(row.id)}
                className={`flex w-full flex-col gap-4 px-6 py-5 text-left transition-colors sm:flex-row sm:items-center sm:justify-between ${
                  isSelected ? 'bg-slate-50' : 'hover:bg-slate-50/60'
                }`}
              >
                <div className="min-w-0 sm:w-56">
                  <div className="text-sm font-semibold text-slate-900">{row.title}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{row.subtitle}</div>
                </div>

                <div className="flex flex-wrap items-center gap-6 sm:gap-8">
                  <div className="font-display text-2xl font-bold tracking-tight text-slate-900 tabular-nums sm:w-28 sm:text-right">
                    {data.value}
                  </div>

                  <div className="flex items-center rounded-lg border border-slate-200/80 bg-slate-50/70 px-2.5 py-1.5">
                    <svg
                      width="128"
                      height="38"
                      viewBox="0 0 128 38"
                      role="img"
                      aria-label={`${row.title} sparkline trend`}
                      className="overflow-visible"
                    >
                      <polyline
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points}
                      />
                    </svg>
                  </div>

                  <div className="flex w-24 items-center justify-end">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-xs font-medium tabular-nums whitespace-nowrap ${
                        data.positive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {data.positive ? (
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {data.delta}
                    </span>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
