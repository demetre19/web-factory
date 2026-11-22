import React, { useState } from 'react';
import { Search } from 'lucide-react';

type AuditScope = 'All' | 'Auth' | 'Permission' | 'Export';

interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  scope: Exclude<AuditScope, 'All'>;
  action: string;
  target: string;
  ip: string;
  location: string;
}

const AUDIT_EVENTS: AuditEvent[] = [
  { id: 'aud-1', timestamp: '2026-11-21 18:44:12', actor: 'claire.chen@meridian.io', scope: 'Permission', action: 'Granted Billing Admin role', target: 'david.okafor@meridian.io', ip: '198.51.100.42', location: 'San Francisco, US' },
  { id: 'aud-2', timestamp: '2026-11-21 18:19:03', actor: 'svc-warehouse-sync', scope: 'Export', action: 'Exported encrypted Parquet snapshot', target: 'ledger_q4_2026', ip: '10.24.8.19', location: 'us-east-1 VPC' },
  { id: 'aud-3', timestamp: '2026-11-21 17:52:48', actor: 'henrik.holm@meridian.io', scope: 'Auth', action: 'Rotated SAML IdP signing certificate', target: 'Okta Enterprise SSO', ip: '203.0.113.88', location: 'Stockholm, SE' },
  { id: 'aud-4', timestamp: '2026-11-21 16:30:11', actor: 'maya.patel@meridian.io', scope: 'Export', action: 'Downloaded SOC2 audit trail CSV', target: 'compliance-archive-nov', ip: '192.0.2.154', location: 'London, UK' },
  { id: 'aud-5', timestamp: '2026-11-21 15:11:09', actor: 'claire.chen@meridian.io', scope: 'Auth', action: 'Enforced WebAuthn MFA policy', target: 'Production Workspace', ip: '198.51.100.42', location: 'San Francisco, US' },
];

export function Data12() {
  const [scope, setScope] = useState<AuditScope>('All');
  const [search, setSearch] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string>('aud-1');

  const visible = AUDIT_EVENTS.filter((ev) => {
    if (scope !== 'All' && ev.scope !== scope) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        ev.actor.toLowerCase().includes(q) ||
        ev.action.toLowerCase().includes(q) ||
        ev.target.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeEvent = visible.find((e) => e.id === selectedId) ?? visible[0];

  return (
    <section
      aria-label="Security and compliance audit activity log"
      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-900">Audit Activity Log</h3>
          <div role="group" aria-label="Filter audit scope" className="inline-flex rounded-md bg-slate-100 p-0.5">
            {(['All', 'Auth', 'Permission', 'Export'] as AuditScope[]).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={scope === s}
                onClick={() => setScope(s)}
                className={`rounded px-2 py-1 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                  scope === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <label className="relative flex items-center">
          <span className="sr-only">Search audit events</span>
          <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter actor or target..."
            className="w-48 rounded-md border border-slate-200 bg-slate-50 py-1 pr-2.5 pl-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none"
          />
        </label>
      </div>

      {visible.length === 0 ? (
        <div className="px-4 py-8 text-center text-xs text-slate-500">
          No audit events match &ldquo;{search}&rdquo;.{' '}
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setScope('All');
            }}
            className="font-medium text-indigo-600 underline"
          >
            Reset filter
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {visible.map((ev) => {
            const isSelected = activeEvent?.id === ev.id;
            return (
              <li key={ev.id}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedId(ev.id)}
                  className={`flex w-full flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-left text-xs transition-colors ${
                    isSelected ? 'bg-slate-50' : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-medium text-slate-900">{ev.actor}</span>
                      <span className="text-slate-500">{ev.action}</span>
                      <span className="font-mono text-[11px] text-slate-800">{ev.target}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="font-medium text-slate-700">{ev.scope}</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={ev.timestamp} className="font-mono tabular-nums whitespace-nowrap">
                      {ev.timestamp}
                    </time>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {activeEvent && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50/80 px-4 py-2 text-[11px] text-slate-600">
          <span>
            Source IP: <strong className="font-mono text-slate-900">{activeEvent.ip}</strong>
          </span>
          <span>Origin: {activeEvent.location}</span>
        </div>
      )}
    </section>
  );
}
