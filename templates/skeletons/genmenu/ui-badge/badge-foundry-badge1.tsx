import { useState } from 'react';

export type StatusVariant = 'new' | 'beta' | 'pro' | 'sale' | 'hot';

interface Badge1Props {
  initialVariant?: StatusVariant;
}

const STATUS_STYLES: Record<
  StatusVariant,
  {
    label: string;
    bg: string;
    text: string;
    notch: string;
    featureTitle: string;
    featureNote: string;
  }
> = {
  new: {
    label: 'New',
    bg: 'bg-emerald-600 dark:bg-emerald-500',
    text: 'text-white dark:text-slate-950',
    notch: 'text-emerald-800 dark:text-emerald-950',
    featureTitle: 'Adaptive SVG Grid',
    featureNote: 'Snap-to-pixel geometry presets',
  },
  beta: {
    label: 'Beta',
    bg: 'bg-sky-600 dark:bg-sky-400',
    text: 'text-white dark:text-slate-950',
    notch: 'text-sky-800 dark:text-sky-900',
    featureTitle: 'Live Token Sync',
    featureNote: 'Real-time theme variable preview',
  },
  pro: {
    label: 'Pro',
    bg: 'bg-slate-900 dark:bg-amber-400',
    text: 'text-amber-300 dark:text-slate-950',
    notch: 'text-amber-400 dark:text-amber-700',
    featureTitle: 'Multi-Brand Export',
    featureNote: 'Automated light & dark CSS bundles',
  },
  sale: {
    label: 'Sale',
    bg: 'bg-rose-600 dark:bg-rose-500',
    text: 'text-white dark:text-white',
    notch: 'text-rose-800 dark:text-rose-900',
    featureTitle: 'Foundry Bundle',
    featureNote: 'Annual studio seat license',
  },
  hot: {
    label: 'Hot',
    bg: 'bg-amber-600 dark:bg-orange-500',
    text: 'text-white dark:text-slate-950',
    notch: 'text-amber-800 dark:text-orange-900',
    featureTitle: 'Motion Primitives',
    featureNote: 'GPU-composited micro-transitions',
  },
};

export function Badge1({ initialVariant = 'new' }: Badge1Props) {
  const [active, setActive] = useState<StatusVariant>(initialVariant);
  const current = STATUS_STYLES[active];
  const variants: StatusVariant[] = ['new', 'beta', 'pro', 'sale', 'hot'];

  return (
    <div className="w-full max-w-[270px] space-y-2.5">
      {/* Small inline text host element */}
      <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
            {current.featureTitle}
          </span>
          <span
            className={`relative inline-flex shrink-0 items-center gap-1 rounded-xs px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase ${current.bg} ${current.text}`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 8 8"
              className={`h-2 w-2 shrink-0 fill-current ${current.notch}`}
            >
              <path d="M0 0h8L0 8V0z" />
            </svg>
            <span>{current.label}</span>
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {current.featureNote}
        </p>
      </div>

      {/* All 5 status variants selectable inline */}
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Status badge variants">
        {variants.map((variant) => {
          const item = STATUS_STYLES[variant];
          const isSelected = active === variant;
          return (
            <button
              key={variant}
              type="button"
              onClick={() => setActive(variant)}
              aria-pressed={isSelected}
              className={`inline-flex items-center gap-1 rounded-xs px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                item.bg
              } ${item.text} ${isSelected ? 'ring-2 ring-slate-900 ring-offset-1 dark:ring-white dark:ring-offset-slate-900' : 'opacity-80 hover:opacity-100'}`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
