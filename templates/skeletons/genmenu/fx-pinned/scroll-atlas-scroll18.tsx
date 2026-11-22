import { IMAGES } from '../../data/specimens';
import { MediaFrame } from '../MediaFrame';

const FOLIO_STACK = [
  {
    index: '01',
    topClass: 'top-20',
    title: 'Plate I — Daylight Shaft',
    detail: 'Docks at 80px top offset while subsequent folios glide upward to cover its lower margin.',
    image: IMAGES.heroAtrium,
  },
  {
    index: '02',
    topClass: 'top-24',
    title: 'Plate II — Counterbalanced Steel',
    detail: 'Docks 16px lower at 96px, preserving the index header of the first folio above.',
    image: IMAGES.sculpture,
  },
  {
    index: '03',
    topClass: 'top-28',
    title: 'Plate III — Coastal Concrete',
    detail: 'Completes the three-tier stacked editorial deck without JavaScript scroll hijacking.',
    image: IMAGES.coastalMonolith,
  },
];

export function Scroll18() {
  return (
    <section
      id="scroll-18"
      aria-labelledby="scroll-18-heading"
      className="border-t border-[#E2E2DE] py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10">
          <p className="text-xs font-medium tracking-wide text-[#575752]">
            Scroll18 · Sticky & Pinned · Stepped sticky stacking offsets
          </p>
          <h2 id="scroll-18-heading" className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#111110] md:text-3xl">
            18. Sticky Stacked Folio Deck
          </h2>
        </div>

        <div className="space-y-8 pb-8">
          {FOLIO_STACK.map((card) => (
            <article
              key={card.index}
              className={`sticky ${card.topClass} rounded-xl border border-[#E2E2DE] bg-white p-6 shadow-sm md:p-8`}
            >
              <div className="grid items-center gap-8 md:grid-cols-12">
                <div className="md:col-span-5">
                  <p className="font-mono text-xs text-[#1D4ED8]">Folio {card.index}</p>
                  <h3 className="mt-2 font-display text-xl font-semibold text-[#111110]">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#575752]">
                    {card.detail}
                  </p>
                </div>
                <div className="md:col-span-7">
                  <MediaFrame
                    src={card.image}
                    alt={card.title}
                    aspectClass="aspect-[16/9]"
                    className="rounded-lg"
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Scroll18;
