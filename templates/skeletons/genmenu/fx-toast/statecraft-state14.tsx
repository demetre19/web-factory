import { Archive, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { clampCountdownRatio } from '../../utils/statesCatalog';

interface StateProps {
  replaySignal?: number;
}

const TOTAL_MS = 3200;

export function State14({ replaySignal = 0 }: StateProps) {
  // Initial static ratio rests visibly at 64% remaining so the countdown bar is scannable immediately
  const [ratio, setRatio] = useState(0.64);
  const [undone, setUndone] = useState(false);
  const rafRef = useRef<number | null>(null);
  const resetTimerRef = useRef<number | null>(null);

  const stopAnim = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current);
  };

  const startCountdown = () => {
    stopAnim();
    setUndone(false);
    setRatio(1);
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const nextRatio = clampCountdownRatio(TOTAL_MS - elapsed, TOTAL_MS);
      setRatio(nextRatio);
      if (elapsed < TOTAL_MS) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        resetTimerRef.current = window.setTimeout(() => {
          setRatio(0.64);
        }, 500);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (replaySignal > 0) {
      startCountdown();
    }
    return stopAnim;
  }, [replaySignal]);

  const handleUndo = () => {
    stopAnim();
    setUndone(true);
    resetTimerRef.current = window.setTimeout(() => {
      setUndone(false);
      setRatio(0.64);
    }, 1800);
  };

  const secondsLeft = Math.max(1, Math.ceil(ratio * 5));

  return (
    <div className="w-full max-w-[270px]">
      {undone ? (
        <div className="flex items-center justify-between gap-2 px-3.5 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="text-xs font-semibold">Restored 3 drafts</span>
          </div>
          <button
            type="button"
            onClick={startCountdown}
            className="text-[11px] font-medium text-emerald-800 underline cursor-pointer"
          >
            Archive
          </button>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-lg bg-slate-900 text-white shadow-sm">
          <div className="flex items-center justify-between gap-2 px-3.5 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <Archive className="w-4 h-4 text-slate-300 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">Archived 3 drafts</p>
                <p className="text-[11px] font-mono tabular-nums text-slate-400">
                  Dismissing in {secondsLeft}s
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleUndo}
              className="px-2.5 py-1 rounded bg-white text-slate-900 text-xs font-semibold hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-400 cursor-pointer whitespace-nowrap shrink-0"
            >
              Undo
            </button>
          </div>
          {/* Countdown Progress Bar */}
          <div className="h-1 w-full bg-slate-800">
            <div
              className="h-full bg-blue-500 origin-left"
              style={{ width: `${Math.round(ratio * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
