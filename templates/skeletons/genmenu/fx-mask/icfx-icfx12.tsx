import { useEffect, useState } from 'react';

export function Icfx12() {
  const [wiped, setWiped] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setWiped(true), 100);
    return () => window.clearTimeout(t);
  }, []);

  const replayWipe = () => {
    setWiped(false);
    window.setTimeout(() => setWiped(true), 120);
  };

  return (
    <div className="w-full">
      <div className="relative h-64 w-full overflow-hidden rounded-xl border border-stone-200 bg-[#E7E5E0]">
        {/* Unwiped blueprint layer */}
        <div className="absolute inset-0 flex items-center justify-center font-mono text-xs tracking-widest text-stone-500">
          MASK WIPE ORIGIN 0% → 100%
        </div>

        {/* Masked artwork revealed via sweeping gradient mask */}
        <div
          className="absolute inset-0 transition-[clip-path] duration-800 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            clipPath: wiped ? 'inset(0% 0% 0% 0%)' : 'inset(0% 100% 0% 0%)',
          }}
        >
          <div className="relative h-full w-full bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#93C5FD]">
            <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden="true">
              <path d="M55 260 L55 128 A80 80 0 0 1 215 128 L215 260 Z" fill="#EFF6FF" fillOpacity="0.88" />
              <path d="M185 260 L185 148 A64 64 0 0 1 313 148 L313 260 Z" fill="#DBEAFE" fillOpacity="0.52" />
              <circle cx="328" cy="64" r="24" fill="#FEF08A" opacity="0.9" />
            </svg>
            <div className="pointer-events-none absolute top-4 left-4 text-white">
              <div className="font-mono text-[11px] text-blue-100">CURTAIN MASK</div>
              <div className="text-lg font-semibold">Colonnade Study</div>
            </div>
          </div>
        </div>

        {/* Crisp wipe leading edge */}
        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] transition-all duration-800 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ left: wiped ? '100%' : '0%' }}
        />

        <button
          type="button"
          onClick={replayWipe}
          className="absolute right-3 bottom-3 z-10 rounded-md bg-white/90 px-2.5 py-1 text-xs font-medium text-stone-900 shadow-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
        >
          Replay Mask
        </button>
      </div>
    </div>
  );
}

export default Icfx12;
