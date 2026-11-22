import {useEffect, useRef, useState} from 'react';
import {calculateParallaxLayers} from '../../utils/fxMath';

export function Fx19() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollRatio, setScrollRatio] = useState(0.45);
  const [manualOverride, setManualOverride] = useState<number | null>(null);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    const updateOnScroll = () => {
      if (manualOverride !== null) return;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = window.innerHeight + rect.height;
      const raw = total > 0 ? (window.innerHeight - rect.top) / total : 0.5;
      setScrollRatio(Math.min(Math.max(raw, 0), 1));
    };

    updateOnScroll();
    window.addEventListener('scroll', updateOnScroll, {passive: true});
    return () => window.removeEventListener('scroll', updateOnScroll);
  }, [manualOverride]);

  const effectiveRatio = manualOverride !== null ? manualOverride : scrollRatio;
  const layers = calculateParallaxLayers(effectiveRatio, 36);

  return (
    <div ref={containerRef} className="flex flex-col gap-3.5 w-full">
      <div className="relative h-56 w-full rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100">
        {!imgFailed ? (
          <img
            src="/src/assets/images/parallax_architectural_atrium_1795322990830.jpg"
            alt="Minimalist concrete and travertine gallery atrium with diagonal sunlight"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            style={{
              transform: `translate3d(0, ${layers.backgroundY}px, 0) scale(1.16)`,
            }}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-150 ease-out"
          />
        ) : (
          <div
            style={{
              transform: `translate3d(0, ${layers.backgroundY}px, 0) scale(1.16)`,
            }}
            className="absolute inset-0 w-full h-full bg-gradient-to-br from-zinc-200 via-zinc-300 to-zinc-400"
          />
        )}

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-zinc-950/75 via-zinc-950/20 to-transparent"
        />

        <div
          style={{
            transform: `translate3d(0, ${layers.midgroundY}px, 0)`,
          }}
          className="absolute right-4 top-4 w-24 h-20 rounded-lg overflow-hidden border border-white/30 shadow-md transition-transform duration-150 ease-out"
        >
          <img
            src="/src/assets/images/parallax_tactile_study_1795322990253.jpg"
            alt="Machined precision aluminum dial study"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        <div
          style={{
            transform: `translate3d(0, ${layers.foregroundY}px, 0)`,
          }}
          className="absolute left-4 right-4 bottom-4 flex items-end justify-between gap-4 transition-transform duration-150 ease-out"
        >
          <div>
            <p className="text-xs font-medium text-zinc-200">
              Multi-Plane Depth
            </p>
            <p className="text-base font-semibold text-white">
              Atrium Light Study
            </p>
          </div>
          <span className="font-mono text-xs tabular-nums text-zinc-200">
            bg {layers.backgroundY}px · fg {layers.foregroundY}px
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor="fx19-depth-scrubber"
          className="text-xs text-zinc-600 whitespace-nowrap"
        >
          Parallax Scrub
        </label>
        <input
          id="fx19-depth-scrubber"
          type="range"
          min={0}
          max={100}
          value={Math.round(effectiveRatio * 100)}
          onChange={(e) => setManualOverride(Number(e.target.value) / 100)}
          className="w-full accent-[#2563EB] cursor-pointer"
        />
        {manualOverride !== null && (
          <button
            type="button"
            onClick={() => setManualOverride(null)}
            className="px-2.5 py-1 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Sync Scroll
          </button>
        )}
      </div>
    </div>
  );
}
