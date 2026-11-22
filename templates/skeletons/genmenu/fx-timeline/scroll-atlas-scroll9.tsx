import { useEffect, useRef, useState } from 'react';

const PARAGRAPHS = [
  'Paragraph 01 — Architectural reading cadence depends on measured pacing. Rather than revealing an entire essay in one abrupt flash, each paragraph negotiates its own vertical entry band.',
  'Paragraph 02 — With CSS animation-timeline: view(), the browser binds opacity and subtle vertical translation directly to the paragraph bounding box as it travels from entry 5% to cover 38%.',
  'Paragraph 03 — Crucially, starting opacity at 0.22 instead of zero guarantees that partially visible prose remains legible if a reader stops mid-scroll or skims rapidly down the page.',
  'Paragraph 04 — When browsers lack view-timeline support, a lightweight IntersectionObserver with a bottom rootMargin triggers an equivalent 350ms compositor transition per paragraph.',
];

export function Scroll9() {
  const [supportsCssView] = useState(() =>
    typeof CSS !== 'undefined' && CSS.supports ? CSS.supports('animation-timeline', 'view()') : false,
  );
  const [visibleSet, setVisibleSet] = useState<boolean[]>(() => PARAGRAPHS.map(() => true));
  const pRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  useEffect(() => {
    if (supportsCssView) {
      setVisibleSet(PARAGRAPHS.map(() => true));
      return;
    }
    setVisibleSet(PARAGRAPHS.map((_, idx) => idx === 0));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-p-idx'));
            if (!Number.isNaN(idx)) {
              setVisibleSet((prev) => prev.map((v, i) => (i === idx ? true : v)));
            }
          }
        });
      },
      { threshold: 0.25 },
    );
    pRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [supportsCssView]);

  return (
    <section
      id="scroll-9"
      aria-labelledby="scroll-9-heading"
      className="border-t border-[#E2E2DE] py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="text-xs font-medium tracking-wide text-[#575752]">
              Scroll9 · CSS Timeline · Per-paragraph view() cadence
            </p>
            <h2 id="scroll-9-heading" className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#111110] md:text-3xl">
              09. Paragraph Cadence Reveal
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#575752]">
              Optimal 65-character prose measure where each block eases upward independently.
            </p>
          </div>

          <div className="space-y-6 lg:col-span-8 max-w-2xl">
            {PARAGRAPHS.map((text, idx) => (
              <p
                key={idx}
                data-p-idx={idx}
                ref={(el) => {
                  pRefs.current[idx] = el;
                }}
                style={
                  !supportsCssView
                    ? {
                        opacity: visibleSet[idx] ? 1 : 0.25,
                        transform: visibleSet[idx] ? 'translateY(0)' : 'translateY(18px)',
                      }
                    : undefined
                }
                className={`rounded-xl border border-[#E2E2DE] bg-white p-6 text-base leading-relaxed text-[#111110] transition-all duration-500 ease-out ${
                  supportsCssView ? 'sd-paragraph-fade' : ''
                }`}
              >
                {text}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Scroll9;
