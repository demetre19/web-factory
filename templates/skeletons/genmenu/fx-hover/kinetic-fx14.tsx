import {useState} from 'react';

export function Fx14() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="grid grid-cols-[52px_1fr] gap-3.5 items-center p-3.5 rounded-lg border border-zinc-200 bg-zinc-50">
        {loaded ? (
          <>
            <div className="w-[52px] h-[52px] rounded-lg bg-[#2563EB] flex items-center justify-center text-white font-semibold text-sm">
              KM
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-sm font-semibold text-zinc-900 truncate">
                Kinetic Motion Spec
              </span>
              <span className="text-xs text-zinc-500 truncate">
                24 tokens synced · 60 fps verified
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="relative overflow-hidden w-[52px] h-[52px] rounded-lg bg-zinc-200 fx-skeleton-shimmer" />
            <div className="flex flex-col gap-2">
              <div className="relative overflow-hidden h-3.5 w-3/4 rounded bg-zinc-200 fx-skeleton-shimmer" />
              <div className="relative overflow-hidden h-3 w-1/2 rounded bg-zinc-200 fx-skeleton-shimmer" />
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-zinc-500">
          {loaded ? 'Hydrated content view' : 'CSS gradient shimmer active'}
        </span>
        <button
          type="button"
          onClick={() => setLoaded((v) => !v)}
          className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {loaded ? 'Show Shimmer' : 'Simulate Loaded'}
        </button>
      </div>
    </div>
  );
}
