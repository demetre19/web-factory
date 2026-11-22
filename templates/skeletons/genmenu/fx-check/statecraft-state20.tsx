import { CheckCircle2, FileJson } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface StateProps {
  replaySignal?: number;
}

export function State20({ replaySignal = 0 }: StateProps) {
  const [progress, setProgress] = useState(100);
  const rafRef = useRef<number | null>(null);

  const startUpload = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    setProgress(0);
    const duration = 560;
    const start = performance.now();

    const tick = (now: number) => {
      const ratio = Math.min(1, (now - start) / duration);
      setProgress(Math.round(ratio * 100));
      if (ratio < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (replaySignal > 0) {
      startUpload();
    }
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [replaySignal]);

  const verified = progress >= 100;

  return (
    <button
      type="button"
      onClick={startUpload}
      aria-label="Replay verified file upload state"
      className={`w-full max-w-[268px] text-left rounded-lg border-2 border-dashed p-3 transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 cursor-pointer ${
        verified
          ? 'border-emerald-400 bg-emerald-50/70'
          : 'border-blue-400 bg-blue-50/50'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
              verified ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
            }`}
          >
            <FileJson className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">
              brand-tokens.json
            </p>
            <p className="text-[11px] font-mono tabular-nums text-slate-600 whitespace-nowrap">
              184 KB · {verified ? 'Verified' : `Uploading ${progress}%`}
            </p>
          </div>
        </div>

        {verified && (
          <CheckCircle2
            className="w-4 h-4 text-emerald-600 shrink-0 animate-badge-pop"
            strokeWidth={2.5}
          />
        )}
      </div>

      <div className="mt-2.5 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
        <div
          className={`h-full transition-colors ${
            verified ? 'bg-emerald-600' : 'bg-blue-600'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </button>
  );
}
