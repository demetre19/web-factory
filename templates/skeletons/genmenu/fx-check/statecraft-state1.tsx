import { useEffect, useState } from 'react';

interface StateProps {
  replaySignal?: number;
}

export function State1({ replaySignal = 0 }: StateProps) {
  const [animKey, setAnimKey] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (replaySignal > 0) {
      setIsPlaying(true);
      setAnimKey((k) => k + 1);
    }
  }, [replaySignal]);

  const handleTrigger = () => {
    setIsPlaying(true);
    setAnimKey((k) => k + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 w-full">
      <button
        type="button"
        onClick={handleTrigger}
        aria-label="Replay checkmark draw animation"
        className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 transition-transform active:scale-95 cursor-pointer"
      >
        <svg
          key={animKey}
          viewBox="0 0 64 64"
          className="w-14 h-14 overflow-visible"
          aria-hidden="true"
        >
          <circle
            cx="32"
            cy="32"
            r="26"
            fill="none"
            stroke="#059669"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="164"
            strokeDashoffset={isPlaying ? 164 : 0}
            className={isPlaying ? 'animate-circle-draw' : ''}
            transform="rotate(-90 32 32)"
          />
          <path
            d="M20 33.5 L28 41.5 L44.5 23.5"
            fill="none"
            stroke="#059669"
            strokeWidth="3.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="48"
            strokeDashoffset={isPlaying ? 48 : 0}
            className={isPlaying ? 'animate-check-draw' : ''}
          />
        </svg>
      </button>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-900">Payment confirmed</p>
        <p className="text-xs font-mono tabular-nums text-slate-500 mt-0.5">
          Receipt #4812 · Settled
        </p>
      </div>
    </div>
  );
}
