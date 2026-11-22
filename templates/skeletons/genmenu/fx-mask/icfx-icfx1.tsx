import { useState } from 'react';

export function Icfx1() {
  const [pinnedOpen, setPinnedOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const expanded = pinnedOpen || hovered;

  return (
    <div className="w-full">
      <div
        className="group relative h-64 w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-900 select-none"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Underlay technical wireframe */}
        <div className="absolute inset-0 flex items-center justify-center bg-[#141517]">
          <svg
            viewBox="0 0 400 260"
            className="h-full w-full opacity-40"
            aria-hidden="true"
          >
            <defs>
              <pattern id="icfx1-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#3F3F46" strokeWidth="0.75" />
              </pattern>
            </defs>
            <rect width="400" height="260" fill="url(#icfx1-grid)" />
            <circle cx="200" cy="130" r="70" fill="none" stroke="#52525B" strokeDasharray="4 4" />
            <line x1="0" y1="130" x2="400" y2="130" stroke="#3F3F46" strokeWidth="0.75" />
            <line x1="200" y1="0" x2="200" y2="260" stroke="#3F3F46" strokeWidth="0.75" />
          </svg>
          <span className="absolute bottom-3 left-3 font-mono text-[11px] tracking-widest text-stone-400">
            IRIS APERTURE · {expanded ? '78%' : '26%'}
          </span>
        </div>

        {/* Clipped primary artwork */}
        <div
          className="absolute inset-0 transition-[clip-path] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            clipPath: expanded
              ? 'circle(78% at 50% 50%)'
              : 'circle(26% at 50% 50%)',
          }}
        >
          <div className="relative h-full w-full bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#D97706]">
            <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden="true">
              <defs>
                <radialGradient id="icfx1-sun" cx="50%" cy="44%" r="48%">
                  <stop offset="0%" stopColor="#FEF3C7" />
                  <stop offset="45%" stopColor="#F59E0B" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="400" height="260" fill="url(#icfx1-sun)" />
              <circle cx="200" cy="115" r="54" fill="#FFFBEB" opacity="0.92" />
              <path d="M0 190 Q120 142 220 178 T400 154 L400 260 L0 260 Z" fill="#0F172A" opacity="0.88" />
              <path d="M0 212 Q160 174 280 206 T400 194 L400 260 L0 260 Z" fill="#020617" />
              <rect x="44" y="34" width="44" height="44" rx="22" fill="none" stroke="#FDE68A" strokeOpacity="0.45" />
            </svg>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="font-serif text-4xl font-semibold tracking-tight text-slate-950/80">
                Ø1
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setPinnedOpen((v) => !v)}
          aria-pressed={pinnedOpen}
          className="absolute right-3 bottom-3 z-10 rounded-md bg-white/90 px-2.5 py-1 text-xs font-medium text-stone-900 shadow-sm backdrop-blur-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
        >
          {pinnedOpen ? 'Reset Iris' : 'Hold Open'}
        </button>
      </div>
    </div>
  );
}

export default Icfx1;
