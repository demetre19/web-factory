import {useEffect, useState} from 'react';
import {RotateCcw} from 'lucide-react';

export interface Fx16Props {
  replayTrigger?: number;
}

export function Fx16({replayTrigger = 0}: Fx16Props) {
  const [drawKey, setDrawKey] = useState(0);
  const [verified, setVerified] = useState(true);

  useEffect(() => {
    if (replayTrigger > 0) {
      setVerified(true);
      setDrawKey((k) => k + 1);
    }
  }, [replayTrigger]);

  return (
    <div className="flex items-center justify-between gap-4 w-full px-4 py-3.5 rounded-lg border border-zinc-200 bg-zinc-50">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 flex items-center justify-center shrink-0">
          {verified ? (
            <svg
              key={drawKey}
              viewBox="0 0 56 56"
              className="w-11 h-11"
              aria-label="Verified checkmark animation"
              role="img"
            >
              <circle
                cx="28"
                cy="28"
                r="25"
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                className="fx-check-circle"
              />
              <path
                d="M17.5 29l7 7 14-15"
                fill="none"
                stroke="#09090B"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="fx-check-mark"
              />
            </svg>
          ) : (
            <div className="w-10 h-10 rounded-full border-2 border-dashed border-zinc-300" />
          )}
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-semibold text-zinc-900">
            {verified ? 'Stroke Verified' : 'Pending Check'}
          </span>
          <span className="text-xs text-zinc-500">
            SVG dashoffset path draw
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => {
            setVerified(true);
            setDrawKey((k) => k + 1);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Redraw
        </button>
      </div>
    </div>
  );
}
