import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

type TeamFilter = 'All' | 'Engineering' | 'Growth' | 'Design';

interface ObjectiveItem {
  id: string;
  team: Exclude<TeamFilter, 'All'>;
  title: string;
  progress: number;
  confidence: 'On Track' | 'At Risk' | 'Behind';
  barColor: string;
  keyResults: Array<{ label: string; current: string; target: string }>;
}

const OBJECTIVES: ObjectiveItem[] = [
  {
    id: 'okr-1',
    team: 'Engineering',
    title: 'Cut global p99 API query latency below 120ms',
    progress: 84,
    confidence: 'On Track',
    barColor: 'bg-emerald-500',
    keyResults: [
      { label: 'Shard read-replica routing in eu-central', current: '98%', target: '100%' },
      { label: 'Zero-allocation JSON serializer rollout', current: '112ms', target: '<120ms' },
    ],
  },
  {
    id: 'okr-2',
    team: 'Growth',
    title: 'Expand mid-market self-serve annual conversions',
    progress: 58,
    confidence: 'At Risk',
    barColor: 'bg-amber-500',
    keyResults: [
      { label: 'Annual plan upgrade checkout share', current: '29%', target: '45%' },
      { label: 'Day-7 workspace activation rate', current: '61%', target: '70%' },
    ],
  },
  {
    id: 'okr-3',
    team: 'Design',
    title: 'Standardize WCAG AA compliance across all 20 data modules',
    progress: 92,
    confidence: 'On Track',
    barColor: 'bg-indigo-600',
    keyResults: [
      { label: 'Keyboard focus-ring & ARIA sort coverage', current: '20/20', target: '20/20' },
      { label: 'Tabular numeral audit on financial views', current: '18/20', target: '20/20' },
    ],
  },
  {
    id: 'okr-4',
    team: 'Engineering',
    title: 'Automate zero-touch disaster recovery failover drills',
    progress: 34,
    confidence: 'Behind',
    barColor: 'bg-rose-500',
    keyResults: [
      { label: 'Cross-region WAL replay verification', current: '1/3', target: '3/3' },
      { label: 'Automated chaos test CI gate', current: '40%', target: '100%' },
    ],
  },
];

export function Data17() {
  const [team, setTeam] = useState<TeamFilter>('All');
  const [expandedId, setExpandedId] = useState<string>('okr-1');

  const visible =
    team === 'All' ? OBJECTIVES : OBJECTIVES.filter((o) => o.team === team);

  return (
    <section
      aria-label="Colourful quarterly OKR progress tracker"
      className="rounded-xl border border-violet-200/80 bg-gradient-to-br from-violet-50/50 via-white to-emerald-50/40 p-6"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Q4 Objectives &amp; Key Results</h3>
          <p className="text-xs text-slate-500">Filter by department and expand any objective for key results</p>
        </div>

        <div role="group" aria-label="Filter OKRs by team" className="inline-flex rounded-lg bg-slate-100 p-1">
          {(['All', 'Engineering', 'Growth', 'Design'] as TeamFilter[]).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={team === t}
              onClick={() => setTeam(t)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                team === t ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <ul className="space-y-3">
        {visible.map((okr) => {
          const isExpanded = expandedId === okr.id;
          return (
            <li key={okr.id} className="rounded-xl border border-slate-200/90 bg-white p-4">
              <button
                type="button"
                aria-expanded={isExpanded}
                onClick={() => setExpandedId(isExpanded ? '' : okr.id)}
                className="w-full text-left"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-violet-700">{okr.team}</span>
                    <span className="text-slate-300" aria-hidden="true">·</span>
                    <span
                      className={`font-semibold ${
                        okr.confidence === 'On Track'
                          ? 'text-emerald-700'
                          : okr.confidence === 'At Risk'
                            ? 'text-amber-700'
                            : 'text-rose-700'
                      }`}
                    >
                      {okr.confidence}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-900 tabular-nums">
                      {okr.progress}%
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
                    )}
                  </div>
                </div>

                <div className="mt-1.5 text-sm font-semibold text-slate-900">{okr.title}</div>

                <div
                  role="progressbar"
                  aria-label={`${okr.title} progress`}
                  aria-valuenow={okr.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100"
                >
                  <div
                    className={`h-full rounded-full ${okr.barColor}`}
                    style={{ width: `${okr.progress}%` }}
                  />
                </div>
              </button>

              {isExpanded && (
                <ul className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                  {okr.keyResults.map((kr) => (
                    <li
                      key={kr.label}
                      className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600"
                    >
                      <span>{kr.label}</span>
                      <span className="font-mono text-slate-900 tabular-nums">
                        {kr.current} / {kr.target}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
