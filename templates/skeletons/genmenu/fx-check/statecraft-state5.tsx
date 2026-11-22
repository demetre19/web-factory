import { Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { computeRingStrokeOffset } from '../../utils/statesCatalog';

interface StateProps {
  replaySignal?: number;
}

const RADIUS = 32;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function State5({ replaySignal = 0 }: StateProps) {
  const [progress, setProgress] = useState(100);
  const rafRef = useRef<number | null>(null);

  const startFill = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    setProgress(0);
    const duration = 680;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const ratio = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - ratio, 3);
      setProgress(Math.round(eased * 100));
      if (ratio < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (replaySignal > 0) {
      startFill();
    }
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [replaySignal]);

  const offset = computeRingStrokeOffset(CIRCUMFERENCE, progress);
  const isComplete = progress >= 100;

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={startFill}
        aria-label={`Progress ring at ${progress} percent, click to replay`}
        className="relative flex items-center justify-center w-20 h-20 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 cursor-pointer"
      >
        <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90" aria-hidden="true">
          <circle
            cx="40"
            cy="40"
            r={RADIUS}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="6"
          />
          <circle
            cx="40"
            cy="40"
            r={RADIUS}
            fill="none"
            stroke={isComplete ? '#059669' : '#2563EB'}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center">
          {isComplete ? (
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-600 text-white animate-badge-pop">
              <Check className="w-5 h-5" strokeWidth={2.75} />
            </span>
          ) : (
            <span className="text-xs font-mono font-semibold tabular-nums text-slate-900">
              {progress}%
            </span>
          )}
        </span>
      </button>

      <div>
        <p className="text-sm font-semibold text-slate-900">
          {isComplete ? 'Build Complete' : 'Compiling Bundle'}
        </p>
        <p className="text-xs font-mono tabular-nums text-slate-500 mt-0.5">
          {progress}% · {isComplete ? 'Ready to deploy' : 'Processing chunks'}
        </p>
      </div>
    </div>
  );
}
