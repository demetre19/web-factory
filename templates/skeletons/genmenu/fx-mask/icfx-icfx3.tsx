import { useState } from 'react';

export function Icfx3() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full">
      <div
        className="relative h-64 w-full overflow-hidden rounded-xl border border-stone-200 bg-[#ECECE8]"
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <div className="absolute inset-0 flex items-center justify-between px-4 font-mono text-[10px] tracking-widest text-stone-400">
          <span>MAT · 14%</span>
          <span>INSET FRAME</span>
        </div>

        <div
          className="absolute inset-0 transition-[clip-path] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            clipPath: expanded
              ? 'inset(0% 0% 0% 0% round 0px)'
              : 'inset(14% 14% 14% 14% round 12px)',
          }}
        >
          <div className="relative h-full w-full bg-gradient-to-br from-[#064E3B] via-[#047857] to-[#A7F3D0]">
            <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden="true">
              <defs>
                <linearGradient id="icfx3-glass" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ECFDF5" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#064E3B" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <path d="M40 260 L40 90 A160 160 0 0 1 360 90 L360 260 Z" fill="url(#icfx3-glass)" />
              <path d="M90 260 L90 115 A110 110 0 0 1 310 115 L310 260" fill="none" stroke="#D1FAE5" strokeWidth="1.2" strokeOpacity="0.6" />
              <line x1="200" y1="10" x2="200" y2="260" stroke="#D1FAE5" strokeWidth="1" strokeOpacity="0.4" />
              <circle cx="200" cy="132" r="34" fill="#ECFDF5" fillOpacity="0.88" />
            </svg>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-lg font-semibold tracking-widest text-emerald-950">
                BH
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-pressed={expanded}
          className="absolute right-3 bottom-3 z-10 rounded-md bg-white/90 px-2.5 py-1 text-xs font-medium text-stone-900 shadow-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
        >
          {expanded ? 'Collapse Mat' : 'Expand Frame'}
        </button>
      </div>
    </div>
  );
}

export default Icfx3;
