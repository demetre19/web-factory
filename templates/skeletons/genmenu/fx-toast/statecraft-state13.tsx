import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StateProps {
  replaySignal?: number;
}

export function State13({ replaySignal = 0 }: StateProps) {
  const [count, setCount] = useState(9);
  const [popKey, setPopKey] = useState(0);

  useEffect(() => {
    if (replaySignal > 0) {
      setPopKey((k) => k + 1);
    }
  }, [replaySignal]);

  const handlePop = () => {
    setCount((c) => (c >= 12 ? 1 : c + 1));
    setPopKey((k) => k + 1);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handlePop}
        aria-label={`Notifications: ${count} unread, click to pop badge`}
        className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm text-slate-800 hover:border-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 cursor-pointer"
      >
        <Bell className="w-7 h-7" strokeWidth={1.75} />
        <span
          key={popKey}
          className="absolute -top-2 -right-2 min-w-[26px] h-[26px] px-1.5 rounded-full bg-rose-600 text-white text-xs font-mono font-bold tabular-nums flex items-center justify-center ring-4 ring-slate-50 animate-badge-pop"
        >
          {count > 9 ? '9+' : count}
        </span>
      </button>

      <div className="text-center">
        <p className="text-xs font-semibold text-slate-900">Spring Overshoot Badge</p>
        <p className="text-[11px] font-mono tabular-nums text-slate-500">
          0.2 → 1.26× → 1.0× settle
        </p>
      </div>
    </div>
  );
}
