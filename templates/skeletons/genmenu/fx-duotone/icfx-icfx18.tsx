import { useState } from 'react';

export function Icfx18() {
  const [lifted, setLifted] = useState(false);

  return (
    <div className="w-full py-2">
      <div
        onMouseEnter={() => setLifted(true)}
        onMouseLeave={() => setLifted(false)}
        className={`relative h-60 w-full overflow-hidden rounded-xl border border-stone-200 bg-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          lifted
            ? '-translate-y-2 shadow-[0_24px_40px_-14px_rgba(20,20,19,0.28),0_8px_16px_-6px_rgba(20,20,19,0.12)]'
            : 'translate-y-0 shadow-[0_2px_6px_rgba(20,20,19,0.06)]'
        }`}
      >
        <div className="relative h-full w-full bg-gradient-to-br from-[#F4F3EF] via-[#E7E5E0] to-[#D6D3CD] p-5">
          <svg viewBox="0 0 360 220" className="h-full w-full" aria-hidden="true">
            <rect x="18" y="16" width="324" height="188" fill="#FFFFFF" stroke="#D6D3D1" />
            <circle cx="122" cy="110" r="52" fill="#1D4ED8" opacity="0.88" />
            <rect x="188" y="58" width="106" height="104" fill="#141413" opacity="0.9" />
            <line x1="18" y1="184" x2="342" y2="184" stroke="#E7E5E4" />
          </svg>
          <div className="pointer-events-none absolute top-7 left-7">
            <span className="font-mono text-[11px] text-stone-500">ELEVATION SPEC</span>
          </div>
          <div className="pointer-events-none absolute bottom-6 left-7">
            <span className="font-serif text-xl font-semibold text-stone-900">
              Cotton Rag Folio
            </span>
          </div>
          <button
            type="button"
            onClick={() => setLifted((v) => !v)}
            aria-pressed={lifted}
            className="absolute right-4 bottom-4 z-10 rounded-md border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-900 shadow-sm transition hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
          >
            {lifted ? 'Settle' : 'Lift Card'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Icfx18;
