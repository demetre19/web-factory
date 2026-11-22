import { useEffect, useRef, useState } from 'react';
import { computeViewportTraversal } from '../../utils/scrollMath';

export function Scroll12() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0.55);
  const [supportsCssView] = useState(() =>
    typeof CSS !== 'undefined' && CSS.supports ? CSS.supports('animation-timeline', 'view()') : false,
  );

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = containerRef.current;
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

  const fillPct = Math.round(Math.min(100, Math.max(18, progress * 115)));

  return (
    <section
      id="scroll-12"
      ref={containerRef}
      aria-labelledby="scroll-12-heading"
      className="border-t border-[#E2E2DE] py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
          <p className="text-xs font-medium tracking-wide text-[#575752]">
            Scroll12 · Typography & Data · Scroll-filled ink sweep
          </p>
          <span className="font-mono text-xs tabular-nums text-[#575752]">
            Ink Fill {fillPct}%
          </span>
        </div>

        <h2
          id="scroll-12-heading"
          style={{
            backgroundImage: 'linear-gradient(90deg, #111110, #1D4ED8)',
            backgroundRepeat: 'no-repeat',
            backgroundSize: supportsCssView ? undefined : `${fillPct}% 100%`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'rgba(17, 17, 16, 0.22)',
          }}
          className={`font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl text-balance ${
            supportsCssView ? 'sd-text-fill' : ''
          }`}
        >
          12. Typography fills progressively with charcoal and cobalt ink as the reader crosses the focal band.
        </h2>
      </div>
    </section>
  );
}

export default Scroll12;
