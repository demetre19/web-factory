import { useEffect, useRef, useState } from 'react';

interface StateProps {
  replaySignal?: number;
}

export function State12({ replaySignal = 0 }: StateProps) {
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<number | null>(null);

  const runCrossfade = () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    setIsLoading(true);
    timerRef.current = window.setTimeout(() => {
      setIsLoading(false);
    }, 760);
  };

  useEffect(() => {
    if (replaySignal > 0) {
      runCrossfade();
    }
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [replaySignal]);

  return (
    <div className="w-full max-w-[260px] space-y-2.5">
      <div className="relative rounded-lg border border-slate-200 bg-white p-3 overflow-hidden min-h-[76px]">
        {/* Skeleton Layer */}
        <div
          aria-hidden={!isLoading}
          className={`flex items-center gap-3 transition-opacity duration-300 ${
            isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="relative w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shimmer" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="relative h-3 w-28 rounded bg-slate-200 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shimmer" />
            </div>
            <div className="relative h-2.5 w-20 rounded bg-slate-100 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>

        {/* Loaded Content Layer */}
        <div
          className={`absolute inset-0 p-3 flex items-center justify-between gap-2 transition-opacity duration-300 ${
            isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center justify-center shrink-0">
              EV
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">Elena Vance</p>
              <p className="text-[11px] text-slate-500 truncate">Principal Systems</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-mono font-semibold tabular-nums text-slate-900">
              $12,480
            </p>
            <p className="text-[11px] font-mono tabular-nums text-emerald-700">+14.2%</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={runCrossfade}
          className="px-3 py-1 rounded-md border border-slate-200 bg-white text-[11px] font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600 cursor-pointer whitespace-nowrap"
        >
          {isLoading ? 'Crossfading...' : 'Load Skeleton → Content'}
        </button>
      </div>
    </div>
  );
}
