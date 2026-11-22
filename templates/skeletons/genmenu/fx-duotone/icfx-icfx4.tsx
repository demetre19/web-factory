import { useState } from 'react';

export function Icfx4() {
  const [showNight, setShowNight] = useState(false);

  return (
    <div className="w-full">
      <div
        className="group relative h-64 w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-100"
        onMouseEnter={() => setShowNight(true)}
        onMouseLeave={() => setShowNight(false)}
      >
        {/* Plate A: Daylight Solarium */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ease-out ${
            showNight ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="relative h-full w-full bg-gradient-to-b from-[#E0F2FE] via-[#F8FAFC] to-[#CBD5E1]">
            <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden="true">
              <circle cx="305" cy="64" r="32" fill="#FDE047" opacity="0.9" />
              <rect x="52" y="102" width="150" height="158" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.5" />
              <rect x="202" y="138" width="140" height="122" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
              <line x1="88" y1="102" x2="88" y2="260" stroke="#CBD5E1" strokeWidth="2" />
              <line x1="128" y1="102" x2="128" y2="260" stroke="#CBD5E1" strokeWidth="2" />
              <line x1="168" y1="102" x2="168" y2="260" stroke="#CBD5E1" strokeWidth="2" />
            </svg>
            <div className="absolute top-4 left-4">
              <div className="font-mono text-[11px] font-medium text-slate-600">STATE A · DAYLIGHT</div>
              <div className="text-lg font-semibold tracking-tight text-slate-900">Solarium Elevation</div>
            </div>
          </div>
        </div>

        {/* Plate B: Nocturnal Observatory */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ease-out ${
            showNight ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="relative h-full w-full bg-gradient-to-b from-[#090D16] via-[#131C31] to-[#1E293B]">
            <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden="true">
              <circle cx="305" cy="64" r="22" fill="#E2E8F0" opacity="0.9" />
              <circle cx="96" cy="48" r="1.5" fill="#FFFFFF" opacity="0.7" />
              <circle cx="164" cy="34" r="1.5" fill="#FFFFFF" opacity="0.5" />
              <circle cx="242" cy="72" r="2" fill="#93C5FD" opacity="0.8" />
              <rect x="52" y="102" width="150" height="158" fill="#0F172A" stroke="#334155" strokeWidth="1.5" />
              <rect x="202" y="138" width="140" height="122" fill="#1E293B" stroke="#334155" strokeWidth="1.5" />
              <rect x="76" y="128" width="32" height="58" fill="#FBBF24" opacity="0.78" />
              <rect x="134" y="128" width="32" height="58" fill="#FBBF24" opacity="0.52" />
              <rect x="228" y="164" width="84" height="36" fill="#38BDF8" opacity="0.28" />
            </svg>
            <div className="absolute top-4 left-4">
              <div className="font-mono text-[11px] font-medium text-sky-300">STATE B · NOCTURNE</div>
              <div className="text-lg font-semibold tracking-tight text-white">Floodlit Facade</div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowNight((v) => !v)}
          aria-pressed={showNight}
          className="absolute right-3 bottom-3 z-10 rounded-md bg-white/90 px-2.5 py-1 text-xs font-medium text-stone-900 shadow-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
        >
          {showNight ? 'Show Daylight' : 'Swap Plate'}
        </button>
      </div>
    </div>
  );
}

export default Icfx4;
