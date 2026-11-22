import { useEffect, useRef, useState } from 'react';
import { IMAGES } from '../../data/specimens';
import { computeViewportTraversal, lerp } from '../../utils/scrollMath';

export function Scroll16() {
  const frameRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0.6);
  const [supportsCssView] = useState(() =>
    typeof CSS !== 'undefined' && CSS.supports ? CSS.supports('animation-timeline', 'view()') : false,
  );

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = frameRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setProgress(computeViewportTraversal(rect.top, rect.height, window.innerHeight));
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  const insetY = lerp(14, 0, Math.min(1, progress * 1.45));
  const insetX = lerp(18, 0, Math.min(1, progress * 1.45));

  return (
    <section
      id="scroll-16"
      aria-labelledby="scroll-16-heading"
      className="border-t border-[#E2E2DE] py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-[#575752]">
              Scroll16 · CSS Timeline · view() clip-path inset aperture
            </p>
            <h2 id="scroll-16-heading" className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#111110] md:text-3xl">
              16. Clip-Path Aperture Expand
            </h2>
          </div>
          <p className="font-mono text-xs tabular-nums text-[#575752]">
            Inset {insetY.toFixed(1)}% {insetX.toFixed(1)}%
          </p>
        </div>

        <div ref={frameRef} className="rounded-xl border border-[#E2E2DE] bg-white p-4">
          <div
            style={
              !supportsCssView
                ? { clipPath: `inset(${insetY}% ${insetX}% ${insetY}% ${insetX}% round 12px)` }
                : undefined
            }
            className={`relative aspect-[16/9] overflow-hidden rounded-lg bg-[#EAE9E4] ${
              supportsCssView ? 'sd-clip-expand' : ''
            }`}
          >
            <img
              src={IMAGES.heroAtrium}
              alt="Sunlit museum atrium framed through expanding clip-path aperture"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute right-6 bottom-6 left-6 text-white">
              <p className="font-mono text-xs text-[#93C5FD]">Full-Bleed Expansion</p>
              <h3 className="mt-1 font-display text-xl font-semibold md:text-2xl">
                Geometric Crop Opens to Full Architectural Scale
              </h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Scroll16;
