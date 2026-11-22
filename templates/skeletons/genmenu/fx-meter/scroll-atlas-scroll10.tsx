import { useEffect, useRef, useState } from 'react';
import { computeRingDashOffset, computeViewportTraversal } from '../../utils/scrollMath';

export function Scroll10() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0.55);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = sectionRef.current;
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

  const radius = 52;
  const { circumference, dashOffset } = computeRingDashOffset(radius, progress);

  return (
    <section
      id="scroll-10"
      ref={sectionRef}
      aria-labelledby="scroll-10-heading"
      className="border-t border-[#E2E2DE] py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-10 rounded-xl border border-[#E2E2DE] bg-white p-8 lg:grid-cols-12">
          <div className="flex flex-col items-center justify-center lg:col-span-4">
            <div className="relative flex h-40 w-40 items-center justify-center">
              <svg className="h-40 w-40 -rotate-90" viewBox="0 0 128 128" aria-hidden="true">
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  fill="none"
                  stroke="#EEEEEC"
                  strokeWidth="8"
                />
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  fill="none"
                  stroke="#1D4ED8"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-2xl font-medium tabular-nums text-[#111110]">
                  {Math.round(progress * 100)}%
                </span>
                <span className="text-[11px] text-[#575752]">Ring Depth</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <p className="text-xs font-medium tracking-wide text-[#575752]">
              Scroll10 · Typography & Data · SVG stroke-dashoffset ring
            </p>
            <h2 id="scroll-10-heading" className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#111110] md:text-3xl">
              10. Circular Progress Ring
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#575752]">
              A radial SVG perimeter tracks continuous scroll traversal using exact circumference math (2πr). Because stroke-dashoffset avoids layout reflows, the arc remains razor sharp across every viewport width.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="rounded-md bg-[#111110] px-4 py-2 text-xs font-medium text-white hover:bg-[#2A2A28] transition-colors whitespace-nowrap shrink-0"
              >
                Return to Top
              </button>
              <a
                href="#scroll-11"
                className="rounded-md border border-[#E2E2DE] bg-[#F7F7F5] px-4 py-2 text-xs font-medium text-[#111110] hover:bg-[#EEEEEC] transition-colors whitespace-nowrap shrink-0"
              >
                Next Specimen
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Scroll10;
