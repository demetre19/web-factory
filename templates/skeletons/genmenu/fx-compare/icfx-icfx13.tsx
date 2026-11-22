import { useState } from 'react';

export function Icfx13() {
  const [split, setSplit] = useState(52);

  return (
    <div className="w-full space-y-2.5">
      <div className="relative h-64 w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-900 select-none">
        {/* AFTER layer: Full rendered chromatic massing */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F766E] via-[#0E7490] to-[#1D4ED8]">
          <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden="true">
            <rect x="64" y="72" width="136" height="148" fill="#F8FAFC" opacity="0.92" />
            <rect x="200" y="106" width="136" height="114" fill="#CBD5E1" opacity="0.88" />
            <circle cx="305" cy="56" r="24" fill="#FDE047" />
            <path d="M0 220 L400 220 L400 260 L0 260 Z" fill="#0F172A" opacity="0.82" />
          </svg>
          <span className="absolute top-3 right-3 font-mono text-[11px] font-medium text-white/90">
            RENDERED
          </span>
        </div>

        {/* BEFORE layer: Wireframe CAD elevation clipped to slider % */}
        <div
          className="absolute inset-0 bg-[#18181B]"
          style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
        >
          <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden="true">
            <defs>
              <pattern id="icfx13-cad" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#27272A" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="400" height="260" fill="url(#icfx13-cad)" />
            <rect x="64" y="72" width="136" height="148" fill="none" stroke="#38BDF8" strokeWidth="1.5" />
            <rect x="200" y="106" width="136" height="114" fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4 3" />
            <circle cx="305" cy="56" r="24" fill="none" stroke="#FDE047" strokeDasharray="3 3" />
            <line x1="0" y1="220" x2="400" y2="220" stroke="#71717A" strokeWidth="1.5" />
          </svg>
          <span className="absolute top-3 left-3 font-mono text-[11px] font-medium text-sky-300">
            WIREFRAME
          </span>
        </div>

        {/* Vertical divider handle */}
        <div
          className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-white shadow-md"
          style={{ left: `${split}%` }}
        >
          <div className="absolute top-1/2 left-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-stone-300 bg-white text-xs font-semibold text-stone-900 shadow">
            ↔
          </div>
        </div>

        {/* Full-frame accessible range slider overlay */}
        <input
          type="range"
          min={4}
          max={96}
          value={split}
          aria-label="Before and after comparison position"
          onChange={(e) => setSplit(Number(e.target.value))}
          className="absolute inset-0 z-20 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>

      <div className="flex items-center justify-between text-xs text-stone-600">
        <span>Drag across plate or use arrow keys</span>
        <span className="font-mono tabular-nums text-stone-900">{split}% / {100 - split}%</span>
      </div>
    </div>
  );
}

export default Icfx13;
