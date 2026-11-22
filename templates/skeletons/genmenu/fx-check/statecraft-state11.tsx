import { Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface StateProps {
  replaySignal?: number;
}

const STEPS = ['Details', 'Billing', 'Review', 'Done'];

export function State11({ replaySignal = 0 }: StateProps) {
  const [completedCount, setCompletedCount] = useState(4);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };

  const runCascade = () => {
    clearTimers();
    setCompletedCount(0);
    STEPS.forEach((_, idx) => {
      const id = window.setTimeout(() => {
        setCompletedCount(idx + 1);
      }, (idx + 1) * 160);
      timersRef.current.push(id);
    });
  };

  useEffect(() => {
    if (replaySignal > 0) {
      runCascade();
    }
    return clearTimers;
  }, [replaySignal]);

  const progressWidth =
    completedCount <= 1 ? '0%' : `${Math.min(100, ((completedCount - 1) / (STEPS.length - 1)) * 100)}%`;

  return (
    <div className="w-full max-w-[270px] space-y-3">
      <div className="relative flex items-center justify-between">
        {/* Background track */}
        <div
          aria-hidden="true"
          className="absolute left-3.5 right-3.5 top-3.5 h-0.5 bg-slate-200"
        />
        {/* Active completed track */}
        <div
          aria-hidden="true"
          className="absolute left-3.5 top-3.5 h-0.5 bg-emerald-600 transition-all duration-300 ease-out"
          style={{ width: `calc(${progressWidth} - 0px)`, maxWidth: 'calc(100% - 28px)' }}
        />

        {STEPS.map((label, idx) => {
          const isDone = idx < completedCount;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setCompletedCount(idx + 1)}
              aria-label={`Step ${idx + 1}: ${label}${isDone ? ' completed' : ''}`}
              className="relative z-10 flex flex-col items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-blue-600 rounded cursor-pointer"
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-semibold border transition-all duration-200 ${
                  isDone
                    ? 'bg-emerald-600 border-emerald-600 text-white animate-badge-pop'
                    : 'bg-white border-slate-300 text-slate-500'
                }`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5" strokeWidth={2.75} />
                ) : (
                  idx + 1
                )}
              </span>
              <span
                className={`text-[11px] font-medium whitespace-nowrap ${
                  isDone ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-500 pt-1 border-t border-slate-200/80">
        <span>{completedCount} of 4 complete</span>
        <button
          type="button"
          onClick={runCascade}
          className="font-sans font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
        >
          Cascade
        </button>
      </div>
    </div>
  );
}
