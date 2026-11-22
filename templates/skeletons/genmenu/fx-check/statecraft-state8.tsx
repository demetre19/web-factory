import { Check, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface StateProps {
  replaySignal?: number;
}

type MorphPhase = 'loading' | 'success';

export function State8({ replaySignal = 0 }: StateProps) {
  const [phase, setPhase] = useState<MorphPhase>('success');
  const timerRef = useRef<number | null>(null);

  const runMorph = () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    setPhase('loading');
    timerRef.current = window.setTimeout(() => {
      setPhase('success');
    }, 680);
  };

  useEffect(() => {
    if (replaySignal > 0) {
      runMorph();
    }
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [replaySignal]);

  const isSuccess = phase === 'success';

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={runMorph}
        aria-label={isSuccess ? 'Connection verified, click to replay morph' : 'Connecting'}
        className={`inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-full border text-xs font-semibold transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 cursor-pointer whitespace-nowrap ${
          isSuccess
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900 min-w-[164px]'
            : 'bg-slate-900 border-slate-900 text-white min-w-[138px]'
        }`}
      >
        <span
          className={`inline-flex items-center justify-center w-5 h-5 rounded-full transition-transform duration-300 ${
            isSuccess ? 'bg-emerald-600 text-white scale-100' : 'bg-transparent text-blue-300'
          }`}
        >
          {isSuccess ? (
            <Check className="w-3.5 h-3.5 animate-badge-pop" strokeWidth={2.75} />
          ) : (
            <Loader2 className="w-4 h-4 animate-spin" />
          )}
        </span>
        <span>{isSuccess ? 'Session Verified' : 'Authenticating'}</span>
      </button>

      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
        <span>{isSuccess ? 'Spinner morphed' : 'Spinning arc'}</span>
        <span aria-hidden="true">·</span>
        <span>360ms ease</span>
      </div>
    </div>
  );
}
