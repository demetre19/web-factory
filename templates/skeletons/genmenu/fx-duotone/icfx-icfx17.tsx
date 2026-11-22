import { useId, useState } from 'react';

const INKS = [
  { name: 'Cobalt', shadow: '#0F172A', highlight: '#93C5FD' },
  { name: 'Cinnabar', shadow: '#450A0A', highlight: '#FDA4AF' },
  { name: 'Forest', shadow: '#052E16', highlight: '#86EFAC' },
  { name: 'Raw', shadow: '', highlight: '' },
] as const;

export function Icfx17() {
  const [inkIndex, setInkIndex] = useState(0);
  const filterId = useId().replace(/:/g, '');
  const activeInk = INKS[inkIndex];
  const isRaw = activeInk.name === 'Raw';

  return (
    <div className="w-full space-y-2.5">
      <div className="relative h-64 w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-900">
        {!isRaw && (
          <svg className="absolute h-0 w-0" aria-hidden="true">
            <defs>
              <filter id={filterId} colorInterpolationFilters="sRGB">
                <feColorMatrix
                  type="matrix"
                  values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0"
                />
              </filter>
            </defs>
          </svg>
        )}

        {/* Base tonal artwork */}
        <div
          className="relative h-full w-full bg-gradient-to-br from-[#F59E0B] via-[#DC2626] to-[#1E3A8A]"
          style={{ filter: !isRaw ? `url(#${filterId}) contrast(1.15)` : 'none' }}
        >
          <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden="true">
            <circle cx="148" cy="108" r="64" fill="#FEF3C7" />
            <path d="M0 196 Q120 118 230 174 T400 132 L400 260 L0 260 Z" fill="#1E293B" opacity="0.88" />
            <rect x="246" y="64" width="94" height="148" fill="#F8FAFC" opacity="0.72" />
          </svg>
        </div>

        {/* Duotone screen & multiply ink layers */}
        {!isRaw && (
          <>
            <div
              className="pointer-events-none absolute inset-0 mix-blend-multiply"
              style={{ backgroundColor: activeInk.highlight }}
            />
            <div
              className="pointer-events-none absolute inset-0 mix-blend-lighten"
              style={{ backgroundColor: activeInk.shadow }}
            />
          </>
        )}

        <div className="pointer-events-none absolute bottom-3 left-3">
          <div className="font-mono text-[11px] text-white/90">DUOTONE SCREEN</div>
          <div className="text-sm font-semibold text-white">{activeInk.name} Ink Grade</div>
        </div>
      </div>

      <div className="flex items-center gap-1.5" role="group" aria-label="Select duotone ink grade">
        {INKS.map((ink, idx) => (
          <button
            key={ink.name}
            type="button"
            onClick={() => setInkIndex(idx)}
            aria-pressed={inkIndex === idx}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] ${
              inkIndex === idx
                ? 'bg-[#1D4ED8] text-white'
                : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
            }`}
          >
            {ink.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Icfx17;
