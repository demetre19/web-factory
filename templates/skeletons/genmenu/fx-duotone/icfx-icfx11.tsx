import { useState } from 'react';

export function Icfx11() {
  const [sweepKey, setSweepKey] = useState(0);
  const [hovering, setHovering] = useState(false);

  return (
    <div className="w-full">
      <div
        className="group relative h-64 w-full overflow-hidden rounded-xl border border-stone-200 bg-gradient-to-br from-[#1C1917] via-[#292524] to-[#44403C]"
        onMouseEnter={() => {
          setHovering(true);
          setSweepKey((k) => k + 1);
        }}
        onMouseLeave={() => setHovering(false)}
      >
        <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden="true">
          <defs>
            <linearGradient id="icfx11-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="50%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
          </defs>
          <circle cx="200" cy="130" r="76" fill="none" stroke="url(#icfx11-gold)" strokeWidth="2.5" />
          <rect x="148" y="78" width="104" height="104" transform="rotate(45 200 130)" fill="none" stroke="#FCD34D" strokeOpacity="0.45" />
          <circle cx="200" cy="130" r="18" fill="url(#icfx11-gold)" opacity="0.85" />
        </svg>

        {/* Moving specular shine */}
        <div
          key={sweepKey}
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent"
          style={{
            animation: hovering || sweepKey > 0 ? 'icfx-shine-sweep 950ms cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none',
            transform: 'translateX(-160%) skewX(-22deg)',
          }}
        />

        <div className="pointer-events-none absolute bottom-3 left-3 text-white">
          <div className="font-mono text-[11px] text-amber-200/90">SPECULAR FOIL</div>
          <div className="text-sm font-medium">Anodized Brass Plate</div>
        </div>

        <button
          type="button"
          onClick={() => setSweepKey((k) => k + 1)}
          className="absolute right-3 bottom-3 z-10 rounded-md bg-white/90 px-2.5 py-1 text-xs font-medium text-stone-900 shadow-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
        >
          Sweep Shine
        </button>
      </div>
    </div>
  );
}

export default Icfx11;
