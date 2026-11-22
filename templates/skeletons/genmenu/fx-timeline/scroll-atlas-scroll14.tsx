import { useEffect, useRef, useState } from 'react';
import { IMAGES } from '../../data/specimens';
import { computeViewportTraversal, lerp } from '../../utils/scrollMath';
import { MediaFrame } from '../MediaFrame';

const TILT_CARDS = [
  {
    code: 'Folio I',
    title: 'Helical Oak Rise',
    detail: 'Rotates from 18deg pitch to 0deg upright plane',
    image: IMAGES.staircase,
  },
  {
    code: 'Folio II',
    title: 'Travertine Atrium',
    detail: 'Perspective depth 1000px · compositor transform',
    image: IMAGES.heroAtrium,
  },
  {
    code: 'Folio III',
    title: 'Aluminum Armature',
    detail: 'Settles flat at viewport center threshold',
    image: IMAGES.sculpture,
  },
];

export function Scroll14() {
  const rowRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0.55);
  const [supportsCssView] = useState(() =>
    typeof CSS !== 'undefined' && CSS.supports ? CSS.supports('animation-timeline', 'view()') : false,
  );

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = rowRef.current;
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

  const tiltDeg = lerp(18, 0, Math.min(1, progress * 1.45));
  const scale = lerp(0.94, 1, Math.min(1, progress * 1.45));

  return (
    <section
      id="scroll-14"
      aria-labelledby="scroll-14-heading"
      className="border-t border-[#E2E2DE] py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-[#575752]">
              Scroll14 · CSS Timeline · view() perspective rotateX flatten
            </p>
            <h2 id="scroll-14-heading" className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#111110] md:text-3xl">
              14. Perspective Tilt Flatten
            </h2>
          </div>
          <p className="font-mono text-xs tabular-nums text-[#575752]">
            Pitch {tiltDeg.toFixed(1)}deg
          </p>
        </div>

        <div ref={rowRef} className="grid gap-6 md:grid-cols-3">
          {TILT_CARDS.map((card) => (
            <article
              key={card.code}
              style={
                !supportsCssView
                  ? {
                      transform: `perspective(1000px) rotateX(${tiltDeg}deg) scale(${scale})`,
                    }
                  : undefined
              }
              className={`rounded-xl border border-[#E2E2DE] bg-white p-4 will-change-transform ${
                supportsCssView ? 'sd-tilt-flatten' : ''
              }`}
            >
              <MediaFrame
                src={card.image}
                alt={card.title}
                aspectClass="aspect-[4/3]"
                className="rounded-lg"
              />
              <div className="mt-4">
                <p className="font-mono text-xs text-[#575752]">{card.code}</p>
                <h3 className="mt-1 font-display text-lg font-semibold text-[#111110]">
                  {card.title}
                </h3>
                <p className="mt-1 text-xs text-[#575752]">{card.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Scroll14;
