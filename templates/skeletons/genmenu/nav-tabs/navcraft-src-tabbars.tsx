import React, { useState } from 'react';
import {
  Activity,
  Archive,
  Bell,
  CreditCard,
  Inbox,
  KeyRound,
  Mail,
  Send,
  ShieldCheck,
  UserCircle,
  Users,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* Nav4: Underline Tab Bar                                                    */
/* -------------------------------------------------------------------------- */
const UNDERLINE_TABS = [
  { id: 'overview', label: 'Overview', detail: 'Active production cluster running 14 nodes across 3 availability zones.' },
  { id: 'deployments', label: 'Deployments', detail: 'Release v2.14.0 rolled out cleanly across edge workers 18 minutes ago.' },
  { id: 'metrics', label: 'Metrics', detail: 'Median response latency is 34ms with 99.98% availability over 30 days.' },
  { id: 'audit', label: 'Audit Log', detail: '12 verified configuration events recorded in the current billing window.' },
];

export function Nav4() {
  const [active, setActive] = useState('overview');
  const current = UNDERLINE_TABS.find((t) => t.id === active) ?? UNDERLINE_TABS[0];

  return (
    <div className="flex flex-col gap-3">
      <nav aria-label="Service sections" className="border-b border-slate-200">
        <div role="tablist" className="flex items-center gap-6 overflow-x-auto">
          {UNDERLINE_TABS.map((tab) => {
            const isSelected = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`nav4-tab-${tab.id}`}
                aria-selected={isSelected}
                aria-controls={`nav4-panel-${tab.id}`}
                onClick={() => setActive(tab.id)}
                className={`relative pb-3 text-sm font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 ${
                  isSelected
                    ? 'text-blue-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
                {isSelected && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-600"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
      <div
        role="tabpanel"
        id={`nav4-panel-${current.id}`}
        aria-labelledby={`nav4-tab-${current.id}`}
        className="rounded-lg bg-white p-3.5 text-sm text-slate-600 border border-slate-200"
      >
        {current.detail}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Nav5: Pill Tab Bar                                                         */
/* -------------------------------------------------------------------------- */
const PILL_TABS = [
  { id: 'all', label: 'All Activity', summary: '28 events across design, code review, and release pipelines today.' },
  { id: 'mentions', label: 'Mentions', summary: '3 direct review requests waiting on your feedback.' },
  { id: 'reviews', label: 'Pull Requests', summary: '7 open pull requests passing CI checks and ready to merge.' },
  { id: 'alerts', label: 'Alerts', summary: 'Zero critical incidents active across monitored regions.' },
];

export function Nav5() {
  const [active, setActive] = useState('all');
  const current = PILL_TABS.find((t) => t.id === active) ?? PILL_TABS[0];

  return (
    <div className="flex flex-col gap-3">
      <nav aria-label="Activity filters">
        <div role="tablist" className="inline-flex flex-wrap items-center gap-1.5 rounded-full bg-slate-200/70 p-1">
          {PILL_TABS.map((tab) => {
            const isSelected = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`nav5-tab-${tab.id}`}
                aria-selected={isSelected}
                aria-controls={`nav5-panel-${tab.id}`}
                onClick={() => setActive(tab.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-all focus-visible:outline-2 focus-visible:outline-blue-600 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>
      <div
        role="tabpanel"
        id={`nav5-panel-${current.id}`}
        aria-labelledby={`nav5-tab-${current.id}`}
        className="rounded-lg border border-slate-200 bg-white p-3.5 text-sm text-slate-600"
      >
        {current.summary}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Nav6: Icon + Label Tab Bar                                                 */
/* -------------------------------------------------------------------------- */
const ICON_TABS = [
  { id: 'inbox', label: 'Inbox', count: 4, icon: Inbox, content: '4 unread messages in your priority triage queue.' },
  { id: 'drafts', label: 'Drafts', count: 2, icon: Mail, content: '2 unsent release announcements saved automatically.' },
  { id: 'sent', label: 'Sent', count: 18, icon: Send, content: '18 dispatches delivered to subscriber lists this week.' },
  { id: 'archive', label: 'Archive', count: 64, icon: Archive, content: '64 resolved threads stored in cold archive.' },
];

export function Nav6() {
  const [active, setActive] = useState('inbox');
  const current = ICON_TABS.find((t) => t.id === active) ?? ICON_TABS[0];

  return (
    <div className="flex flex-col gap-3">
      <nav aria-label="Mailbox views" className="rounded-xl border border-slate-200 bg-white p-1.5">
        <div role="tablist" className="grid grid-cols-2 gap-1 sm:grid-cols-4">
          {ICON_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`nav6-tab-${tab.id}`}
                aria-selected={isSelected}
                aria-controls={`nav6-panel-${tab.id}`}
                onClick={() => setActive(tab.id)}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 ${
                  isSelected
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{tab.label}</span>
                <span className="font-mono text-[11px] tabular-nums opacity-75">{tab.count}</span>
              </button>
            );
          })}
        </div>
      </nav>
      <div
        role="tabpanel"
        id={`nav6-panel-${current.id}`}
        aria-labelledby={`nav6-tab-${current.id}`}
        className="rounded-lg border border-slate-200 bg-white p-3.5 text-sm text-slate-600"
      >
        {current.content}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Nav7: Vertical Sidebar Tabs                                                */
/* -------------------------------------------------------------------------- */
const SIDEBAR_TABS = [
  { id: 'profile', label: 'Profile', icon: UserCircle, title: 'Profile Details', desc: 'Manage public display name, timezone, and preferred contact email.' },
  { id: 'billing', label: 'Billing', icon: CreditCard, title: 'Billing & Plan', desc: 'Pro Team plan renews on December 1, 2026 at $48/month.' },
  { id: 'keys', label: 'API Keys', icon: KeyRound, title: 'API Credentials', desc: '3 scoped tokens active; last rotation completed 11 days ago.' },
  { id: 'security', label: 'Security', icon: ShieldCheck, title: 'Access & 2FA', desc: 'Hardware security keys enforced for all workspace maintainers.' },
  { id: 'notifications', label: 'Alerts', icon: Bell, title: 'Notification Rules', desc: 'Digest summaries delivered daily at 09:00 PST.' },
  { id: 'team', label: 'Team', icon: Users, title: 'Workspace Members', desc: '9 active seats allocated across Engineering and Design.' },
  { id: 'usage', label: 'Usage', icon: Activity, title: 'Monthly Quota', desc: '68,420 of 250,000 included requests consumed.' },
];

export function Nav7() {
  const [active, setActive] = useState('profile');
  const current = SIDEBAR_TABS.find((t) => t.id === active) ?? SIDEBAR_TABS[0];

  return (
    <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[190px_1fr]">
      <nav aria-label="Account settings tabs">
        <div role="tablist" aria-orientation="vertical" className="flex flex-col gap-0.5">
          {SIDEBAR_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`nav7-tab-${tab.id}`}
                aria-selected={isSelected}
                aria-controls={`nav7-panel-${tab.id}`}
                onClick={() => setActive(tab.id)}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 ${
                  isSelected
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      <div
        role="tabpanel"
        id={`nav7-panel-${current.id}`}
        aria-labelledby={`nav7-tab-${current.id}`}
        className="flex flex-col justify-between rounded-lg bg-slate-50 p-4 border border-slate-200/80"
      >
        <div>
          <h4 className="text-sm font-semibold text-slate-900">{current.title}</h4>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{current.desc}</p>
        </div>
        <div className="mt-4 text-xs text-slate-500">
          Active panel · {current.label}
        </div>
      </div>
    </div>
  );
}
