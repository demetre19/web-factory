import { useEffect, useRef, useState } from 'react';
import { IMAGES } from '../../data/specimens';
import { MediaFrame } from '../MediaFrame';

const CASCADE_ITEMS = [
  {
    code: 'Plate A',
    title: 'Daylight Compression',
    detail: 'Entry delay 0ms · 28px vertical settle',
    image: IMAGES.heroAtrium,
  },
  {
    code: 'Plate B',
    title: 'Balanced Armature',
    detail: 'Entry delay 110ms · 28px vertical settle',
    image: IMAGES.sculpture,
  },
  {
    code: 'Plate C',
    title: 'Coastal Aperture',
    detail: 'Entry delay 220ms · 28px vertical settle',
    image: IMAGES.coastalMonolith,
  },
  {
    code: 'Plate D',
    title: 'Colonnade Cadence',
    detail: 'Entry delay 330ms · 28px vertical settle',
    image: IMAGES.pavilionShadow,
  },
];

export function Scroll2() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(true);
  const [supportsCssView] = useState(() =>
    typeof CSS !== 'undefined' && CSS.supports ? CSS.supports('animation-timeline', 'view()') : false,
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (supportsCssView) {
      setRevealed(true);
      return;
    }
    setRevealed(false);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed(true);
          }
        });
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [supportsCssView]);

  const staggerClasses = ['sd-stagger-0', 'sd-stagger-1', 'sd-stagger-2', 'sd-stagger-3'];

  return (
    <section
      id="scroll-2"
      aria-labelledby="scroll-2-heading"
      className="border-t border-[#E2E2DE] py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-[#575752]">
              Scroll2 · CSS Timeline · animation-timeline: view() + IO delay
            </p>
            <h2 id="scroll-2-heading" className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#111110] md:text-3xl">
              02. Staggered Cascade
            </h2>
          </div>
          {!supportsCssView && (
            <button
              type="button"
              onClick={() => {
                setRevealed(false);
                window.setTimeout(() => setRevealed(true), 60);
              }}
              className="rounded-md border border-[#E2E2DE] bg-white px-3 py-1.5 text-xs font-medium text-[#111110] hover:bg-[#EEEEEC] whitespace-nowrap shrink-0"
            >
              Replay Cascade
            </button>
          )}
        </div>

        <div ref={containerRef} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CASCADE_ITEMS.map((item, idx) => (
            <article
              key={item.code}
              style={
                !supportsCssView
                  ? {
                      transitionDelay: `${idx * 110}ms`,
                      opacity: revealed ? 1 : 0.25,
                      transform: revealed ? 'translateY(0px)' : 'translateY(28px)',
                    }
                  : undefined
              }
              className={`rounded-xl border border-[#E2E2DE] bg-white p-4 transition-all duration-500 ease-out ${
                supportsCssView ? staggerClasses[idx] : ''
              }`}
            >
              <MediaFrame
                src={item.image}
                alt={item.title}
                aspectClass="aspect-[4/3]"
                className="rounded-lg"
              />
              <div className="mt-4">
                <p className="font-mono text-xs text-[#575752]">{item.code}</p>
                <h3 className="mt-1 font-display text-base font-semibold text-[#111110]">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-[#575752]">{item.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Scroll2;
