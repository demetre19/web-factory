import { useEffect, useRef, useState } from 'react';
import { IMAGES } from '../../data/specimens';
import { computeViewportTraversal, lerp } from '../../utils/scrollMath';
import { MediaFrame } from '../MediaFrame';

export function Scroll15() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0.5);
  const [supportsCssView] = useState(() =>
    typeof CSS !== 'undefined' && CSS.supports ? CSS.supports('animation-timeline', 'view()') : false,
  );

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = stageRef.current;
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

  const upY = lerp(32, -32, progress);
  const downY = lerp(-32, 32, progress);

  return (
    <section
      id="scroll-15"
      aria-labelledby="scroll-15-heading"
      className="border-t border-[#E2E2DE] py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-[#575752]">
              Scroll15 · Spatial & Media · Opposing vertical column shear
            </p>
            <h2 id="scroll-15-heading" className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#111110] md:text-3xl">
              15. Counter-Scroll Split Columns
            </h2>
          </div>
          <p className="font-mono text-xs tabular-nums text-[#575752]">
            Left {upY >= 0 ? `+${upY.toFixed(0)}` : upY.toFixed(0)}px · Right{' '}
            {downY >= 0 ? `+${downY.toFixed(0)}` : downY.toFixed(0)}px
          </p>
        </div>

        <div
          ref={stageRef}
          className="grid gap-8 overflow-hidden rounded-xl border border-[#E2E2DE] bg-[#EEEEEC]/70 p-6 md:grid-cols-2 md:p-10"
        >
          <div
            style={!supportsCssView ? { transform: `translateY(${upY}px)` } : undefined}
            className={`space-y-6 will-change-transform ${supportsCssView ? 'sd-counter-up' : ''}`}
          >
            <div className="rounded-xl border border-[#E2E2DE] bg-white p-4">
              <MediaFrame src={IMAGES.staircase} alt="Spiral staircase ascending" aspectClass="aspect-[3/4]" className="rounded-lg" />
              <p className="mt-3 font-mono text-xs text-[#575752]">Column A · Ascending (-Y)</p>
            </div>
            <div className="rounded-xl border border-[#E2E2DE] bg-white p-5">
              <h3 className="font-display text-lg font-semibold text-[#111110]">Upward Shear</h3>
              <p className="mt-2 text-sm text-[#575752]">
                Translates upward from +32px to -32px as the frame crosses the viewport.
              </p>
            </div>
          </div>

          <div
            style={!supportsCssView ? { transform: `translateY(${downY}px)` } : undefined}
            className={`space-y-6 will-change-transform ${supportsCssView ? 'sd-counter-down' : ''}`}
          >
            <div className="rounded-xl border border-[#E2E2DE] bg-white p-5">
              <h3 className="font-display text-lg font-semibold text-[#111110]">Downward Counterweight</h3>
              <p className="mt-2 text-sm text-[#575752]">
                Mirrors the left column in reverse (-32px to +32px), creating dynamic architectural tension.
              </p>
            </div>
            <div className="rounded-xl border border-[#E2E2DE] bg-white p-4">
              <MediaFrame src={IMAGES.coastalMonolith} alt="Concrete coastal horizon" aspectClass="aspect-[4/3]" className="rounded-lg" />
              <p className="mt-3 font-mono text-xs text-[#575752]">Column B · Descending (+Y)</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Scroll15;
