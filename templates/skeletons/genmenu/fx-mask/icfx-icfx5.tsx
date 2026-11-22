import { useEffect, useRef, useState } from 'react';

export function Icfx5() {
  const frameRef = useRef<HTMLDivElement>(null);
  const [offsetY, setOffsetY] = useState(0);
  const [manualBias, setManualBias] = useState<number | null>(null);

  useEffect(() => {
    let rafId = 0;

    const updateParallax = () => {
      const el = frameRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 900;
      const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)));
      const shift = Math.round((progress - 0.5) * 68 * 10) / 10;
      setOffsetY(shift);
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateParallax);
    };

    updateParallax();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const activeOffset = manualBias !== null ? manualBias : offsetY;

  return (
    <div className="w-full space-y-2.5">
      <div
        ref={frameRef}
        className="relative h-64 w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-900"
      >
        <div
          className="absolute -inset-y-14 inset-x-0 will-change-transform transition-transform duration-150 ease-out"
          style={{ transform: `translate3d(0, ${activeOffset}px, 0)` }}
        >
          <div className="relative h-full w-full bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#334155]">
            <svg viewBox="0 0 600 360" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
              <circle cx="480" cy="84" r="40" fill="#F1F5F9" opacity="0.88" />
              <path d="M0 240 L120 140 L250 225 L390 120 L520 210 L600 175 L600 360 L0 360 Z" fill="#1E3A8A" opacity="0.55" />
              <path d="M0 275 L165 188 L305 260 L445 170 L600 245 L600 360 L0 360 Z" fill="#0F172A" opacity="0.82" />
              <rect x="64" y="218" width="472" height="6" fill="#E2E8F0" opacity="0.65" />
              <line x1="120" y1="224" x2="120" y2="330" stroke="#94A3B8" strokeWidth="4" />
              <line x1="250" y1="224" x2="250" y2="330" stroke="#94A3B8" strokeWidth="4" />
              <line x1="380" y1="224" x2="380" y2="330" stroke="#94A3B8" strokeWidth="4" />
              <line x1="490" y1="224" x2="490" y2="330" stroke="#94A3B8" strokeWidth="4" />
            </svg>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/75 via-black/30 to-transparent p-4">
          <div>
            <div className="font-mono text-[11px] text-slate-300">VIADUCT ELEVATION</div>
            <div className="text-base font-semibold text-white">Fixed-Aperture Parallax</div>
          </div>
          <span className="font-mono text-xs tabular-nums text-sky-200">
            ΔY {activeOffset > 0 ? `+${activeOffset.toFixed(1)}` : activeOffset.toFixed(1)}px
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-stone-600">
        <label htmlFor="icfx5-scrub" className="shrink-0 font-medium">
          Scroll Offset
        </label>
        <input
          id="icfx5-scrub"
          type="range"
          min={-34}
          max={34}
          step={1}
          value={Math.round(activeOffset)}
          onChange={(e) => setManualBias(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer accent-[#1D4ED8]"
        />
        {manualBias !== null && (
          <button
            type="button"
            onClick={() => setManualBias(null)}
            className="shrink-0 font-medium text-[#1D4ED8] hover:underline"
          >
            Live Scroll
          </button>
        )}
      </div>
    </div>
  );
}

export default Icfx5;
