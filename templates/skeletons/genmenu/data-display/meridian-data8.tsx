import React, { useState } from 'react';
import { Bookmark, ChevronDown, ChevronUp } from 'lucide-react';

type ReleaseCategory = 'All' | 'Platform' | 'Security' | 'API';

interface ReleaseNote {
  id: string;
  date: string;
  category: Exclude<ReleaseCategory, 'All'>;
  title: string;
  summary: string;
  author: string;
  details: string[];
}

const RELEASES: ReleaseNote[] = [
  {
    id: 'rel-1',
    date: '2026-11-19',
    category: 'Platform',
    title: 'Zero-downtime partition rebalancing for multi-region tables',
    summary: 'Automatic shard splitting now runs incrementally without write locks during peak traffic windows.',
    author: 'Elena Rostova · Storage Systems',
    details: [
      'Reduces tail write latency spikes by 68% during background compaction.',
      'Supports live schema validation across primary and read-replica clusters.',
    ],
  },
  {
    id: 'rel-2',
    date: '2026-11-14',
    category: 'Security',
    title: 'Hardware-backed WebAuthn enforcement for organization admins',
    summary: 'Workspace owners can now mandate FIDO2 passkeys across billing and role-escalation actions.',
    author: 'Marcus Vance · Identity Core',
    details: [
      'Enforces per-session cryptographic verification for API token minting.',
      'Exports signed verification events to external SIEM webhook sinks.',
    ],
  },
  {
    id: 'rel-3',
    date: '2026-11-08',
    category: 'API',
    title: 'Cursor-paginated batch export endpoint with Arrow IPC streaming',
    summary: 'Stream up to 5M analytical rows per request with deterministic resume cursors.',
    author: 'Priya Nair · Query Runtime',
    details: [
      'Eliminates offset drift on rapidly mutating transactional datasets.',
      'Includes built-in zstd compression negotiation over HTTP/2.',
    ],
  },
];

export function Data8() {
  const [filter, setFilter] = useState<ReleaseCategory>('All');
  const [savedIds, setSavedIds] = useState<string[]>(['rel-1']);
  const [expandedId, setExpandedId] = useState<string>('rel-1');

  const visible =
    filter === 'All' ? RELEASES : RELEASES.filter((r) => r.category === filter);

  const toggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <section
      aria-label="Platform release and changelog feed"
      className="rounded-xl border border-slate-200 bg-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold text-slate-900">Engineering Releases</h3>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <span className="text-xs text-slate-500 tabular-nums">{savedIds.length} bookmarked</span>
        </div>

        <div role="group" aria-label="Filter releases by category" className="inline-flex rounded-lg bg-slate-100 p-1">
          {(['All', 'Platform', 'Security', 'API'] as ReleaseCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              aria-pressed={filter === cat}
              onClick={() => setFilter(cat)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                filter === cat ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <ul className="divide-y divide-slate-100">
        {visible.map((item) => {
          const isSaved = savedIds.includes(item.id);
          const isExpanded = expandedId === item.id;
          return (
            <li key={item.id} className="px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-800">{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={item.date} className="font-mono tabular-nums">
                      {item.date}
                    </time>
                    <span aria-hidden="true">·</span>
                    <span>{item.author}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                  <p className="max-w-2xl text-sm leading-relaxed text-slate-600">{item.summary}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    aria-label={isSaved ? `Remove bookmark for ${item.title}` : `Bookmark ${item.title}`}
                    aria-pressed={isSaved}
                    onClick={() => toggleSave(item.id)}
                    className={`rounded-md border p-2 transition-colors ${
                      isSaved
                        ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Bookmark className="h-3.5 w-3.5" fill={isSaved ? 'currentColor' : 'none'} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    aria-label={isExpanded ? `Collapse details for ${item.title}` : `Expand details for ${item.title}`}
                    onClick={() => setExpandedId(isExpanded ? '' : item.id)}
                    className="rounded-md border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-600">
                  {item.details.map((detail) => (
                    <li key={detail}>{detail}</li>
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
