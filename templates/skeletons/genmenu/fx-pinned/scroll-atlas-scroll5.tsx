import { useEffect, useRef, useState } from 'react';
import { IMAGES } from '../../data/specimens';
import { computeHorizontalTrackX, computeStickyProgress } from '../../utils/scrollMath';
import { MediaFrame } from '../MediaFrame';

const GALLERY_PLATES = [
  {
    code: 'Plate 01',
    title: 'Atrium Daylight Cut',
    year: '2024',
    image: IMAGES.heroAtrium,
  },
  {
    code: 'Plate 02',
    title: 'Equilibrium Study IV',
    year: '2025',
    image: IMAGES.sculpture,
  },
  {
    code: 'Plate 03',
    title: 'Slate Horizon Pavilion',
    year: '2025',
    image: IMAGES.coastalMonolith,
  },
  {
    code: 'Plate 04',
    title: 'Oak & Concrete Helix',
    year: '2026',
    image: IMAGES.staircase,
  },
  {
    code: 'Plate 05',
    title: 'Colonnade Shadow Grid',
    year: '2026',
    image: IMAGES.pavilionShadow,
  },
];

export function Scroll5() {
  const runwayRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0.22);
  const [translateX, setTranslateX] = useState(-180);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const runway = runwayRef.current;
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (!runway || !viewport || !track) return;
      const rect = runway.getBoundingClientRect();
      const nextP = computeStickyProgress(rect.top, rect.height, window.innerHeight);
      const nextX = computeHorizontalTrackX(
        nextP,
        track.scrollWidth,
        viewport.clientWidth,
      );
      setProgress(nextP);
      setTranslateX(nextX);
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      id="scroll-5"
      aria-labelledby="scroll-5-heading"
      className="border-t border-[#E2E2DE] py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-[#575752]">
              Scroll5 · Sticky & Pinned · translateX driven by vertical scroll
            </p>
            <h2 id="scroll-5-heading" className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#111110] md:text-3xl">
              05. Horizontal Track on Vertical
            </h2>
          </div>
          <p className="font-mono text-xs tabular-nums text-[#575752]">
            Offset {Math.round(translateX)}px · {Math.round(progress * 100)}%
          </p>
        </div>

        <div ref={runwayRef} className="relative min-h-[185vh]">
          <div className="sticky top-20 rounded-xl border border-[#E2E2DE] bg-white p-6">
            <div ref={viewportRef} className="overflow-hidden">
              <div
                ref={trackRef}
                style={{ transform: `translate3d(${translateX}px, 0, 0)` }}
                className="flex gap-6 will-change-transform"
              >
                {GALLERY_PLATES.map((plate) => (
                  <article
                    key={plate.code}
                    className="w-[300px] shrink-0 sm:w-[360px]"
                  >
                    <MediaFrame
                      src={plate.image}
                      alt={plate.title}
                      aspectClass="aspect-[4/3]"
                      className="rounded-lg"
                    />
                    <div className="mt-3 flex items-baseline justify-between">
                      <h3 className="font-display text-base font-semibold text-[#111110]">
                        {plate.title}
                      </h3>
                      <span className="font-mono text-xs text-[#575752]">
                        {plate.code} · {plate.year}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4 border-t border-[#E2E2DE] pt-4">
              <span className="font-mono text-xs text-[#575752] whitespace-nowrap">
                X-Axis Track
              </span>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#EEEEEC]">
                <div
                  className="h-full w-full origin-left bg-[#1D4ED8]"
                  style={{ transform: `scaleX(${Math.max(0.05, progress)})` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Scroll5;
