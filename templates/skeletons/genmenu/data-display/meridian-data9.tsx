import React, { useState } from 'react';
import { CheckCheck } from 'lucide-react';

type PriorityFilter = 'All' | 'Urgent' | 'High' | 'Normal';

interface FeedTicket {
  id: string;
  account: string;
  channel: string;
  priority: Exclude<PriorityFilter, 'All'>;
  message: string;
  ago: string;
  accentBg: string;
}

const TICKETS: FeedTicket[] = [
  {
    id: 't-101',
    account: 'Aether Freight',
    channel: 'Slack Connect',
    priority: 'Urgent',
    message: 'Webhook signature mismatch on eu-west-1 production tenant after key rotation.',
    ago: '4m ago',
    accentBg: 'bg-rose-600 text-white',
  },
  {
    id: 't-102',
    account: 'Solstice Health',
    channel: 'Priority Portal',
    priority: 'High',
    message: 'Requesting temporary seat cap lift from 250 to 400 ahead of Monday onboarding.',
    ago: '19m ago',
    accentBg: 'bg-amber-500 text-slate-950',
  },
  {
    id: 't-103',
    account: 'Lumen Architecture',
    channel: 'Email Desk',
    priority: 'Normal',
    message: 'Clarification on SOC2 Type II report attachment for annual procurement review.',
    ago: '42m ago',
    accentBg: 'bg-indigo-600 text-white',
  },
  {
    id: 't-104',
    account: 'Cinder Robotics',
    channel: 'API Alert',
    priority: 'High',
    message: 'Rate limit burst warnings observed during nightly telemetry backfill job.',
    ago: '1h ago',
    accentBg: 'bg-teal-600 text-white',
  },
];

export function Data9() {
  const [priority, setPriority] = useState<PriorityFilter>('All');
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);

  const filtered =
    priority === 'All' ? TICKETS : TICKETS.filter((t) => t.priority === priority);

  const toggleResolved = (id: string) => {
    setResolvedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <section
      aria-label="Colourful customer escalation and support feed"
      className="rounded-xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/60 via-white to-amber-50/40 overflow-hidden"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 bg-white/80 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-semibold text-slate-900">Support Triage Stream</h3>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <span className="text-xs font-medium text-indigo-700 tabular-nums">
            {TICKETS.length - resolvedIds.length} open
          </span>
        </div>

        <div role="group" aria-label="Filter tickets by priority" className="flex items-center gap-1">
          {(['All', 'Urgent', 'High', 'Normal'] as PriorityFilter[]).map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={priority === p}
              onClick={() => setPriority(p)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                priority === p
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-indigo-100/70 hover:text-slate-900'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <ul className="divide-y divide-indigo-100/70">
        {filtered.map((ticket) => {
          const isResolved = resolvedIds.includes(ticket.id);
          return (
            <li
              key={ticket.id}
              className={`flex items-start justify-between gap-4 px-4 py-3.5 transition-opacity ${
                isResolved ? 'opacity-55 bg-slate-50/70' : 'bg-white/60 hover:bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${ticket.accentBg}`}
                  aria-hidden="true"
                >
                  {ticket.account.slice(0, 2).toUpperCase()}
                </div>
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-900">{ticket.account}</span>
                    <span className="text-slate-300" aria-hidden="true">·</span>
                    <span className="font-medium text-indigo-700">{ticket.channel}</span>
                    <span className="text-slate-300" aria-hidden="true">·</span>
                    <span
                      className={`font-semibold ${
                        ticket.priority === 'Urgent'
                          ? 'text-rose-700'
                          : ticket.priority === 'High'
                            ? 'text-amber-700'
                            : 'text-slate-600'
                      }`}
                    >
                      {ticket.priority}
                    </span>
                    <span className="text-slate-300" aria-hidden="true">·</span>
                    <span className="font-mono text-[11px] text-slate-500">{ticket.ago}</span>
                  </div>
                  <p className={`text-xs leading-relaxed text-slate-700 ${isResolved ? 'line-through' : ''}`}>
                    {ticket.message}
                  </p>
                </div>
              </div>

              <button
                type="button"
                aria-pressed={isResolved}
                onClick={() => toggleResolved(ticket.id)}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  isResolved
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                {isResolved ? 'Triaged' : 'Triage'}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
