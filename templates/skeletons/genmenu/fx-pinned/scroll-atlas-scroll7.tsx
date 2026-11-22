import { useEffect, useRef, useState } from 'react';
import { IMAGES } from '../../data/specimens';
import { MediaFrame } from '../MediaFrame';

const PAIRS = [
  {
    id: 'pair-1',
    step: '01',
    heading: 'Structural Light Beams',
    prose:
      'As the reader moves down the right-hand commentary column, the left visual plate locks in place at a comfortable top offset, establishing visual continuity without forcing the eye to hunt.',
    caption: 'Fig 7.1 — Atrium skylight diagonal beam study',
    image: IMAGES.heroAtrium,
  },
  {
    id: 'pair-2',
    step: '02',
    heading: 'Tactile Stone & Steel Balance',
    prose:
      'IntersectionObserver watches each commentary block with a centered rootMargin band. Crossing the midpoint immediately transitions the paired plate while maintaining identical framing bounds.',
    caption: 'Fig 7.2 — Brushed aluminum kinetic sculpture',
    image: IMAGES.sculpture,
  },
  {
    id: 'pair-3',
    step: '03',
    heading: 'Monolithic Coastal Framing',
    prose:
      'Rather than duplicating thumbnails inside every paragraph, sticky pairing preserves generous whitespace and keeps typography constrained to an effortless 60-character reading measure.',
    caption: 'Fig 7.3 — Nordic concrete ocean overlook',
    image: IMAGES.coastalMonolith,
  },
];

export function Scroll7() {
  const [activeIdx, setActiveIdx] = useState(0);
  const blockRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-pair-index'));
            if (!Number.isNaN(idx)) {
              setActiveIdx(idx);
            }
          }
        });
      },
      { rootMargin: '-35% 0px -35% 0px', threshold: 0.1 },
    );

    blockRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const current = PAIRS[activeIdx] ?? PAIRS[0];

  return (
    <section
      id="scroll-7"
      aria-labelledby="scroll-7-heading"
      className="border-t border-[#E2E2DE] py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-[#575752]">
              Scroll7 · Sticky & Pinned · Paired sticky media + scrolling text
            </p>
            <h2 id="scroll-7-heading" className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#111110] md:text-3xl">
              07. Sticky Image & Scrolling Prose
            </h2>
          </div>
          <p className="font-mono text-xs tabular-nums text-[#575752]">
            Active Pair {current.step} / 0{PAIRS.length}
          </p>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-12">
          <div className="lg:sticky lg:top-24 lg:col-span-6">
            <div className="rounded-xl border border-[#E2E2DE] bg-white p-4">
              <MediaFrame
                src={current.image}
                alt={current.heading}
                aspectClass="aspect-[4/3]"
                className="rounded-lg transition-opacity duration-300"
              />
              <div className="mt-3 flex items-center justify-between text-xs text-[#575752]">
                <span>{current.caption}</span>
                <span className="font-mono tabular-nums">{current.step}</span>
              </div>
            </div>
          </div>

          <div className="space-y-8 lg:col-span-6">
            {PAIRS.map((pair, idx) => {
              const isActive = idx === activeIdx;
              return (
                <article
                  key={pair.id}
                  data-pair-index={idx}
                  ref={(el) => {
                    blockRefs.current[idx] = el;
                  }}
                  onClick={() => setActiveIdx(idx)}
                  className={`cursor-pointer rounded-xl border p-6 md:p-8 transition-colors duration-200 ${
                    isActive
                      ? 'border-[#1D4ED8] bg-white'
                      : 'border-[#E2E2DE] bg-[#F7F7F5] opacity-75 hover:opacity-100'
                  }`}
                >
                  <p className="font-mono text-xs text-[#1D4ED8]">Pair {pair.step}</p>
                  <h3 className="mt-2 font-display text-xl font-semibold text-[#111110]">
                    {pair.heading}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#575752]">
                    {pair.prose}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Scroll7;
