import { useState } from 'react';

export function Icfx20() {
  const [exposed, setExposed] = useState(false);

  return (
    <div className="w-full">
      <div
        className="relative h-64 w-full overflow-hidden rounded-xl border border-stone-200 bg-[#18181B]"
        onMouseEnter={() => setExposed(true)}
        onMouseLeave={() => setExposed(false)}
      >
        <div
          className={`h-full w-full bg-gradient-to-tr from-[#0F172A] via-[#0369A1] to-[#38BDF8] transition-[filter,transform] duration-500 ease-out ${
            exposed ? 'scale-100 brightness-105 contrast-115' : 'scale-[1.03] brightness-75 contrast-90'
          }`}
        >
          <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden="true">
            <defs>
              <pattern id="icfx20-dots" width="10" height="10" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#E0F2FE" fillOpacity="0.24" />
              </pattern>
            </defs>
            <rect width="400" height="260" fill="url(#icfx20-dots)" />
            <circle cx="200" cy="130" r="68" fill="none" stroke="#F0F9FF" strokeWidth="1.2" strokeOpacity="0.7" />
            <polygon points="200,74 252,168 148,168" fill="#F0F9FF" fillOpacity="0.2" stroke="#BAE6FD" strokeWidth="1.2" />
          </svg>
        </div>

        {/* Expanding corner registration crop marks */}
        <div
          className={`pointer-events-none absolute inset-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            exposed ? 'inset-3 opacity-100' : 'inset-7 opacity-65'
          }`}
        >
          <span className="absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-white" />
          <span className="absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-white" />
          <span className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-white" />
          <span className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-white" />
        </div>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-white">
          <span className="font-mono text-[11px] tracking-widest text-sky-100">
            {exposed ? 'PRINT EXPOSURE +1.0 EV' : 'PROOF DENSITY -0.5 EV'}
          </span>
          <span className="mt-1 font-serif text-3xl font-semibold">R-20</span>
        </div>

        <button
          type="button"
          onClick={() => setExposed((v) => !v)}
          aria-pressed={exposed}
          className="absolute right-3 bottom-3 z-10 rounded-md bg-white/90 px-2.5 py-1 text-xs font-medium text-stone-900 shadow-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
        >
          {exposed ? 'Dim Proof' : 'Expose Print'}
        </button>
      </div>
    </div>
  );
}

export default Icfx20;
