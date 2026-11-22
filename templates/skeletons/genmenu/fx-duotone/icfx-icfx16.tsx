import { useState } from 'react';

export function Icfx16() {
  const [active, setActive] = useState(true);

  return (
    <div className="w-full">
      <div
        className="relative h-64 w-full overflow-hidden rounded-xl bg-stone-200 p-[2px]"
        onMouseEnter={() => setActive(true)}
      >
        {/* Animated conic-gradient border clipped behind inner surface */}
        <div
          className="pointer-events-none absolute -inset-[50%]"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, transparent 220deg, #1D4ED8 280deg, #60A5FA 325deg, transparent 360deg)',
            animation: active ? 'icfx-border-rotate 3s linear infinite' : 'none',
            opacity: active ? 1 : 0.25,
          }}
        />

        {/* Inner clipped image container */}
        <div className="relative h-full w-full overflow-hidden rounded-[10px] bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#020617]">
          <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden="true">
            <rect x="44" y="44" width="312" height="172" fill="none" stroke="#60A5FA" strokeOpacity="0.28" />
            <circle cx="200" cy="130" r="62" fill="none" stroke="#93C5FD" strokeWidth="1.5" strokeOpacity="0.65" />
            <path d="M138 130 L200 68 L262 130 L200 192 Z" fill="#3B82F6" fillOpacity="0.18" stroke="#BFDBFE" strokeOpacity="0.4" />
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-white">
            <span className="font-mono text-[11px] tracking-widest text-blue-300">PERIMETER TRACE</span>
            <span className="mt-1 font-serif text-3xl font-semibold">B-16</span>
          </div>

          <button
            type="button"
            onClick={() => setActive((v) => !v)}
            aria-pressed={active}
            className="absolute right-3 bottom-3 z-10 rounded-md bg-white/90 px-2.5 py-1 text-xs font-medium text-stone-900 shadow-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
          >
            {active ? 'Pause Ring' : 'Trace Border'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Icfx16;
