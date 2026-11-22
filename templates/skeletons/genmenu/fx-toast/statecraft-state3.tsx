import { CheckCircle2, Plus, X } from 'lucide-react';
import { useEffect, useState, type CSSProperties } from 'react';

interface StateProps {
  replaySignal?: number;
}

interface ToastItem {
  id: number;
  title: string;
  detail: string;
}

const INITIAL_TOASTS: ToastItem[] = [
  { id: 1, title: '24 assets synced', detail: 'CDN edge · Just now' },
  { id: 2, title: 'Webhook verified', detail: 'prod-eu-west · 12s ago' },
  { id: 3, title: 'Team invite accepted', detail: 'M. Lin joined · 1m ago' },
];

export function State3({ replaySignal = 0 }: StateProps) {
  const [toasts, setToasts] = useState<ToastItem[]>(INITIAL_TOASTS);
  const [animKey, setAnimKey] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (replaySignal > 0) {
      setToasts(INITIAL_TOASTS);
      setHasAnimated(true);
      setAnimKey((k) => k + 1);
    }
  }, [replaySignal]);

  const dismissTop = () => {
    setToasts((prev) => {
      const remaining = prev.slice(1);
      return remaining.length > 0 ? remaining : INITIAL_TOASTS;
    });
  };

  const pushToast = () => {
    setHasAnimated(true);
    setAnimKey((k) => k + 1);
    setToasts((prev) => {
      const nextId = (prev[0]?.id ?? 0) + 1;
      return [
        { id: nextId, title: `Snapshot #${nextId} saved`, detail: 'Workspace · Just now' },
        ...prev.slice(0, 2),
      ];
    });
  };

  return (
    <div className="flex flex-col items-center justify-between w-full max-w-[260px] gap-3">
      <div className="relative w-full h-28 mt-4" aria-live="polite">
        {toasts.slice(0, 3).map((toast, idx) => {
          const stackY = -idx * 16;
          const stackScale = 1 - idx * 0.04;
          const zIndex = 30 - idx * 10;
          const opacity = idx === 0 ? 1 : idx === 1 ? 0.94 : 0.84;

          const style: CSSProperties & Record<`--${string}`, string | number> = {
            zIndex,
            opacity,
            '--stack-y': `${stackY}px`,
            '--stack-scale': stackScale,
            transform: `translateY(${stackY}px) scale(${stackScale})`,
            animationDelay: hasAnimated ? `${idx * 65}ms` : undefined,
          };

          return (
            <div
              key={`${animKey}-${toast.id}`}
              style={style}
              className={`absolute inset-x-0 bottom-0 flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg bg-white border border-slate-200 shadow-sm transition-all duration-200 ${
                hasAnimated ? 'animate-toast-enter' : ''
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">{toast.title}</p>
                  <p className="text-[11px] font-mono tabular-nums text-slate-500 truncate">
                    {toast.detail}
                  </p>
                </div>
              </div>
              {idx === 0 && (
                <button
                  type="button"
                  onClick={dismissTop}
                  aria-label={`Dismiss ${toast.title}`}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600 cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={pushToast}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600 cursor-pointer whitespace-nowrap"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Push Toast</span>
      </button>
    </div>
  );
}
