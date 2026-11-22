import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  RotateCcw,
  ShieldAlert,
  Activity,
  CheckCircle2,
} from 'lucide-react';

interface ServiceNode {
  id: string;
  service: string;
  region: string;
  p95Ms: number;
  errorRate: number;
  state: 'Degraded' | 'Healthy' | 'Throttled';
  owner: string;
}

type SortField = 'service' | 'p95Ms' | 'errorRate' | 'state';

const SERVICES: ServiceNode[] = [
  { id: 'svc-auth', service: 'edge-auth-gateway', region: 'us-east-1', p95Ms: 42, errorRate: 0.04, state: 'Healthy', owner: 'IAM Core' },
  { id: 'svc-billing', service: 'ledger-settlement-api', region: 'eu-central-1', p95Ms: 318, errorRate: 2.14, state: 'Degraded', owner: 'Payments' },
  { id: 'svc-search', service: 'vector-index-shard-04', region: 'us-west-2', p95Ms: 184, errorRate: 0.68, state: 'Throttled', owner: 'Search Infra' },
  { id: 'svc-ingest', service: 'telemetry-stream-bus', region: 'ap-southeast-1', p95Ms: 67, errorRate: 0.11, state: 'Healthy', owner: 'Data Pipe' },
  { id: 'svc-media', service: 'asset-transcode-pool', region: 'us-east-1', p95Ms: 249, errorRate: 1.42, state: 'Degraded', owner: 'Media Ops' },
];

export function Data2() {
  const [items, setItems] = useState<ServiceNode[]>(SERVICES);
  const [sortField, setSortField] = useState<SortField>('p95Ms');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeId, setActiveId] = useState<string>('svc-billing');
  const [acknowledged, setAcknowledged] = useState<string[]>([]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder(field === 'service' || field === 'state' ? 'asc' : 'desc');
    }
  };

  const sorted = [...items].sort((a, b) => {
    const dir = sortOrder === 'asc' ? 1 : -1;
    if (sortField === 'p95Ms') return (a.p95Ms - b.p95Ms) * dir;
    if (sortField === 'errorRate') return (a.errorRate - b.errorRate) * dir;
    return a[sortField].localeCompare(b[sortField]) * dir;
  });

  const handleDrain = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, state: 'Healthy', p95Ms: Math.max(38, Math.round(item.p95Ms * 0.45)), errorRate: 0.09 }
          : item
      )
    );
  };

  const toggleAck = (id: string) => {
    setAcknowledged((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const renderBadge = (state: ServiceNode['state']) => {
    if (state === 'Healthy') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-300 ring-1 ring-inset ring-emerald-400/30 whitespace-nowrap">
          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
          Healthy
        </span>
      );
    }
    if (state === 'Throttled') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-300 ring-1 ring-inset ring-amber-400/30 whitespace-nowrap">
          <Activity className="h-3 w-3" aria-hidden="true" />
          Throttled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-500/15 px-2 py-0.5 text-xs font-medium text-rose-300 ring-1 ring-inset ring-rose-400/30 whitespace-nowrap">
        <ShieldAlert className="h-3 w-3" aria-hidden="true" />
        Degraded
      </span>
    );
  };

  const activeNode = items.find((i) => i.id === activeId) ?? items[0];

  return (
    <section
      aria-label="Dark service health and latency table"
      className="rounded-xl border border-slate-800 bg-slate-950 text-slate-100 overflow-hidden"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-white">Runtime Service Table</h3>
          <span className="text-slate-700" aria-hidden="true">·</span>
          <span className="text-xs text-slate-400">
            Selected: <span className="font-mono text-slate-200">{activeNode.service}</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setItems(SERVICES);
            setAcknowledged([]);
          }}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white whitespace-nowrap shrink-0"
        >
          <RotateCcw className="h-3 w-3" aria-hidden="true" />
          Reset nodes
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/70 text-slate-400">
              {(
                [
                  ['service', 'Service'],
                  ['state', 'State'],
                  ['p95Ms', 'p95 Latency'],
                  ['errorRate', 'Error %'],
                ] as Array<[SortField, string]>
              ).map(([field, label]) => {
                const isNumeric = field === 'p95Ms' || field === 'errorRate';
                return (
                  <th
                    key={field}
                    scope="col"
                    aria-sort={
                      sortField === field
                        ? sortOrder === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                    className={`px-4 py-2.5 font-medium ${isNumeric ? 'text-right' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSort(field)}
                      className={`inline-flex items-center gap-1.5 hover:text-white focus-visible:outline-2 focus-visible:outline-sky-400 rounded whitespace-nowrap ${
                        isNumeric ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <span>{label}</span>
                      {sortField !== field ? (
                        <ArrowUpDown className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
                      ) : sortOrder === 'asc' ? (
                        <ArrowUp className="h-3.5 w-3.5 text-sky-400" aria-hidden="true" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5 text-sky-400" aria-hidden="true" />
                      )}
                    </button>
                  </th>
                );
              })}
              <th scope="col" className="px-4 py-2.5 font-medium">Owner</th>
              <th scope="col" className="px-4 py-2.5 text-right font-medium">Mitigation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {sorted.map((node) => {
              const isSelected = node.id === activeId;
              const isAcked = acknowledged.includes(node.id);
              return (
                <tr
                  key={node.id}
                  aria-selected={isSelected}
                  onClick={() => setActiveId(node.id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-sky-950/50' : 'hover:bg-slate-900/70'
                  }`}
                >
                  <td className="px-4 py-2.5">
                    <div className="font-mono font-medium text-white">{node.service}</div>
                    <div className="text-[11px] text-slate-400">{node.region}</div>
                  </td>
                  <td className="px-4 py-2.5">{renderBadge(node.state)}</td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-slate-200 whitespace-nowrap">
                    {node.p95Ms} ms
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-slate-200 whitespace-nowrap">
                    {node.errorRate.toFixed(2)}%
                  </td>
                  <td className="px-4 py-2.5 text-slate-300 whitespace-nowrap">{node.owner}</td>
                  <td
                    className="px-4 py-2.5 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="inline-flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        aria-pressed={isAcked}
                        onClick={() => toggleAck(node.id)}
                        className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                          isAcked
                            ? 'bg-slate-800 text-sky-300 ring-1 ring-sky-500/40'
                            : 'bg-slate-900 text-slate-300 ring-1 ring-slate-700 hover:text-white'
                        }`}
                      >
                        <Check className="h-3 w-3" aria-hidden="true" />
                        {isAcked ? 'Acked' : 'Ack'}
                      </button>
                      {node.state !== 'Healthy' && (
                        <button
                          type="button"
                          onClick={() => handleDrain(node.id)}
                          className="rounded bg-sky-500 px-2 py-1 text-[11px] font-medium text-slate-950 hover:bg-sky-400 whitespace-nowrap shrink-0"
                        >
                          Reroute
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
