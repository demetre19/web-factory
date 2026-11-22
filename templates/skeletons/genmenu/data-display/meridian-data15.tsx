import React, { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

interface SprintDay {
  day: number;
  label: string;
  shipped: number;
  target: number;
  highlight: string;
}

const INITIAL_SPRINT_DAYS: SprintDay[] = [
  { day: 8, label: 'Sun', shipped: 2, target: 4, highlight: 'CI runner cache tuning' },
  { day: 9, label: 'Mon', shipped: 5, target: 4, highlight: 'Token refresh middleware' },
  { day: 10, label: 'Tue', shipped: 4, target: 4, highlight: 'CSV streaming exporter' },
  { day: 11, label: 'Wed', shipped: 6, target: 4, highlight: 'Telemetry schema v3 migration' },
  { day: 12, label: 'Thu', shipped: 3, target: 4, highlight: 'Keyboard nav audit' },
  { day: 13, label: 'Fri', shipped: 5, target: 4, highlight: 'Release candidate verification' },
  { day: 14, label: 'Sat', shipped: 1, target: 2, highlight: 'Docs typo sweep' },
  { day: 15, label: 'Sun', shipped: 2, target: 2, highlight: 'Backup restore check' },
  { day: 16, label: 'Mon', shipped: 4, target: 4, highlight: 'Billing webhook retries' },
  { day: 17, label: 'Tue', shipped: 5, target: 4, highlight: 'Dark table contrast pass' },
  { day: 18, label: 'Wed', shipped: 6, target: 4, highlight: 'Query planner hint flags' },
  { day: 19, label: 'Thu', shipped: 4, target: 4, highlight: 'Passkey enrollment UX' },
  { day: 20, label: 'Fri', shipped: 5, target: 4, highlight: 'Sprint demo & tagging' },
  { day: 21, label: 'Sat', shipped: 3, target: 4, highlight: 'Weekend soak monitoring' },
];

export function Data15() {
  const [days, setDays] = useState<SprintDay[]>(INITIAL_SPRINT_DAYS);
  const [selectedDay, setSelectedDay] = useState<number>(18);

  const active = days.find((d) => d.day === selectedDay) ?? days[0];
  const metCount = days.filter((d) => d.shipped >= d.target).length;

  const toggleGoalMet = (dayNum: number) => {
    setDays((prev) =>
      prev.map((d) =>
        d.day === dayNum
          ? { ...d, shipped: d.shipped >= d.target ? Math.max(0, d.target - 1) : d.target }
          : d
      )
    );
  };

  return (
    <section
      aria-label="Colourful 14-day sprint cadence calendar strip"
      className="rounded-xl border border-teal-200 bg-gradient-to-r from-teal-50 via-white to-sky-50 p-4"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 text-xs">
          <h3 className="font-semibold text-slate-900">14-Day Sprint Cadence</h3>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <span className="font-mono font-medium text-teal-700 tabular-nums">
            {metCount}/14 targets met
          </span>
        </div>
        <span className="text-[11px] text-slate-500">Select a day to inspect or toggle quota</span>
      </div>

      <ul className="grid grid-cols-7 gap-1.5 sm:grid-cols-14">
        {days.map((d) => {
          const isSelected = d.day === selectedDay;
          const ratio = d.shipped / d.target;
          const toneClass =
            ratio >= 1.25
              ? 'bg-teal-600 text-white border-teal-700'
              : ratio >= 1
                ? 'bg-emerald-500 text-white border-emerald-600'
                : ratio >= 0.5
                  ? 'bg-amber-300 text-slate-950 border-amber-400'
                  : 'bg-rose-200 text-rose-950 border-rose-300';

          return (
            <li key={d.day}>
              <button
                type="button"
                aria-pressed={isSelected}
                aria-label={`Nov ${d.day} (${d.label}): ${d.shipped} of ${d.target} shipped`}
                onClick={() => setSelectedDay(d.day)}
                className={`flex w-full flex-col items-center rounded-lg border py-2 text-center transition-transform ${toneClass} ${
                  isSelected ? 'ring-2 ring-slate-900 ring-offset-1 scale-[1.03]' : 'hover:opacity-90'
                }`}
              >
                <span className="text-[10px] font-medium opacity-85">{d.label}</span>
                <span className="font-mono text-xs font-bold tabular-nums">{d.day}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-teal-100 bg-white/90 px-3.5 py-2.5 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono font-semibold text-slate-900">Nov {active.day}</span>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <span className="text-slate-700">{active.highlight}</span>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <span className="font-mono text-slate-600 tabular-nums">
            {active.shipped}/{active.target} PRs
          </span>
        </div>

        <button
          type="button"
          onClick={() => toggleGoalMet(active.day)}
          className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
        >
          {active.shipped >= active.target ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
              Quota Met
            </>
          ) : (
            <>
              <Circle className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              Mark Quota Met
            </>
          )}
        </button>
      </div>
    </section>
  );
}
