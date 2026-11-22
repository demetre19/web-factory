import { useId, useState } from 'react';
import { Bell, Check, Inbox, Plus, RefreshCw, X } from 'lucide-react';
import { formatBadgeCount } from '../../utils/microCatalog';

/**
 * Micro18: Badge / Count Indicator with Breakdown Tray · Colourful
 */
export function Micro18() {
  const [open, setOpen] = useState(true);
  const [mentions, setMentions] = useState(4);
  const [reviews, setReviews] = useState(8);
  const [alerts, setAlerts] = useState(2);
  const trayId = useId();

  const total = mentions + reviews + alerts;
  const displayCount = formatBadgeCount(total);

  return (
    <div className="pt-2 pb-44 flex items-start justify-center">
      <div className="relative inline-flex">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={trayId}
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border border-indigo-200 text-sm font-medium text-slate-900 shadow-xs hover:bg-indigo-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 transition-colors whitespace-nowrap"
        >
          <Inbox className="w-4 h-4 text-indigo-600" aria-hidden="true" />
          <span>Inbox</span>
          <span
            aria-label={`${total} unread items`}
            className={`px-2 py-0.5 rounded-full text-xs font-mono font-semibold tabular-nums transition-colors ${
              total > 0
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {displayCount}
          </span>
        </button>

        {open && (
          <div
            id={trayId}
            role="region"
            aria-label="Unread count breakdown"
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 z-20 w-64 p-3.5 rounded-xl bg-white border border-indigo-100 shadow-lg text-left"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
              <span>Queue Summary</span>
              <span className="font-mono tabular-nums text-indigo-600">{total} total</span>
            </div>

            <div className="mt-2.5 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Mentions</span>
                <span className="font-mono tabular-nums font-medium text-slate-900">{mentions}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Pull Reviews</span>
                <span className="font-mono tabular-nums font-medium text-slate-900">{reviews}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>System Alerts</span>
                <span className="font-mono tabular-nums font-medium text-slate-900">{alerts}</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setReviews((r) => r + 88)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <Plus className="w-3 h-3" aria-hidden="true" />
                <span>Spike 99+</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (total === 0) {
                    setMentions(4);
                    setReviews(8);
                    setAlerts(2);
                  } else {
                    setMentions(0);
                    setReviews(0);
                    setAlerts(0);
                  }
                }}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 focus-visible:outline-none focus-visible:underline"
              >
                {total === 0 ? 'Restore' : 'Mark Read'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Micro19: Notification Dot Indicator with Activity Tray · Professional
 */
const INITIAL_NOTIFICATIONS = [
  { id: 'n1', title: 'Release v2.4 deployed', time: '2m ago' },
  { id: 'n2', title: 'Maya approved Schema PR', time: '18m ago' },
  { id: 'n3', title: 'Weekly backup verified', time: '1h ago' },
];

export function Micro19() {
  const [open, setOpen] = useState(true);
  const [items, setItems] = useState(INITIAL_NOTIFICATIONS);
  const trayId = useId();
  const hasUnread = items.length > 0;

  return (
    <div className="pt-2 pb-56 flex items-start justify-center">
      <div className="relative inline-flex">
        <button
          type="button"
          aria-label={hasUnread ? `Notifications (${items.length} unread)` : 'Notifications (no unread)'}
          aria-expanded={open}
          aria-controls={trayId}
          onClick={() => setOpen((prev) => !prev)}
          className="relative inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 transition-colors"
        >
          <Bell className="w-4 h-4" aria-hidden="true" />
          {hasUnread && (
            <span
              aria-hidden="true"
              className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white"
            />
          )}
        </button>

        {open && (
          <div
            id={trayId}
            role="dialog"
            aria-label="Recent notifications"
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 z-20 w-72 p-3 rounded-xl bg-white border border-slate-200 shadow-lg text-left"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-900">Activity</span>
              <span className="text-xs text-slate-500 tabular-nums">
                {items.length} unread
              </span>
            </div>

            {items.length === 0 ? (
              <div className="py-5 text-center">
                <p className="text-xs text-slate-500">All caught up</p>
                <button
                  type="button"
                  onClick={() => setItems(INITIAL_NOTIFICATIONS)}
                  className="mt-2 text-xs font-medium text-slate-900 underline underline-offset-2"
                >
                  Restore sample events
                </button>
              </div>
            ) : (
              <div className="mt-2 space-y-1.5">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">{item.title}</p>
                      <p className="text-[11px] text-slate-400 tabular-nums mt-0.5">{item.time}</p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Dismiss ${item.title}`}
                      onClick={() => setItems((prev) => prev.filter((n) => n.id !== item.id))}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 shrink-0"
                    >
                      <X className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Micro20: Sync Status Dot & Live State Switcher · Minimal Dark
 */
type SyncState = 'synced' | 'syncing' | 'paused';

const SYNC_STATES: Record<
  SyncState,
  { label: string; dotClass: string; desc: string }
> = {
  synced: {
    label: 'Synced',
    dotClass: 'bg-emerald-400',
    desc: 'All replicas up to date',
  },
  syncing: {
    label: 'Syncing',
    dotClass: 'bg-amber-400',
    desc: 'Pushing 4 local deltas',
  },
  paused: {
    label: 'Paused',
    dotClass: 'bg-slate-400',
    desc: 'Offline queue active',
  },
};

export function Micro20() {
  const [open, setOpen] = useState(true);
  const [status, setStatus] = useState<SyncState>('synced');
  const menuId = useId();
  const current = SYNC_STATES[status];

  return (
    <div className="pt-2 pb-48 flex items-start justify-center">
      <div className="relative inline-flex">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-slate-100 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 transition-colors whitespace-nowrap"
        >
          <span
            aria-hidden="true"
            className={`w-2 h-2 rounded-full ${current.dotClass}`}
          />
          <span>{current.label}</span>
          <RefreshCw
            className={`w-3 h-3 text-slate-400 ${status === 'syncing' ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
        </button>

        {open && (
          <div
            id={menuId}
            role="menu"
            aria-label="Sync status switcher"
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 z-20 w-60 p-1.5 rounded-xl bg-slate-950 border border-slate-800 shadow-2xl text-left"
          >
            {(Object.keys(SYNC_STATES) as SyncState[]).map((key) => {
              const cfg = SYNC_STATES[key];
              const active = status === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => setStatus(key)}
                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                    active ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      aria-hidden="true"
                      className={`w-2 h-2 rounded-full shrink-0 ${cfg.dotClass}`}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium">{cfg.label}</p>
                      <p className="text-[11px] text-slate-400 truncate">{cfg.desc}</p>
                    </div>
                  </div>
                  {active && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
