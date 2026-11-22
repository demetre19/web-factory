import {useEffect, useState} from 'react';
import {RotateCcw} from 'lucide-react';

export interface Fx17Props {
  replayTrigger?: number;
}

const STAGGER_ROWS = [
  {step: '01', label: 'Parse layout geometry', timing: '0 ms'},
  {step: '02', label: 'Promote compositor layer', timing: '80 ms'},
  {step: '03', label: 'Settle cubic-bezier curve', timing: '160 ms'},
  {step: '04', label: 'Commit final frame', timing: '240 ms'},
];

export function Fx17({replayTrigger = 0}: Fx17Props) {
  const [sequenceKey, setSequenceKey] = useState(0);

  useEffect(() => {
    if (replayTrigger > 0) {
      setSequenceKey((k) => k + 1);
    }
  }, [replayTrigger]);

  return (
    <div className="flex flex-col gap-3.5 w-full">
      <ul key={sequenceKey} className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {STAGGER_ROWS.map((row, idx) => (
          <li
            key={row.step}
            style={{animationDelay: `${idx * 80}ms`}}
            className="fx-stagger-item flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50"
          >
            <span className="text-xs font-medium text-zinc-800 truncate">
              {row.step}. {row.label}
            </span>
            <span className="font-mono text-[11px] tabular-nums text-zinc-500 shrink-0">
              +{row.timing}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">
          80ms incremental delay per child
        </span>
        <button
          type="button"
          onClick={() => setSequenceKey((k) => k + 1)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Replay Stagger
        </button>
      </div>
    </div>
  );
}
