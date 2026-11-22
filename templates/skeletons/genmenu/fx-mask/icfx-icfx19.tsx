import { useState } from 'react';

const SLATS = [0, 1, 2, 3, 4, 5];

export function Icfx19() {
  const [open, setOpen] = useState(true);

  return (
    <div className="w-full">
      <div
        className="relative h-64 w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-900"
        onMouseEnter={() => setOpen(true)}
      >
        {/* Underlying artwork */}
        <div className="relative h-full w-full bg-gradient-to-br from-[#7C2D12] via-[#C2410C] to-[#FBBF24]">
          <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden="true">
            <circle cx="200" cy="112" r="56" fill="#FEF3C7" opacity="0.92" />
            <path d="M0 198 L95 142 L185 186 L290 120 L400 184 L400 260 L0 260 Z" fill="#431407" opacity="0.9" />
          </svg>
          <div className="pointer-events-none absolute top-4 left-4 text-white">
            <div className="font-mono text-[11px] text-amber-100">LOUVER APERTURE</div>
            <div className="text-lg font-semibold">Solar Rotunda</div>
          </div>
        </div>

        {/* 6 staggered vertical shutter blinds */}
        <div className="pointer-events-none absolute inset-0 grid grid-cols-6">
          {SLATS.map((idx) => (
            <div
              key={idx}
              style={{ transitionDelay: `${idx * 45}ms` }}
              className={`h-full origin-left border-r border-stone-800/40 bg-[#1C1917] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                open ? 'scale-x-0' : 'scale-x-100'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-pressed={open}
          className="absolute right-3 bottom-3 z-10 rounded-md bg-white/90 px-2.5 py-1 text-xs font-medium text-stone-900 shadow-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
        >
          {open ? 'Close Shutters' : 'Open Shutters'}
        </button>
      </div>
    </div>
  );
}

export default Icfx19;
