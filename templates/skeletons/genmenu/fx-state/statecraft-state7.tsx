import { AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StateProps {
  replaySignal?: number;
}

export function State7({ replaySignal = 0 }: StateProps) {
  const [shakeKey, setShakeKey] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (replaySignal > 0) {
      setIsShaking(true);
      setShakeKey((k) => k + 1);
    }
  }, [replaySignal]);

  const triggerError = () => {
    setIsShaking(true);
    setShakeKey((k) => k + 1);
  };

  return (
    <div className="w-full max-w-[276px] space-y-2">
      <div className="flex items-center gap-1.5">
        <span aria-hidden="true" className="font-mono text-xs text-red-400 select-none">
          «
        </span>
        <div
          key={shakeKey}
          role="alert"
          className={`flex-1 min-w-0 flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-red-500 bg-red-50 text-red-900 ${
            isShaking ? 'animate-error-shake' : ''
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-mono text-xs font-medium tabular-nums truncate">
              390-182
            </span>
          </div>
          <button
            type="button"
            onClick={triggerError}
            className="px-2.5 py-1 rounded bg-red-600 text-white text-[11px] font-semibold hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-blue-600 cursor-pointer whitespace-nowrap shrink-0"
          >
            Verify
          </button>
        </div>
        <span aria-hidden="true" className="font-mono text-xs text-red-400 select-none">
          »
        </span>
      </div>
      <p className="text-xs font-medium text-red-700 text-center">
        Invalid code — 2 attempts remaining
      </p>
    </div>
  );
}
