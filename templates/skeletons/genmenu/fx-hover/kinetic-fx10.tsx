import {useState} from 'react';

export function Fx10() {
  const [active, setActive] = useState(true);
  const [pings, setPings] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center gap-5 w-full py-2">
      <div className="relative inline-flex items-center justify-center">
        {active && (
          <>
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-lg border-2 border-[#2563EB] fx-pulse-ring pointer-events-none"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-lg border border-[#2563EB]/70 fx-pulse-ring-delayed pointer-events-none"
            />
          </>
        )}
        <button
          type="button"
          onClick={() => setPings((n) => n + 1)}
          className="relative z-10 px-6 py-3 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
        >
          Request Access ({pings})
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setActive((a) => !a)}
          className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {active ? 'Pause Pulse Ring' : 'Enable Pulse Ring'}
        </button>
      </div>
    </div>
  );
}
