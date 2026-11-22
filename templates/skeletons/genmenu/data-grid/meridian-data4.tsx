import React, { useState } from 'react';

type ClusterRegion = 'us-east' | 'eu-west' | 'ap-south';

interface TelemetryMetric {
  label: string;
  value: string;
  unit: string;
  loadPct: number;
  limit: string;
}

const REGION_METRICS: Record<ClusterRegion, TelemetryMetric[]> = {
  'us-east': [
    { label: 'vCPU Saturation', value: '74.2', unit: '%', loadPct: 74, limit: '90% threshold' },
    { label: 'Memory Allocated', value: '412.8', unit: 'GiB', loadPct: 81, limit: '512 GiB pool' },
    { label: 'Queue Depth', value: '18', unit: 'jobs', loadPct: 24, limit: '75 max queue' },
    { label: 'Error Budget Left', value: '99.4', unit: '%', loadPct: 99, limit: '30d rolling SLO' },
  ],
  'eu-west': [
    { label: 'vCPU Saturation', value: '52.6', unit: '%', loadPct: 53, limit: '90% threshold' },
    { label: 'Memory Allocated', value: '298.0', unit: 'GiB', loadPct: 58, limit: '512 GiB pool' },
    { label: 'Queue Depth', value: '9', unit: 'jobs', loadPct: 12, limit: '75 max queue' },
    { label: 'Error Budget Left', value: '99.9', unit: '%', loadPct: 100, limit: '30d rolling SLO' },
  ],
  'ap-south': [
    { label: 'vCPU Saturation', value: '86.9', unit: '%', loadPct: 87, limit: '90% threshold' },
    { label: 'Memory Allocated', value: '468.4', unit: 'GiB', loadPct: 91, limit: '512 GiB pool' },
    { label: 'Queue Depth', value: '54', unit: 'jobs', loadPct: 72, limit: '75 max queue' },
    { label: 'Error Budget Left', value: '96.2', unit: '%', loadPct: 96, limit: '30d rolling SLO' },
  ],
};

export function Data4() {
  const [region, setRegion] = useState<ClusterRegion>('us-east');
  const metrics = REGION_METRICS[region];

  return (
    <section
      aria-label="Dark compute cluster telemetry KPI strip"
      className="rounded-xl border border-slate-800 bg-[#0B1120] p-4 text-slate-100"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-semibold tracking-wide text-slate-200">
          Compute Cluster Telemetry
        </h3>
        <div role="group" aria-label="Cluster region" className="flex items-center gap-1">
          {(['us-east', 'eu-west', 'ap-south'] as ClusterRegion[]).map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={region === r}
              onClick={() => setRegion(r)}
              className={`rounded px-2 py-1 font-mono text-[11px] transition-colors whitespace-nowrap shrink-0 ${
                region === r
                  ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => {
          const isHigh = m.loadPct >= 85 && m.label !== 'Error Budget Left';
          return (
            <li
              key={m.label}
              className="rounded-lg border border-slate-800 bg-slate-900/75 px-3.5 py-3"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{m.label}</span>
                <span className="font-mono text-slate-500">{m.limit}</span>
              </div>
              <div className="mt-1.5 flex items-baseline gap-1 font-mono tabular-nums">
                <span className="text-xl font-semibold text-white">{m.value}</span>
                <span className="text-xs text-slate-400">{m.unit}</span>
              </div>
              <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full ${
                    isHigh ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${m.loadPct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
