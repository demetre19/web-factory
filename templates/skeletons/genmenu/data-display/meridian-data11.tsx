import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, Wrench } from 'lucide-react';

type IncidentPhase = 'All' | 'Detection' | 'Mitigation' | 'Resolution';

interface IncidentEntry {
  id: string;
  utc: string;
  phase: Exclude<IncidentPhase, 'All'>;
  summary: string;
  responder: string;
  detail: string;
}

const INCIDENT_EVENTS: IncidentEntry[] = [
  {
    id: 'inc-1',
    utc: '14:02:18 UTC',
    phase: 'Detection',
    summary: 'Synthetic prober flagged 502 spike on EU ingestion ingress',
    responder: 'PagerBot',
    detail: 'Error budget burn rate crossed 4.5x baseline threshold on edge-eu-west-2.',
  },
  {
    id: 'inc-2',
    utc: '14:06:41 UTC',
    phase: 'Mitigation',
    summary: 'Shifted 100% EU ingress traffic to secondary Frankfurt pool',
    responder: 'S. Takahashi',
    detail: 'DNS weighted pool adjusted via Terraform hotfix PR #8841.',
  },
  {
    id: 'inc-3',
    utc: '14:19:05 UTC',
    phase: 'Mitigation',
    summary: 'Rolled back TLS cipher negotiation change on proxy fleet',
    responder: 'A. Lindqvist',
    detail: 'Restored BoringSSL session ticket cache compatibility for legacy SDKs.',
  },
  {
    id: 'inc-4',
    utc: '14:34:50 UTC',
    phase: 'Resolution',
    summary: 'Full HTTP 200 parity confirmed across all EU edge POPs',
    responder: 'S. Takahashi',
    detail: 'Zero dropped payloads recorded over 15-minute post-mitigation soak.',
  },
];

export function Data11() {
  const [phase, setPhase] = useState<IncidentPhase>('All');
  const [selectedId, setSelectedId] = useState<string>('inc-2');

  const filtered =
    phase === 'All' ? INCIDENT_EVENTS : INCIDENT_EVENTS.filter((e) => e.phase === phase);

  const phaseIcon = (p: IncidentEntry['phase']) => {
    if (p === 'Detection') return <AlertTriangle className="h-3.5 w-3.5 text-rose-400" aria-hidden="true" />;
    if (p === 'Mitigation') return <Wrench className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />;
    return <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />;
  };

  return (
    <section
      aria-label="Dark incident post-mortem timeline"
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-xs">
          <h3 className="font-semibold text-white">Incident #419 Timeline</h3>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <span className="font-mono text-slate-400">Duration: 32m 32s</span>
        </div>

        <div role="group" aria-label="Filter incident phase" className="flex items-center gap-1">
          {(['All', 'Detection', 'Mitigation', 'Resolution'] as IncidentPhase[]).map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={phase === p}
              onClick={() => setPhase(p)}
              className={`rounded px-2 py-1 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                phase === p
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <ol className="relative space-y-2.5 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
        {filtered.map((entry) => {
          const isSelected = selectedId === entry.id;
          return (
            <li key={entry.id} className="relative pl-8">
              <span className="absolute left-0 top-2 flex h-6 w-6 items-center justify-center rounded-full border border-slate-800 bg-slate-900">
                {phaseIcon(entry.phase)}
              </span>

              <button
                type="button"
                aria-expanded={isSelected}
                onClick={() => setSelectedId(isSelected ? '' : entry.id)}
                className={`w-full rounded-lg border px-3.5 py-2.5 text-left transition-colors ${
                  isSelected
                    ? 'border-sky-500/40 bg-slate-900'
                    : 'border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/70'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-2">
                    <time className="font-mono text-sky-400 tabular-nums">{entry.utc}</time>
                    <span className="text-slate-600" aria-hidden="true">·</span>
                    <span className="font-medium text-slate-300">{entry.phase}</span>
                  </div>
                  <span className="text-slate-400">{entry.responder}</span>
                </div>
                <div className="mt-1 text-xs font-medium text-slate-100">{entry.summary}</div>
                {isSelected && (
                  <p className="mt-1.5 border-t border-slate-800 pt-1.5 text-[11px] text-slate-400">
                    {entry.detail}
                  </p>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
