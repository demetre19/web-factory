import { useEffect, useRef, useState } from 'react';
import { IMAGES } from '../../data/specimens';
import { computeStickyProgress, getActiveStepIndex } from '../../utils/scrollMath';
import { MediaFrame } from '../MediaFrame';

const CHAPTERS = [
  {
    index: '01',
    title: 'Solar Axis & Travertine Mass',
    detail:
      'A pinned viewport anchors the focal photograph while vertical travel steps cleanly across four curatorial notes.',
    image: IMAGES.heroAtrium,
    alt: 'Concrete and travertine atrium with diagonal daylight beam',
  },
  {
    index: '02',
    title: 'Equilibrium in Brushed Steel',
    detail:
      'Counterbalanced arcs convert static gallery elevation into calibrated rotational poise.',
    image: IMAGES.sculpture,
    alt: 'Brushed aluminum and limestone kinetic sculpture on gallery plinth',
  },
  {
    index: '03',
    title: 'Horizon Framing at Low Tide',
    detail:
      'Cast concrete apertures compress the coastal sky into a measured architectural ribbon.',
    image: IMAGES.coastalMonolith,
    alt: 'Nordic concrete pavilion overlooking slate ocean horizon',
  },
  {
    index: '04',
    title: 'Helical Ascent Under Skylight',
    detail:
      'Continuous oak treads spiral beneath overhead mullions without interrupting vertical rhythm.',
    image: IMAGES.pavilionShadow,
    alt: 'Limestone colonnade casting geometric shadows across courtyard',
  },
];

export function Scroll1() {
  const runwayRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0.28);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = runwayRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const next = computeStickyProgress(rect.top, rect.height, window.innerHeight);
      setProgress(next);
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

  const activeIdx = getActiveStepIndex(progress, CHAPTERS.length);
  const active = CHAPTERS[activeIdx];

  return (
    <section
      id="scroll-1"
      aria-labelledby="scroll-1-heading"
      className="border-t border-[#E2E2DE] py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-[#575752]">
              Scroll1 · Sticky & Pinned · position: sticky stage
            </p>
            <h2 id="scroll-1-heading" className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#111110] md:text-3xl">
              01. Pinned Stage
            </h2>
          </div>
          <p className="font-mono text-xs tabular-nums text-[#575752]">
            Stage {active.index} / 0{CHAPTERS.length} · {Math.round(progress * 100)}%
          </p>
        </div>

        <div ref={runwayRef} className="relative min-h-[165vh]">
          <div className="sticky top-20 rounded-xl border border-[#E2E2DE] bg-white p-6 md:p-8">
            <div className="grid items-stretch gap-8 lg:grid-cols-12">
              <div className="flex flex-col justify-between lg:col-span-5">
                <div>
                  <div className="mb-6 flex items-center gap-3">
                    {CHAPTERS.map((chap, idx) => (
                      <button
                        key={chap.index}
                        type="button"
                        onClick={() => {
                          if (!runwayRef.current) return;
                          const rect = runwayRef.current.getBoundingClientRect();
                          const docTop = window.scrollY + rect.top;
                          const target =
                            docTop +
                            ((rect.height - window.innerHeight) * (idx + 0.15)) / CHAPTERS.length;
                          window.scrollTo({ top: target, behavior: 'smooth' });
                        }}
                        className={`font-mono text-xs tabular-nums px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                          idx === activeIdx
                            ? 'bg-[#1D4ED8] text-white'
                            : 'bg-[#EEEEEC] text-[#575752] hover:text-[#111110]'
                        }`}
                        aria-label={`Jump to pinned stage ${chap.index}`}
                      >
                        {chap.index}
                      </button>
                    ))}
                  </div>

                  <p className="text-xs font-medium text-[#1D4ED8]">
                    Chapter {active.index}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-semibold text-[#111110] text-balance">
                    {active.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#575752]">
                    {active.detail}
                  </p>
                </div>

                <div className="mt-8 border-t border-[#E2E2DE] pt-4">
                  <div className="h-1 w-full overflow-hidden rounded-full bg-[#EEEEEC]">
                    <div
                      className="h-full origin-left bg-[#1D4ED8] transition-transform duration-150 ease-out"
                      style={{ transform: `scaleX(${Math.max(0.06, progress)})` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-[#575752]">
                    Content stays pinned inside the viewport while the 165vh runway scrolls past.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-7">
                <MediaFrame
                  src={active.image}
                  alt={active.alt}
                  aspectClass="aspect-[16/10] lg:h-[380px] lg:aspect-auto"
                  className="rounded-lg transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Scroll1;
