import React, { useState } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';

type Period = '7d' | '30d' | '90d';

interface KpiMetric {
  id: string;
  label: string;
  values: Record<Period, { figure: string; delta: string; positive: boolean; targetPct: number; context: string }>;
}

const KPI_DATA: KpiMetric[] = [
  {
    id: 'arr',
    label: 'Net Recurring Revenue',
    values: {
      '7d': { figure: '$142,800', delta: '+4.2%', positive: true, targetPct: 88, context: 'vs prior 7 days' },
      '30d': { figure: '$618,400', delta: '+11.8%', positive: true, targetPct: 92, context: 'vs prior 30 days' },
      '90d': { figure: '$1,842,000', delta: '+19.4%', positive: true, targetPct: 96, context: 'vs prior quarter' },
    },
  },
  {
    id: 'nrr',
    label: 'Net Dollar Retention',
    values: {
      '7d': { figure: '116.4%', delta: '+0.6%', positive: true, targetPct: 94, context: 'Cohort weighted' },
      '30d': { figure: '118.2%', delta: '+1.9%', positive: true, targetPct: 95, context: 'Expansion led' },
      '90d': { figure: '117.5%', delta: '+2.4%', positive: true, targetPct: 93, context: 'Enterprise tier' },
    },
  },
  {
    id: 'cac',
    label: 'Blended Payback Period',
    values: {
      '7d': { figure: '7.4 mo', delta: '-0.3 mo', positive: true, targetPct: 82, context: 'Faster recovery' },
      '30d': { figure: '7.1 mo', delta: '-0.8 mo', positive: true, targetPct: 86, context: 'Lower paid spend' },
      '90d': { figure: '7.9 mo', delta: '+0.4 mo', positive: false, targetPct: 74, context: 'Outbound ramp' },
    },
  },
  {
    id: 'churn',
    label: 'Gross Logo Churn',
    values: {
      '7d': { figure: '1.12%', delta: '-0.18%', positive: true, targetPct: 89, context: 'Below 1.5% cap' },
      '30d': { figure: '1.34%', delta: '+0.14%', positive: false, targetPct: 78, context: 'SMB renewals' },
      '90d': { figure: '1.21%', delta: '-0.22%', positive: true, targetPct: 91, context: 'Annual contracts' },
    },
  },
];

export function Data3() {
  const [period, setPeriod] = useState<Period>('30d');
  const [focusedId, setFocusedId] = useState<string>('arr');

  return (
    <section aria-label="Executive SaaS revenue KPI cards" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Revenue Performance</h3>
          <p className="text-xs text-slate-500">Click any KPI card to pin its target benchmark</p>
        </div>
        <div
          role="group"
          aria-label="Reporting period"
          className="inline-flex items-center rounded-lg bg-slate-100 p-1"
        >
          {(['7d', '30d', '90d'] as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={period === p}
              onClick={() => setPeriod(p)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                period === p
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPI_DATA.map((kpi) => {
          const stat = kpi.values[period];
          const isFocused = focusedId === kpi.id;
          return (
            <li key={kpi.id}>
              <button
                type="button"
                aria-pressed={isFocused}
                onClick={() => setFocusedId(kpi.id)}
                className={`w-full rounded-xl border p-5 text-left transition-all focus-visible:outline-2 focus-visible:outline-indigo-600 ${
                  isFocused
                    ? 'border-slate-900 bg-white shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-500">{kpi.label}</span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium tabular-nums whitespace-nowrap ${
                      stat.positive ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {stat.positive ? (
                      <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {stat.delta}
                  </span>
                </div>

                <div className="mt-3 font-display text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                  {stat.figure}
                </div>

                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{stat.context}</span>
                    <span className="font-mono tabular-nums">{stat.targetPct}% goal</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${
                        isFocused ? 'bg-slate-900' : 'bg-slate-400'
                      }`}
                      style={{ width: `${stat.targetPct}%` }}
                    />
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
