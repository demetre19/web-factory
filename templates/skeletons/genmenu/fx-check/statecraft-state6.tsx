import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StateProps {
  replaySignal?: number;
}

export function State6({ replaySignal = 0 }: StateProps) {
  const [pulseKey, setPulseKey] = useState(0);
  const [hasPulsed, setHasPulsed] = useState(false);

  useEffect(() => {
    if (replaySignal > 0) {
      setHasPulsed(true);
      setPulseKey((k) => k + 1);
    }
  }, [replaySignal]);

  const handleClick = () => {
    setHasPulsed(true);
    setPulseKey((k) => k + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div key={pulseKey} className="relative inline-flex items-center justify-center">
        {/* Outer visible pulse ring */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute -inset-3 rounded-xl border-2 border-emerald-400/60 ${
            hasPulsed ? 'animate-pulse-ring' : 'opacity-30 scale-105'
          }`}
        />
        {/* Inner visible pulse ring */}
        <span
          aria-hidden="true"
          style={{ animationDelay: hasPulsed ? '90ms' : undefined }}
          className={`pointer-events-none absolute -inset-1.5 rounded-xl border border-emerald-500/75 ${
            hasPulsed ? 'animate-pulse-ring' : 'opacity-55'
          }`}
        />

        <button
          type="button"
          onClick={handleClick}
          className="relative z-10 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold shadow-sm hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-transform active:scale-95 whitespace-nowrap cursor-pointer"
        >
          <Check className="w-4 h-4" strokeWidth={2.5} />
          <span>Changes Saved</span>
        </button>
      </div>
      <p className="text-xs font-mono text-slate-500">Click button to emit pulse</p>
    </div>
  );
}
