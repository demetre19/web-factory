import { useState } from 'react';

export function Icfx7() {
  const [active, setActive] = useState(false);

  return (
    <div className="w-full">
      <div
        className="group relative h-64 w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-900"
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
      >
        <div
          className={`h-full w-full bg-gradient-to-br from-[#27272A] via-[#3F3F46] to-[#71717A] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            active ? 'scale-110' : 'scale-100'
          }`}
        >
          <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden="true">
            <rect x="64" y="42" width="128" height="176" fill="#18181B" stroke="#A1A1AA" strokeOpacity="0.4" />
            <rect x="208" y="68" width="128" height="150" fill="#09090B" stroke="#E4E4E7" strokeOpacity="0.3" />
            <circle cx="128" cy="112" r="28" fill="#F4F4F5" opacity="0.88" />
            <path d="M208 175 L272 110 L336 175 Z" fill="#E4E4E7" opacity="0.22" />
          </svg>
        </div>

        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent transition-opacity duration-300 ${
            active ? 'opacity-100' : 'opacity-65'
          }`}
        />

        <div
          className={`absolute inset-x-0 bottom-0 p-4 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            active ? 'translate-y-0' : 'translate-y-9'
          }`}
        >
          <div className="font-mono text-[11px] tracking-wider text-stone-300">
            ARCHIVE 07 · BRUTALIST MONOLITH
          </div>
          <h4 className="mt-0.5 text-base font-semibold text-white">
            Concrete Courtyard Study
          </h4>
          <p className="mt-1.5 text-xs leading-relaxed text-stone-200">
            Optical 1.10x zoom paired with a measured scrim and sliding archival caption.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActive((v) => !v)}
          aria-pressed={active}
          className="absolute top-3 right-3 z-10 rounded-md bg-white/90 px-2.5 py-1 text-xs font-medium text-stone-900 shadow-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
        >
          {active ? 'Reset' : 'Zoom'}
        </button>
      </div>
    </div>
  );
}

export default Icfx7;
