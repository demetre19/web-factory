import React, { useState } from 'react';
import { Check, CircleDot, Clock } from 'lucide-react';

type MilestoneStatus = 'All' | 'Completed' | 'In Progress' | 'Upcoming';

interface Milestone {
  id: string;
  phase: string;
  date: string;
  title: string;
  status: Exclude<MilestoneStatus, 'All'>;
  owner: string;
  deliverables: string[];
}

const MILESTONES: Milestone[] = [
  {
    id: 'ms-1',
    phase: 'Phase 01',
    date: 'Nov 02, 2026',
    title: 'Dual-Write Replication Cutover',
    status: 'Completed',
    owner: 'Storage Guild',
    deliverables: ['Shadow read parity verified at 99.998%', 'Zero replication lag across 48h soak'],
  },
  {
    id: 'ms-2',
    phase: 'Phase 02',
    date: 'Nov 18, 2026',
    title: 'Tenant Routing & DNS Canary',
    status: 'In Progress',
    owner: 'Edge Platform',
    deliverables: ['25% enterprise traffic routed to eu-central-2', 'Automated rollback health probe active'],
  },
  {
    id: 'ms-3',
    phase: 'Phase 03',
    date: 'Dec 04, 2026',
    title: 'Legacy Cluster Decommission',
    status: 'Upcoming',
    owner: 'Core Infrastructure',
    deliverables: ['Archive cold snapshots to S3 Glacier', 'Retire legacy VPC peering routes'],
  },
];

export function Data10() {
  const [filter, setFilter] = useState<MilestoneStatus>('All');
  const [selectedId, setSelectedId] = useState<string>('ms-2');

  const visible =
    filter === 'All' ? MILESTONES : MILESTONES.filter((m) => m.status === filter);

  return (
    <section
      aria-label="Migration milestone timeline view"
      className="rounded-xl border border-slate-200 bg-white p-6"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Infrastructure Cutover Timeline</h3>
          <p className="text-xs text-slate-500">Select any milestone to inspect phase deliverables</p>
        </div>

        <div role="group" aria-label="Filter milestones by status" className="inline-flex rounded-lg bg-slate-100 p-1">
          {(['All', 'Completed', 'In Progress', 'Upcoming'] as MilestoneStatus[]).map((status) => (
            <button
              key={status}
              type="button"
              aria-pressed={filter === status}
              onClick={() => setFilter(status)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                filter === status ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <ol className="relative space-y-6 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
        {visible.map((ms) => {
          const isSelected = selectedId === ms.id;
          return (
            <li key={ms.id} className="relative pl-10">
              <span
                className={`absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full border ${
                  ms.status === 'Completed'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : ms.status === 'In Progress'
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-white text-slate-400'
                }`}
                aria-hidden="true"
              >
                {ms.status === 'Completed' ? (
                  <Check className="h-4 w-4" />
                ) : ms.status === 'In Progress' ? (
                  <CircleDot className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
              </span>

              <button
                type="button"
                aria-expanded={isSelected}
                onClick={() => setSelectedId(isSelected ? '' : ms.id)}
                className={`w-full rounded-lg border p-4 text-left transition-colors ${
                  isSelected
                    ? 'border-slate-300 bg-slate-50/80'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-slate-800">{ms.phase}</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={ms.date}>{ms.date}</time>
                    <span aria-hidden="true">·</span>
                    <span>{ms.owner}</span>
                  </div>
                  <span
                    className={`font-medium ${
                      ms.status === 'Completed'
                        ? 'text-emerald-700'
                        : ms.status === 'In Progress'
                          ? 'text-indigo-700'
                          : 'text-slate-500'
                    }`}
                  >
                    {ms.status}
                  </span>
                </div>

                <div className="mt-1.5 text-sm font-semibold text-slate-900">{ms.title}</div>

                {isSelected && (
                  <ul className="mt-3 space-y-1 border-t border-slate-200/80 pt-3 text-xs text-slate-600">
                    {ms.deliverables.map((d) => (
                      <li key={d} className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-slate-400" aria-hidden="true" />
                        {d}
                      </li>
                    ))}
                  </ul>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
