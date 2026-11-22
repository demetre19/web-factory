import { useEffect, useRef, useState } from 'react';
import { IMAGES } from '../../data/specimens';
import { computeViewportTraversal, lerp } from '../../utils/scrollMath';

export function Scroll3() {
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

  const backY = lerp(-28, 28, progress);
  const midY = lerp(18, -22, progress);
  const frontY = lerp(42, -42, progress);

  return (
    <section
      id="scroll-3"
      aria-labelledby="scroll-3-heading"
      className="border-t border-[#E2E2DE] py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-[#575752]">
              Scroll3 · Spatial & Media · 3-plane parallax depth
            </p>
            <h2 id="scroll-3-heading" className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#111110] md:text-3xl">
              03. Depth Parallax Layers
            </h2>
          </div>
          <p className="font-mono text-xs tabular-nums text-[#575752]">
            Back {backY >= 0 ? `+${backY.toFixed(0)}` : backY.toFixed(0)}px · Mid{' '}
            {midY >= 0 ? `+${midY.toFixed(0)}` : midY.toFixed(0)}px · Front{' '}
            {frontY >= 0 ? `+${frontY.toFixed(0)}` : frontY.toFixed(0)}px
          </p>
        </div>

        <div
          ref={stageRef}
          className="relative h-[460px] overflow-hidden rounded-xl border border-[#E2E2DE] bg-[#181816]"
        >
          <div
            style={!supportsCssView ? { transform: `translateY(${backY}px) scale(1.08)` } : undefined}
            className={`absolute inset-0 ${supportsCssView ? 'sd-parallax-back' : ''}`}
          >
            <img
              src={IMAGES.coastalMonolith}
              alt="Background concrete pavilion overlooking sea horizon"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/20" />
          </div>

          <div
            style={!supportsCssView ? { transform: `translateY(${midY}px)` } : undefined}
            className={`relative z-10 mx-auto mt-14 max-w-xl px-6 ${
              supportsCssView ? 'sd-parallax-mid' : ''
            }`}
          >
            <div className="rounded-xl border border-white/20 bg-[#111110]/85 p-6 text-white backdrop-blur-sm">
              <p className="text-xs font-medium tracking-wide text-[#93C5FD]">
                Midground Plane · 0.65x Velocity
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-wide text-balance">
                Independent Planes Create Optical Depth
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-300">
                When background photography, midground editorial cards, and foreground captions move at staggered ratios, flat surfaces separate into spatial depth.
              </p>
            </div>
          </div>

          <div
            style={!supportsCssView ? { transform: `translateY(${frontY}px)` } : undefined}
            className={`absolute right-6 bottom-8 left-6 z-20 flex flex-wrap items-end justify-between gap-4 md:right-10 md:left-10 ${
              supportsCssView ? 'sd-parallax-front' : ''
            }`}
          >
            <div className="rounded-lg border border-white/25 bg-white px-5 py-3.5 text-[#111110]">
              <p className="font-mono text-xs text-[#575752]">Foreground Plane · 1.4x Velocity</p>
              <p className="mt-0.5 font-display text-base font-semibold">
                Nordic Coastal Monolith · 58.97° N
              </p>
            </div>
            <div className="rounded-lg border border-white/25 bg-[#1D4ED8] px-4 py-2.5 text-white">
              <p className="font-mono text-xs tabular-nums">
                Traversal {(progress * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Scroll3;
