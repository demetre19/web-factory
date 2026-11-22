import { useState } from 'react';

export type AvailabilityState = 'available' | 'busy' | 'offline';

interface Badge12Props {
  initialState?: AvailabilityState;
}

const STATE_CONFIG: Record<
  AvailabilityState,
  {
    label: string;
    dotColor: string;
    ringColor: string;
    textColor: string;
    pulse: boolean;
  }
> = {
  available: {
    label: 'Available now',
    dotColor: 'fill-emerald-500 dark:fill-emerald-400',
    ringColor: 'stroke-emerald-500/60 dark:stroke-emerald-400/60',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    pulse: true,
  },
  busy: {
    label: 'In session',
    dotColor: 'fill-amber-500 dark:fill-amber-400',
    ringColor: 'stroke-amber-500/60 dark:stroke-amber-400/60',
    textColor: 'text-amber-700 dark:text-amber-300',
    pulse: true,
  },
  offline: {
    label: 'Away',
    dotColor: 'fill-slate-400 dark:fill-slate-500',
    ringColor: 'stroke-slate-300 dark:stroke-slate-600',
    textColor: 'text-slate-600 dark:text-slate-400',
    pulse: false,
  },
};

export function Badge12({ initialState = 'available' }: Badge12Props) {
  const [status, setStatus] = useState<AvailabilityState>(initialState);
  const cfg = STATE_CONFIG[status];
  const order: AvailabilityState[] = ['available', 'busy', 'offline'];

  const cycleStatus = () => {
    const idx = order.indexOf(status);
    setStatus(order[(idx + 1) % order.length]);
  };

  return (
    <div className="flex w-full max-w-[260px] flex-col gap-2.5">
      {/* Small profile inline host */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            MC
            {/* Avatar corner availability dot */}
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 rounded-full bg-white dark:bg-slate-900"
            >
              <circle cx="8" cy="8" r="5" className={cfg.dotColor} />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
              Dr. Mira Chen
            </p>
            <div className="mt-0.5 flex items-center gap-1.5">
              {/* Pulsing SVG ring + center dot paired with explicit text */}
              <span className="relative inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                {cfg.pulse && (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    className="motion-safe-pulse absolute inset-0 h-full w-full animate-ping"
                  >
                    <circle
                      cx="10"
                      cy="10"
                      r="7"
                      fill="none"
                      strokeWidth="2"
                      className={cfg.ringColor}
                    />
                  </svg>
                )}
                <svg aria-hidden="true" viewBox="0 0 12 12" className="relative h-2.5 w-2.5">
                  <circle cx="6" cy="6" r="4.5" className={cfg.dotColor} />
                </svg>
              </span>
              <span className={`text-xs font-medium ${cfg.textColor}`}>{cfg.label}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={cycleStatus}
          className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Switch
        </button>
      </div>
    </div>
  );
}
