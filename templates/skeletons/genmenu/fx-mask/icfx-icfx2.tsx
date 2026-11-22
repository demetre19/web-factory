import { useEffect, useState } from 'react';

export function Icfx2() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setRevealed(true), 120);
    return () => window.clearTimeout(timer);
  }, []);

  const replay = () => {
    setRevealed(false);
    window.setTimeout(() => setRevealed(true), 60);
  };

  return (
    <div className="w-full">
      <div
        className="group relative h-64 w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-100"
        onMouseEnter={() => setRevealed(true)}
      >
        <div className="absolute inset-0 flex flex-col justify-between bg-[#EAEAE6] p-5 text-stone-500">
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span>SHEAR AXIS 28°</span>
            <span>PLATE 02</span>
          </div>
          <div className="font-mono text-xs tracking-wider text-stone-400">
            CLIP POLYGON STANDBY
          </div>
        </div>

        <div
          className="absolute inset-0 transition-[clip-path] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            clipPath: revealed
              ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
              : 'polygon(0% 0%, 34% 0%, 10% 100%, 0% 100%)',
          }}
        >
          <div className="relative h-full w-full bg-gradient-to-tr from-[#0B132B] via-[#1C2541] to-[#3A506B]">
            <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden="true">
              <polygon points="0,260 190,48 400,260" fill="#5BC0BE" opacity="0.22" />
              <polygon points="110,260 275,30 400,260" fill="#E0FBFC" opacity="0.14" />
              <line x1="64" y1="260" x2="210" y2="0" stroke="#98C1D9" strokeWidth="1.5" strokeOpacity="0.6" />
              <line x1="184" y1="260" x2="330" y2="0" stroke="#E0FBFC" strokeWidth="1" strokeOpacity="0.35" />
              <rect x="28" y="28" width="74" height="74" fill="#F8FAFC" fillOpacity="0.12" stroke="#E0FBFC" strokeOpacity="0.4" />
            </svg>
            <div className="absolute top-6 left-7 text-white">
              <div className="font-mono text-xs tracking-widest text-sky-200">CANTILEVER STUDY</div>
              <div className="mt-1 text-3xl font-bold tracking-tight">Δ2</div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={replay}
          className="absolute right-3 bottom-3 z-10 rounded-md bg-white/90 px-2.5 py-1 text-xs font-medium text-stone-900 shadow-sm backdrop-blur-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
        >
          Replay Wipe
        </button>
      </div>
    </div>
  );
}

export default Icfx2;
