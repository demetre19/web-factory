import { useState } from 'react';

export function Icfx9() {
  const [colored, setColored] = useState(false);

  return (
    <div className="w-full">
      <div
        className="relative h-64 w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-900"
        onMouseEnter={() => setColored(true)}
        onMouseLeave={() => setColored(false)}
      >
        <div
          className={`h-full w-full bg-gradient-to-br from-[#9F1239] via-[#D97706] to-[#0D9488] transition-[filter] duration-500 ease-out ${
            colored ? 'grayscale-0 contrast-100 saturate-110' : 'grayscale contrast-125 brightness-95'
          }`}
        >
          <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden="true">
            <circle cx="136" cy="112" r="68" fill="#FDE047" opacity="0.85" />
            <circle cx="258" cy="144" r="76" fill="#2DD4BF" opacity="0.72" />
            <path d="M0 218 C110 156 260 156 400 212 L400 260 L0 260 Z" fill="#881337" opacity="0.82" />
            <rect x="44" y="42" width="108" height="148" fill="none" stroke="#FFFBEB" strokeWidth="1.5" strokeOpacity="0.6" />
          </svg>
          <div className="pointer-events-none absolute top-4 left-4">
            <div className="font-mono text-[11px] tracking-wider text-white/90">
              {colored ? 'CHROMATIC SPECTRUM' : 'SILVER GELATIN'}
            </div>
            <div className="mt-0.5 font-serif text-2xl font-semibold text-white">
              Chroma Plate 09
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setColored((v) => !v)}
          aria-pressed={colored}
          className="absolute right-3 bottom-3 z-10 rounded-md bg-white/90 px-2.5 py-1 text-xs font-medium text-stone-900 shadow-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
        >
          {colored ? 'Desaturate' : 'Develop Color'}
        </button>
      </div>
    </div>
  );
}

export default Icfx9;
