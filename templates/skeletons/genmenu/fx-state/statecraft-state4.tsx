import { ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface StateProps {
  replaySignal?: number;
}

export function State4({ replaySignal = 0 }: StateProps) {
  // Static initial showcase rests at 76% diagonal reveal so the wipe edge is immediately scannable
  const [wipePercent, setWipePercent] = useState(76);
  const timerRef = useRef<number | null>(null);

  const runSweep = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    setWipePercent(0);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setWipePercent(100);
      });
    });
    timerRef.current = window.setTimeout(() => {
      setWipePercent(76);
    }, 950);
  };

  useEffect(() => {
    if (replaySignal > 0) {
      runSweep();
    }
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [replaySignal]);

  const topEdge = Math.min(115, wipePercent + 10);
  const bottomEdge = Math.max(-15, wipePercent - 10);

  return (
    <div className="flex flex-col items-center gap-2.5 w-full max-w-[260px]">
      <div className="relative w-full h-28 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 select-none">
        {/* Base Layer: Draft Wireframe */}
        <div className="absolute inset-0 p-3 flex flex-col justify-between bg-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500">Draft View</span>
            <span className="w-8 h-2 rounded bg-slate-300" />
          </div>
          <div className="space-y-1.5">
            <div className="h-2.5 w-3/4 rounded bg-slate-300" />
            <div className="h-2 w-1/2 rounded bg-slate-200" />
          </div>
          <div className="h-5 w-20 rounded bg-slate-300" />
        </div>

        {/* Diagonal Wipe Layer: Published View */}
        <div
          className="absolute inset-0 p-3 flex flex-col justify-between bg-slate-900 text-white transition-[clip-path] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            clipPath: `polygon(0% 0%, ${topEdge}% 0%, ${bottomEdge}% 100%, 0% 100%)`,
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-blue-300">Published View</span>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight leading-tight">
              Release Ready
            </p>
            <p className="text-[11px] text-slate-300 mt-0.5 tabular-nums">
              Diagonal curtain · {wipePercent}%
            </p>
          </div>
          <div className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
            <span>Live</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={runSweep}
        className="px-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600 cursor-pointer whitespace-nowrap"
      >
        Sweep Diagonal Wipe
      </button>
    </div>
  );
}
