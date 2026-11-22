import { useEffect, useRef, useState } from 'react';
import { IMAGES } from '../../data/specimens';
import { computeViewportTraversal, lerp } from '../../utils/scrollMath';
import { MediaFrame } from '../MediaFrame';

export function Scroll6() {
  const leadRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0.5);
  const [supportsCssView] = useState(() =>
    typeof CSS !== 'undefined' && CSS.supports ? CSS.supports('animation-timeline', 'view()') : false,
  );

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = leadRef.current;
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

  const scale = lerp(1.12, 0.92, progress);
  const radius = Math.round(lerp(2, 16, progress));

  return (
    <section
      id="scroll-6"
      aria-labelledby="scroll-6-heading"
      className="border-t border-[#E2E2DE] py-16 md:py-24 overflow-x-clip"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-[#575752]">
              Scroll6 · Spatial & Media · animation-timeline: view() scale down
            </p>
            <h2 id="scroll-6-heading" className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#111110] md:text-3xl">
              06. Scale-Down Gallery
            </h2>
          </div>
          <p className="font-mono text-xs tabular-nums text-[#575752]">
            Scale {scale.toFixed(2)}x · Radius {radius}px
          </p>
        </div>

        <div ref={leadRef} className="overflow-hidden rounded-xl border border-[#E2E2DE] bg-[#EAE9E4] p-4 md:p-6">
          <div
            style={
              !supportsCssView
                ? { transform: `scale(${scale})`, borderRadius: `${radius}px` }
                : undefined
            }
            className={`overflow-hidden shadow-sm transition-transform duration-75 will-change-transform ${
              supportsCssView ? 'sd-scale-down' : ''
            }`}
          >
            <MediaFrame
              src={IMAGES.pavilionShadow}
              alt="Limestone colonnade casting geometric courtyard shadows"
              aspectClass="aspect-[16/9]"
              className="rounded-lg"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {[
            { title: 'Atrium Proportion', meta: '16:9 · 1.12x to 0.92x', image: IMAGES.heroAtrium },
            { title: 'Plinth Balance', meta: '4:3 · Framed settle', image: IMAGES.sculpture },
            { title: 'Sea Horizon Frame', meta: '4:3 · Edge margin reveal', image: IMAGES.coastalMonolith },
          ].map((item) => (
            <article key={item.title} className="rounded-xl border border-[#E2E2DE] bg-white p-4">
              <MediaFrame src={item.image} alt={item.title} aspectClass="aspect-[4/3]" className="rounded-lg" />
              <h3 className="mt-3 font-display text-base font-semibold text-[#111110]">{item.title}</h3>
              <p className="mt-1 font-mono text-xs text-[#575752]">{item.meta}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Scroll6;
