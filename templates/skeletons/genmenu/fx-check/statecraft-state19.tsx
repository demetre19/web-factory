import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StateProps {
  replaySignal?: number;
}

const COMMAND = 'npx statecraft init';

export function State19({ replaySignal = 0 }: StateProps) {
  const [copied, setCopied] = useState(true);
  const [rippleKey, setRippleKey] = useState(0);
  const [hasRippled, setHasRippled] = useState(false);

  const triggerCopy = () => {
    setCopied(true);
    setHasRippled(true);
    setRippleKey((k) => k + 1);
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(COMMAND).catch(() => {});
    }
  };

  useEffect(() => {
    if (replaySignal > 0) {
      triggerCopy();
    }
  }, [replaySignal]);

  return (
    <div className="w-full max-w-[270px] flex items-center justify-between gap-2 pl-3 pr-2 py-2 rounded-lg border border-slate-200 bg-white">
      <code className="text-xs font-mono text-slate-700 truncate">{COMMAND}</code>

      <div key={rippleKey} className="relative inline-flex items-center justify-center shrink-0">
        {copied && (
          <>
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute -inset-2 rounded-lg border border-emerald-400/70 ${
                hasRippled ? 'animate-pulse-ring' : 'opacity-45 scale-105'
              }`}
            />
            <span
              aria-hidden="true"
              style={{ animationDelay: hasRippled ? '90ms' : undefined }}
              className={`pointer-events-none absolute -inset-3.5 rounded-xl border border-emerald-300/60 ${
                hasRippled ? 'animate-pulse-ring' : 'opacity-25 scale-105'
              }`}
            />
          </>
        )}

        <button
          type="button"
          onClick={triggerCopy}
          aria-label="Copy command to clipboard"
          className={`relative z-10 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 cursor-pointer whitespace-nowrap ${
            copied
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
