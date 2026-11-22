import { useRef, useState } from 'react';
import { IMAGES } from '../../data/specimens';
import { MediaFrame } from '../MediaFrame';

const SNAP_SLIDES = [
  {
    index: '01',
    title: 'Atrium Sunlight Cut',
    subtitle: 'Snap Point 1 · scroll-snap-align: start',
    body: 'Native CSS scroll-snap-type: y mandatory settles the container cleanly on discrete architectural plates without JS physics hijacking.',
    image: IMAGES.heroAtrium,
  },
  {
    index: '02',
    title: 'Kinetic Plinth Study',
    subtitle: 'Snap Point 2 · scroll-snap-align: start',
    body: 'Mouse wheel gestures, touch swipes, and keyboard buttons all converge onto exact snap targets inside a self-contained deck.',
    image: IMAGES.sculpture,
  },
  {
    index: '03',
    title: 'Sea Horizon Monolith',
    subtitle: 'Snap Point 3 · scroll-snap-align: start',
    body: 'Using an explicit bounded snap container avoids hijacking the outer document scrollbar while demonstrating crisp snap choreography.',
    image: IMAGES.coastalMonolith,
  },
];

export function Scroll11() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const jumpToSlide = (idx: number) => {
    const clamped = Math.max(0, Math.min(SNAP_SLIDES.length - 1, idx));
    setActiveSlide(clamped);
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ top: clamped * el.clientHeight, behavior: 'smooth' });
  };

  return (
    <section
      id="scroll-11"
      aria-labelledby="scroll-11-heading"
      className="border-t border-[#E2E2DE] py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-[#575752]">
              Scroll11 · Sticky & Pinned · CSS scroll-snap-type: y mandatory
            </p>
            <h2 id="scroll-11-heading" className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#111110] md:text-3xl">
              11. Mandatory Section Snap Deck
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => jumpToSlide(activeSlide - 1)}
              disabled={activeSlide === 0}
              className="rounded-md border border-[#E2E2DE] bg-white px-3 py-1.5 text-xs font-medium text-[#111110] disabled:opacity-40 hover:bg-[#EEEEEC] whitespace-nowrap shrink-0"
            >
              Previous Slide
            </button>
            <button
              type="button"
              onClick={() => jumpToSlide(activeSlide + 1)}
              disabled={activeSlide === SNAP_SLIDES.length - 1}
              className="rounded-md bg-[#1D4ED8] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40 hover:bg-[#1E40AF] whitespace-nowrap shrink-0"
            >
              Next Slide
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="flex flex-row gap-2 lg:col-span-2 lg:flex-col">
            {SNAP_SLIDES.map((slide, idx) => (
              <button
                key={slide.index}
                type="button"
                onClick={() => jumpToSlide(idx)}
                className={`rounded-lg border px-3 py-2.5 text-left transition-colors whitespace-nowrap shrink-0 ${
                  idx === activeSlide
                    ? 'border-[#1D4ED8] bg-white text-[#111110]'
                    : 'border-[#E2E2DE] bg-[#EEEEEC]/60 text-[#575752] hover:text-[#111110]'
                }`}
              >
                <span className="font-mono text-xs tabular-nums">
                  {slide.index} · Slide
                </span>
              </button>
            ))}
          </div>

          <div
            ref={scrollerRef}
            onScroll={(e) => {
              const el = e.currentTarget;
              if (el.clientHeight > 0) {
                setActiveSlide(Math.round(el.scrollTop / el.clientHeight));
              }
            }}
            className="h-[400px] snap-y snap-mandatory overflow-y-auto rounded-xl border border-[#E2E2DE] bg-white lg:col-span-10"
            tabIndex={0}
            aria-label="Scrollable snap deck"
          >
            {SNAP_SLIDES.map((slide) => (
              <div
                key={slide.index}
                className="grid h-[400px] snap-start items-center gap-6 p-6 md:grid-cols-12 md:p-8"
              >
                <div className="md:col-span-5">
                  <p className="font-mono text-xs text-[#1D4ED8]">{slide.subtitle}</p>
                  <h3 className="mt-2 font-display text-2xl font-semibold text-[#111110]">
                    {slide.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#575752]">{slide.body}</p>
                </div>
                <div className="md:col-span-7">
                  <MediaFrame
                    src={slide.image}
                    alt={slide.title}
                    aspectClass="aspect-[16/10]"
                    className="rounded-lg"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Scroll11;
