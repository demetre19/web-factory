import React, { useState } from 'react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

type LeaderboardMetric = 'merged' | 'reviews' | 'issues';

interface Contributor {
  id: string;
  name: string;
  team: string;
  initials: string;
  badgeBg: string;
  merged: number;
  reviews: number;
  issues: number;
  rankChange: number;
}

const CONTRIBUTORS: Contributor[] = [
  { id: 'c-1', name: 'Nadia Kowalski', team: 'Query Engine', initials: 'NK', badgeBg: 'bg-indigo-600 text-white', merged: 46, reviews: 71, issues: 28, rankChange: 2 },
  { id: 'c-2', name: 'Devon Brooks', team: 'Edge Runtime', initials: 'DB', badgeBg: 'bg-emerald-600 text-white', merged: 41, reviews: 84, issues: 22, rankChange: 0 },
  { id: 'c-3', name: 'Haruki Sato', team: 'Storage Core', initials: 'HS', badgeBg: 'bg-amber-500 text-slate-950', merged: 38, reviews: 59, issues: 35, rankChange: 1 },
  { id: 'c-4', name: 'Amara Osei', team: 'Design Systems', initials: 'AO', badgeBg: 'bg-rose-600 text-white', merged: 34, reviews: 63, issues: 41, rankChange: -1 },
  { id: 'c-5', name: 'Liam Gallagher', team: 'Billing Ledger', initials: 'LG', badgeBg: 'bg-sky-600 text-white', merged: 29, reviews: 48, issues: 19, rankChange: -2 },
];

export function Data19() {
  const [metric, setMetric] = useState<LeaderboardMetric>('merged');
  const [selectedId, setSelectedId] = useState<string>('c-1');

  const ranked = [...CONTRIBUTORS].sort((a, b) => b[metric] - a[metric]);
  const maxVal = Math.max(...ranked.map((r) => r[metric]), 1);

  return (
    <section
      aria-label="Colourful engineering velocity leaderboard rows"
      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-gradient-to-r from-indigo-50/70 via-white to-emerald-50/70 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">Engineering Velocity Leaderboard</h3>
        <div role="group" aria-label="Rank leaderboard by metric" className="inline-flex rounded-md bg-slate-100 p-0.5">
          {(
            [
              ['merged', 'PRs Merged'],
              ['reviews', 'Reviews'],
              ['issues', 'Issues Closed'],
            ] as Array<[LeaderboardMetric, string]>
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={metric === key}
              onClick={() => setMetric(key)}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                metric === key ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <ol className="divide-y divide-slate-100">
        {ranked.map((person, index) => {
          const score = person[metric];
          const barPct = Math.round((score / maxVal) * 100);
          const isSelected = selectedId === person.id;

          return (
            <li key={person.id}>
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedId(person.id)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                  isSelected ? 'bg-indigo-50/60' : 'hover:bg-slate-50'
                }`}
              >
                <span className="w-6 font-mono text-xs font-bold text-slate-500 tabular-nums">
                  #{index + 1}
                </span>

                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${person.badgeBg}`}
                  aria-hidden="true"
                >
                  {person.initials}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-xs font-semibold text-slate-900">{person.name}</span>
                    <span className="hidden text-[11px] text-slate-500 sm:inline">· {person.team}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-200"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`inline-flex items-center gap-0.5 text-[11px] font-mono tabular-nums ${
                      person.rankChange > 0
                        ? 'text-emerald-700'
                        : person.rankChange < 0
                          ? 'text-rose-700'
                          : 'text-slate-400'
                    }`}
                    aria-label={`Rank change ${person.rankChange}`}
                  >
                    {person.rankChange > 0 ? (
                      <ArrowUp className="h-3 w-3" aria-hidden="true" />
                    ) : person.rankChange < 0 ? (
                      <ArrowDown className="h-3 w-3" aria-hidden="true" />
                    ) : (
                      <Minus className="h-3 w-3" aria-hidden="true" />
                    )}
                    {Math.abs(person.rankChange)}
                  </span>
                  <span className="w-10 text-right font-mono text-sm font-bold text-slate-900 tabular-nums">
                    {score}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
