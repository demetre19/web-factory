import { ArrowDown, Check, FileArchive } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { computeRingStrokeOffset } from '../../utils/statesCatalog';

interface StateProps {
  replaySignal?: number;
}

const RING_RADIUS = 16;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function State15({ replaySignal = 0 }: StateProps) {
  const [percent, setPercent] = useState(100);
  const rafRef = useRef<number | null>(null);

  const startDownload = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    setPercent(0);
    const duration = 640;
    const start = performance.now();

    const tick = (now: number) => {
      const ratio = Math.min(1, (now - start) / duration);
      setPercent(Math.round(ratio * 100));
      if (ratio < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (replaySignal > 0) {
      startDownload();
    }
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [replaySignal]);

  const offset = computeRingStrokeOffset(RING_CIRCUMFERENCE, percent);
  const done = percent >= 100;
  const loadedMb = ((percent / 100) * 4.2).toFixed(1);

  return (
    <div className="w-full max-w-[264px] flex items-center justify-between gap-3 px-3.5 py-3 rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
          <FileArchive className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-900 truncate">
            design-tokens.zip
          </p>
          <p className="text-[11px] font-mono tabular-nums text-slate-500">
            {loadedMb} / 4.2 MB · {done ? 'Saved' : `${percent}%`}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={startDownload}
        aria-label={done ? 'Download complete, click to re-download' : `Downloading ${percent}%`}
        className="relative flex items-center justify-center w-10 h-10 rounded-full focus-visible:outline-2 focus-visible:outline-blue-600 cursor-pointer shrink-0"
      >
        <svg viewBox="0 0 40 40" className="w-10 h-10 -rotate-90" aria-hidden="true">
          <circle
            cx="20"
            cy="20"
            r={RING_RADIUS}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="3"
          />
          <circle
            cx="20"
            cy="20"
            r={RING_RADIUS}
            fill="none"
            stroke={done ? '#059669' : '#2563EB'}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center">
          {done ? (
            <Check className="w-4 h-4 text-emerald-600 animate-badge-pop" strokeWidth={2.5} />
          ) : (
            <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
          )}
        </span>
      </button>
    </div>
  );
}
