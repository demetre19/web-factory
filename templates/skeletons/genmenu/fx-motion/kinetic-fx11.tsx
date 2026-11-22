import {useState} from 'react';

export function Fx11() {
  const [sweeping, setSweeping] = useState(false);

  const triggerSweep = () => {
    setSweeping(false);
    requestAnimationFrame(() => setSweeping(true));
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full py-2">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={triggerSweep}
          onAnimationEnd={() => setSweeping(false)}
          className={`group relative overflow-hidden px-5 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] ${
            sweeping ? 'fx-shine-active' : ''
          }`}
        >
          <span
            aria-hidden="true"
            className="fx-shine-bar pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent"
          />
          <span className="relative z-10">Deploy Build</span>
        </button>

        <button
          type="button"
          onClick={triggerSweep}
          className="group relative overflow-hidden px-5 py-2.5 rounded-lg bg-[#2563EB] text-white text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
        >
          <span
            aria-hidden="true"
            className="fx-shine-bar pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          />
          <span className="relative z-10">Export Tokens</span>
        </button>
      </div>

      <span className="text-xs text-zinc-500">
        Hover or click to trigger diagonal sheen
      </span>
    </div>
  );
}
